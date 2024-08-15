// Imports
import React, { useState, useEffect } from 'react';
import { Plus, Minus, HelpCircle, Save, FileInput, Trash2, DollarSign } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/Tooltip';
import { Alert, AlertDescription } from '../ui/Alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/Table";
import { useBusinessPlan } from '../../hooks/useBusinessPlan';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/Accordion';

const StartupCostsCalculator = () => {
  // Context and State
  const { setStartupCosts } = useBusinessPlan();

  const [bigPurchases, setBigPurchases] = useState(() => {
    const saved = localStorage.getItem('bigPurchases');
    return saved ? JSON.parse(saved) : [
      { name: 'Equipment', amount: 0, depreciation: 5 },
      { name: 'Vehicles', amount: 0, depreciation: 5 },
      { name: 'Furniture', amount: 0, depreciation: 7 },
    ];
  });

  const [startingCosts, setStartingCosts] = useState(() => {
    const saved = localStorage.getItem('startingCosts');
    return saved ? JSON.parse(saved) : [
      { name: 'Licenses and Permits', amount: 0 },
      { name: 'Deposits', amount: 0 },
      { name: 'Starting Inventory', amount: 0 },
    ];
  });

  const [operatingMoney, setOperatingMoney] = useState(() => {
    const saved = localStorage.getItem('operatingMoney');
    return saved ? parseFloat(saved) : 0;
  });

  const [savedCalculations, setSavedCalculations] = useState(() => {
    const saved = localStorage.getItem('savedCalculations');
    return saved ? JSON.parse(saved) : [];
  });

  // useEffect Hooks
  useEffect(() => {
    localStorage.setItem('bigPurchases', JSON.stringify(bigPurchases));
    localStorage.setItem('startingCosts', JSON.stringify(startingCosts));
    localStorage.setItem('operatingMoney', operatingMoney.toString());
    localStorage.setItem('savedCalculations', JSON.stringify(savedCalculations));
  }, [bigPurchases, startingCosts, operatingMoney, savedCalculations]);

  // Utility Functions
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const parseFormattedNumber = (str) => {
    return parseFloat(str.replace(/,/g, '')) || 0;
  };

  // Event Handlers
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
      setBigPurchases([
        { name: 'Equipment', amount: 0, depreciation: 5 },
        { name: 'Vehicles', amount: 0, depreciation: 5 },
        { name: 'Furniture', amount: 0, depreciation: 7 },
      ]);
      setStartingCosts([
        { name: 'Licenses and Permits', amount: 0 },
        { name: 'Deposits', amount: 0 },
        { name: 'Starting Inventory', amount: 0 },
      ]);
      setOperatingMoney(0);
      localStorage.removeItem('bigPurchases');
      localStorage.removeItem('startingCosts');
      localStorage.removeItem('operatingMoney');
    }
  };

  const saveCalculation = () => {
    const calculationName = prompt('Enter a name for this calculation:');
    if (calculationName) {
      const newCalculation = {
        name: calculationName,
        bigPurchases,
        startingCosts,
        operatingMoney,
        date: new Date().toISOString()
      };
      setSavedCalculations([...savedCalculations, newCalculation]);
    }
  };

  const loadCalculation = (calculation) => {
    if (window.confirm(`Are you sure you want to load "${calculation.name}"? This will overwrite your current data.`)) {
      setBigPurchases(calculation.bigPurchases);
      setStartingCosts(calculation.startingCosts);
      setOperatingMoney(calculation.operatingMoney);
    }
  };

  const deleteCalculation = (index) => {
    if (window.confirm('Are you sure you want to delete this saved calculation?')) {
      const newSavedCalculations = savedCalculations.filter((_, i) => i !== index);
      setSavedCalculations(newSavedCalculations);
    }
  };

  // Calculations
  const totalBigPurchases = bigPurchases.reduce((sum, item) => sum + item.amount, 0);
  const totalStartingCosts = startingCosts.reduce((sum, item) => sum + item.amount, 0);
  const totalFundsNeeded = totalBigPurchases + totalStartingCosts + operatingMoney;

  // Update Context
  useEffect(() => {
    setStartupCosts({ totalFundsNeeded });
  }, [totalFundsNeeded, setStartupCosts]);

  // Render Functions
  const renderItemInputs = (item, index, setter, includeDepreciation) => (
    <div key={index} className="mb-4 p-4 bg-gray-100 rounded-lg">
      <Input
        type="text"
        value={item.name}
        onChange={(e) => handleInputChange(setter, index, 'name', e.target.value)}
        className="w-full mb-2"
        placeholder="Item Name"
      />
      <Input
        type="text"
        value={formatNumber(item.amount)}
        onChange={(e) => handleInputChange(setter, index, 'amount', e.target.value)}
        className="w-full mb-2"
        placeholder="$ 0.00"
      />
      {includeDepreciation && (
        <Input
          type="number"
          value={item.depreciation}
          onChange={(e) => handleInputChange(setter, index, 'depreciation', e.target.value)}
          className="w-full mb-2"
          placeholder="Depreciation (Years)"
        />
      )}
      <Button variant="destructive" size="sm" onClick={() => removeItem(setter, index)} className="w-full">
        <Minus className="h-4 w-4 mr-2" /> Remove
      </Button>
    </div>
  );

  const renderSection = (title, items, setter, defaultItem, includeDepreciation = false, total, tooltipContent) => (
    <Accordion type="single" collapsible className="mb-4">
      <AccordionItem value={title}>
        <AccordionTrigger>
          <div className="flex items-center justify-between w-full">
            <span>{title}</span>
            <span className="text-blue-600">${formatNumber(total.toFixed(2))}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="mb-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-5 w-5 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tooltipContent}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {items.map((item, index) => renderItemInputs(item, index, setter, includeDepreciation))}
          <Button onClick={() => addItem(setter, defaultItem)} className="w-full mt-2">
            <Plus className="h-4 w-4 mr-2" /> Add Item
          </Button>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );

  // Component Return
  return (
    <Card className="w-full mx-auto">
      <CardHeader className="flex flex-col items-start">
        <CardTitle className="text-2xl mb-4">Startup Costs Calculator</CardTitle>
        <div className="flex space-x-2 w-full">
          <Button onClick={clearAll} variant="outline" size="sm" className="flex-1">
            <Trash2 className="h-4 w-4 mr-2" /> Reset
          </Button>
          <Button onClick={saveCalculation} size="sm" className="flex-1">
            <Save className="h-4 w-4 mr-2" /> Save
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {renderSection(
          'Fixed Assets', 
          bigPurchases, 
          setBigPurchases, 
          { name: '', amount: 0, depreciation: 5 }, 
          true, 
          totalBigPurchases,
          'These are the big things you buy once and use for a long time, like equipment, vehicles, or furniture.'
        )}
        {renderSection(
          'Starting Costs', 
          startingCosts, 
          setStartingCosts, 
          { name: '', amount: 0 }, 
          false, 
          totalStartingCosts,
          'These are the costs that get your business up and running, like licenses, permits, deposits, starting inventories.'
        )}
        
        <Accordion type="single" collapsible className="mb-4">
          <AccordionItem value="operating-money">
            <AccordionTrigger>Operating Money and Emergency Fund</AccordionTrigger>
            <AccordionContent>
              <div className="mb-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-5 w-5 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This is the extra money set aside for unexpected expenses and general business operations.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <Input
                  type="text"
                  id="operatingMoney"
                  value={formatNumber(operatingMoney)}
                  onChange={(e) => setOperatingMoney(parseFormattedNumber(e.target.value))}
                  className="pl-10 w-full"
                  placeholder="0.00"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        
        <section className="mt-8 p-4 bg-green-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="font-medium">Total Fixed Assets:</p>
              <p className="text-blue-600">${formatNumber(totalBigPurchases.toFixed(2))}</p>
            </div>
            <div className="flex justify-between">
              <p className="font-medium">Total Starting Costs:</p>
              <p className="text-green-600">${formatNumber(totalStartingCosts.toFixed(2))}</p>
            </div>
            <div className="flex justify-between">
              <p className="font-medium">Operating Money:</p>
              <p className="text-purple-600">${formatNumber(operatingMoney.toFixed(2))}</p>
            </div>
            <div className="flex justify-between font-bold">
              <p>TOTAL FUNDS NEEDED:</p>
              <p className="text-red-600">${formatNumber(totalFundsNeeded.toFixed(2))}</p>
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
          <Accordion type="single" collapsible className="mt-6">
            <AccordionItem value="saved-calculations">
              <AccordionTrigger>Saved Calculations</AccordionTrigger>
              <AccordionContent>
                {savedCalculations.map((calc, index) => (
                  <div key={index} className="mb-2 p-2 bg-gray-100 rounded flex justify-between items-center">
                    <div>
                      <p className="font-medium">{calc.name}</p>
                      <p className="text-sm text-gray-600">{new Date(calc.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Button onClick={() => loadCalculation(calc)} size="sm" className="mr-2">
                        <FileInput className="h-4 w-4 mr-2" /> Load
                      </Button>
                      <Button onClick={() => deleteCalculation(index)} size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};

export default StartupCostsCalculator;