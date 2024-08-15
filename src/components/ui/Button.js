import React from 'react';

export const Button = ({ children, variant = 'default', size = 'default', className = '', ...props }) => {
  const baseStyles = 'font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantStyles = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
  };
  const sizeStyles = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2 py-1 text-sm',
    default: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};