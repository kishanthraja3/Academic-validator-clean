import React from 'react';
import Icon from '../AppIcon';

const Breadcrumb = ({ 
  items = [],
  separator = 'ChevronRight',
  className = ''
}) => {
  const handleNavigation = (path) => {
    if (path) {
      window.location.href = path;
    }
  };

  if (!items || items?.length === 0) {
    return null;
  }

  return (
    <nav className={`flex items-center space-x-1 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1">
        {items?.map((item, index) => {
          const isLast = index === items?.length - 1;
          
          return (
            <li key={index} className="flex items-center space-x-1">
              {index > 0 && (
                <Icon 
                  name={separator} 
                  size={14} 
                  className="text-muted-foreground flex-shrink-0" 
                />
              )}
              {isLast ? (
                <span className="font-medium text-foreground truncate max-w-[200px]" title={item?.label}>
                  {item?.label}
                </span>
              ) : (
                <button
                  onClick={() => handleNavigation(item?.path)}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-150 truncate max-w-[150px]"
                  title={item?.label}
                >
                  {item?.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;