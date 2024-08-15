// Imports
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Minus, Save, Trash2, FileInput } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/Table";
import { Switch } from '../ui/Switch';
import { useBusinessPlan } from '../../hooks/useBusinessPlan';
import { useToast } from '../ui/Toast';
import debounce from 'lodash/debounce';

// Utility functions
const formatNumber = (num) => {
  if (Number.isInteger(num)) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else {
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
};

const parseFormattedNumber = (str) => {
  return parseFloat(str.replace(/,/g, '')) || 0;
};

// Component definition
const OpexCalculator = () => {
  // Context
  const { workforce, setOpex } = useBusinessPlan();
  const { addToast } = useToast();
  
  // State definitions
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('opexExpenses');
    return saved ? JSON.parse(saved) : [
      { name: 'Salaries and Wages', amount: 0, frequency: 'Monthly' },
      { name: 'Rent', amount: 0, frequency: 'Monthly' },
      { name: 'Utilities', amount: 0, frequency: 'Monthly' },
      { name: 'Insurance', amount: 0, frequency: 'Monthly' },
      { name: 'Software and Technology', amount: 0, frequency: 'Monthly' },
    ];
  });

  const [savedCalculations, setSavedCalculations] = useState(() => {
    const saved = localStorage.getItem('savedOpexCalculations');
    return saved ? JSON.parse(saved) : [];
  });

  const [useWorkforceData, setUseWorkforceData] = useState(() => {
    const saved = localStorage.getItem('useWorkforceData');
    return saved ? JSON.parse(saved) : true; // Default to true
  });

  // useEffect for localStorage
  useEffect(() => {
    localStorage.setItem('opexExpenses', JSON.stringify(expenses));
    localStorage.setItem('savedOpexCalculations', JSON.stringify(savedCalculations));
    localStorage.setItem('useWorkforceData', JSON.stringify(useWorkforceData));
  }, [expenses, savedCalculations, useWorkforceData]);

  // Debounced addToast function
  const debouncedAddToast = useCallback(
    debounce((message) => {
      addToast(message);
    }, 1000),
    [addToast]
  );

  // Effect to update expenses when workforce data changes
  useEffect(() => {
    if (useWorkforceData) {
      setExpenses(prevExpenses => {
        const newExpenses = prevExpenses.map(expense => 
          expense.name === 'Salaries and Wages' 
            ? { ...expense, amount: workforce?.totalMonthlyExpenses || 0 } 
            : expense
        );
        
        // Only update and show toast if the amount has changed
        const salariesExpense = prevExpenses.find(e => e.name === 'Salaries and Wages');
        if (salariesExpense && salariesExpense.amount !== (workforce?.totalMonthlyExpenses || 0)) {
          debouncedAddToast('Salaries and Wages updated from workforce data');
          return newExpenses;
        }
        
        return prevExpenses;
      });
    }
  }, [useWorkforceData, workforce, debouncedAddToast]);

  // Event handlers
  const handleExpenseChange = (index, field, value) => {
    const newExpenses = [...expenses];
    if (field === 'amount') {
      newExpenses[index][field] = parseFormattedNumber(value);
    } else {
      newExpenses[index][field] = value;
    }
    setExpenses(newExpenses);
  };

  const addExpense = () => {
    setExpenses([...expenses, { name: '', amount: 0, frequency: 'Monthly' }]);
  };

  const removeExpense = (index) => {
    const newExpenses = expenses.filter((_, i) => i !== index);
    setExpenses(newExpenses);
  };

  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all data? This will reset the form and clear saved data.')) {
      setExpenses([
        { name: 'Salaries and Wages', amount: 0, frequency: 'Monthly' },
        { name: 'Rent', amount: 0, frequency: 'Monthly' },
        { name: 'Utilities', amount: 0, frequency: 'Monthly' },
        { name: 'Insurance', amount: 0, frequency: 'Monthly' },
        { name: 'Software and Technology', amount: 0, frequency: 'Monthly' },
      ]);
      localStorage.removeItem('opexExpenses');
      setUseWorkforceData(true);
    }
  };

  const saveCalculation = () => {
    const calculationName = prompt('Enter a name for this calculation:');
    if (calculationName) {
      const newCalculation = {
        name: calculationName,
        expenses,
        useWorkforceData,
        date: new Date().toISOString()
      };
      setSavedCalculations([...savedCalculations, newCalculation]);
    }
  };

  const loadCalculation = (calculation) => {
    if (window.confirm(`Are you sure you want to load "${calculation.name}"? This will overwrite your current data.`)) {
      setExpenses(calculation.expenses);
      setUseWorkforceData(calculation.useWorkforceData);
    }
  };

  const deleteCalculation = (index) => {
    if (window.confirm('Are you sure you want to delete this saved calculation?')) {
      const newSavedCalculations = savedCalculations.filter((_, i) => i !== index);
      setSavedCalculations(newSavedCalculations);
    }
  };

  // Calculation functions
  const calculateMonthlyAmount = (item) => {
    switch (item.frequency) {
      case 'Weekly':
        return (item.amount * 52) / 12;
      case 'Bi-weekly':
        return (item.amount * 26) / 12;
      case 'Monthly':
        return item.amount;
      case 'Quarterly':
        return item.amount / 3;
      case 'Annually':
        return item.amount / 12;
      default:
        return item.amount;
    }
  };

  const calculateMonthlyTotal = () => {
    return expenses.reduce((sum, item) => sum + calculateMonthlyAmount(item), 0);
  };

  const totalMonthlyExpenses = calculateMonthlyTotal();
  const totalAnnualExpenses = totalMonthlyExpenses * 12;

  // Update context
  useEffect(() => {
    setOpex({
      totalMonthlyExpenses,
      totalAnnualExpenses,
      expenses
    });
  }, [totalMonthlyExpenses, totalAnnualExpenses, expenses, setOpex]);

  // Chart data
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#A4DE6C', '#D0ED57', '#FFA07A', '#20B2AA'];

  const pieChartData = expenses.map(item => ({
    name: item.name || 'Unnamed Expense',
    value: calculateMonthlyAmount(item)
  }));

  // Render functions
  const renderExpensesTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Expense Name</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Frequency</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((item, index) => (
          <TableRow key={index}>
            <TableCell>
              <Input
                type="text"
                value={item.name}
                onChange={(e) => handleExpenseChange(index, 'name', e.target.value)}
                className="w-full"
                placeholder={index === 0 ? "Salaries and Wages" : "Expense Name"}
                disabled={useWorkforceData && item.name === 'Salaries and Wages'}
              />
            </TableCell>
            <TableCell>
              <Input
                type="text"
                value={formatNumber(item.amount)}
                onChange={(e) => handleExpenseChange(index, 'amount', e.target.value)}
                className="w-full"
                placeholder="Amount"
                disabled={useWorkforceData && item.name === 'Salaries and Wages'}
              />
            </TableCell>
            <TableCell>
              <select
                value={item.frequency}
                onChange={(e) => handleExpenseChange(index, 'frequency', e.target.value)}
                className="w-full border border-gray-300 rounded-md"
                disabled={useWorkforceData && item.name === 'Salaries and Wages'}
              >
                <option value="Weekly">Weekly</option>
                <option value="Bi-weekly">Bi-weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annually">Annually</option>
              </select>
            </TableCell>
            <TableCell>
              <Button 
                variant="destructive" 
                size="icon"
                onClick={() => removeExpense(index)}
                disabled={useWorkforceData && item.name === 'Salaries and Wages'}
              >
                <Minus className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderSavedCalculations = () => (
    savedCalculations.length > 0 && (
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Saved Calculations</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {savedCalculations.map((calc, index) => (
              <TableRow key={index}>
                <TableCell>{calc.name}</TableCell>
                <TableCell>{new Date(calc.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button onClick={() => loadCalculation(calc)} size="sm" className="mr-2">
                    <FileInput className="h-4 w-4 mr-2" /> Load
                  </Button>
                  <Button onClick={() => deleteCalculation(index)} size="sm" variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  );

  // Component return
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">Operating Expenses Calculator</CardTitle>
        <div className="flex space-x-2">
          <Button onClick={clearAll} variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-2" /> Reset
          </Button>
          <Button onClick={saveCalculation} size="sm">
            <Save className="h-4 w-4 mr-2" /> Save
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center space-x-2 mb-4">
            <Switch
              checked={useWorkforceData}
              onCheckedChange={setUseWorkforceData}
              id="use-workforce-data"
            />
            <label htmlFor="use-workforce-data">
              Use Workforce Data for Salaries and Wages
            </label>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Operating Expenses</h3>
            {renderExpensesTable()}
            <Button onClick={addExpense} className="mt-2">
              <Plus className="h-4 w-4 mr-2" /> Add Expense
            </Button>
          </div>

          <div className="text-xl font-bold">
            Total Monthly Operating Expenses: ${formatNumber(totalMonthlyExpenses)}
          </div>
          <div className="text-xl font-bold">
            Total Annual Operating Expenses: ${formatNumber(totalAnnualExpenses)}
          </div>

          <div className="h-80 mt-8">
            <h3 className="text-lg font-semibold mb-2">Expense Distribution</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${formatNumber(value)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {renderSavedCalculations()}
        </div>
      </CardContent>
    </Card>
  );
};

export default OpexCalculator;