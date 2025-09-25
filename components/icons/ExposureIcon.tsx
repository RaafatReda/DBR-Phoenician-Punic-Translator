import React from 'react';

interface IconProps {
  className?: string;
}

const ExposureIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9h-9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a9 9 0 100-18 9 9 0 000 18z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.364 15.364l-1.06-1.06m-2.829-2.829l-1.06-1.06m0 0L9.354 9.354m1.06 1.06l1.06 1.06" />
    </svg>
);

export default ExposureIcon;
