import React from 'react';

export default function Skeleton({ className="", style }) {
  return (
    <div 
      className={`animate-shimmer rounded-md ${className}`} 
      style={style}
    ></div>
  );
}
