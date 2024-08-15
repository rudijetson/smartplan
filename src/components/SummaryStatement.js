// src/components/SummaryStatement.js

// Imports
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/Table";
import { useBusinessPlan } from '../hooks/useBusinessPlan';

// Utility functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
};

const formatPercentage = (value) => {
  return `${(value * 100).toFixed(2)}%`;
};

// Component definition
const SummaryStatement = ({ onTabChange }) => {
  // Context and state
  const { salesForecast, opex, costOfSales } = useBusinessPlan();
  const [summary, setSummary] = useState({
    sales: { year1: 0, year2: 0, year3: 0 },
    costOfGoodsSold: { year1: 0, year2: 0, year3: 0 },
    grossProfit: { year1: 0, year2: 0, year3: 0 },
    operatingExpenses: { year1: 0, year2: 0, year3: 0 },
    netProfit: { year1: 0, year2: 0, year3: 0 },
    grossMargin: { year1: 0, year2: 0, year3: 0 },
    netProfitMargin: { year1: 0, year2: 0, year3: 0 }
  });

  // Effect to update summary when data changes
  useEffect(() => {
    if (salesForecast && opex) {
      const newSummary = {
        sales: {
          year1: salesForecast.year1?.totalSales || 0,
          year2: salesForecast.year2?.totalSales || 0,
          year3: salesForecast.year3?.totalSales || 0
        },
        grossProfit: {
          year1: salesForecast.year1?.totalGrossProfit || 0,
          year2: salesForecast.year2?.totalGrossProfit || 0,
          year3: salesForecast.year3?.totalGrossProfit || 0
        },
        operatingExpenses: {
          year1: opex.totalAnnualExpenses || 0,
          year2: opex.totalAnnualExpenses || 0,
          year3: opex.totalAnnualExpenses || 0
        }
      };

      // Calculate Cost of Goods Sold
      newSummary.costOfGoodsSold = {
        year1: newSummary.sales.year1 - newSummary.grossProfit.year1,
        year2: newSummary.sales.year2 - newSummary.grossProfit.year2,
        year3: newSummary.sales.year3 - newSummary.grossProfit.year3
      };

      // Calculate Net Profit
      newSummary.netProfit = {
        year1: newSummary.grossProfit.year1 - newSummary.operatingExpenses.year1,
        year2: newSummary.grossProfit.year2 - newSummary.operatingExpenses.year2,
        year3: newSummary.grossProfit.year3 - newSummary.operatingExpenses.year3
      };

      // Calculate Gross Margin
      newSummary.grossMargin = {
        year1: newSummary.sales.year1 ? newSummary.grossProfit.year1 / newSummary.sales.year1 : 0,
        year2: newSummary.sales.year2 ? newSummary.grossProfit.year2 / newSummary.sales.year2 : 0,
        year3: newSummary.sales.year3 ? newSummary.grossProfit.year3 / newSummary.sales.year3 : 0
      };

      // Calculate Net Profit Margin
      newSummary.netProfitMargin = {
        year1: newSummary.sales.year1 ? newSummary.netProfit.year1 / newSummary.sales.year1 : 0,
        year2: newSummary.sales.year2 ? newSummary.netProfit.year2 / newSummary.sales.year2 : 0,
        year3: newSummary.sales.year3 ? newSummary.netProfit.year3 / newSummary.sales.year3 : 0
      };

      setSummary(newSummary);
    }
  }, [salesForecast, opex]);

  // Handler for tab changes
  const handleTabChange = (tabValue) => {
    if (onTabChange) {
      onTabChange(tabValue);
    }
  };

  // Component render
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">3-Year Financial Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Year 1</TableHead>
              <TableHead>Year 2</TableHead>
              <TableHead>Year 3</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-bold">
                <button 
                  onClick={() => handleTabChange('sales-forecast')} 
                  className="text-blue-600 hover:underline focus:outline-none"
                >
                  Sales
                </button>
              </TableCell>
              <TableCell>{formatCurrency(summary.sales.year1)}</TableCell>
              <TableCell>{formatCurrency(summary.sales.year2)}</TableCell>
              <TableCell>{formatCurrency(summary.sales.year3)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">
                <button 
                  onClick={() => handleTabChange('cost-of-sales')} 
                  className="text-blue-600 hover:underline focus:outline-none"
                >
                  Cost of Goods Sold
                </button>
              </TableCell>
              <TableCell>{formatCurrency(summary.costOfGoodsSold.year1)}</TableCell>
              <TableCell>{formatCurrency(summary.costOfGoodsSold.year2)}</TableCell>
              <TableCell>{formatCurrency(summary.costOfGoodsSold.year3)}</TableCell>
            </TableRow>
            <TableRow className="bg-gray-100">
              <TableCell className="font-bold">Gross Profit</TableCell>
              <TableCell>{formatCurrency(summary.grossProfit.year1)}</TableCell>
              <TableCell>{formatCurrency(summary.grossProfit.year2)}</TableCell>
              <TableCell>{formatCurrency(summary.grossProfit.year3)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Gross Margin</TableCell>
              <TableCell>{formatPercentage(summary.grossMargin.year1)}</TableCell>
              <TableCell>{formatPercentage(summary.grossMargin.year2)}</TableCell>
              <TableCell>{formatPercentage(summary.grossMargin.year3)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">
                <button 
                  onClick={() => handleTabChange('opex')} 
                  className="text-blue-600 hover:underline focus:outline-none"
                >
                  Operating Expenses
                </button>
              </TableCell>
              <TableCell>{formatCurrency(summary.operatingExpenses.year1)}</TableCell>
              <TableCell>{formatCurrency(summary.operatingExpenses.year2)}</TableCell>
              <TableCell>{formatCurrency(summary.operatingExpenses.year3)}</TableCell>
            </TableRow>
            <TableRow className="bg-gray-100">
              <TableCell className="font-bold">Net Profit</TableCell>
              <TableCell>{formatCurrency(summary.netProfit.year1)}</TableCell>
              <TableCell>{formatCurrency(summary.netProfit.year2)}</TableCell>
              <TableCell>{formatCurrency(summary.netProfit.year3)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">Net Profit Margin</TableCell>
              <TableCell>{formatPercentage(summary.netProfitMargin.year1)}</TableCell>
              <TableCell>{formatPercentage(summary.netProfitMargin.year2)}</TableCell>
              <TableCell>{formatPercentage(summary.netProfitMargin.year3)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SummaryStatement;