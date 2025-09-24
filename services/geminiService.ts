import { GoogleGenAI, Type } from "@google/genai";
import { Language, PhoenicianDialect, TransliterationOutput, PhoenicianWordDetails } from '../types';

// FIX: Initialize Gemini API client. The API key must be an environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const model = 'gemini-2.5-flash';

// FIX: Define a reusable JSON schema for the translation output.
const translationSchema = {
  type: Type.OBJECT,
  properties: {
    phoenician: {
      type: Type.STRING,
      description: "The translated text in Phoenician script (Unicode range U+10900–U+1091F).",
    },
    latin: {
      type: Type.STRING,
      description: "A Latin-based transliteration of the Phoenician text.",
    },
    arabic: {
      type: Type.STRING,
      description: "An Arabic-based transliteration of the Phoenician text. Use Arabic characters. For sounds not present in standard Arabic, use extended Arabic characters (e.g., 'پ' U+067E for the 'p' sound, 'گ' U+06AF for the 'g' sound).",
    },
    grammar: {
      type: Type.ARRAY,
      description: "A word-by-word grammatical analysis of the Phoenician translation.",
      items: {
        type: Type.OBJECT,
        properties: {
          token: {
            type: Type.STRING,
            description: "The individual word or token in Phoenician script.",
          },
          type: {
            type: Type.STRING,
            description: "The grammatical type of the token (must be one of: Noun, Verb, Adjective, Adverb, Preposition, Conjunction, Pronoun, Numeral, Particle, Interjection).",
          },
          description: {
            type: Type.OBJECT,
            description: "Descriptions of the token's grammatical function in English, French, and Arabic.",
            properties: {
              en: { type: Type.STRING, description: "English description." },
              fr: { type: Type.STRING, description: "French description." },
              ar: { type: Type.STRING, description: "Arabic description." },
            },
            required: ["en", "fr", "ar"],
          },
        },
        required: ["token", "type", "description"],
      },
    },
  },
  required: ["phoenician", "latin", "arabic", "grammar"],
};

const cognateSchema = {
    type: Type.OBJECT,
    properties: {
        script: {
            type: Type.STRING,
            description: "The cognate text in its native script.",
        },
        latin: {
            type: Type.STRING,
            description: "A simple, phonetic Latin-based transliteration of the cognate text.",
        },
    },
    required: ["script", "latin"],
};

export const translateText = async (
  text: string,
  sourceLang: Language,
  targetLang: Language,
  dialect: PhoenicianDialect,
  includeCognates: boolean
): Promise<string | TransliterationOutput> => {
  if (!text.trim()) {
    return '';
  }

  const isTranslatingToPhoenician = targetLang === Language.PHOENICIAN;

  const systemInstruction = `You are an expert linguist specializing in ancient Semitic languages. Your task is to provide high-quality translations.
- When translating TO Phoenician, you MUST respond in the requested JSON format.
- Your Phoenician output must use Unicode characters from the Phoenician block (U+10900–U+1091F).
- The description for each grammar token MUST be provided in three languages: English, French, and Arabic.
- When providing an Arabic transliteration, accurately represent Phoenician sounds. Use 'پ' (U+067E) for the 'p' sound and 'گ' (U+06AF) for the 'g' sound.
- When translating FROM Phoenician, just provide the direct translation as plain text.
${includeCognates && isTranslatingToPhoenician ? "\n- You MUST also provide the Modern Hebrew, Modern Standard Arabic, and Imperial Aramaic translations or closest cognates for the source text. For each cognate, provide BOTH the text in its native script AND a simple Latin phonetic transliteration. Use Syriac script for Aramaic." : ""}`;
  
  const prompt = `Translate the following text from ${sourceLang} to ${targetLang}.
If translating to Phoenician, use the ${dialect} dialect.
Text: "${text}"`;

  try {
    const finalSchema = JSON.parse(JSON.stringify(translationSchema)); // Deep copy to avoid mutation
    if (isTranslatingToPhoenician && includeCognates) {
        finalSchema.properties.hebrewCognate = {
          ...cognateSchema,
          description: "The closest Modern Hebrew translation or cognate. Use Hebrew script for the 'script' field.",
        };
        finalSchema.properties.arabicCognate = {
          ...cognateSchema,
          description: "The closest Modern Standard Arabic translation or cognate. Use Arabic script for the 'script' field.",
        };
        finalSchema.properties.aramaicCognate = {
          ...cognateSchema,
          description: "The closest Imperial Aramaic translation or cognate. Use Syriac script for the 'script' field.",
        };
    }

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        ...(isTranslatingToPhoenician && {
            responseMimeType: "application/json",
            responseSchema: finalSchema,
        }),
      },
    });

    if (isTranslatingToPhoenician) {
      const jsonText = response.text.trim();
      const result = JSON.parse(jsonText);
      // Validate the structure slightly, though the model should adhere to the schema
      if (result.phoenician && result.latin && result.arabic) {
          return result as TransliterationOutput;
      } else {
          throw new Error("Received malformed JSON from API.");
      }
    } else {
      return response.text.trim();
    }
  } catch (error) {
    console.error('Gemini API translation error:', error);
    throw new Error('Failed to translate text. The AI service may be temporarily unavailable.');
  }
};

export const comparePhoenicianDialects = async (
  text: string,
  sourceDialect: PhoenicianDialect
): Promise<Record<string, TransliterationOutput>> => {
    if (!text.trim()) {
        return {};
    }

    const allDialects = Object.values(PhoenicianDialect);

    // Sanitize keys for the JSON schema (remove spaces)
    const sanitizeKey = (key: string) => key.replace(/\s/g, '');
    const sanitizedDialectKeys = allDialects.map(sanitizeKey);
    const keyToDialectMap = allDialects.reduce((acc, dialect) => {
        acc[sanitizeKey(dialect)] = dialect;
        return acc;
    }, {} as Record<string, PhoenicianDialect>);


    const systemInstruction = `You are an expert linguist specializing in ancient Semitic languages.
Your task is to take a given text in one Phoenician dialect and render it into all major Phoenician dialects.
You MUST respond in the requested JSON format, using the specified JSON keys.
- Your Phoenician output must use Unicode characters from the Phoenician block (U+10900–U+1091F).
- The description for each grammar token MUST be provided in three languages: English, French, and Arabic.
- When providing an Arabic transliteration, accurately represent Phoenician sounds. Use 'پ' (U+067E) for the 'p' sound and 'گ' (U+06AF) for the 'g' sound.`;

    const prompt = `The following text is in the ${sourceDialect} dialect: "${text}".
Please provide this text in all of the following dialects: ${allDialects.join(', ')}.
The JSON response object must have keys: ${sanitizedDialectKeys.join(', ')}. Specifically, use "StandardPhoenician" for Standard Phoenician and "Punic" for Punic.
For each dialect, provide the text in Phoenician script, a Latin transliteration, an Arabic transliteration, and a grammatical analysis.`;

    const comparisonSchema = {
        type: Type.OBJECT,
        properties: allDialects.reduce((acc, dialect) => {
            acc[sanitizeKey(dialect)] = translationSchema;
            return acc;
        }, {} as Record<string, any>),
        required: sanitizedDialectKeys,
    };
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: comparisonSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const resultWithSanitizedKeys = JSON.parse(jsonText);
        
        // Convert sanitized keys back to original dialect names for the app
        const finalResult: Record<string, TransliterationOutput> = {};
        for (const sanitizedKey in resultWithSanitizedKeys) {
            const originalDialect = keyToDialectMap[sanitizedKey];
            if (originalDialect) {
                finalResult[originalDialect] = resultWithSanitizedKeys[sanitizedKey];
            }
        }
        return finalResult;

    } catch (error) {
        console.error('Gemini API dialect comparison error:', error);
        throw new Error('Failed to compare dialects. The AI service may be temporarily unavailable.');
    }
};

export const getPhoenicianWordDetails = async (word: string): Promise<PhoenicianWordDetails> => {
    const systemInstruction = `You are a linguist specializing in Phoenician. For a given Phoenician word, provide its details in a specific JSON format.
- The Phoenician text must use Unicode characters from the Phoenician block (U+10900–U+1091F).
- Provide the word's meaning in English, French, and Arabic.
- The example sentence should be simple and clearly demonstrate the word's usage. Provide a Latin transliteration, an Arabic transliteration, and translations of the example sentence in English, French, and Arabic.
- When providing an Arabic transliteration, accurately represent Phoenician sounds. Use 'پ' (U+067E) for the 'p' sound and 'گ' (U+06AF) for the 'g' sound.
- All fields are mandatory.`;
    
    const prompt = `Provide details for the Phoenician word: "${word}"`;

    const wordDetailsSchema = {
        type: Type.OBJECT,
        properties: {
            word: { type: Type.STRING, description: "The original Phoenician word provided." },
            latinTransliteration: { type: Type.STRING, description: "A scholarly Latin-based transliteration of the word." },
            arabicTransliteration: { type: Type.STRING, description: "An Arabic-based transliteration of the word." },
            englishMeaning: { type: Type.STRING, description: "The English meaning or translation of the word." },
            frenchMeaning: { type: Type.STRING, description: "The French meaning or translation of the word." },
            arabicMeaning: { type: Type.STRING, description: "The Arabic meaning or translation of the word." },
            exampleSentence: {
                type: Type.OBJECT,
                properties: {
                    phoenician: { type: Type.STRING, description: "An example sentence in Phoenician script using the word." },
                    latin: { type: Type.STRING, description: "A Latin-based transliteration of the example sentence." },
                    arabicTransliteration: { type: Type.STRING, description: "An Arabic-based transliteration of the example sentence." },
                    arabic: { type: Type.STRING, description: "The Arabic translation of the example sentence." },
                    english: { type: Type.STRING, description: "The English translation of the example sentence." },
                    french: { type: Type.STRING, description: "The French translation of the example sentence." },
                },
                required: ["phoenician", "latin", "arabicTransliteration", "arabic", "english", "french"],
            },
        },
        required: ["word", "latinTransliteration", "arabicTransliteration", "englishMeaning", "frenchMeaning", "arabicMeaning", "exampleSentence"],
    };

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: wordDetailsSchema,
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        
        // Basic validation
        if (result.word && result.exampleSentence?.phoenician) {
            return result as PhoenicianWordDetails;
        } else {
            throw new Error("Received malformed JSON for word details from API.");
        }
    } catch (error) {
        console.error('Gemini API word details error:', error);
        throw new Error('Failed to get word details from Gemini API. Please try again.');
    }
};

export const getTranslationHintsFromImage = async (
  base64ImageData: string,
  dialect: PhoenicianDialect
): Promise<{ transcription: string; translation: string }> => {
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64ImageData,
    },
  };

  const scriptName = dialect === PhoenicianDialect.PUNIC ? "Punic" : "Standard Phoenician";

  const textPart = {
    text: `You are an expert OCR tool for ancient scripts. Transcribe any ${scriptName} text in this image. Then, provide a simple, literal English translation of the transcribed text. If no text is found, return empty strings for both fields. Respond ONLY in a valid JSON format. Do not add any markdown formatting like \`\`\`json. The JSON should have two keys: 'transcription' (the ${scriptName} text using Unicode characters U+10900–U+1091F) and 'translation' (the English text).`,
  };
  
  const hintSchema = {
    type: Type.OBJECT,
    properties: {
      transcription: {
        type: Type.STRING,
        description: `The transcribed text in ${scriptName} script (Unicode range U+10900–U+1091F).`,
      },
      translation: {
        type: Type.STRING,
        description: "A simple, literal English translation of the transcribed text.",
      },
    },
    required: ["transcription", "translation"],
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: hintSchema,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    if (typeof result.transcription === 'string' && typeof result.translation === 'string') {
        return result as { transcription: string; translation: string };
    } else {
        throw new Error("Received malformed JSON for image hints from API.");
    }
  } catch (error) {
    console.error('Gemini API image hint error:', error);
    throw new Error('Failed to get hints from image. The AI service may be temporarily unavailable.');
  }
};

export const recognizePhoenicianTextInImage = async (
    base64ImageData: string
): Promise<string> => {
    const imagePart = {
        inlineData: {
            mimeType: 'image/png', // Assume PNG, could be dynamic if needed
            data: base64ImageData,
        },
    };

    const textPart = {
        text: 'Transcribe any Phoenician text visible in this image. If no text is found, respond with an empty string. Only provide the transcribed text, nothing else.',
    };

    try {
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [imagePart, textPart] },
        });
        return response.text.trim();
    } catch (error) {
        console.error('Gemini API image recognition error:', error);
        throw new Error('Failed to recognize text from image. The AI service may be temporarily unavailable.');
    }
};