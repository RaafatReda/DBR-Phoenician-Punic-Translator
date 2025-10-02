import React from 'react';

const FemaleIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V9A2.25 2.25 0 0 0 17.25 6.75H6.75A2.25 2.25 0 0 0 4.5 9v8.25A2.25 2.25 0 0 0 6.75 19.5z" />
    </svg>
);

export default FemaleIcon;
