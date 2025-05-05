import React from 'react';

interface ButtonNavBarProps {
  children?: React.ReactNode;
  onClick?: () => void;
  title?: string;
  className?: string; // Add the className prop
}

const ButtonNavBar: React.FC<ButtonNavBarProps> = ({
  children,
  onClick,
  title,
  className, // Destructure the className prop
  ...rest
}) => {
  const buttonClasses = `
    cursor-pointer
    gap-2
    items-center
    rounded-sm
    p-2
    rounded-md
    text-sm
    font-medium
    transition-colors
    focus:outline-none
    hover:bg-gray-200
    dark:hover:bg-gray-700
  `;

  // Merge the classes
  const mergedClasses = `${buttonClasses} ${className || ''}`;

  return (
    <button
      onClick={onClick}
      title={title}
      className={mergedClasses} // Use the merged classes
      {...rest}
    >
      {children}
    </button>
  );
};

export default ButtonNavBar;
