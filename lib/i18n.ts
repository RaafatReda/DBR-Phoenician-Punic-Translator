export type UILang = 'en' | 'fr' | 'ar';

export const translations: Record<UILang, Record<string, string>> = {
  en: {
    mainTitle: 'DBR Translator',
    subtitle: 'An advanced web tool utilizing AI to provide accurate translations and deeper understanding of the Phoenician and Punic linguistic heritage.',
    unknownError: 'An unknown error occurred.',
    translating: 'Translating',
    comparing: 'Comparing',
    compareVariants: 'Compare Dialects',
    translate: 'Translate',
    enterTextPlaceholder: 'Enter text in',
    translationPlaceholder: 'Translation will appear here...',
    copyError: 'Failed to copy text.',
    copySuccess: 'Copied!',
    copyTitle: 'Copy translation',
    saveSuccess: 'Saved!',
    saveTitle: 'Save translation',
    footerAllRightsReserved: 'All Rights Reserved.',
    speechError: 'Speech recognition error',
    micError: 'Could not start speech recognition',
    micStop: 'Stop listening',
    micNotAvailable: 'Microphone not available for this language',
    micStart: 'Start listening',
    imageProcessError: 'Failed to process image.',
    fileReadError: 'Error reading file.',
    handwritingTitle: 'Handwriting input',
    keyboardClose: 'Close keyboard',
    keyboardOpen: 'Open keyboard',
    keyboardLabel: 'Virtual Keyboard',
    keySpace: 'Space',
    keySymbols: '?123',
    keyLetters: 'ABC',
    manualTitle: 'How to Use',
    dictionaryTitle: 'Phoenician Glossary',
    savedTranslationsTitle: 'Saved Translations',
    lessonsTitle: 'Lessons',
    translatorMode: 'Translator',
    dialectMode: 'Dialect Variants',
    grammarHelper: 'Grammar Helper',
    compareCognates: "Compare Cognates (H/A/A)",
    hebrewCognate: "Hebrew Cognate",
    arabicCognate: "Arabic Cognate",
    aramaicCognate: "Aramaic Cognate",
    scriptView: 'Script View',
    phoenicianDialect: 'Phoenician Dialect',
    comparisonResultsTitle: 'Comparison Results',
    comparingVariants: 'Comparing Dialect Variants...',
    grammarPanelHint: 'Click a word to see its grammar details.',
    grammarType: 'Type:',
    grammarDescription: 'Description:',
    savedTitle: 'Saved Translations',
    savedClose: 'Close saved translations',
    savedEmpty: 'You have no saved translations yet.',
    savedSelect: 'Select translation',
    savedNoteEdit: 'Add or edit note',
    savedDelete: 'Delete translation',
    savedCancel: 'Cancel',
    savedSaveNote: 'Save Note',
    savedSelectAll: 'Select All',
    savedExport: 'Export',
    savedClear: 'Clear History',
    addNotesPlaceholder: 'Add your notes here...',
    manualHeader: 'User Manual',
    manualClose: 'Close usage manual',
    manualWelcomeTitle: 'Welcome to the DBR Translator!',
    manualWelcomeSub: 'Your portal to the ancient world of Phoenician and Punic languages. Here\'s a quick guide to get you started.',
    manualS1Title: '1. The Translator',
    manualS1L1: '<strong>🌐 Select Languages:</strong> Pick your source and target languages. The app will smartly handle swaps if you choose the same language for both.',
    manualS1L2: '<strong>✍️ Enter Your Text:</strong> The left panel is for your input. Use our advanced tools:',
    manualS1L2_1: '<strong>📷 Camera Input:</strong> Use the camera icon to activate the AR mode. Point it at objects to see their names in Phoenician or scan ancient texts.',
    manualS1L2_2: '<strong>✍️ Handwriting:</strong> Draw characters on the canvas. Our AI will recognize them.',
    manualS1L2_3: '<strong>⌨️ Virtual Keyboard:</strong> Access specialized keyboards for Phoenician, Punic, and more.',
    manualS1L2_4: '<strong>🎤 Voice Input:</strong> Dictate text directly using your microphone (for modern languages).',
    manualS1L3: '<strong>🚀 Translate:</strong> Hit the main button to see the magic happen. Your translation appears on the right.',
    manualS2Title: '2. Explore Your Translation',
    manualS2L1: '<strong>🛠️ Result Tools:</strong> A toolbar appears above your translation with powerful options:',
    manualS2L1_1: '<strong>✨ AI Assistant:</strong> Refine your translation. Ask the AI to make it more poetic, change a word, or explain a nuance.',
    manualS2L1_2: '<strong>🗣️ Text-to-Speech:</strong> Hear your translation spoken aloud. For Phoenician, it reads the scholarly transliteration.',
    manualS2L1_3: '<strong>🎨 Layout Editor:</strong> Get creative! Drag, resize, and rotate words from your translation to create a custom graphic.',
    manualS2L1_4: '<strong>📋 Copy & 💾 Save:</strong> Easily copy your results or save them to your personal collection.',
    manualS2L2: '<strong>🧠 Deeper Insights:</strong>',
    manualS2L2_1: '<strong>🎓 Grammar Helper:</strong> Toggle this on to see a color-coded grammatical breakdown. Click any word to understand its role in the sentence.',
    manualS2L2_2: '<strong>🤝 Cognate Comparison:</strong> Discover linguistic connections. See related words in Hebrew, Arabic, and Aramaic.',
    manualS2L2_3: '<strong>↔️ Dialect Mode:</strong> Switch from "Translator" to "Dialect Variants" to see how a phrase differs between Standard Phoenician and its later Punic form.',
    manualS3Title: '3. Learning & Discovery',
    manualS3L1: '<strong>📚 Main Menu (Top Right):</strong>',
    manualS3L1_1: '<strong>𐤀 Dictionary:</strong> A comprehensive glossary. Search for words by Phoenician script, transliteration, or meaning in multiple languages.',
    manualS3L1_2: '<strong>📜 Lessons:</strong> Learn the alphabet and dive into the grammar of both Phoenician and Punic dialects.',
    manualS3L1_3: '<strong>❓ User Manual:</strong> You\'re reading it!',
    manualS3L1_4: '<strong>🗂️ Saved Translations:</strong> Access your saved work, add notes, and export.',
    manualS3L2: '<strong>💬 AI Tutor:</strong> Click the floating chat bubble to start a conversation with an AI tutor. Practice your Phoenician in an interactive, guided environment.',
    manualS4Title: '4. Customization & Export',
    manualS4L1: '<strong>⚙️ Settings (Top Left):</strong>',
    manualS4L1_1: '<strong>🌍 UI Language:</strong> Change the app\'s interface language (EN/FR/AR).',
    manualS4L1_2: '<strong>🎨 Theme:</strong> Cycle between Dark, Light, and Papyrus themes.',
    manualS4L1_3: '<strong>🇦 Font Size:</strong> Adjust the text size for your comfort.',
    manualS4L2: '<strong>📤 Exporting:</strong> From your saved translations, you can select one or more entries and export them as a beautifully formatted <strong>PDF</strong> or a high-resolution <strong>PNG/JPG image</strong>.',
    handwritingHeader: 'Phoenician Handwriting Input',
    handwritingClose: 'Close handwriting canvas',
    handwritingClear: 'Clear',
    handwritingUndo: 'Undo last stroke',
    handwritingRedo: 'Redo last stroke',
    handwritingRecognize: 'Recognize',
    handwritingRecognizing: 'Recognizing...',
    themeSwitchDark: 'Switch to dark mode',
    themeSwitchLight: 'Switch to light mode',
    themeSwitchPapyrus: 'Switch to papyrus mode',
    themeSwitchPurple: 'Switch to purple-glassy mode',
    chatFabTitle: 'Open AI Chat Tutor',
    chatHeaderPhoenician: 'AI Phoenician Tutor',
    chatHeaderPunic: 'AI Punic Tutor',
    chatSubheader: 'Practice your conversation skills!',
    chatClose: 'Close chat',
    chatPlaceholderPhoenician: 'Type in Phoenician...',
    chatPlaceholderPunic: 'Type in Punic...',
    chatErrorInit: "Sorry, I couldn't connect to the AI tutor. (Error initializing chat.)",
    chatErrorResponse: "I'm having trouble responding right now. (Failed to get response.)",
    dailyWordTitle: 'DAILY WORD (PHOENICIAN & PUNIC)',
    dailyWordNew: 'Get a new word',
    dailyWordClose: 'Close daily word card',
    dailyWordError: 'Could not load word of the day.',
    dailyWordUsage: 'USAGE IN A SENTENCE',
    dictionaryHeader: 'Phoenician Glossary',
    punicGlossaryTitle: 'Punic Glossary',
    phoenicianGlossaryTitle: 'Phoenician Glossary',
    dictionaryClose: 'Close dictionary',
    dictionarySearch: 'Search in English...',
    dictionarySearch_fr: 'Search in French...',
    dictionarySearch_ar: 'Search in Arabic...',
    dictionaryAll: 'All',
    dictionaryFound: 'words found (of',
    dictionaryTotal: 'total)',
    dictionaryNone: 'No matching words found.',
    dictionaryNoneSub: 'Try clearing the filters or checking your spelling.',
    theonyms: 'Theonyms',
    personalNames: 'Personal Names',
    locationNames: 'Location Names',
    standardPhoenician: 'Standard Phoenician',
    punic: 'Punic',
    english: 'English',
    phoenician: 'Phoenician',
    arabic: 'Arabic',
    french: 'French',
    spanish: 'Spanish',
    italian: 'Italian',
    chinese: 'Chinese',
    japanese: 'Japanese',
    turkish: 'Turkish',
    greek: 'Greek',
    german: 'German',
    latin: 'Latin',
    both: 'All',
    dailyWordLatinTransliteration: 'Latin Transliteration',
    dailyWordArabicTransliteration: 'Arabic Transliteration',
    dailyWordMeaning: 'Meaning',
    previewTextTitle: 'Preview Text',
    noun: 'Noun',
    verb: 'Verb',
    adjective: 'Adjective',
    adverb: 'Adverb',
    preposition: 'Preposition',
    conjunction: 'Conjunction',
    pronoun: 'Pronoun',
    numeral: 'Numeral',
    particle: 'Particle',
    interjection: 'Interjection',
    layoutEditTitle: 'Edit Layout',
    exportJpg: 'Save JPG',
    exportPng: 'Save PNG',
    exportPdf: 'Save PDF',
    done: 'Done',
    exporting: 'Exporting...',
    transliterationSectionTitle: 'Transliteration: Latin',
    fontSizeManagerTitle: 'Manage font size',
    fontSize: 'Font Size',
    reset: 'Reset',
    increaseFontSize: 'Increase font size',
    decreaseFontSize: 'Decrease font size',
    fontSizeSmall: 'Small',
    fontSizeMedium: 'Medium',
    fontSizeLarge: 'Large',
    textScannerTitle: 'AR & Camera',
    cameraError: 'Could not access the camera. Please check permissions and ensure your browser supports this feature.',
    uploadPhoto: 'Upload from device',
    speakTranslation: 'Speak translation',
    stopSpeaking: 'Stop speaking',
    ttsNotSupported: 'Text-to-speech not supported by your browser.',
    close: 'Close',
    downloadPhoto: 'Download Photo',
    switchCamera: 'Switch Camera',
    arView: 'AR View',
    advancedSettings: 'Advanced Settings',
    focus: 'Focus',
    exposure: 'Exposure',
    whiteBalance: 'White Balance',
    brightness: 'Brightness',
    contrast: 'Contrast',
    zoom: 'Zoom',
    analyzeObjects: 'Analyze',
    arToggle: 'Toggle AR View',
    aiAssistantTitle: 'AI Assistant',
    aiAssistantHeader: 'AI Translation Assistant',
    aiAssistantSubheader: 'Refine your translation with AI',
    aiAssistantSource: 'Source Text',
    aiAssistantOriginal: 'Original Translation',
    aiAssistantRequestPlaceholder: 'e.g., "Change the word for \'king\' to \'ruler\'" or "Make it sound more poetic."',
    aiAssistantGetResponse: 'Get Suggestion',
    aiAssistantGettingResponse: 'Getting Suggestion...',
    aiAssistantImproved: 'Improved Translation',
    aiAssistantExplanation: 'Explanation',
    aiAssistantApply: 'Apply Changes',
    aiAssistantError: 'The assistant could not process your request.',
    arAnalysisFailed: 'AR analysis failed. Please try again.',
    grayscale: 'Grayscale',
    resetAdjustments: 'Reset adjustments',
    lessonsHeader: 'Phoenician & Punic Lessons',
    lessonsClose: 'Close Lessons',
    alphabetTab: 'Alphabet',
    grammarTab: 'Grammar',
    alphabetIntro: 'The Phoenician alphabet consists of 22 consonants. Vowels were generally not written. The Punic script is a later, more cursive form of this alphabet.',
    aleph: 'Aleph', ox: 'Ox',
    bet: 'Bet', house: 'House',
    gimel: 'Gimel', camel: 'Camel',
    dalet: 'Dalet', door: 'Door',
    he: 'He', window: 'Window',
    waw: 'Waw', hook: 'Hook',
    zayin: 'Zayin', weapon: 'Weapon',
    het: 'Het', fence: 'Fence',
    tet: 'Tet', wheel: 'Wheel',
    yod: 'Yod', hand: 'Hand',
    kaph: 'Kaph', palm_of_hand: 'Palm of Hand',
    lamed: 'Lamed', goad: 'Goad',
    mem: 'Mem', water: 'Water',
    nun: 'Nun', fish: 'Fish',
    samekh: 'Samekh', pillar: 'Pillar',
    ayin: 'Ayin', eye: 'Eye',
    pe: 'Pe', mouth: 'Mouth',
    sade: 'Sade', plant: 'Plant',
    qoph: 'Qoph', monkey: 'Monkey',
    resh: 'Resh', head: 'Head',
    shin: 'Shin', tooth: 'Tooth',
    taw: 'Taw', mark: 'Mark',
    grammarContentPhoenicianHtml: `
      <h3>1. Sentence Structure & Syntax</h3>
      <p>Phoenician follows a structure common to many ancient Semitic languages.</p>
      <ul>
        <li><strong>Word Order:</strong> The primary word order is <strong>Verb-Subject-Object (VSO)</strong>. Example: <code>pʿl h-ʾdm h-mlʾkt</code> (<code class="phoenician">𐤐𐤏𐤋 𐤄𐤀𐤃𐤌 𐤄𐤌𐤋𐤀𐤊𐤕</code>) - "The man did the work" (lit. "Did the man the work"). SVO order can be used for emphasis.</li>
        <li><strong>Negation:</strong> Verbs are typically negated with the particle <code>bal</code> (<code class="phoenician">𐤁𐤋</code>). Example: <code>bal ylk</code> (<code class="phoenician">𐤁𐤋 𐤉𐤋𐤊</code>) - "He will not go."</li>
        <li><strong>Questions:</strong> Questions could be formed by intonation or by using interrogative words like <code>my</code> (<code class="phoenician">𐤌𐤉</code>) for "who?" and <code>mh</code> (<code class="phoenician">𐤌𐤄</code>) for "what?".</li>
        <li><strong>Relative Clauses:</strong> Clauses are often introduced by the relative pronoun <code>ʾš</code> (<code class="phoenician">𐤀𐤔</code>), meaning "who, which, that". Example: <code>h-ʾš ʾš pʿl...</code> (<code class="phoenician">𐤄𐤀𐤔 𐤀𐤔 𐤐𐤏𐤋...</code>) - "The man who did...".</li>
      </ul>
      <h3>2. Nouns, Pronouns & Determiners</h3>
      <p>Nouns have gender (masculine/feminine) and number (singular/plural/dual).</p>
      <ul>
        <li><strong>Gender & Plurals:</strong> Masculine plurals usually end in <code>-m</code> (<code class="phoenician">𐤌</code>), while feminine singulars often end in <code>-t</code> (<code class="phoenician">𐤕</code>).</li>
        <li><strong>Possession (Construct State):</strong> Possession is shown by placing nouns next to each other. The first noun is in the "construct" form (often shortened) and the last noun carries the definite article. Example: <code>mlk ṣr</code> (<code class="phoenician">𐤌𐤋𐤊 𐤑𐤓</code>) - "king of Tyre". To say "the king of Tyre", it is <code>mlk h-ṣr</code> (<code class="phoenician">𐤌𐤋𐤊 𐤄𐤑𐤓</code>).</li>
        <li><strong>Possessive Suffixes:</strong> Pronouns can be attached to nouns as suffixes. Example: <code>ʾb</code> (<code class="phoenician">𐤀𐤁</code>) "father" becomes <code>ʾby</code> (<code class="phoenician">𐤀𐤁𐤉</code>) "my father".</li>
        <li><strong>Demonstratives:</strong> "This" is typically <code>z</code> (<code class="phoenician">𐤆</code>).</li>
      </ul>
      <h3>3. Verbs & Conjugation</h3>
      <p>Verbs are based on a three-consonant root and are conjugated based on aspect (completed vs. incomplete action) rather than tense.</p>
      <ul>
        <li><strong>Perfect Aspect (Qatal):</strong> Describes a completed action. Prefixes and suffixes indicate the person. Example (root K-T-B, to write): <code>ktb</code> (<code class="phoenician">𐤊𐤕𐤁</code>) - "he wrote"; <code>ktbt</code> (<code class="phoenician">𐤊𐤕𐤁𐤕</code>) - "she wrote"; <code>ktbty</code> (<code class="phoenician">𐤊𐤕𐤁𐤕𐤉</code>) - "I wrote".</li>
        <li><strong>Imperfect Aspect (Yiqtol):</strong> Describes an incomplete or future action. Example: <code>yktb</code> (<code class="phoenician">𐤉𐤊𐤕𐤁</code>) - "he will write"; <code>tktb</code> (<code class="phoenician">𐤕𐤊𐤕𐤁</code>) - "she will write"; <code>ʾktb</code> (<code class="phoenician">𐤀𐤊𐤕𐤁</code>) - "I will write".</li>
        <li><strong>Imperative:</strong> Commands are formed from the verb stem. Example: <code>ktb!</code> (<code class="phoenician">𐤊𐤕𐤁</code>) - "Write!".</li>
      </ul>
      <h3>4. Prepositions & Particles</h3>
      <p>Short particles are essential for connecting ideas.</p>
      <ul>
        <li><strong>Inseparable Prepositions:</strong> <code>b-</code> (<code class="phoenician">𐤁</code>) "in, with", <code>l-</code> (<code class="phoenician">𐤋</code>) "to, for", <code>k-</code> (<code class="phoenician">𐤊</code>) "as, like". These attach directly to the following word.</li>
        <li><strong>Other Particles:</strong> <code>ʿl</code> (<code class="phoenician">𐤏𐤋</code>) "on, upon", <code>mn</code> (<code class="phoenician">𐤌𐤍</code>) "from", <code>ʿm</code> (<code class="phoenician">𐤏𐤌</code>) "with".</li>
      </ul>
      <h3>5. Numbers & Counting</h3>
      <p>Numbers agree in gender with the noun they modify. Examples: <code>ʾḥd</code> (<code class="phoenician">𐤀𐤇𐤃</code>) - one, <code>šnm</code> (<code class="phoenician">𐤔𐤍𐤌</code>) - two, <code>šlš</code> (<code class="phoenician">𐤔𐤋𐤔</code>) - three, <code>ʿšr</code> (<code class="phoenician">𐤏𐤔𐤓</code>) - ten.</p>`,
    grammarContentPunicHtml: `
      <h3>1. From Phoenician to Punic</h3>
      <p>Punic grammar is a direct descendant of Phoenician, retaining its core Semitic structure. The primary changes occurred in pronunciation and spelling conventions over centuries of use in North Africa and the Mediterranean.</p>
      <h3>2. Phonology & Pronunciation (Key Changes)</h3>
      <p>The most significant differences between Phoenician and Punic are in their sounds and how they were written.</p>
      <ul>
        <li><strong>Weakened Gutturals:</strong> The throaty sounds of consonants like <code>ʿayin</code> (<code class="punic">𐤏</code>) and <code>ḥet</code> (<code class="punic">𐤇</code>) weakened and were often dropped in pronunciation and writing, especially in Late Punic.</li>
        <li><strong>Vowel Indication (Matres Lectionis):</strong> Punic made greater use of consonant letters to indicate vowels. This was rare in early Phoenician.
          <ul>
            <li><code>ʾaleph</code> (<code class="punic">𐤀</code>) became a placeholder for various vowel sounds.</li>
            <li><code>waw</code> (<code class="punic">𐤅</code>) was used for 'u' and 'o' sounds.</li>
            <li><code>yod</code> (<code class="punic">𐤉</code>) was used for 'i' and 'e' sounds.</li>
          </ul>
          This makes Punic inscriptions crucial for understanding how the language was spoken.
        </li>
        <li><strong>Vowel Shifts:</strong> The pronunciation of vowels changed over time. For example, the original long 'ā' often shifted to an 'ō' sound, which could then become 'ū' in Late Punic. Latin transcriptions of Punic names (e.g., Hannibal) help us reconstruct these sounds.</li>
      </ul>
      <h3>3. Verbs & Nouns</h3>
      <p>The fundamental verb (triliteral root, perfect/imperfect aspects) and noun systems (gender, number, construct state) remain the same as in Phoenician.</p>
      <ul>
        <li><strong>Pronouns:</strong> Some pronouns evolved. For instance, the 3rd person masculine singular pronoun <code>hwʾ</code> (<code class="phoenician">𐤄𐤅𐤀</code>, "he") often became simplified to <code>hʾ</code> (<code class="punic">𐤄𐤀</code>) in later Punic.</li>
        <li><strong>Loanwords:</strong> Punic incorporated words from surrounding languages, primarily Berber and Latin, especially for administrative and military terms.</li>
      </ul>
      <h3>4. Idioms & Expressions</h3>
      <p>Punic expressions continued Phoenician traditions but were also influenced by local North African cultures. Religious formulas, such as dedications to the gods <strong>Ba'al Hammon</strong> and <strong>Tanit</strong>, are very common in Punic inscriptions.</p>
      <ul>
        <li>A common votive formula is <code>l-ʾdn l-bʿl ḥmn... ndr ʾš ndr...</code> (<code class="punic">𐤋𐤀𐤃𐤍 𐤋𐤁𐤏𐤋 𐤇𐤌𐤍... 𐤍𐤃𐤓 𐤀𐤔 𐤍𐤃𐤓...</code>) which means "To the Lord, to Ba'al Hammon... the vow which [Name] vowed...".</li>
      </ul>`
  },
  fr: {
    mainTitle: 'Traducteur DBR',
    subtitle: 'Un outil web avancé utilisant l’IA pour offrir des traductions précises et une compréhension approfondie du patrimoine linguistique phénicien et punique.',
    unknownError: 'Une erreur inconnue est survenue.',
    translating: 'Traduction',
    comparing: 'Comparaison',
    compareVariants: 'Comparer les Dialectes',
    translate: 'Traduire',
    enterTextPlaceholder: 'Entrez le texte en',
    translationPlaceholder: 'La traduction apparaîtra ici...',
    copyError: 'La copie a échoué.',
    copySuccess: 'Copié !',
    copyTitle: 'Copier la traduction',
    saveSuccess: 'Enregistré !',
    saveTitle: 'Enregistrer la traduction',
    footerAllRightsReserved: 'Tous droits réservés.',
    speechError: 'Erreur de reconnaissance vocale',
    micError: 'Impossible de démarrer la reconnaissance vocale',
    micStop: 'Arrêter l\'écoute',
    micNotAvailable: 'Microphone non disponible pour cette langue',
    micStart: 'Démarrer l\'écoute',
    imageProcessError: 'Échec du traitement de l\'image.',
    fileReadError: 'Erreur de lecture du fichier.',
    handwritingTitle: 'Saisie manuscrite',
    keyboardClose: 'Fermer le clavier',
    keyboardOpen: 'Ouvrir le clavier',
    keyboardLabel: 'Clavier Virtuel',
    keySpace: 'Espace',
    keySymbols: '?123',
    keyLetters: 'ABC',
    manualTitle: 'Mode d\'emploi',
    dictionaryTitle: 'Glossaire Phénicien',
    savedTranslationsTitle: 'Traductions Enregistrées',
    lessonsTitle: 'Leçons',
    translatorMode: 'Traducteur',
    dialectMode: 'Variantes Dialectales',
    grammarHelper: 'Assistant Grammatical',
    compareCognates: "Comparer Cognats (H/A/A)",
    hebrewCognate: "Cognat Hébreu",
    arabicCognate: "Cognat Arabe",
    aramaicCognate: "Cognat Araméen",
    scriptView: 'Vue du Script',
    phoenicianDialect: 'Dialecte Phénicien',
    comparisonResultsTitle: 'Résultats de la Comparaison',
    comparingVariants: 'Comparaison des variantes dialectales...',
    grammarPanelHint: 'Cliquez sur un mot pour voir ses détails grammaticaux.',
    grammarType: 'Type :',
    grammarDescription: 'Description :',
    savedTitle: 'Traductions Enregistrées',
    savedClose: 'Fermer les traductions',
    savedEmpty: 'Vous n\'avez aucune traduction enregistrée.',
    savedSelect: 'Sélectionner la traduction',
    savedNoteEdit: 'Ajouter ou modifier la note',
    savedDelete: 'Supprimer la traduction',
    savedCancel: 'Annuler',
    savedSaveNote: 'Enregistrer la Note',
    savedSelectAll: 'Tout Sélectionner',
    savedExport: 'Exporter',
    savedClear: 'Effacer l\'Historique',
    addNotesPlaceholder: 'Ajoutez vos notes ici...',
    manualHeader: 'Manuel d\'utilisation',
    manualClose: 'Fermer le manuel',
    manualWelcomeTitle: 'Bienvenue sur le Traducteur DBR !',
    manualWelcomeSub: 'Votre portail vers le monde antique des langues phénicienne et punique. Voici un guide rapide pour commencer.',
    manualS1Title: '1. Le Traducteur',
    manualS1L1: '<strong>🌐 Sélection des Langues :</strong> Choisissez vos langues source et cible. L\'application gérera intelligemment les inversions si vous choisissez la même langue pour les deux.',
    manualS1L2: '<strong>✍️ Saisie de Votre Texte :</strong> Le panneau de gauche est pour votre saisie. Utilisez nos outils avancés :',
    manualS1L2_1: '<strong>📷 Saisie par Caméra :</strong> Utilisez l\'icône de la caméra pour activer le mode RA. Pointez-la vers des objets pour voir leurs noms en phénicien ou pour scanner des textes anciens.',
    manualS1L2_2: '<strong>✍️ Écriture Manuscrite :</strong> Dessinez des caractères sur la toile. Notre IA les reconnaîtra.',
    manualS1L2_3: '<strong>⌨️ Clavier Virtuel :</strong> Accédez à des claviers spécialisés pour le phénicien, le punique, et plus encore.',
    manualS1L2_4: '<strong>🎤 Saisie Vocale :</strong> Dictez le texte directement avec votre microphone (pour les langues modernes).',
    manualS1L3: '<strong>🚀 Traduire :</strong> Appuyez sur le bouton principal pour voir la magie opérer. Votre traduction apparaît à droite.',
    manualS2Title: '2. Explorez Votre Traduction',
    manualS2L1: '<strong>🛠️ Outils de Résultat :</strong> Une barre d\'outils apparaît au-dessus de votre traduction avec des options puissantes :',
    manualS2L1_1: '<strong>✨ Assistant IA :</strong> Affinez votre traduction. Demandez à l\'IA de la rendre plus poétique, de changer un mot ou d\'expliquer une nuance.',
    manualS2L1_2: '<strong>🗣️ Synthèse Vocale :</strong> Écoutez votre traduction lue à voix haute. Pour le phénicien, elle lit la translittération académique.',
    manualS2L1_3: '<strong>🎨 Éditeur de Mise en Page :</strong> Soyez créatif ! Glissez, redimensionnez et faites pivoter les mots de votre traduction pour créer un graphique personnalisé.',
    manualS2L1_4: '<strong>📋 Copier & 💾 Enregistrer :</strong> Copiez facilement vos résultats ou sauvegardez-les dans votre collection personnelle.',
    manualS2L2: '<strong>🧠 Aperçus Approfondis :</strong>',
    manualS2L2_1: '<strong>🎓 Assistant Grammatical :</strong> Activez cette option pour voir une analyse grammaticale avec un code couleur. Cliquez sur n\'importe quel mot pour comprendre son rôle dans la phrase.',
    manualS2L2_2: '<strong>🤝 Comparaison de Cognats :</strong> Découvrez des liens linguistiques. Voyez les mots apparentés en hébreu, arabe et araméen.',
    manualS2L2_3: '<strong>↔️ Mode Dialecte :</strong> Passez de "Traducteur" à "Variantes Dialectales" pour voir comment une phrase diffère entre le phénicien standard et sa forme punique tardive.',
    manualS3Title: '3. Apprentissage & Découverte',
    manualS3L1: '<strong>📚 Menu Principal (en haut à droite) :</strong>',
    manualS3L1_1: '<strong>𐤀 Dictionnaire :</strong> Un glossaire complet. Recherchez des mots par script phénicien, translittération ou signification dans plusieurs langues.',
    manualS3L1_2: '<strong>📜 Leçons :</strong> Apprenez l\'alphabet et plongez dans la grammaire des dialectes phénicien et punique.',
    manualS3L1_3: '<strong>❓ Manuel d\'Utilisation :</strong> Vous le lisez actuellement !',
    manualS3L1_4: '<strong>🗂️ Traductions Enregistrées :</strong> Accédez à votre travail sauvegardé, ajoutez des notes et exportez.',
    manualS3L2: '<strong>💬 Tuteur IA :</strong> Cliquez sur la bulle de chat flottante pour démarrer une conversation avec un tuteur IA. Pratiquez votre phénicien dans un environnement interactif et guidé.',
    manualS4Title: '4. Personnalisation & Exportation',
    manualS4L1: '<strong>⚙️ Paramètres (en haut à gauche) :</strong>',
    manualS4L1_1: '<strong>🌍 Langue de l\'Interface :</strong> Changez la langue de l\'interface de l\'application (EN/FR/AR).',
    manualS4L1_2: '<strong>🎨 Thème :</strong> Basculez entre les thèmes Sombre, Clair et Papyrus.',
    manualS4L1_3: '<strong>🇦 Taille de Police :</strong> Ajustez la taille du texte pour votre confort.',
    manualS4L2: '<strong>📤 Exportation :</strong> Depuis vos traductions enregistrées, vous pouvez sélectionner une ou plusieurs entrées et les exporter en <strong>PDF</strong> magnifiquement formaté ou en image <strong>PNG/JPG</strong> haute résolution.',
    handwritingHeader: 'Saisie Manuscrite Phénicienne',
    handwritingClose: 'Fermer la saisie manuscrite',
    handwritingClear: 'Effacer',
    handwritingUndo: 'Annuler',
    handwritingRedo: 'Rétablir',
    handwritingRecognize: 'Reconnaître',
    handwritingRecognizing: 'Reconnaissance...',
    themeSwitchDark: 'Passer en mode sombre',
    themeSwitchLight: 'Passer en mode clair',
    themeSwitchPapyrus: 'Passer en mode papyrus',
    themeSwitchPurple: 'Passer au mode violet-vitreux',
    chatFabTitle: 'Ouvrir le Tuteur IA',
    chatHeaderPhoenician: 'Tuteur IA de Phénicien',
    chatHeaderPunic: 'Tuteur IA de Punique',
    chatSubheader: 'Pratiquez votre conversation en phénicien !',
    chatClose: 'Fermer le chat',
    chatPlaceholderPhoenician: 'Écrivez en phénicien...',
    chatPlaceholderPunic: 'Écrivez en punique...',
    chatErrorInit: "Désolé, je n'ai pas pu me connecter au tuteur IA. (Erreur d'initialisation du chat.)",
    chatErrorResponse: "J'ai du mal à répondre en ce moment. (Échec de l'obtention de la réponse.)",
    dailyWordTitle: 'MOT DU JOUR (PHÉNICIEN & PUNIQUE)',
    dailyWordNew: 'Obtenir un nouveau mot',
    dailyWordClose: 'Fermer la carte du mot du jour',
    dailyWordError: 'Impossible de charger le mot du jour.',
    dailyWordUsage: 'UTILISATION DANS UNE PHRASE',
    dictionaryHeader: 'Glossaire Phénicien',
    punicGlossaryTitle: 'Glossaire Punique',
    phoenicianGlossaryTitle: 'Glossaire Phénicien',
    dictionaryClose: 'Fermer le dictionnaire',
    dictionarySearch: 'Rechercher en Français...',
    dictionarySearch_fr: 'Rechercher en Français...',
    dictionarySearch_ar: 'Rechercher en Arabe...',
    dictionaryAll: 'Tous',
    dictionaryFound: 'mots trouvés (sur',
    dictionaryTotal: 'total)',
    dictionaryNone: 'Aucun mot correspondant trouvé.',
    dictionaryNoneSub: 'Essayez de supprimer les filtres ou de vérifier votre orthographe.',
    theonyms: 'Théonymes',
    personalNames: 'Noms Personnels',
    locationNames: 'Noms de Lieux',
    standardPhoenician: 'Phénicien',
    punic: 'Punique',
    english: 'Anglais',
    phoenician: 'Phénicien',
    arabic: 'Arabe',
    french: 'Français',
    spanish: 'Espagnol',
    italian: 'Italien',
    chinese: 'Chinois',
    japanese: 'Japonais',
    turkish: 'Turc',
    greek: 'Grec',
    german: 'Allemand',
    latin: 'Latin',
    both: 'Tout',
    dailyWordLatinTransliteration: 'Translittération Latine',
    dailyWordArabicTransliteration: 'Translittération Arabe',
    dailyWordMeaning: 'Signification',
    previewTextTitle: 'Aperçu du Texte',
    noun: 'Nom',
    verb: 'Verbe',
    adjective: 'Adjectif',
    adverb: 'Adverbe',
    preposition: 'Préposition',
    conjunction: 'Conjonction',
    pronoun: 'Pronom',
    numeral: 'Numéral',
    particle: 'Particule',
    interjection: 'Interjection',
    layoutEditTitle: 'Modifier la mise en page',
    exportJpg: 'Enregistrer JPG',
    exportPng: 'Enregistrer PNG',
    exportPdf: 'Enregistrer PDF',
    done: 'Terminé',
    exporting: 'Exportation...',
    transliterationSectionTitle: 'Latin',
    fontSizeManagerTitle: 'Gérer la taille de la police',
    fontSize: 'Taille de police',
    reset: 'Réinitialiser',
    increaseFontSize: 'Augmenter la taille de la police',
    decreaseFontSize: 'Diminuer la taille de la police',
    fontSizeSmall: 'Petite',
    fontSizeMedium: 'Moyenne',
    fontSizeLarge: 'Grande',
    textScannerTitle: 'RA & Caméra',
    cameraError: 'Impossible d\'accéder à la caméra. Veuillez vérifier les autorisations et vous assurer que votre navigateur prend en charge cette fonctionnalité.',
    uploadPhoto: 'Télécharger depuis l\'appareil',
    speakTranslation: 'Lire la traduction',
    stopSpeaking: 'Arrêter la lecture',
    ttsNotSupported: 'La synthèse vocale n\'est pas supportée par votre navigateur.',
    close: 'Fermer',
    downloadPhoto: 'Télécharger la Photo',
    switchCamera: 'Changer de Caméra',
    arView: 'Vue RA',
    advancedSettings: 'Paramètres Avancés',
    focus: 'Mise au point',
    exposure: 'Exposition',
    whiteBalance: 'Balance des blancs',
    brightness: 'Luminosité',
    contrast: 'Contraste',
    zoom: 'Zoom',
    analyzeObjects: 'Analyser',
    arToggle: 'Activer/Désactiver la RA',
    aiAssistantTitle: 'Assistant IA',
    aiAssistantHeader: 'Assistant de Traduction IA',
    aiAssistantSubheader: 'Affinez votre traduction avec l\'IA',
    aiAssistantSource: 'Texte Source',
    aiAssistantOriginal: 'Traduction Originale',
    aiAssistantRequestPlaceholder: 'Ex: "Changez le mot pour \'roi\' en \'souverain\'" ou "Rendez-le plus poétique."',
    aiAssistantGetResponse: 'Obtenir Suggestion',
    aiAssistantGettingResponse: 'Obtention de la suggestion...',
    aiAssistantImproved: 'Traduction Améliorée',
    aiAssistantExplanation: 'Explication',
    aiAssistantApply: 'Appliquer',
    aiAssistantError: "L'assistant n'a pas pu traiter votre demande.",
    arAnalysisFailed: "L'analyse RA a échoué. Veuillez réessayer.",
    grayscale: 'Niveaux de gris',
    resetAdjustments: 'Réinitialiser les ajustements',
    lessonsHeader: 'Leçons de Phénicien & Punique',
    lessonsClose: 'Fermer les Leçons',
    alphabetTab: 'Alphabet',
    grammarTab: 'Grammaire',
    alphabetIntro: 'L\'alphabet phénicien se compose de 22 consonnes. Les voyelles n\'étaient généralement pas écrites. L\'écriture punique est une forme plus tardive et plus cursive de cet alphabet.',
    aleph: 'Aleph', ox: 'Bœuf',
    bet: 'Bet', house: 'Maison',
    gimel: 'Gimel', camel: 'Chameau',
    dalet: 'Dalet', door: 'Porte',
    he: 'He', window: 'Fenêtre',
    waw: 'Waw', hook: 'Crochet',
    zayin: 'Zayin', weapon: 'Arme',
    het: 'Het', fence: 'Clôture',
    tet: 'Tet', wheel: 'Roue',
    yod: 'Yod', hand: 'Main',
    kaph: 'Kaph', palm_of_hand: 'Paume de main',
    lamed: 'Lamed', goad: 'Aiguillon',
    mem: 'Mem', water: 'Eau',
    nun: 'Nun', fish: 'Poisson',
    samekh: 'Samekh', pillar: 'Pilier',
    ayin: 'Ayin', eye: 'Œil',
    pe: 'Pe', mouth: 'Bouche',
    sade: 'Sade', plant: 'Plante',
    qoph: 'Qoph', monkey: 'Singe',
    resh: 'Resh', head: 'Tête',
    shin: 'Shin', tooth: 'Dent',
    taw: 'Taw', mark: 'Marque',
    grammarContentPhoenicianHtml: `
      <h3>1. Structure de la Phrase & Syntaxe</h3>
      <p>Le phénicien suit une structure commune à de nombreuses langues sémitiques anciennes.</p>
      <ul>
        <li><strong>Ordre des mots :</strong> L'ordre principal est <strong>Verbe-Sujet-Objet (VSO)</strong>. Exemple : <code>pʿl h-ʾdm h-mlʾkt</code> (<code class="phoenician">𐤐𐤏𐤋 𐤄𐤀𐤃𐤌 𐤄𐤌𐤋𐤀𐤊𐤕</code>) - "L'homme fit le travail" (litt. "Fit l'homme le travail"). L'ordre SVO peut être utilisé pour l'emphase.</li>
        <li><strong>Négation :</strong> Les verbes sont généralement niés avec la particule <code>bal</code> (<code class="phoenician">𐤁𐤋</code>). Exemple : <code>bal ylk</code> (<code class="phoenician">𐤁𐤋 𐤉𐤋𐤊</code>) - "Il n'ira pas."</li>
        <li><strong>Interrogations :</strong> Les questions pouvaient être formées par l'intonation ou en utilisant des mots interrogatifs comme <code>my</code> (<code class="phoenician">𐤌𐤉</code>) pour "qui ?" et <code>mh</code> (<code class="phoenician">𐤌𐤄</code>) pour "quoi ?".</li>
        <li><strong>Propositions relatives :</strong> Les propositions sont souvent introduites par le pronom relatif <code>ʾš</code> (<code class="phoenician">𐤀𐤔</code>), signifiant "qui, que". Exemple : <code>h-ʾš ʾš pʿl...</code> (<code class="phoenician">𐤄𐤀𐤔 𐤀𐤔 𐤐𐤏𐤋...</code>) - "L'homme qui fit...".</li>
      </ul>
      <h3>2. Noms, Pronoms & Déterminants</h3>
      <p>Les noms ont un genre (masculin/féminin) et un nombre (singulier/pluriel/duel).</p>
      <ul>
        <li><strong>Genre & Pluriels :</strong> Les pluriels masculins se terminent généralement par <code>-m</code> (<code class="phoenician">𐤌</code>), tandis que les singuliers féminins se terminent souvent par <code>-t</code> (<code class="phoenician">𐤕</code>).</li>
        <li><strong>Possession (État construit) :</strong> La possession est indiquée en plaçant les noms les uns à côté des autres. Le premier nom est à la forme "construite" (souvent raccourcie) et le dernier nom porte l'article défini. Exemple : <code>mlk ṣr</code> (<code class="phoenician">𐤌𐤋𐤊 𐤑𐤓</code>) - "roi de Tyr". Pour dire "le roi de Tyr", on dit <code>mlk h-ṣr</code> (<code class="phoenician">𐤌𐤋𐤊 𐤄𐤑𐤓</code>).</li>
        <li><strong>Suffixes possessifs :</strong> Les pronoms peuvent être attachés aux noms comme suffixes. Exemple : <code>ʾb</code> (<code class="phoenician">𐤀𐤁</code>) "père" devient <code>ʾby</code> (<code class="phoenician">𐤀𐤁𐤉</code>) "mon père".</li>
        <li><strong>Démonstratifs :</strong> "Ceci" est typiquement <code>z</code> (<code class="phoenician">𐤆</code>).</li>
      </ul>
      <h3>3. Verbes & Conjugaison</h3>
      <p>Les verbes sont basés sur une racine de trois consonnes et sont conjugués selon l'aspect (action accomplie vs inaccomplie) plutôt que le temps.</p>
      <ul>
        <li><strong>Aspect accompli (Qatal) :</strong> Décrit une action terminée. Les préfixes et suffixes indiquent la personne. Exemple (racine K-T-B, écrire) : <code>ktb</code> (<code class="phoenician">𐤊𐤕𐤁</code>) - "il a écrit" ; <code>ktbt</code> (<code class="phoenician">𐤊𐤕𐤁𐤕</code>) - "elle a écrit" ; <code>ktbty</code> (<code class="phoenician">𐤊𐤕𐤁𐤕𐤉</code>) - "j'ai écrit".</li>
        <li><strong>Aspect inaccompli (Yiqtol) :</strong> Décrit une action inachevée ou future. Exemple : <code>yktb</code> (<code class="phoenician">𐤉𐤊𐤕𐤁</code>) - "il écrira" ; <code>tktb</code> (<code class="phoenician">𐤕𐤊𐤕𐤁</code>) - "elle écrira" ; <code>ʾktb</code> (<code class="phoenician">𐤀𐤊𐤕𐤁</code>) - "j'écrirai".</li>
        <li><strong>Impératif :</strong> Les ordres sont formés à partir du radical du verbe. Exemple : <code>ktb!</code> (<code class="phoenician">𐤊𐤕𐤁</code>) - "Écris !".</li>
      </ul>
      <h3>4. Prépositions & Particules</h3>
      <p>Les particules courtes sont essentielles pour relier les idées.</p>
      <ul>
        <li><strong>Prépositions inséparables :</strong> <code>b-</code> (<code class="phoenician">𐤁</code>) "dans, avec", <code>l-</code> (<code class="phoenician">𐤋</code>) "à, pour", <code>k-</code> (<code class="phoenician">𐤊</code>) "comme". Elles s'attachent directement au mot suivant.</li>
        <li><strong>Autres particules :</strong> <code>ʿl</code> (<code class="phoenician">𐤏𐤋</code>) "sur", <code>mn</code> (<code class="phoenician">𐤌𐤍</code>) "de", <code>ʿm</code> (<code class="phoenician">𐤏𐤌</code>) "avec".</li>
      </ul>
      <h3>5. Nombres & Comptage</h3>
      <p>Les nombres s'accordent en genre avec le nom qu'ils modifient. Exemples : <code>ʾḥd</code> (<code class="phoenician">𐤀𐤇𐤃</code>) - un, <code>šnm</code> (<code class="phoenician">𐤔𐤍𐤌</code>) - deux, <code>šlš</code> (<code class="phoenician">𐤔𐤋𐤔</code>) - trois, <code>ʿšr</code> (<code class="phoenician">𐤏𐤔𐤓</code>) - dix.</p>`,
    grammarContentPunicHtml: `
      <h3>1. Du Phénicien au Punique</h3>
      <p>La grammaire punique est une descendante directe du phénicien, conservant sa structure sémitique de base. Les principaux changements se sont produits dans la prononciation et les conventions orthographiques au fil des siècles d'utilisation en Afrique du Nord et en Méditerranée.</p>
      <h3>2. Phonologie & Prononciation (Changements clés)</h3>
      <p>Les différences les plus significatives entre le phénicien et le punique résident dans leurs sons et leur écriture.</p>
      <ul>
        <li><strong>Affaiblissement des gutturales :</strong> Les sons gutturaux des consonnes comme <code>ʿayin</code> (<code class="punic">𐤏</code>) et <code>ḥet</code> (<code class="punic">𐤇</code>) se sont affaiblis et ont souvent été abandonnés dans la prononciation et l'écriture, surtout en punique tardif.</li>
        <li><strong>Indication des voyelles (Matres Lectionis) :</strong> Le punique a fait un plus grand usage des lettres-consonnes pour indiquer les voyelles. C'était rare en phénicien ancien.
          <ul>
            <li><code>ʾaleph</code> (<code class="punic">𐤀</code>) est devenu un substitut pour divers sons de voyelles.</li>
            <li><code>waw</code> (<code class="punic">𐤅</code>) était utilisé pour les sons 'u' et 'o'.</li>
            <li><code>yod</code> (<code class="punic">𐤉</code>) était utilisé pour les sons 'i' et 'e'.</li>
          </ul>
          Cela rend les inscriptions puniques cruciales pour comprendre comment la langue était parlée.
        </li>
        <li><strong>Changements vocaliques :</strong> La prononciation des voyelles a changé avec le temps. Par exemple, le 'ā' long original a souvent évolué en un son 'ō', qui pouvait ensuite devenir 'ū' en punique tardif. Les transcriptions latines de noms puniques (par ex., Hannibal) nous aident à reconstituer ces sons.</li>
      </ul>
      <h3>3. Verbes & Noms</h3>
      <p>Les systèmes fondamentaux du verbe (racine trilitère, aspects accompli/inaccompli) et du nom (genre, nombre, état construit) restent les mêmes qu'en phénicien.</p>
      <ul>
        <li><strong>Pronoms :</strong> Certains pronoms ont évolué. Par exemple, le pronom de la 3e personne du masculin singulier <code>hwʾ</code> (<code class="phoenician">𐤄𐤅𐤀</code>, "il") est souvent devenu simplifié en <code>hʾ</code> (<code class="punic">𐤄𐤀</code>) en punique tardif.</li>
        <li><strong>Mots d'emprunt :</strong> Le punique a incorporé des mots des langues environnantes, principalement le berbère et le latin, en particulier pour les termes administratifs et militaires.</li>
      </ul>
      <h3>4. Idiomes & Expressions</h3>
      <p>Les expressions puniques ont perpétué les traditions phéniciennes mais ont également été influencées par les cultures locales d'Afrique du Nord. Les formules religieuses, telles que les dédicaces aux dieux <strong>Ba'al Hammon</strong> et <strong>Tanit</strong>, sont très courantes dans les inscriptions puniques.</p>
      <ul>
        <li>Une formule votive courante est <code>l-ʾdn l-bʿl ḥmn... ndr ʾš ndr...</code> (<code class="punic">𐤋𐤀𐤃𐤍 𐤋𐤁𐤏𐤋 𐤇𐤌𐤍... 𐤍𐤃𐤓 𐤀𐤔 𐤍𐤃𐤓...</code>) qui signifie "Au Seigneur, à Ba'al Hammon... le vœu que [Nom] a fait...".</li>
      </ul>`
  },
  ar: {
    mainTitle: 'مترجم DBR',
    subtitle: 'أداة ويب متقدمة تستخدم الذكاء الاصطناعي لتقديم ترجمات دقيقة وفهماً أعمق للتراث اللغوي الفينيقي والبونيقي.',
    unknownError: 'حدث خطأ غير معروف.',
    translating: 'جارٍ الترجمة',
    comparing: 'جارٍ المقارنة',
    compareVariants: 'قارن اللهجات',
    translate: 'ترجم',
    enterTextPlaceholder: 'أدخل النص بـ',
    translationPlaceholder: 'ستظهر الترجمة هنا...',
    copyError: 'فشل نسخ النص.',
    copySuccess: 'تم النسخ!',
    copyTitle: 'نسخ الترجمة',
    saveSuccess: 'تم الحفظ!',
    saveTitle: 'حفظ الترجمة',
    footerAllRightsReserved: 'جميع الحقوق محفوظة.',
    speechError: 'خطأ في التعرف على الكلام',
    micError: 'لم يتمكن من بدء التعرف على الكلام',
    micStop: 'إيقاف الاستماع',
    micNotAvailable: 'الميكروفون غير متوفر لهذه اللغة',
    micStart: 'بدء الاستماع',
    imageProcessError: 'فشل في معالجة الصورة.',
    fileReadError: 'خطأ في قراءة الملف.',
    handwritingTitle: 'إدخال بخط اليد',
    keyboardClose: 'إغلاق لوحة المفاتيح',
    keyboardOpen: 'فتح لوحة المفاتيح',
    keyboardLabel: 'لوحة مفاتيح افتراضية',
    keySpace: 'مسافة',
    keySymbols: '؟123',
    keyLetters: 'أبت',
    manualTitle: 'دليل الاستخدام',
    dictionaryTitle: 'قاموس فينيقي',
    savedTranslationsTitle: 'الترجمات المحفوظة',
    lessonsTitle: 'دروس',
    translatorMode: 'مترجم',
    dialectMode: 'لهجات مختلفة',
    grammarHelper: 'مساعد القواعد',
    compareCognates: "مقارنة الجذور (ع/ع/آ)",
    hebrewCognate: "الجذر العبري",
    arabicCognate: "الجذر العربي",
    aramaicCognate: "الجذر الآرامي",
    scriptView: 'عرض النص',
    phoenicianDialect: 'اللهجة الفينيقية',
    comparisonResultsTitle: 'نتائج المقارنة',
    comparingVariants: 'تتم مقارنة اللهجات المختلفة...',
    grammarPanelHint: 'انقر على كلمة لرؤية تفاصيلها النحوية.',
    grammarType: 'النوع:',
    grammarDescription: 'الوصف:',
    savedTitle: 'الترجمات المحفوظة',
    savedClose: 'إغلاق الترجمات المحفوظة',
    savedEmpty: 'ليس لديك ترجمات محفوظة بعد.',
    savedSelect: 'اختر الترجمة',
    savedNoteEdit: 'أضف أو عدّل الملاحظة',
    savedDelete: 'حذف الترجمة',
    savedCancel: 'إلغاء',
    savedSaveNote: 'حفظ الملاحظة',
    savedSelectAll: 'تحديد الكل',
    savedExport: 'تصدير',
    savedClear: 'مسح السجل',
    addNotesPlaceholder: 'أضف ملاحظاتك هنا...',
    manualHeader: 'دليل المستخدم',
    manualClose: 'إغلاق دليل الاستخدام',
    manualWelcomeTitle: '!أهلاً بك في مترجم DBR',
    manualWelcomeSub: 'بوابتك إلى العالم القديم للغات الفينيقية والبونيقية. إليك دليل سريع للبدء.',
    manualS1Title: '١. المترجم',
    manualS1L1: '<strong>🌐 اختر اللغات:</strong> حدد لغات المصدر والهدف. سيقوم التطبيق بالتبديل بذكاء إذا اخترت نفس اللغة لكليهما.',
    manualS1L2: '<strong>✍️ أدخل نصك:</strong> اللوحة اليسرى مخصصة لإدخالاتك. استخدم أدواتنا المتقدمة:',
    manualS1L2_1: '<strong>📷 الإدخال بالكاميرا:</strong> استخدم أيقونة الكاميرا لتفعيل وضع الواقع المعزز. وجّهها نحو الأشياء لرؤية أسمائها بالفينيقية أو لمسح النصوص القديمة ضوئياً.',
    manualS1L2_2: '<strong>✍️ الكتابة اليدوية:</strong> ارسم الحروف على اللوحة وسيتعرف عليها الذكاء الاصطناعي.',
    manualS1L2_3: '<strong>⌨️ لوحة المفاتيح الافتراضية:</strong> استخدم لوحات مفاتيح متخصصة للفينيقية والبونيقية وغيرها.',
    manualS1L2_4: '<strong>🎤 الإدخال الصوتي:</strong> أملِ النص مباشرة باستخدام الميكروفون (للغات الحديثة).',
    manualS1L3: '<strong>🚀 ترجم:</strong> اضغط على الزر الرئيسي لترى السحر. تظهر ترجمتك على اليمين.',
    manualS2Title: '٢. استكشف ترجمتك',
    manualS2L1: '<strong>🛠️ أدوات النتيجة:</strong> يظهر شريط أدوات فوق ترجمتك بخيارات قوية:',
    manualS2L1_1: '<strong>✨ مساعد الذكاء الاصطناعي:</strong> حسّن ترجمتك. اطلب من الذكاء الاصطناعي جعلها أكثر شاعرية، أو تغيير كلمة، أو شرح فارق بسيط.',
    manualS2L1_2: '<strong>🗣️ تحويل النص إلى كلام:</strong> استمع إلى ترجمتك بصوت عالٍ. بالنسبة للفينيقية، فإنه يقرأ النقل الحرفي الأكاديمي.',
    manualS2L1_3: '<strong>🎨 محرر التخطيط:</strong> كن مبدعًا! اسحب كلمات ترجمتك وغيّر حجمها وقم بتدويرها لإنشاء رسم مخصص.',
    manualS2L1_4: '<strong>📋 نسخ و 💾 حفظ:</strong> انسخ نتائجك بسهولة أو احفظها في مجموعتك الشخصية.',
    manualS2L2: '<strong>🧠 رؤى أعمق:</strong>',
    manualS2L2_1: '<strong>🎓 مساعد القواعد:</strong> قم بتفعيل هذا الخيار لرؤية تحليل نحوي مرمّز بالألوان. انقر على أي كلمة لفهم دورها في الجملة.',
    manualS2L2_2: '<strong>🤝 مقارنة الجذور:</strong> اكتشف الروابط اللغوية. شاهد الكلمات ذات الصلة في العبرية والعربية والآرامية.',
    manualS2L2_3: '<strong>↔️ وضع اللهجات:</strong> بدّل من "المترجم" إلى "اللهجات المختلفة" لترى كيف تختلف العبارة بين الفينيقية القياسية وشكلها البونيقي المتأخر.',
    manualS3Title: '٣. التعلم والاكتشاف',
    manualS3L1: '<strong>📚 القائمة الرئيسية (أعلى اليمين):</strong>',
    manualS3L1_1: '<strong>𐤀 القاموس:</strong> معجم شامل. ابحث عن الكلمات بالكتابة الفينيقية، أو النقل الحرفي، أو المعنى بلغات متعددة.',
    manualS3L1_2: '<strong>📜 الدروس:</strong> تعلم الأبجدية وتعمق في قواعد اللهجتين الفينيقية والبونيقية.',
    manualS3L1_3: '<strong>❓ دليل الاستخدام:</strong> أنت تقرأه الآن!',
    manualS3L1_4: '<strong>🗂️ الترجمات المحفوظة:</strong> يمكنك الوصول إلى عملك المحفوظ وإضافة ملاحظات وتصديره.',
    manualS3L2: '<strong>💬 مدرس الذكاء الاصطناعي:</strong> انقر على فقاعة الدردشة العائمة لبدء محادثة مع مدرس ذكاء اصطناعي. مارس لغتك الفينيقية في بيئة تفاعلية وموجهة.',
    manualS4Title: '٤. التخصيص والتصدير',
    manualS4L1: '<strong>⚙️ الإعدادات (أعلى اليسار):</strong>',
    manualS4L1_1: '<strong>🌍 لغة الواجهة:</strong> قم بتغيير لغة واجهة التطبيق (EN/FR/AR).',
    manualS4L1_2: '<strong>🎨 المظهر:</strong> تنقل بين المظاهر الداكنة والفاتحة والبردية.',
    manualS4L1_3: '<strong>🇦 حجم الخط:</strong> اضبط حجم النص لراحتك.',
    manualS4L2: '<strong>📤 التصدير:</strong> من ترجماتك المحفوظة، يمكنك تحديد إدخال واحد أو أكثر وتصديره كملف <strong>PDF</strong> منسق بشكل جميل أو صورة <strong>PNG/JPG</strong> عالية الدقة.',
    handwritingHeader: 'إدخال خط اليد الفينيقي',
    handwritingClose: 'إغلاق لوحة الكتابة اليدوية',
    handwritingClear: 'مسح',
    handwritingUndo: 'تراجع',
    handwritingRedo: 'إعادة',
    handwritingRecognize: 'تعرف',
    handwritingRecognizing: 'جارٍ التعرف...',
    themeSwitchDark: 'التبديل إلى الوضع الداكن',
    themeSwitchLight: 'التبديل إلى الوضع الفاتح',
    themeSwitchPapyrus: 'التبديل إلى وضع البردي',
    themeSwitchPurple: 'التبديل إلى الوضع الزجاجي الأرجواني',
    chatFabTitle: 'افتح مدرس الذكاء الاصطناعي',
    chatHeaderPhoenician: 'مدرس الذكاء الاصطناعي الفينيقي',
    chatHeaderPunic: 'مدرس الذكاء الاصطناعي البونيقي',
    chatSubheader: 'تدرب على مهارات المحادثة باللغة الفينيقية!',
    chatClose: 'إغلاق الدردشة',
    chatPlaceholderPhoenician: 'اكتب باللغة الفينيقية...',
    chatPlaceholderPunic: 'اكتب باللغة البونيقية...',
    chatErrorInit: 'عذراً، لم أتمكن من الاتصال بمدرس الذكاء الاصطناعي. (خطأ في تهيئة الدردشة.)',
    chatErrorResponse: 'أواجه مشكلة في الرد الآن. (فشل في الحصول على استجابة.)',
    dailyWordTitle: 'كلمة اليوم (فينيقي و بونيقي)',
    dailyWordNew: 'احصل على كلمة جديدة',
    dailyWordClose: 'إغلاق بطاقة الكلمة اليومية',
    dailyWordError: 'تعذر تحميل كلمة اليوم.',
    dailyWordUsage: 'الاستخدام في جملة',
    dictionaryHeader: 'قاموس فينيقي',
    punicGlossaryTitle: 'قاموس بونيقي',
    phoenicianGlossaryTitle: 'قاموس فينيقي',
    dictionaryClose: 'إغلاق القاموس',
    dictionarySearch: 'ابحث باللغة العربية...',
    dictionarySearch_fr: 'ابحث باللغة الفرنسية...',
    dictionarySearch_ar: 'ابحث باللغة العربية...',
    dictionaryAll: 'الكل',
    dictionaryFound: 'كلمات تم العثور عليها (من',
    dictionaryTotal: 'المجموع)',
    dictionaryNone: 'لم يتم العثور على كلمات مطابقة.',
    dictionaryNoneSub: 'حاول مسح المرشحات أو التحقق من الإملاء.',
    theonyms: 'أسماء الآلهة',
    personalNames: 'أسماء الأشخاص',
    locationNames: 'أسماء الأماكن',
    standardPhoenician: 'فينيقي',
    punic: 'بونيقي',
    english: 'الإنجليزية',
    phoenician: 'فينيقي',
    arabic: 'العربية',
    french: 'الفرنسية',
    spanish: 'الإسبانية',
    italian: 'الإيطالية',
    chinese: 'الصينية',
    japanese: 'اليابانية',
    turkish: 'التركية',
    greek: 'اليونانية',
    german: 'الألمانية',
    latin: 'اللاتينية',
    both: 'الكل',
    dailyWordLatinTransliteration: 'النقل الحرفي اللاتيني',
    dailyWordArabicTransliteration: 'النقل الحرفي العربي',
    dailyWordMeaning: 'المعنى',
    previewTextTitle: 'معاينة النص',
    noun: 'اسم',
    verb: 'فعل',
    adjective: 'صفة',
    adverb: 'ظرف',
    preposition: 'حرف جر',
    conjunction: 'حرف عطف',
    pronoun: 'ضمير',
    numeral: 'عدد',
    particle: 'أداة',
    interjection: 'أداة تعجب',
    layoutEditTitle: 'تعديل التخطيط',
    exportJpg: 'حفظ JPG',
    exportPng: 'حفظ PNG',
    exportPdf: 'حفظ PDF',
    done: 'تم',
    exporting: 'جارٍ التصدير...',
    transliterationSectionTitle: 'النقل الحرفي: عربي و لاتيني',
    fontSizeManagerTitle: 'إدارة حجم الخط',
    fontSize: 'حجم الخط',
    reset: 'إعادة تعيين',
    increaseFontSize: 'تكبير حجم الخط',
    decreaseFontSize: 'تصغير حجم الخط',
    fontSizeSmall: 'صغير',
    fontSizeMedium: 'متوسط',
    fontSizeLarge: 'كبير',
    textScannerTitle: 'الواقع المعزز والكاميرا',
    cameraError: 'تعذر الوصول إلى الكاميرا. يرجى التحقق من الأذونات والتأكد من أن متصفحك يدعم هذه الميزة.',
    uploadPhoto: 'تحميل من الجهاز',
    speakTranslation: 'قراءة الترجمة',
    stopSpeaking: 'إيقاف القراءة',
    ttsNotSupported: 'تحويل النص إلى كلام غير مدعوم من متصفحك.',
    close: 'إغلاق',
    downloadPhoto: 'تنزيل الصورة',
    switchCamera: 'تبديل الكاميرا',
    arView: 'واقع معزز',
    advancedSettings: 'إعدادات متقدمة',
    focus: 'التركيز البؤري',
    exposure: 'التعرض للضوء',
    whiteBalance: 'توازن الأبيض',
    brightness: 'السطوع',
    contrast: 'التباين',
    zoom: 'تكبير',
    analyzeObjects: 'تحليل',
    arToggle: 'تفعيل/إلغاء الواقع المعزز',
    aiAssistantTitle: 'مساعد الذكاء الاصطناعي',
    aiAssistantHeader: 'مساعد الترجمة بالذكاء الاصطناعي',
    aiAssistantSubheader: 'صقل ترجمتك مع الذكاء الاصطناعي',
    aiAssistantSource: 'النص المصدر',
    aiAssistantOriginal: 'الترجمة الأصلية',
    aiAssistantRequestPlaceholder: 'مثال: "غير كلمة \'ملك\' إلى \'حاكم\'" أو "اجعلها تبدو أكثر شاعرية."',
    aiAssistantGetResponse: 'احصل على اقتراح',
    aiAssistantGettingResponse: 'جارٍ الحصول على اقتراح...',
    aiAssistantImproved: 'الترجمة المحسنة',
    aiAssistantExplanation: 'الشرح',
    aiAssistantApply: 'تطبيق التغييرات',
    aiAssistantError: 'لم يتمكن المساعد من معالجة طلبك.',
    arAnalysisFailed: 'فشل تحليل الواقع المعزز. الرجاء المحاولة مرة أخرى.',
    grayscale: 'تدرج الرمادي',
    resetAdjustments: 'إعادة ضبط التعديلات',
    lessonsHeader: 'دروس في الفينيقية والبونيقية',
    lessonsClose: 'إغلاق الدروس',
    alphabetTab: 'الأبجدية',
    grammarTab: 'القواعد',
    alphabetIntro: 'تتكون الأبجدية الفينيقية من 22 حرفًا ساكنًا. لم تكن الحروف المتحركة تُكتب بشكل عام. الخط البونيقي هو شكل لاحق وأكثر تعقيدًا من هذه الأبجدية.',
    aleph: 'ألف', ox: 'ثور',
    bet: 'بيت', house: 'بيت',
    gimel: 'جيمل', camel: 'جمل',
    dalet: 'دلت', door: 'باب',
    he: 'هه', window: 'نافذة',
    waw: 'واو', hook: 'خطاف',
    zayin: 'زين', weapon: 'سلاح',
    het: 'حيط', fence: 'سياج',
    tet: 'طيط', wheel: 'عجلة',
    yod: 'يود', hand: 'يد',
    kaph: 'كاپ', palm_of_hand: 'راحة اليد',
    lamed: 'لامد', goad: 'مهماز',
    mem: 'ميم', water: 'ماء',
    nun: 'نون', fish: 'سمكة',
    samekh: 'سمخ', pillar: 'عمود',
    ayin: 'عين', eye: 'عين',
    pe: 'په', mouth: 'فم',
    sade: 'صادي', plant: 'نبات',
    qoph: 'قوپ', monkey: 'قرد',
    resh: 'ريش', head: 'رأس',
    shin: 'شين', tooth: 'سن',
    taw: 'تاو', mark: 'علامة',
    grammarContentPhoenicianHtml: `
      <h3>١. بنية الجملة والصياغة</h3>
      <p>تتبع اللغة الفينيقية بنية شائعة في العديد من اللغات السامية القديمة.</p>
      <ul>
        <li><strong>ترتيب الكلمات:</strong> الترتيب الأساسي للكلمات هو <strong>فعل-فاعل-مفعول به (VSO)</strong>. مثال: <code>pʿl h-ʾdm h-mlʾkt</code> (<code class="phoenician">𐤐𐤏𐤋 𐤄𐤀𐤃𐤌 𐤄𐤌𐤋𐤀𐤊𐤕</code>) - "فعل الرجل العمل". يمكن استخدام ترتيب فاعل-فعل-مفعول به للتأكيد.</li>
        <li><strong>النفي:</strong> عادةً ما يتم نفي الأفعال باستخدام الأداة <code>bal</code> (<code class="phoenician">𐤁𐤋</code>). مثال: <code>bal ylk</code> (<code class="phoenician">𐤁𐤋 𐤉𐤋𐤊</code>) - "لن يذهب."</li>
        <li><strong>الاستفهام:</strong> يمكن تكوين الأسئلة عن طريق النبرة الصوتية أو باستخدام كلمات استفهام مثل <code>my</code> (<code class="phoenician">𐤌𐤉</code>) لـ "من؟" و <code>mh</code> (<code class="phoenician">𐤌𐤄</code>) لـ "ماذا؟".</li>
        <li><strong>الجمل الموصولة:</strong> غالبًا ما تُقدَّم الجمل بالضمير الموصول <code>ʾš</code> (<code class="phoenician">𐤀𐤔</code>)، والذي يعني "الذي، التي". مثال: <code>h-ʾš ʾš pʿl...</code> (<code class="phoenician">𐤄𐤀𐤔 𐤀𐤔 𐤐𐤏𐤋...</code>) - "الرجل الذي فعل...".</li>
      </ul>
      <h3>٢. الأسماء والضمائر وأدوات التعريف</h3>
      <p>للأسماء جنس (مذكر/مؤنث) وعدد (مفرد/جمع/مثنى).</p>
      <ul>
        <li><strong>الجنس والجمع:</strong> عادةً ما ينتهي جمع المذكر بـ <code>-m</code> (<code class="phoenician">𐤌</code>)، بينما غالبًا ما ينتهي المفرد المؤنث بـ <code>-t</code> (<code class="phoenician">𐤕</code>).</li>
        <li><strong>الملكية (حالة الإضافة):</strong> تُظهر الملكية بوضع الأسماء بجانب بعضها. يكون الاسم الأول في صيغة "الإضافة" (غالبًا ما يكون مختصرًا) ويحمل الاسم الأخير أداة التعريف. مثال: <code>mlk ṣr</code> (<code class="phoenician">𐤌𐤋𐤊 𐤑𐤓</code>) - "ملك صور". لقول "ملك صور"، تكون <code>mlk h-ṣr</code> (<code class="phoenician">𐤌𐤋𐤊 𐤄𐤑𐤓</code>).</li>
        <li><strong>لواحق الملكية:</strong> يمكن إلحاق الضمائر بالأسماء كـ لواحق. مثال: <code>ʾb</code> (<code class="phoenician">𐤀𐤁</code>) "أب" تصبح <code>ʾby</code> (<code class="phoenician">𐤀𐤁𐤉</code>) "أبي".</li>
        <li><strong>ضمائر الإشارة:</strong> "هذا" عادة ما تكون <code>z</code> (<code class="phoenician">𐤆</code>).</li>
      </ul>
      <h3>٣. الأفعال والتصريف</h3>
      <p>تستند الأفعال إلى جذر ثلاثي وتُصرف بناءً على الصيغة (فعل مكتمل مقابل فعل غير مكتمل) بدلاً من الزمن.</p>
      <ul>
        <li><strong>الصيغة التامة (قتَل):</strong> تصف فعلاً مكتملاً. تشير السوابق واللواحق إلى الشخص. مثال (الجذر ك-ت-ب، يكتب): <code>ktb</code> (<code class="phoenician">𐤊𐤕𐤁</code>) - "هو كتب"؛ <code>ktbt</code> (<code class="phoenician">𐤊𐤕𐤁𐤕</code>) - "هي كتبت"؛ <code>ktbty</code> (<code class="phoenician">𐤊𐤕𐤁𐤕𐤉</code>) - "أنا كتبت".</li>
        <li><strong>الصيغة غير التامة (يقتُل):</strong> تصف فعلاً غير مكتمل أو مستقبلي. مثال: <code>yktb</code> (<code class="phoenician">𐤉𐤊𐤕𐤁</code>) - "هو سيكتب"؛ <code>tktb</code> (<code class="phoenician">𐤕𐤊𐤕𐤁</code>) - "هي ستكتب"؛ <code>ʾktb</code> (<code class="phoenician">𐤀𐤊𐤕𐤁</code>) - "أنا سأكتب".</li>
        <li><strong>صيغة الأمر:</strong> تُشتق الأوامر من جذر الفعل. مثال: <code>ktb!</code> (<code class="phoenician">𐤊𐤕𐤁</code>) - "اكتب!".</li>
      </ul>
      <h3>٤. حروف الجر والأدوات</h3>
      <p>الأدوات القصيرة ضرورية لربط الأفكار.</p>
      <ul>
        <li><strong>حروف الجر المتصلة:</strong> <code>b-</code> (<code class="phoenician">𐤁</code>) "في، بـ"، <code>l-</code> (<code class="phoenician">𐤋</code>) "لـ، إلى"، <code>k-</code> (<code class="phoenician">𐤊</code>) "كـ، مثل". تتصل هذه مباشرة بالكلمة التالية.</li>
        <li><strong>أدوات أخرى:</strong> <code>ʿl</code> (<code class="phoenician">𐤏𐤋</code>) "على، فوق"، <code>mn</code> (<code class="phoenician">𐤌𐤍</code>) "من"، <code>ʿm</code> (<code class="phoenician">𐤏𐤌</code>) "مع".</li>
      </ul>
      <h3>٥. الأرقام والعد</h3>
      <p>تتوافق الأرقام في الجنس مع الاسم الذي تصفه. أمثلة: <code>ʾḥd</code> (<code class="phoenician">𐤀𐤇𐤃</code>) - واحد، <code>šnm</code> (<code class="phoenician">𐤔𐤍𐤌</code>) - اثنان، <code>šlš</code> (<code class="phoenician">𐤔𐤋𐤔</code>) - ثلاثة، <code>ʿšr</code> (<code class="phoenician">𐤏𐤔𐤓</code>) - عشرة.</p>`,
    grammarContentPunicHtml: `
      <h3>١. من الفينيقية إلى البونيقية</h3>
      <p>تعتبر القواعد البونيقية سليلة مباشرة للغة الفينيقية، حيث تحتفظ ببنيتها السامية الأساسية. حدثت التغييرات الرئيسية في النطق وقواعد الإملاء على مدى قرون من الاستخدام في شمال إفريقيا والبحر الأبيض المتوسط.</p>
      <h3>٢. علم الأصوات والنطق (التغييرات الرئيسية)</h3>
      <p>تكمن أهم الفروق بين الفينيقية والبونيقية في أصواتهما وكيفية كتابتها.</p>
      <ul>
        <li><strong>إضعاف الحروف الحلقية:</strong> ضعفت الأصوات الحلقية للحروف الساكنة مثل <code>ʿayin</code> (<code class="punic">𐤏</code>) و <code>ḥet</code> (<code class="punic">𐤇</code>) وغالباً ما أُسقطت في النطق والكتابة، خاصة في اللغة البونيقية المتأخرة.</li>
        <li><strong>الإشارة إلى الحركات (أمهات القراءة):</strong> استخدمت اللغة البونيقية الحروف الساكنة بشكل أكبر للإشارة إلى الحركات. كان هذا نادرًا في الفينيقية المبكرة.
          <ul>
            <li>أصبحت <code>ʾaleph</code> (<code class="punic">𐤀</code>) رمزًا نائبًا لأصوات حركات مختلفة.</li>
            <li>استُخدمت <code>waw</code> (<code class="punic">𐤅</code>) لأصوات 'u' و 'o'.</li>
            <li>استُخدمت <code>yod</code> (<code class="punic">𐤉</code>) لأصوات 'i' و 'e'.</li>
          </ul>
          وهذا يجعل النقوش البونيقية حاسمة لفهم كيفية نطق اللغة.
        </li>
        <li><strong>تحولات الحركات:</strong> تغير نطق الحركات بمرور الوقت. على سبيل المثال، غالبًا ما تحولت الحركة الطويلة الأصلية 'ā' إلى صوت 'ō'، والذي بدوره يمكن أن يصبح 'ū' في البونيقية المتأخرة. تساعدنا عمليات النقل الحرفي اللاتينية للأسماء البونيقية (مثل Hannibal) على إعادة بناء هذه الأصوات.</li>
      </ul>
      <h3>٣. الأفعال والأسماء</h3>
      <p>تظل أنظمة الأفعال (الجذر الثلاثي، الصيغ التامة وغير التامة) والأسماء (الجنس، العدد، حالة الإضافة) الأساسية كما هي في الفينيقية.</p>
      <ul>
        <li><strong>الضمائر:</strong> تطورت بعض الضمائر. على سبيل المثال، غالبًا ما تم تبسيط ضمير الغائب المذكر المفرد <code>hwʾ</code> (<code class="phoenician">𐤄𐤅𐤀</code>, "هو") إلى <code>hʾ</code> (<code class="punic">𐤄𐤀</code>) في البونيقية المتأخرة.</li>
        <li><strong>الكلمات الدخيلة:</strong> استعارت اللغة البونيقية كلمات من اللغات المحيطة بها، وفي مقدمتها البربرية واللاتينية، خاصة للمصطلحات الإدارية والعسكرية.</li>
      </ul>
      <h3>٤. الاصطلاحات والعبارات</h3>
      <p>استمرت التعبيرات البونيقية في التقاليد الفينيقية ولكنها تأثرت أيضًا بالثقافات المحلية في شمال إفريقيا. الصيغ الدينية، مثل الإهداءات للآلهة <strong>بعل حمون</strong> و <strong>تانيت</strong>، شائعة جدًا في النقوش البونيقية.</p>
      <ul>
        <li>إحدى الصيغ النذرية الشائعة هي <code>l-ʾdn l-bʿl ḥmn... ndr ʾš ndr...</code> (<code class="punic">𐤋𐤀𐤃𐤍 𐤋𐤁𐤏𐤋 𐤇𐤌𐤍... 𐤍𐤃𐤓 𐤀𐤔 𐤍𐤃𐤓...</code>) والتي تعني "للسيد، لبعل حمون... النذر الذي نذره [الاسم]...".</li>
      </ul>`
  },
};