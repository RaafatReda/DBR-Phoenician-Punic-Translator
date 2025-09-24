
import React from 'react';
import { GrammarToken } from '../types';

interface GrammarHighlightedTextProps {
  grammar: GrammarToken[];
  className?: string;
  selectedToken: GrammarToken | null;
  onTokenClick: (token: GrammarToken | null) => void;
}

const colorClasses = [
  'text-rose-400',
  'text-cyan-400',
  'text-teal-400',
  'text-amber-400',
  'text-lime-400',
  'text-fuchsia-400',
  'text-sky-400',
];

const GrammarHighlightedText: React.FC<GrammarHighlightedTextProps> = ({ grammar, className, selectedToken, onTokenClick }) => {

  const handleTokenClick = (token: GrammarToken) => {
    if (selectedToken && selectedToken.token === token.token && selectedToken.description === token.description) {
        // Deselect if clicking the same token again
        onTokenClick(null);
    } else {
        onTokenClick(token);
    }
  };

  return (
    <p className={className} dir="rtl">
      {grammar.map((token, index) => {
        // This attempts to give parts of speech consistent colors, but will cycle
        const colorClass = colorClasses[index % colorClasses.length];
        const isSelected = selectedToken && selectedToken.token === token.token && selectedToken.description === token.description;
        
        // Add a space between tokens
        const separator = index > 0 ? ' ' : '';
        
        return (
          <React.Fragment key={index}>
            {separator}
            <span
              className={`cursor-pointer transition-all duration-200 ease-in-out ${
                isSelected
                  ? 'bg-[color:var(--color-primary)]/30 rounded-md'
                  : 'hover:bg-white/10 rounded-md'
              } ${colorClass}`}
              style={{ padding: '0 0.2em' }}
              onClick={() => handleTokenClick(token)}
            >
              {token.token}
            </span>
          </React.Fragment>
        );
      })}
    </p>
  );
};

export default GrammarHighlightedText;
