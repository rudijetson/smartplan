import React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

export const Tabs = TabsPrimitive.Root;
export const TabsList = React.forwardRef(({ className = '', ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={`flex space-x-1 rounded-xl bg-blue-900/20 p-1 ${className}`}
    {...props}
  />
));
export const TabsTrigger = React.forwardRef(({ className = '', ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={`px-3 py-1.5 text-sm font-medium text-blue-700 rounded-lg select-none hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 data-[state=active]:bg-white data-[state=active]:text-blue-900 data-[state=active]:shadow-sm ${className}`}
    {...props}
  />
));
export const TabsContent = React.forwardRef(({ className = '', ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={`mt-2 rounded-xl p-6 ${className}`}
    {...props}
  />
));