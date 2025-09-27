import React from 'react';

interface IconProps {
  className?: string;
  isFilled?: boolean;
}

const BookmarkIcon: React.FC<IconProps> = ({ className = "w-6 h-6", isFilled = false }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isFilled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 3H6.75A2.25 2.25 0 004.5 5.25v15.07a.75.75 0 001.238.62L12 18.233l6.262 3.697A.75.75 0 0019.5 20.32V5.25A2.25 2.25 0 0017.25 3z" />
    </svg>
);

export default BookmarkIcon;