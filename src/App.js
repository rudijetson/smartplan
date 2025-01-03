// src/App.js
// hoff

// Imports
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/Tabs';
import StartupCostsCalculator from './components/calculators/StartupCostsCalculator';
import SourceOfFundsCalculator from './components/calculators/SourceOfFundsCalculator';
import CostOfSalesCalculator from './components/calculators/CostOfSalesCalculator';
import SalesForecastCalculator from './components/calculators/SalesForecastCalculator';
import WorkforceCalculator from './components/calculators/WorkforceCalculator';
import OpexCalculator from './components/calculators/OpexCalculator';
import SummaryStatement from './components/SummaryStatement';
import { BusinessPlanProvider } from './contexts/BusinessPlanContext';
import { ToastProvider } from './components/ui/Toast';
import Header from './components/Header';

// App component
function App() {
  // State for active tab
  const [activeTab, setActiveTab] = useState('startup-costs');

  // Handler for tab changes
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
  };

  // Render
  return (
    <BusinessPlanProvider>
      <ToastProvider>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <Header />
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
                <TabsTrigger value="startup-costs">Startup Costs</TabsTrigger>
                <TabsTrigger value="source-of-funds">Source of Funds</TabsTrigger>
                <TabsTrigger value="cost-of-sales">Cost of Sales</TabsTrigger>
                <TabsTrigger value="sales-forecast">Sales Forecast</TabsTrigger>
                <TabsTrigger value="workforce">Workforce</TabsTrigger>
                <TabsTrigger value="opex">Operating Expenses</TabsTrigger>
                <TabsTrigger value="summary">Financial Summary</TabsTrigger>
              </TabsList>
              <TabsContent value="startup-costs">
                <StartupCostsCalculator />
              </TabsContent>
              <TabsContent value="source-of-funds">
                <SourceOfFundsCalculator />
              </TabsContent>
              <TabsContent value="cost-of-sales">
                <CostOfSalesCalculator />
              </TabsContent>
              <TabsContent value="sales-forecast">
                <SalesForecastCalculator />
              </TabsContent>
              <TabsContent value="workforce">
                <WorkforceCalculator />
              </TabsContent>
              <TabsContent value="opex">
                <OpexCalculator />
              </TabsContent>
              <TabsContent value="summary">
                <SummaryStatement onTabChange={handleTabChange} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </ToastProvider>
    </BusinessPlanProvider>
  );
}

export default App;