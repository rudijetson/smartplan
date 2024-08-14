// Imports
import React, { useState, useEffect } from 'react';
import { Plus, Minus, HelpCircle, Save, FileInput, Trash2, DollarSign } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/Tooltip';
import { Alert, AlertDescription } from '../ui/Alert';
import { Checkbox } from '../ui/Checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/Table";

// Component definition
const StartupCostsCalculator = () => {
  // State definitions
  const [fixedAssets, setFixedAssets] = useState(() => {
    const saved = localStorage.getItem('fixedAssets');
    return saved ? JSON.parse(saved) : [
      { name: 'Commercial Real Estate', amount: 0, depreciation: 39 },
      { name: 'Leasehold Improvements', amount: 0, depreciation: 15 },
      { name: 'Furniture / Fixtures', amount: 0, depreciation: 7 },
      { name: 'Equipment', amount: 0, depreciation: 5 },
      { name: 'Vehicles', amount: 0, depreciation: 5 },
    ];
  });

  const [startupExpenses, setStartupExpenses] = useState(() => {
    const saved = localStorage.getItem('startupExpenses');
    return saved ? JSON.parse(saved) : [
      { name: 'Rent / Utility Deposits', amount: 0 },
      { name: 'Prepaid Expenses (Insurance, etc.)', amount: 0 },
      { name: 'Starting Inventory', amount: 0 },
      { name: 'Pre-Launch Salaries & Wages', amount: 0 },
    ];
  });

  const [workingCapital, setWorkingCapital] = useState(() => {
    const saved = localStorage.getItem('workingCapital');
    return saved ? parseFloat(saved) : 0;
  });

  const [savedCalculations, setSavedCalculations] = useState(() => {
    const saved = localStorage.getItem('savedCalculations');
    return saved ? JSON.parse(saved) : [];
  });

  const [confirmDelete, setConfirmDelete] = useState(() => {
    const saved = localStorage.getItem('confirmDelete');
    return saved ? JSON.parse(saved) : true;
  });

  // useEffect for localStorage
  useEffect(() => {
    localStorage.setItem('fixedAssets', JSON.stringify(fixedAssets));
    localStorage.setItem('startupExpenses', JSON.stringify(startupExpenses));
    localStorage.setItem('workingCapital', workingCapital.toString());
    localStorage.setItem('savedCalculations', JSON.stringify(savedCalculations));
    localStorage.setItem('confirmDelete', JSON.stringify(confirmDelete));
  }, [fixedAssets, startupExpenses, workingCapital, savedCalculations, confirmDelete]);

  // Utility functions
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const parseFormattedNumber = (str) => {
    return parseFloat(str.replace(/,/g, '')) || 0;
  };

  // Event handlers
const handleInputChange = (setter, index, field, value) => {
  setter(prev => {
    const newArray = [...prev];
    if (field === 'amount') {
      newArray[index][field] = parseFormattedNumber(value);
    } else if (field === 'depreciation') {
      newArray[index][field] = parseFloat(value) || 0;
    } else {
      newArray[index][field] = value;
    }
    return newArray;
  });
};

const addItem = (setter, defaultItem) => {
  setter(prev => [...prev, defaultItem]);
};

const removeItem = (setter, index) => {
  setter(prev => prev.filter((_, i) => i !== index));
};

const clearAll = () => {
  if (window.confirm('Are you sure you want to clear all data? This will reset the form and clear saved data.')) {
    setFixedAssets([
      { name: 'Commercial Real Estate', amount: 0, depreciation: 39 },
      { name: 'Leasehold Improvements', amount: 0, depreciation: 15 },
      { name: 'Furniture / Fixtures', amount: 0, depreciation: 7 },
      { name: 'Equipment', amount: 0, depreciation: 5 },
      { name: 'Vehicles', amount: 0, depreciation: 5 },
    ]);
    setStartupExpenses([
      { name: 'Rent / Utility Deposits', amount: 0 },
      { name: 'Prepaid Expenses (Insurance, etc.)', amount: 0 },
      { name: 'Starting Inventory', amount: 0 },
      { name: 'Pre-Launch Salaries & Wages', amount: 0 },
    ]);
    setWorkingCapital(0);
    localStorage.removeItem('fixedAssets');
    localStorage.removeItem('startupExpenses');
    localStorage.removeItem('workingCapital');
  }
};

const saveCalculation = () => {
  const calculationName = prompt('Enter a name for this calculation:');
  if (calculationName) {
    const newCalculation = {
      name: calculationName,
      fixedAssets,
      startupExpenses,
      workingCapital,
      date: new Date().toISOString()
    };
    setSavedCalculations([...savedCalculations, newCalculation]);
  }
};

const loadCalculation = (calculation) => {
  if (window.confirm(`Are you sure you want to load "${calculation.name}"? This will overwrite your current data.`)) {
    setFixedAssets(calculation.fixedAssets);
    setStartupExpenses(calculation.startupExpenses);
    setWorkingCapital(calculation.workingCapital);
  }
};

const deleteCalculation = (index) => {
  if (window.confirm('Are you sure you want to delete this saved calculation?')) {
    const newSavedCalculations = savedCalculations.filter((_, i) => i !== index);
    setSavedCalculations(newSavedCalculations);
  }
};

  // Calculations
  const totalFixedAssets = fixedAssets.reduce((sum, item) => sum + item.amount, 0);
  const totalStartupExpenses = startupExpenses.reduce((sum, item) => sum + item.amount, 0);
  const totalFundsNeeded = totalFixedAssets + totalStartupExpenses + workingCapital;

  // Render functions
  const renderSection = (title, items, setter, defaultItem, includeDepreciation = false, total) => (
    <section className="mb-8 p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="text-lg font-bold text-blue-600">
          Total: ${formatNumber(total.toFixed(2))}
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">Item</TableHead>
            <TableHead className="text-right">Amount ($)</TableHead>
            {includeDepreciation && <TableHead className="text-right">Depreciation (Years)</TableHead>}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                <Input
                  type="text"
                  value={item.name}
                  onChange={(e) => handleInputChange(setter, index, 'name', e.target.value)}
                  className="w-full"
                  placeholder="Item Name"
                />
              </TableCell>
              <TableCell className="text-right">
                <Input
                  type="text"
                  value={formatNumber(item.amount)}
                  onChange={(e) => handleInputChange(setter, index, 'amount', e.target.value)}
                  className="w-full text-right"
                  placeholder="$ 0.00"
                />
              </TableCell>
              {includeDepreciation && (
                <TableCell className="text-right">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Input
                          type="number"
                          value={item.depreciation}
                          onChange={(e) => handleInputChange(setter, index, 'depreciation', e.target.value)}
                          className="w-full text-right"
                          placeholder="0"
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Depreciation period in years</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              )}
              <TableCell className="text-right">
                <Button variant="destructive" size="icon" onClick={() => removeItem(setter, index)}>
                  <Minus className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={() => addItem(setter, defaultItem)} className="mt-2">
        <Plus className="h-4 w-4 mr-2" /> Add Item
      </Button>
    </section>
  );
  // Component return
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">Startup Costs Calculator</CardTitle>
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
        {renderSection('Fixed Assets', fixedAssets, setFixedAssets, { name: '', amount: 0, depreciation: 5 }, true, totalFixedAssets)}
        {renderSection('Startup Expenses', startupExpenses, setStartupExpenses, { name: '', amount: 0 }, false, totalStartupExpenses)}
        
        <section className="mb-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Working Capital & Cash Reserves</h3>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label htmlFor="workingCapital" className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <Input
                  type="text"
                  id="workingCapital"
                  value={formatNumber(workingCapital)}
                  onChange={(e) => setWorkingCapital(parseFormattedNumber(e.target.value))}
                  className="pl-10"
                  placeholder="0.00"
                />
              </div>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <HelpCircle className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Working capital is the money needed to cover initial operating expenses</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </section>
        
        <section className="mt-8 p-4 bg-green-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Total Fixed Assets:</p>
              <p className="text-lg text-blue-600">${formatNumber(totalFixedAssets.toFixed(2))}</p>
            </div>
            <div>
              <p className="font-medium">Total Startup Expenses:</p>
              <p className="text-lg text-green-600">${formatNumber(totalStartupExpenses.toFixed(2))}</p>
            </div>
            <div>
              <p className="font-medium">Working Capital:</p>
              <p className="text-lg text-purple-600">${formatNumber(workingCapital.toFixed(2))}</p>
            </div>
            <div>
              <p className="font-medium">TOTAL FUNDS NEEDED:</p>
              <p className="text-xl font-bold text-red-600">${formatNumber(totalFundsNeeded.toFixed(2))}</p>
            </div>
          </div>
        </section>
        
        {totalFundsNeeded > 1000000 && (
          <Alert className="mt-4">
            <AlertDescription>
              Your total funds needed exceed $1,000,000. Please review your inputs carefully.
            </AlertDescription>
          </Alert>
        )}
  
        {savedCalculations.length > 0 && (
          <div className="mt-6">
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
        )}
      </CardContent>
    </Card>
  );
};

export default StartupCostsCalculator;