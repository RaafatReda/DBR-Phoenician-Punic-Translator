import React from 'react';

interface IconProps {
  className?: string;
  isFilled?: boolean;
}

const BookmarkIcon: React.FC<IconProps> = ({ className = "w-6 h-6", isFilled = false }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isFilled ? "currentColor" : "none"} className={className}>
      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16.5 3.75V16.5L12 14.25L7.5 16.5V3.75m9 0H7.5A2.25 2.25 0 005.25 6v13.5A2.25 2.25 0 007.5 21.75h9a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0016.5 3.75z"></path>
    </svg>
);

export default BookmarkIcon;
