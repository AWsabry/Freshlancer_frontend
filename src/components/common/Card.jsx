import React from 'react';

const Card = ({ children, className = '', title, actions }) => {
  return (
    <div className={`card ${className}`}>
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 pb-4 border-b gap-2 sm:gap-0">
          {title && <h3 className="text-base sm:text-lg font-semibold">{title}</h3>}
          {actions && <div className="flex items-center gap-2 w-full sm:w-auto">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
