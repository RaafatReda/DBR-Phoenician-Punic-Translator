
import React from 'react';

interface IconProps {
  className?: string;
}

const DatabaseIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm-1 4H8c-1.1 0-1.99.9-1.99 2L6 21c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V11l-6-6zM13 18H9v-2h4v2zm4-4H9v-2h8v2zm-2-4V7l4 4h-4z"/>
    </svg>
);

export default DatabaseIcon;