
import React from 'react';

interface IconProps {
  className?: string;
}

const NewspaperIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18 3H6c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-2h2v2zm5-4H7v-2h7v2zm3-4H7V7h10v2z"/>
    </svg>
);

export default NewspaperIcon;