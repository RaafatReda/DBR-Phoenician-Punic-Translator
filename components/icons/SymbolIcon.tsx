import React from 'react';

interface IconProps {
  className?: string;
}

const SymbolIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639l4.25-6.501a1.012 1.012 0 011.603-.393l.91 1.045a1.012 1.012 0 001.385.23l2.25-1.5a1.012 1.012 0 011.158 0l2.25 1.5a1.012 1.012 0 001.385-.23l.91-1.045a1.012 1.012 0 011.603.393l4.25 6.501a1.012 1.012 0 010 .639l-4.25 6.501a1.012 1.012 0 01-1.603.393l-.91-1.045a1.012 1.012 0 00-1.385-.23l-2.25 1.5a1.012 1.012 0 01-1.158 0l-2.25-1.5a1.012 1.012 0 00-1.385.23l-.91 1.045a1.012 1.012 0 01-1.603-.393l-4.25-6.501z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a3 3 0 100-6 3 3 0 000 6z" />
    </svg>
);

export default SymbolIcon;
