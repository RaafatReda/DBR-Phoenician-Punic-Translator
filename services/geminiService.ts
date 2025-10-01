import { GoogleGenAI, Type } from "@google/genai";
import { Language, PhoenicianDialect, TransliterationOutput, PhoenicianWordDetails, RecognizedObject, AIAssistantResponse, PronunciationResult } from '../types';
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

export const getPhoenicianWordDetails = async (word: string): Promise<PhoenicianWordDetails> => {
    const systemInstruction = `You are a linguist specializing in Phoenician. For a given Phoenician word, provide its details in a specific JSON format.
${transliterationSystemInstruction}
- The Phoenician text must use Unicode characters from the Phoenician block (U+10900–U+1091F).
- Provide the word's meaning in English, French, and Arabic.
- The example sentence should be simple and clearly demonstrate the word's usage. Provide a Latin transliteration, an Arabic transliteration, and translations of the example sentence in English, French, and Arabic.
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

const getLanguageName = (langCode: UILang): string => {
    switch (langCode) {
        case 'fr': return 'French';
        case 'ar': return 'Arabic';
        case 'en':
        default: return 'English';
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
  dialect: PhoenicianDialect
): Promise<PronunciationResult> => {
    const systemInstruction = `You are an expert historical linguist specializing in the phonology of ancient Semitic languages, particularly Phoenician and its Punic dialect. Your task is to reconstruct the pronunciation of a given text. You MUST respond in a valid JSON format adhering to the provided schema.
    
**Dialect Consideration:**
- If the dialect is 'Standard Phoenician', reconstruct based on early first millennium BCE phonology.
- If the dialect is 'Punic', reconstruct based on later, North African phonology (c. 3rd-1st century BCE). This includes known sound changes like the weakening of guttural consonants (ayin 𐤏, heth 𐤇) and the shift of 'p' (𐤐) to 'f'.

**Output Fields:**
1.  **latinTransliteration**: Provide a strict, academic transliteration. Follow this mapping precisely:
    𐤀 = ʾ, 𐤁 = b, 𐤂 = g, 𐤃 = d, 𐤄 = h, 𐤅 = w, 𐤆 = z, 𐤇 = ḥ, 𐤈 = ṭ, 𐤉 = y, 𐤊 = k, 𐤋 = l, 𐤌 = m, 𐤍 = n, 𐤎 = s, 𐤏 = ʿ, 𐤐 = p, 𐤑 = ṣ, 𐤒 = q, 𐤓 = r, 𐤔 = š, 𐤕 = t.

2.  **ipaReconstruction**: Provide an approximate phonetic reconstruction using the International Phonetic Alphabet (IPA). Infer vowels based on comparative Semitics (e.g., Hebrew, Arabic). Use standard IPA symbols. For Punic, reflect the aforementioned sound changes (e.g., use [f] for 𐤐).

3.  **ttsFriendly**: Create a simplified, vocalized spelling using only basic Latin characters (a-z). This version is intended for a standard text-to-speech (TTS) engine to pronounce. It should be intuitive. For example, for '𐤌𐤋𐤊' (mlk, "king"), a good TTS-friendly form would be "milk" or "melek". For '𐤒𐤓𐤕𐤇𐤃𐤔𐤕' (qrt-ḥdšt, "Carthage"), a good form would be "Qart-hadasht".`;
    
    const prompt = `Reconstruct the pronunciation of the following ${dialect} text: "${text}"`;

    const schema = {
        type: Type.OBJECT,
        properties: {
            latinTransliteration: { type: Type.STRING, description: "Academic Latin transliteration." },
            ipaReconstruction: { type: Type.STRING, description: "Approximate IPA reconstruction." },
            ttsFriendly: { type: Type.STRING, description: "Vocalized, TTS-friendly Latin spelling." }
        },
        required: ["latinTransliteration", "ipaReconstruction", "ttsFriendly"]
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
