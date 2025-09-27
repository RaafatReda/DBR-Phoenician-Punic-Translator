
import React from 'react';

interface IconProps {
  className?: string;
}

const ManualIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2L2 7l10 5 10-5L12 2zm0 18.5L2 15v4l10 5 10-5v-4l-10 5.5zM12 13L2 8v4l10 5 10-5V8l-10 5z"/>
  </svg>
);

export default ManualIcon;