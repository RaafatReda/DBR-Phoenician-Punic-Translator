import React from 'react';

interface IconProps {
  className?: string;
}

const KeyboardIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 10.5V8.25a.75.75 0 01.75-.75h2.25a.75.75 0 01.75.75v2.25m-3 0V15m0-4.5h3m-3 0H6.75m3 0H9.75m1.5 0H15m-3 0H12m2.25 0H18m0 0v-2.25a.75.75 0 00-.75-.75h-2.25a.75.75 0 00-.75.75v2.25m3 0V15m0-4.5h-3m3 0h.75m-3 0H9.75m3 0H12m0 0H6.75m6 2.25h3.375m-3.375 0H9.75m-3.375 0H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-3.375m-9.375 0H6.75m3 0H9.75m0 0H12m0 0h.75m0 0h2.25" />
  </svg>
);

export default KeyboardIcon;
