// src/hooks/useBusinessPlan.js

import { useContext } from 'react';
import { BusinessPlanContext } from '../contexts/BusinessPlanContext';

export function useBusinessPlan() {
  const context = useContext(BusinessPlanContext);
  if (context === undefined) {
    throw new Error('useBusinessPlan must be used within a BusinessPlanProvider');
  }
  return context;
}