import React from 'react';
import { PhoenicianDialect } from '../types';

interface ScriptModeToggleProps {
  scriptMode: PhoenicianDialect;
  setScriptMode: (mode: PhoenicianDialect) => void;
  t: (key: string) => string;
}

const ScriptModeToggle: React.FC<ScriptModeToggleProps> = ({ scriptMode, setScriptMode, t }) => {
  const phoenicianActive = scriptMode === PhoenicianDialect.STANDARD_PHOENICIAN;
  const punicActive = scriptMode === PhoenicianDialect.PUNIC;

  const buttonClass = (isActive: boolean) =>
    `px-3 py-1 rounded-md font-semibold transition-colors w-28 text-center h-10 flex justify-center items-center ${
      isActive ? 'keyboard-layout-btn-active' : 'keyboard-btn text-[color:var(--color-text)]'
    }`;

  return (
    <div className="flex items-center bg-[color:var(--keyboard-panel-bg)] p-1 rounded-lg">
      <button
        onClick={() => setScriptMode(PhoenicianDialect.STANDARD_PHOENICIAN)}
        className={`${buttonClass(phoenicianActive)} font-sans text-sm`}
        aria-pressed={phoenicianActive}
        title={t('standardPhoenician')}
      >
        {t('phoenician')}
      </button>
      <button
        onClick={() => setScriptMode(PhoenicianDialect.PUNIC)}
        className={`${buttonClass(punicActive)} font-sans text-sm`}
        aria-pressed={punicActive}
        title={t('punic')}
      >
        {t('punic')}
      </button>
    </div>
  );
};

export default ScriptModeToggle;