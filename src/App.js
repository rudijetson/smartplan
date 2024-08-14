// src/App.js
import React from 'react';
import { BusinessPlanProvider } from './contexts/BusinessPlanContext';
import StartupCostsCalculator from './components/calculators/StartupCostsCalculator';
import SourceOfFundsCalculator from './components/calculators/SourceOfFundsCalculator';
import SalesForecastCalculator from './components/calculators/SalesForecastCalculator';
import WorkforceCalculator from './components/calculators/WorkforceCalculator';
import OpexCalculator from './components/calculators/OpexCalculator';
import CostOfSalesCalculator from './components/calculators/CostOfSalesCalculator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/Tabs';

function App() {
  return (
    <BusinessPlanProvider>
      <div className="App min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900">AI-Assisted Business Planner</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Tabs defaultValue="startup-costs" className="mt-6">
            <TabsList>
              <TabsTrigger value="startup-costs">Startup Costs</TabsTrigger>
              <TabsTrigger value="source-of-funds">Source of Funds</TabsTrigger>
              <TabsTrigger value="cost-of-sales">Cost of Sales</TabsTrigger>
              <TabsTrigger value="workforce">Workforce</TabsTrigger>
              <TabsTrigger value="opex">Operating Expenses</TabsTrigger>
              <TabsTrigger value="sales-forecast">Sales Forecast</TabsTrigger>
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
            <TabsContent value="workforce">
              <WorkforceCalculator />
            </TabsContent>
            <TabsContent value="opex">
              <OpexCalculator />
            </TabsContent>
            <TabsContent value="sales-forecast">
              <SalesForecastCalculator />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </BusinessPlanProvider>
  );
}

export default App;