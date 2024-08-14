// src/components/SummaryDashboard.js
import React from 'react';
import { useBusinessPlan } from '../hooks/useBusinessPlan';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { 
  formatCurrency, 
  calculateTotalStartupCosts, 
  calculateTotalFunding, 
  calculateProjectedRevenue, 
  calculateTotalExpenses 
} from '../lib/utils';

export function SummaryDashboard() {
  const {
    startupCosts,
    fundingSources,
    salesForecast,
    workforce,
    opex,
    costOfSales
  } = useBusinessPlan();

  const totalStartupCosts = calculateTotalStartupCosts(startupCosts);
  const totalFunding = calculateTotalFunding(fundingSources);
  const projectedRevenue = calculateProjectedRevenue(salesForecast);
  const totalExpenses = calculateTotalExpenses(workforce, opex, costOfSales);
  const projectedProfit = projectedRevenue - totalExpenses;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Plan Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div>Total Startup Costs: {formatCurrency(totalStartupCosts)}</div>
        <div>Total Funding: {formatCurrency(totalFunding)}</div>
        <div>Projected Annual Revenue: {formatCurrency(projectedRevenue)}</div>
        <div>Projected Annual Expenses: {formatCurrency(totalExpenses)}</div>
        <div>Projected Annual Profit: {formatCurrency(projectedProfit)}</div>
      </CardContent>
    </Card>
  );
}
export default SummaryDashboard;