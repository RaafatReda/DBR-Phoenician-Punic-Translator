export interface GrammarModuleData {
    moduleTitleKey: string;
    moduleContentKey: string;
}

export interface GrammarLevelData {
    levelTitleKey: string;
    modules: GrammarModuleData[];
}

export const grammarPhoenicianLevels: GrammarLevelData[] = [
    { "levelTitleKey": "beginnerLevel", "modules": [
        { "moduleTitleKey": "module1Title", "moduleContentKey": "phoenicianModule1Content" },
        { "moduleTitleKey": "module2Title", "moduleContentKey": "phoenicianModule2Content" },
        { "moduleTitleKey": "module3Title", "moduleContentKey": "phoenicianModule3Content" }
    ]},
    { "levelTitleKey": "intermediateLevel", "modules": [
        { "moduleTitleKey": "module4Title", "moduleContentKey": "phoenicianModule4Content" },
        { "moduleTitleKey": "module5Title", "moduleContentKey": "phoenicianModule5Content" },
        { "moduleTitleKey": "module6Title", "moduleContentKey": "phoenicianModule6Content" }
    ]},
    { "levelTitleKey": "advancedLevel", "modules": [
        { "moduleTitleKey": "module7TitlePhoenician", "moduleContentKey": "phoenicianModule7Content" },
        { "moduleTitleKey": "module8TitlePhoenician", "moduleContentKey": "phoenicianModule8Content" },
        { "moduleTitleKey": "module9TitlePhoenician", "moduleContentKey": "phoenicianModule9Content" }
    ]}
];

export const grammarPunicLevels: GrammarLevelData[] = [
    { "levelTitleKey": "beginnerLevel", "modules": [
        { "moduleTitleKey": "module1Title", "moduleContentKey": "punicModule1Content" },
        { "moduleTitleKey": "module2Title", "moduleContentKey": "punicModule2Content" },
        { "moduleTitleKey": "module3Title", "moduleContentKey": "punicModule3Content" }
    ]},
    { "levelTitleKey": "intermediateLevel", "modules": [
        { "moduleTitleKey": "module4Title", "moduleContentKey": "punicModule4Content" },
        { "moduleTitleKey": "module5Title", "moduleContentKey": "punicModule5Content" },
        { "moduleTitleKey": "module6Title", "moduleContentKey": "punicModule6Content" }
    ]},
    { "levelTitleKey": "advancedLevel", "modules": [
        { "moduleTitleKey": "module7Title", "moduleContentKey": "punicModule7Content" },
        { "moduleTitleKey": "module8Title", "moduleContentKey": "punicModule8Content" },
        { "moduleTitleKey": "module9Title", "moduleContentKey": "punicModule9Content" },
        { "moduleTitleKey": "module10Title", "moduleContentKey": "punicModule10Content" },
        { "moduleTitleKey": "module11Title", "moduleContentKey": "punicModule11Content" },
        { "moduleTitleKey": "module12Title", "moduleContentKey": "punicModule12Content" }
    ]}
];
