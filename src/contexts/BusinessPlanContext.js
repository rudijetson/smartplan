// src/contexts/BusinessPlanContext.js

import React, { createContext, useState, useContext } from 'react';

export const BusinessPlanContext = createContext();

export function BusinessPlanProvider({ children }) {
  const [startupCosts, setStartupCosts] = useState({});
  const [fundingSources, setFundingSources] = useState({});
  const [salesForecast, setSalesForecast] = useState({});
  const [workforce, setWorkforce] = useState({});
  const [opex, setOpex] = useState({});
  const [costOfSales, setCostOfSales] = useState({});

  const value = {
    startupCosts, setStartupCosts,
    fundingSources, setFundingSources,
    salesForecast, setSalesForecast,
    workforce, setWorkforce,
    opex, setOpex,
    costOfSales, setCostOfSales
  };

  return (
    <BusinessPlanContext.Provider value={value}>
      {children}
    </BusinessPlanContext.Provider>
  );
}

export function useBusinessPlan() {
  const context = useContext(BusinessPlanContext);
  if (context === undefined) {
    throw new Error('useBusinessPlan must be used within a BusinessPlanProvider');
  }
  return context;
}