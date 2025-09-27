
import React from 'react';

interface IconProps {
  className?: string;
}

const DictionaryIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <span 
    className={`${className} flex items-center justify-center [font-family:var(--font-punic)] text-3xl`}
    aria-hidden="true"
  >
    𐤀
  </span>
);

export default DictionaryIcon;
