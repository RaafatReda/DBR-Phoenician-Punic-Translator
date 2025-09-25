import React from 'react';

interface IconProps {
  className?: string;
}

const WhiteBalanceIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75v16.5M17.25 7.5L6.75 16.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 12a8.25 8.25 0 01-16.5 0" />
    </svg>
);

export default WhiteBalanceIcon;
