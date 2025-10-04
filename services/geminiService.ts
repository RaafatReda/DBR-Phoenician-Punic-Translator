import { GoogleGenAI, Type } from "@google/genai";
import { Language, PhoenicianDialect, TransliterationOutput, PhoenicianWordDetails, RecognizedObject, AIAssistantResponse, PronunciationResult, GlossaryLang } from '../types';
import { UILang } from "../lib/i18n";

// FIX: Initialize Gemini API client. The API key must be an environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const model = 'gemini-2.5-flash';

const transliterationSystemInstruction = `
- For all Latin transliterations, you MUST adhere strictly to the following academic standard mapping:
  𐤀 = ʾ (U+02BE), 𐤁 = b, 𐤂 = g, 𐤃 = d, 𐤄 = h, 𐤅 = w, 𐤆 = z, 𐤇 = ḥ (U+1E25), 𐤈 = ṭ (U+1E6D), 𐤉 = y, 𐤊 = k, 𐤋 = l, 𐤌 = m, 𐤍 = n, 𐤎 = s, 𐤏 = ʿ (U+02BF), 𐤐 = p, 𐤑 = ṣ (U+1E63), 𐤒 = q, 𐤓 = r, 𐤔 = š (U+0161), 𐤕 = t.
- For all Arabic transliterations, you MUST adhere strictly to the following mapping:
  𐤀 = أ, 𐤁 = ب, 𐤂 = ج, 𐤃 = د, 𐤄 = هـ, 𐤅 = و, 𐤆 = ز, 𐤇 = ح, 𐤈 = ط, 𐤉 = ي, 𐤊 = ك, 𐤋 = ل, 𐤌 = م, 𐤍 = ن, 𐤎 = س, 𐤏 = ع, 𐤐 = پ, 𐤑 = ص, 𐤒 = ق, 𐤓 = ر, 𐤔 = ش, 𐤕 = ت.
- Punic Dialect Note: When transliterating the Punic dialect, be aware that 𐤐 (p) often represents an [f] sound (so it can be transliterated to ف in Arabic), and 𐤂 (g) may represent a [ɣ] sound (غ in Arabic). Use context to decide.
- Vowel representation (Matres Lectionis): In later Phoenician and Punic, some consonants were used to indicate vowels. When transliterating, infer vowels where appropriate based on these letters: 𐤀 can represent 'a', 𐤉 for 'i', and 𐤅 for 'u'. Your Latin transliteration should reflect this vocalization for better readability (e.g., 'mlk' could be transliterated 'milk').
`;

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
      description: "A Latin-based transliteration of the Phoenician text, following the standard mapping provided.",
    },
    arabic: {
      type: Type.STRING,
      description: "An Arabic-based transliteration of the Phoenician text, following the standard mapping provided.",
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
${transliterationSystemInstruction}
- When translating TO Phoenician, you MUST respond in the requested JSON format.
- Your Phoenician output must use Unicode characters from the Phoenician block (U+10900–U+1091F).
- The description for each grammar token MUST be provided in three languages: English, French, and Arabic.
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
${transliterationSystemInstruction}
You MUST respond in the requested JSON format, using the specified JSON keys.
- Your Phoenician output must use Unicode characters from the Phoenician block (U+10900–U+1091F).
- The description for each grammar token MUST be provided in three languages: English, French, and Arabic.`;

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

// FIX: Made the `meaning` parameter optional to support calls without a predefined meaning, as needed by the DailyPhoenicianWord component.
export const getPhoenicianWordDetails = async (
  word: string, 
  meaning?: { en: string; fr: string; ar: string }
): Promise<PhoenicianWordDetails> => {
    const systemInstruction = `You are a linguist specializing in Phoenician. For a given Phoenician word ${meaning ? 'with a specific meaning' : ''}, provide its details in a specific JSON format.
${transliterationSystemInstruction}
- The Phoenician text must use Unicode characters from the Phoenician block (U+10900–U+1091F).
${meaning ? `- You MUST use the exact meanings provided for the word in English, French, and Arabic. Do not change them.` : '- You must provide the most common and appropriate meanings in English, French, and Arabic.'}
- The example sentence MUST be simple and clearly demonstrate the word's usage ${meaning ? `according to the provided specific meaning.` : `according to its most common meaning.`}
- Provide a Latin transliteration, an Arabic transliteration, and translations of the example sentence in English, French, and Arabic.
- All fields are mandatory.`;
    
    const prompt = meaning 
        ? `Provide details for the Phoenician word: "${word}"
The specific meaning to use is:
- English: "${meaning.en}"
- French: "${meaning.fr}"
- Arabic: "${meaning.ar}"

Generate an example sentence that uses the word "${word}" with this EXACT meaning.`
        : `Provide details for the Phoenician word: "${word}".

Generate an example sentence that uses the word "${word}" with its most common meaning.`;

    const wordDetailsSchema = {
        type: Type.OBJECT,
        properties: {
            word: { type: Type.STRING, description: "The original Phoenician word provided." },
            latinTransliteration: { type: Type.STRING, description: "A scholarly Latin-based transliteration of the word." },
            arabicTransliteration: { type: Type.STRING, description: "An Arabic-based transliteration of the word." },
            englishMeaning: { type: Type.STRING, description: `The English meaning of the word. ${meaning ? `Must be exactly: "${meaning.en}"` : "The most common English meaning."}` },
            frenchMeaning: { type: Type.STRING, description: `The French meaning of the word. ${meaning ? `Must be exactly: "${meaning.fr}"` : "The most common French meaning."}` },
            arabicMeaning: { type: Type.STRING, description: `The Arabic meaning of the word. ${meaning ? `Must be exactly: "${meaning.ar}"` : "The most common Arabic meaning."}` },
            exampleSentence: {
                type: Type.OBJECT,
                properties: {
                    phoenician: { type: Type.STRING, description: `An example sentence in Phoenician script using the word "${word}"${meaning ? ' with the specified meaning' : ''}.` },
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

const getLanguageName = (langCode: UILang | GlossaryLang): string => {
    switch (langCode) {
        case 'fr': return 'French';
        case 'ar': return 'Arabic';
        case 'es': return 'Spanish';
        case 'it': return 'Italian';
        case 'de': return 'German';
        case 'zh': return 'Chinese';
        case 'ja': return 'Japanese';
        case 'tr': return 'Turkish';
        case 'el': return 'Greek';
        case 'en':
        default: return 'English';
    }
};

export const translateGlossaryBatch = async (
    terms: string[],
    targetLangCode: GlossaryLang
  ): Promise<string[]> => {
    if (terms.length === 0) return [];
    const targetLanguage = getLanguageName(targetLangCode);
  
    const systemInstruction = `You are a highly skilled translator. You will be given a JSON array of English terms. Translate each term into ${targetLanguage}. You MUST respond with a JSON array of strings of the exact same length as the input array, where each string is the translation of the corresponding term in the input array. Do not add any extra explanations or markdown.`;
  
    const prompt = JSON.stringify(terms);
  
    const schema = {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    };
  
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });
  
      const jsonText = response.text.trim();
      const result = JSON.parse(jsonText);
      if (Array.isArray(result) && result.length === terms.length) {
          return result as string[];
      } else {
          console.error("Mismatched translation count from API. Input:", terms.length, "Output:", result.length);
          throw new Error("Mismatched translation count from API.");
      }
    } catch (error) {
      console.error(`Gemini API glossary translation error to ${targetLanguage}:`, error);
      throw new Error(`Failed to translate glossary to ${targetLanguage}.`);
    }
  };

export const getTranslationCorrection = async (
  sourceText: string,
  sourceLang: Language,
  originalTranslation: TransliterationOutput,
  userRequest: string,
  uiLang: UILang
): Promise<AIAssistantResponse> => {
    const languageName = getLanguageName(uiLang);

    const systemInstruction = `You are an expert AI linguistic assistant specializing in Phoenician. Your task is to help a user refine a translation.
${transliterationSystemInstruction}
- You will receive a source text, its original Phoenician translation, and a user's request for modification.
- You MUST respond in the requested JSON format.
- The 'improvedTranslation' object must be a complete, valid translation output, including Phoenician script, Latin and Arabic transliterations, and a full grammatical analysis, even if only one word was changed.
- The 'explanation' field MUST clearly and concisely explain the changes you made based on the user's request, written in ${languageName}.
- Phoenician text must use Unicode characters from the Phoenician block (U+10900–U+1091F).`;

    const prompt = `Context: The user wants to adjust a translation from ${sourceLang} to Phoenician.
- Source Text: "${sourceText}"
- Original Phoenician Translation (in Phoenician script): "${originalTranslation.phoenician}"
- User Request: "${userRequest}"

Please analyze the request and provide an improved translation and an explanation of the changes in ${languageName}. If the request is nonsensical or impossible, explain why in a helpful manner and return the original translation.`;

    const correctionSchema = {
        type: Type.OBJECT,
        properties: {
            improvedTranslation: translationSchema,
            explanation: {
                type: Type.STRING,
                description: `An explanation of the changes made, written in ${languageName}.`,
            },
        },
        required: ["improvedTranslation", "explanation"],
    };
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: correctionSchema,
            },
        });

        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        if (result.improvedTranslation && result.explanation) {
            return result as AIAssistantResponse;
        } else {
            throw new Error("Received malformed JSON from AI Assistant.");
        }
    } catch (error) {
        console.error('Gemini API assistant error:', error);
        throw new Error('Failed to get a response from the AI assistant.');
    }
};

export const recognizeSymbolInImage = async (
  base64ImageData: string,
  uiLang: UILang
): Promise<{ name: string; description: string }> => {
  const imagePart = {
    inlineData: {
      mimeType: 'image/png',
      data: base64ImageData,
    },
  };

  const languageName = getLanguageName(uiLang);

  const textPart = {
    text: `Analyze the provided image for specific ancient Phoenician or Punic iconographic symbols. Identify ONLY ONE of the following symbols if present: Tanit symbol, lunar motif (crescent), solar disk (winged or simple), betyl stone, lotus flower, or bottle-shaped idol.
If a symbol is identified, respond with a JSON object containing 'name' and 'description'. The 'name' should be the ${languageName} name of the symbol. The 'description' should be a concise, one-paragraph explanation of its cultural and historical significance, written in ${languageName}.
If no symbol from the list is clearly identifiable, respond with a JSON object where both 'name' and 'description' are empty strings: {"name": "", "description": ""}.
Do not identify any other objects. Respond ONLY with the JSON object, without any markdown formatting like \`\`\`json.`,
  };
  
  const symbolSchema = {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: `The ${languageName} name of the identified symbol.`,
      },
      description: {
        type: Type.STRING,
        description: `A concise, one-paragraph explanation of the symbol's significance in ${languageName}.`,
      },
    },
    required: ["name", "description"],
  };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: symbolSchema,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    if (typeof result.name === 'string' && typeof result.description === 'string') {
        return result;
    } else {
        throw new Error("Received malformed JSON for symbol recognition from API.");
    }
  } catch (error) {
    console.error('Gemini API symbol recognition error:', error);
    throw new Error('Failed to recognize symbol from image. The AI service may be temporarily unavailable.');
  }
};

export const getTranslationHintsFromImage = async (
  base64ImageData: string,
  dialect: PhoenicianDialect
): Promise<{ transcription: string; translation: string }> => {
  const imagePart = {
    inlineData: {
      mimeType: 'image/png',
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

export const recognizeObjectsInImage = async (
    base64ImageData: string,
    dialect: PhoenicianDialect,
    uiLang: UILang
): Promise<RecognizedObject[]> => {
    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64ImageData,
        },
    };

    const dialectName = dialect === PhoenicianDialect.PUNIC ? "Punic" : "Standard Phoenician";
    const languageName = getLanguageName(uiLang);

    const textPart = {
        text: `You are an expert AI assistant for analyzing images and translating to ancient languages. Your task is to identify up to 5 prominent objects in the provided image.
For your transliterations, adhere STRICTLY to this standard: 
- Latin: 𐤀=ʾ, 𐤁=b, 𐤂=g, 𐤃=d, 𐤄=h, 𐤅=w, 𐤆=z, 𐤇=ḥ, 𐤈=ṭ, 𐤉=y, 𐤊=k, 𐤋=l, 𐤌=m, 𐤍=n, 𐤎=s, 𐤏=ʿ, 𐤐=p, 𐤑=ṣ, 𐤒=q, 𐤓=r, 𐤔=š, 𐤕=t.
- Arabic: 𐤀=أ, 𐤁=ب, 𐤂=ج, 𐤃=د, 𐤄=هـ, 𐤅=و, 𐤆=ز, 𐤇=ح, 𐤈=ط, 𐤉=ي, 𐤊=ك, 𐤋=ل, 𐤌=م, 𐤍=ن, 𐤎=س, 𐤏=ع, 𐤐=پ, 𐤑=ص, 𐤒=ق, 𐤓=ر, 𐤔=ش, 𐤕=ت.

For each object you identify, provide a JSON object containing seven fields:
1. 'name': A simple, one-word English name for the object (e.g., 'tree', 'person', 'dog', 'car').
2. 'phoenician': The translation of this English name into the ${dialectName} dialect of Phoenician. The translation must use Unicode characters from the Phoenician script block (U+10900–U+1091F). If a direct translation is not available, provide the closest conceptual equivalent.
3. 'latin': A Latin-based transliteration of the Phoenician word.
4. 'arabicTransliteration': An Arabic-based phonetic transliteration of the Phoenician word.
5. 'translation': The translation of the English object 'name' into ${languageName}.
6. 'pos': The grammatical part of speech for the Phoenician word, such as 'Noun'.
7. 'box': A bounding box object with four numerical fields (x, y, width, height), representing the object's location and size as percentages (from 0.0 to 1.0) of the image's total dimensions.

If you cannot identify any objects, return an empty array []. Respond ONLY with the JSON array, without any markdown formatting.`,
    };

    const objectSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING, description: "The English name of the object." },
                phoenician: { type: Type.STRING, description: `The ${dialectName} word for the object.` },
                latin: { type: Type.STRING, description: "A Latin-based phonetic transliteration of the Phoenician word." },
                arabicTransliteration: { type: Type.STRING, description: "An Arabic-based phonetic transliteration of the Phoenician word." },
                translation: { type: Type.STRING, description: `The translation of the object's name into ${languageName}.` },
                pos: { type: Type.STRING, description: "The part of speech of the Phoenician word." },
                box: {
                    type: Type.OBJECT,
                    properties: {
                        x: { type: Type.NUMBER, description: "The x-coordinate of the top-left corner as a percentage (0-1)." },
                        y: { type: Type.NUMBER, description: "The y-coordinate of the top-left corner as a percentage (0-1)." },
                        width: { type: Type.NUMBER, description: "The width of the box as a percentage (0-1)." },
                        height: { type: Type.NUMBER, description: "The height of the box as a percentage (0-1)." },
                    },
                    required: ["x", "y", "width", "height"],
                },
            },
            required: ["name", "phoenician", "latin", "arabicTransliteration", "translation", "pos", "box"],
        },
    };

    try {
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: objectSchema,
            },
        });
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result as RecognizedObject[];
    } catch (error) {
        console.error('Gemini API object recognition error:', error);
        throw new Error('Failed to analyze objects in the image.');
    }
};

export const reconstructPronunciation = async (
  text: string,
  dialect: PhoenicianDialect,
  uiLang: UILang
): Promise<PronunciationResult> => {
    const languageName = getLanguageName(uiLang);

    const systemInstruction = `You are an expert historical linguist specializing in the phonology of ancient Semitic languages, particularly Phoenician and its Punic dialect. Your task is to reconstruct the pronunciation of a given text. You MUST respond in a valid JSON format adhering to the provided schema.

**Dialect Consideration:**
- If the dialect is 'Standard Phoenician', reconstruct based on early first millennium BCE phonology.
- If the dialect is 'Punic', reconstruct based on later, North African phonology (c. 3rd-1st century BCE). This includes sound changes like the weakening of gutturals and the shift of 'p' to 'f'.

**Phonetic Mapping for TTS:**
You MUST map each Phoenician letter to its closest Arabic phoneme for TTS purposes, following this guide:
- 𐤀 (Aleph): أ (hamza, especially at word start)
- 𐤁 (Bet): ب
- 𐤂 (Gimel): غ (a heavy G sound)
- 𐤃 (Dalet): د
- 𐤄 (He): هـ
- 𐤅 (Waw): و
- 𐤆 (Zayin): ز
- 𐤇 (Het): ح (guttural H)
- 𐤈 (Tet): ط (emphatic T)
- 𐤉 (Yod): ي
- 𐤊 (Kaph): ك
- 𐤋 (Lamed): ل
- 𐤌 (Mem): م
- 𐤍 (Nun): ن
- 𐤎 (Samekh): س
- 𐤏 (Ayin): ع (guttural Ayin)
- 𐤐 (Pe): پ (use a P sound, as Arabic lacks it) or ف in Punic context. The TTS might pronounce پ as B, which is acceptable.
- 𐤑 (Tsade): ص (emphatic S)
- 𐤒 (Qoph): ق (deep Q)
- 𐤓 (Resh): ر
- 𐤔 (Shin): ش
- 𐤕 (Taw): ت

**Crucial Pronunciation Rules for TTS Output (tts in word_pronunciations, tts_full_sentence):**
- **Vocalization based on IPA:** Your vocalized Arabic TTS output MUST be a direct, phonetic rendering of your reconstructed IPA string. Use Arabic vowel marks (harakat: Fatha, Kasra, Damma) to create a fluid, natural, and realistic pronunciation. The goal is to make an Arabic TTS engine *sound* like it's speaking Phoenician.
- **No Arabic Grammar Endings (I'rāb):** You MUST NOT use Arabic grammatical case endings. This means NO tanwīn ( ◌ً , ◌ٍ , ◌ٌ ) and NO final short vowels (ـُ , ـِ , ـَ) for grammatical cases. The pronunciation must be syllabic, not based on Classical Arabic grammar.
- **Mandatory Sukun:** Every single word in the TTS fields MUST end with a Sukun ( ْ ) unless the word naturally ends in a long vowel sound (ا, و, ي). This is critical to prevent the TTS engine from adding its own final vowel.
- **Follow these examples EXACTLY:**
  - \`𐤇𐤓𐤑\` → TTS must be \`حَرَصْ\` (ḥa-raṣ), NOT \`حَرَصٌ\`.
  - \`𐤁𐤕𐤍\` → TTS must be \`بَتَنْ\` (ba-tan), NOT \`بَتَنٌ\`.
  - \`𐤀𐤋𐤌\` → TTS must be \`أَلَمْ\` (ʾa-lam), NOT \`أَلَمٌ\`.
- The goal is a neutral, syllabic reading that avoids Arabic inflectional endings entirely.

**Output Fields (JSON):**
1.  **transliteration**: A strict, academic Latin transliteration.
2.  **ipa**: An approximate phonetic reconstruction using the International Phonetic Alphabet (IPA).
3.  **word_pronunciations**: An array of objects. Each object MUST contain two keys: 'phoenician' (the original word from the input) and 'tts' (the vocalized ARABIC string for that word, following all pronunciation rules).
4.  **tts_full_sentence**: A single string containing the full reconstructed sentence, also in vocalized ARABIC characters for an Arabic TTS engine.
5.  **note**: A brief note comparing the word(s) to cognates in Hebrew, Arabic, or Aramaic if relevant. This note MUST be written in ${languageName}.`;
    
    const prompt = `Reconstruct the pronunciation of the following ${dialect} text, providing output suitable for an Arabic TTS engine: "${text}"`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            transliteration: { type: Type.STRING, description: "Academic Latin transliteration." },
            ipa: { type: Type.STRING, description: "Approximate IPA reconstruction." },
            word_pronunciations: {
                type: Type.ARRAY,
                description: "An array of objects, each pairing an original Phoenician word with its vocalized Arabic TTS string.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        phoenician: { type: Type.STRING, description: "A single word from the input text, in Phoenician script." },
                        tts: { type: Type.STRING, description: "The vocalized Arabic TTS rendering for this single word, following all phonological rules." }
                    },
                    required: ["phoenician", "tts"]
                }
            },
            tts_full_sentence: { type: Type.STRING, description: "The full sentence in vocalized Arabic for TTS playback." },
            note: { type: Type.STRING, description: `Comparative linguistic notes on cognates, written in ${languageName}.` }
        },
        required: ["transliteration", "ipa", "word_pronunciations", "tts_full_sentence", "note"]
    };

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as PronunciationResult;
    } catch (error) {
        console.error('Gemini API pronunciation reconstruction error:', error);
        throw new Error('Failed to reconstruct pronunciation. The AI service may be temporarily unavailable.');
    }
};

export const discussPronunciation = async (
  originalWord: string,
  pronunciationResult: PronunciationResult,
  userQuery: string,
  dialect: PhoenicianDialect,
  uiLang: UILang
): Promise<string> => {
    const languageName = getLanguageName(uiLang);

    const systemInstruction = `You are an expert historical linguist specializing in Phoenician phonology, acting as a helpful tutor and editor.
The user has a question or suggestion about a reconstructed pronunciation.
Your task is to answer clearly in ${languageName}.
If the user's suggestion is plausible, you MUST provide an alternative reconstruction. Format this alternative as a complete JSON object wrapped in special tags: [SUGGESTION]{"transliteration": "...", "ipa": "...", "word_pronunciations": [...], "tts_full_sentence": "...", "note": "..."}[/SUGGESTION].
The JSON object MUST be a valid PronunciationResult.
First, provide your textual explanation, and THEN, if applicable, provide the [SUGGESTION] block.
If the user's idea is incorrect, explain why politely without providing a suggestion block.
Do not respond in JSON yourself, only use the special block for suggestions.`;
    
    const prompt = `Context:
- Original Phoenician Text: "${originalWord}"
- Dialect for Reconstruction: ${dialect}
- Your Current Suggested Pronunciation:
  - Latin Transliteration: "${pronunciationResult.transliteration}"
  - IPA: "${pronunciationResult.ipa}"
  - TTS for Arabic Engine: "${pronunciationResult.tts_full_sentence}"
- User's Query: "${userQuery}"

Please analyze the user's query. Provide an explanation in ${languageName}. If their idea leads to a valid alternative pronunciation, provide it inside a [SUGGESTION]{...}[/SUGGESTION] block after your explanation.`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction,
            },
        });
        return response.text.trim();
    } catch (error) {
        console.error('Gemini API pronunciation discussion error:', error);
        throw new Error('Failed to get a response from the pronunciation tutor.');
    }
};

export const explainSentenceInTutor = async (
  context: PhoenicianWordDetails,
  userQuery: string,
  uiLang: UILang
): Promise<string> => {
    const languageName = getLanguageName(uiLang);

    const systemInstruction = `You are an expert AI language tutor specializing in Phoenician grammar and syntax.
The user is asking a question about a specific Phoenician word and its example sentence.
Your task is to provide a clear, concise, and helpful explanation in ${languageName}.
Base your answer on the provided context. Be encouraging and educational. Do not respond in JSON.`;
    
    const prompt = `Context:
- Word in Focus: "${context.word}" (${context.latinTransliteration})
- Meaning: "${context.englishMeaning}"
- Example Sentence (Phoenician): "${context.exampleSentence.phoenician}"
- Example Sentence (English Translation): "${context.exampleSentence.english}"
- User's Question: "${userQuery}"

Please answer the user's question about the sentence or the word's usage in ${languageName}.`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                systemInstruction,
            },
        });
        return response.text.trim();
    } catch (error) {
        console.error('Gemini API sentence explanation error:', error);
        throw new Error('Failed to get a response from the AI tutor.');
    }
};