import React from 'react';
import { AlertTriangle } from 'lucide-react';

const Alert = ({ children, className = '', ...props }) => (
  <div
    className={`bg-yellow-50 border-l-4 border-yellow-400 p-4 ${className}`}
    role="alert"
    {...props}
  >
    <div className="flex">
      <div className="flex-shrink-0">
        <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
      </div>
      <div className="ml-3">
        {children}
      </div>
    </div>
  </div>
);

const AlertTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-sm font-medium text-yellow-800 ${className}`} {...props}>
    {children}
  </h3>
);

const AlertDescription = ({ children, className = '', ...props }) => (
  <div className={`mt-2 text-sm text-yellow-700 ${className}`} {...props}>
    {children}
  </div>
);

export { Alert, AlertTitle, AlertDescription };