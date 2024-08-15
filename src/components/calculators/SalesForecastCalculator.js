// Imports
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Minus, Save, FileInput, Trash2, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/Table";
import { useBusinessPlan } from '../../hooks/useBusinessPlan';
import { useToast } from '../ui/Toast';

// Component definition
const SalesForecastCalculator = () => {
  // Context
  const { setSalesForecast } = useBusinessPlan();
  const { addToast } = useToast();

  // Initial state definitions
  const initialProduct = { 
    name: '', 
    costPerItem: '', 
    sellingPrice: '', 
    quantity: '',
    timeframe: 'month'
  };

  // State definitions
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem('salesForecastProducts');
    return savedProducts ? JSON.parse(savedProducts) : {
      year1: [initialProduct],
      year2: [initialProduct],
      year3: [initialProduct]
    };
  });
  const [savedCalculations, setSavedCalculations] = useState(() => {
    const savedCalcs = localStorage.getItem('savedSalesForecastCalculations');
    return savedCalcs ? JSON.parse(savedCalcs) : [];
  });
  const [savedCostOfSalesCalculations, setSavedCostOfSalesCalculations] = useState(() => {
    const savedCalcs = localStorage.getItem('savedCostOfSalesCalculations');
    return savedCalcs ? JSON.parse(savedCalcs) : [];
  });
  const [percentIncrease, setPercentIncrease] = useState({ year2: 0, year3: 0 });

  // useEffect for localStorage
  useEffect(() => {
    localStorage.setItem('salesForecastProducts', JSON.stringify(products));
    localStorage.setItem('savedSalesForecastCalculations', JSON.stringify(savedCalculations));
  }, [products, savedCalculations]);

  // Utility functions
  const formatNumber = (num) => {
    if (typeof num !== 'number') return '0';
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const parseFormattedNumber = (str) => {
    if (typeof str !== 'string') return 0;
    return parseFloat(str.replace(/,/g, '')) || 0;
  };

  // Event handlers
  const handleProductChange = (year, index, field, value) => {
    const updatedProducts = { ...products };
    if (field === 'timeframe') {
      updatedProducts[year][index].timeframe = value;
    } else {
      updatedProducts[year][index][field] = value;
    }
    setProducts(updatedProducts);
  };

  const addProduct = (year) => {
    const updatedProducts = { ...products };
    updatedProducts[year] = [...updatedProducts[year], { ...initialProduct }];
    setProducts(updatedProducts);
  };

  const removeProduct = (year, index) => {
    const updatedProducts = { ...products };
    updatedProducts[year] = updatedProducts[year].filter((_, i) => i !== index);
    setProducts(updatedProducts);
  };

  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all data? This will reset the form.')) {
      setProducts({
        year1: [initialProduct],
        year2: [initialProduct],
        year3: [initialProduct]
      });
      setPercentIncrease({ year2: 0, year3: 0 });
      localStorage.removeItem('salesForecastProducts');
    }
  };

  const saveCalculation = () => {
    const calculationName = prompt('Enter a name for this calculation:');
    if (calculationName) {
      const newCalculation = {
        name: calculationName,
        products,
        percentIncrease,
        date: new Date().toISOString()
      };
      setSavedCalculations([...savedCalculations, newCalculation]);
    }
  };

  const loadCalculation = (calculation) => {
    if (window.confirm(`Are you sure you want to load "${calculation.name}"? This will overwrite your current data.`)) {
      setProducts(calculation.products);
      setPercentIncrease(calculation.percentIncrease || { year2: 0, year3: 0 });
    }
  };

  const deleteCalculation = (index) => {
    if (window.confirm('Are you sure you want to delete this saved calculation?')) {
      const newSavedCalculations = savedCalculations.filter((_, i) => i !== index);
      setSavedCalculations(newSavedCalculations);
    }
  };

  const loadFromCostOfSales = (calculation, year) => {
    const newProduct = {
      name: calculation.name,
      costPerItem: formatNumber(calculation.costPerUnit),
      sellingPrice: formatNumber(calculation.sellingPrice),
      quantity: '',
      timeframe: 'month'
    };
    const updatedProducts = { ...products };
    updatedProducts[year] = [...updatedProducts[year], newProduct];
    setProducts(updatedProducts);
  };

  // New function to save product to Cost of Sales
  const saveProductToCostOfSales = (product) => {
    const newCostOfSalesItem = {
      name: product.name,
      isProduct: true,
      costPerUnit: parseFormattedNumber(product.costPerItem),
      sellingPrice: parseFormattedNumber(product.sellingPrice),
      date: new Date().toISOString()
    };
    const updatedCostOfSalesCalculations = [...savedCostOfSalesCalculations, newCostOfSalesItem];
    setSavedCostOfSalesCalculations(updatedCostOfSalesCalculations);
    localStorage.setItem('savedCostOfSalesCalculations', JSON.stringify(updatedCostOfSalesCalculations));
    addToast(`${product.name} has been saved to the Cost of Sales calculator.`);
  };

  // New function to delete from Cost of Sales
  const deleteFromCostOfSales = (index) => {
    if (window.confirm('Are you sure you want to delete this item from Cost of Sales?')) {
      const newSavedCostOfSalesCalculations = savedCostOfSalesCalculations.filter((_, i) => i !== index);
      setSavedCostOfSalesCalculations(newSavedCostOfSalesCalculations);
      localStorage.setItem('savedCostOfSalesCalculations', JSON.stringify(newSavedCostOfSalesCalculations));
      addToast("The item has been deleted from the Cost of Sales calculator.");
    }
  };

  // Calculation functions
  const calculateQuantities = (product) => {
    const quantity = parseFormattedNumber(product.quantity);
    let perDay, perMonth, perYear;
    switch (product.timeframe) {
      case 'day':
        perDay = quantity;
        perMonth = quantity * 30;
        perYear = quantity * 365;
        break;
      case 'month':
        perDay = quantity / 30;
        perMonth = quantity;
        perYear = quantity * 12;
        break;
      case 'year':
        perDay = quantity / 365;
        perMonth = quantity / 12;
        perYear = quantity;
        break;
      default:
        perDay = perMonth = perYear = 0;
    }
    return { perDay: Math.round(perDay), perMonth: Math.round(perMonth), perYear: Math.round(perYear) };
  };

  const calculateTotals = (yearProducts, year) => {
    let totalSales = 0;
    let totalGrossProfit = 0;
    let totalCostOfGoodsSold = 0;
    let totalPerDay = 0;
    let totalPerMonth = 0;
    let totalPerYear = 0;

    if (Array.isArray(yearProducts)) {
      yearProducts.forEach(product => {
        const { perDay, perMonth, perYear } = calculateQuantities(product);
        const productSales = parseFormattedNumber(product.sellingPrice) * perYear;
        const productCostOfGoodsSold = parseFormattedNumber(product.costPerItem) * perYear;
        const productGrossProfit = productSales - productCostOfGoodsSold;
        
        totalSales += productSales;
        totalGrossProfit += productGrossProfit;
        totalCostOfGoodsSold += productCostOfGoodsSold;
        totalPerDay += perDay;
        totalPerMonth += perMonth;
        totalPerYear += perYear;
      });
    }

    if (year === 'year2' || year === 'year3') {
      const increase = 1 + (percentIncrease[year] / 100);
      totalSales *= increase;
      totalGrossProfit *= increase;
      totalCostOfGoodsSold *= increase;
      totalPerDay *= increase;
      totalPerMonth *= increase;
      totalPerYear *= increase;
    }

    const grossProfitMargin = totalSales !== 0 ? (totalGrossProfit / totalSales) * 100 : 0;

    return { 
      totalSales, 
      totalGrossProfit, 
      grossProfitMargin, 
      totalCostOfGoodsSold,
      totalPerDay,
      totalPerMonth,
      totalPerYear
    };
  };

  const yearTotals = useMemo(() => {
    const totals = {};
    ['year1', 'year2', 'year3'].forEach(year => {
      totals[year] = calculateTotals(products[year] || [], year);
    });
    return totals;
  }, [products, percentIncrease]);

  // Update context
  useEffect(() => {
    setSalesForecast(yearTotals);
  }, [yearTotals, setSalesForecast]);

  // Render functions
  const renderYearTab = (year) => (
    <div>
      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead>Name of Product/Service</TableHead>
            <TableHead>Cost Per Item</TableHead>
            <TableHead>Selling Price</TableHead>
            <TableHead>Quantity Sold</TableHead>
            <TableHead>Timeframe</TableHead>
            <TableHead>Per Day</TableHead>
            <TableHead>Per Month</TableHead>
            <TableHead>Per Year</TableHead>
            <TableHead>Total Sales</TableHead>
            <TableHead>Total Cost of Goods Sold</TableHead>
            <TableHead>Gross Profit</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(products[year] || []).map((product, index) => {
            const quantities = calculateQuantities(product);
            const totalSales = parseFormattedNumber(product.sellingPrice) * quantities.perYear;
            const totalCostOfGoodsSold = parseFormattedNumber(product.costPerItem) * quantities.perYear;
            const grossProfit = totalSales - totalCostOfGoodsSold;
            return (
              <TableRow key={index}>
                <TableCell>
                  <Input
                    type="text"
                    value={product.name}
                    onChange={(e) => handleProductChange(year, index, 'name', e.target.value)}
                    placeholder="e.g., Widget A"
                    className="w-full"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={product.costPerItem}
                    onChange={(e) => handleProductChange(year, index, 'costPerItem', e.target.value)}
                    placeholder="Cost per item"
                    className="w-full text-right"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={product.sellingPrice}
                    onChange={(e) => handleProductChange(year, index, 'sellingPrice', e.target.value)}
                    placeholder="Selling price"
                    className="w-full text-right"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={product.quantity}
                    onChange={(e) => handleProductChange(year, index, 'quantity', e.target.value)}
                    placeholder="Quantity"
                    className="w-full text-right"
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={product.timeframe}
                    onValueChange={(value) => handleProductChange(year, index, 'timeframe', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="day">Per Day</SelectItem>
                      <SelectItem value="month">Per Month</SelectItem>
                      <SelectItem value="year">Per Year</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{formatNumber(quantities.perDay)}</TableCell>
                <TableCell>{formatNumber(quantities.perMonth)}</TableCell>
                <TableCell>{formatNumber(quantities.perYear)}</TableCell>
                <TableCell>${formatNumber(totalSales)}</TableCell>
                <TableCell>${formatNumber(totalCostOfGoodsSold)}</TableCell>
                <TableCell>${formatNumber(grossProfit)}</TableCell>
                <TableCell>
                  <Button variant="destructive" size="icon" onClick={() => removeProduct(year, index)} className="mr-2">
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => saveProductToCostOfSales(product)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {yearTotals[year] && (
            <TableRow className="font-bold bg-gray-100">
              <TableCell colSpan={5}>Totals</TableCell>
              <TableCell>{formatNumber(yearTotals[year].totalPerDay)}</TableCell>
              <TableCell>{formatNumber(yearTotals[year].totalPerMonth)}</TableCell>
              <TableCell>{formatNumber(yearTotals[year].totalPerYear)}</TableCell>
              <TableCell>${formatNumber(yearTotals[year].totalSales)}</TableCell>
              <TableCell>${formatNumber(yearTotals[year].totalCostOfGoodsSold)}</TableCell>
              <TableCell>${formatNumber(yearTotals[year].totalGrossProfit)}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Button onClick={() => addProduct(year)} className="mt-4">
        <Plus className="h-4 w-4 mr-2" /> Add Product/Service
      </Button>
  
      {year !== 'year1' && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-lg font-semibold mb-2">Percent Increase for {year.replace('year', 'Year ')}</h4>
          <div className="flex items-center">
            <Input
              type="number"
              value={percentIncrease[year]}
              onChange={(e) => setPercentIncrease({...percentIncrease, [year]: parseFloat(e.target.value) || 0})}
              className="w-24 mr-2"
            />
            <span>%</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            This percentage will be applied to increase the total sales, cost of goods sold, and gross profit for this year.
          </p>
        </div>
      )}
  
      {savedCostOfSalesCalculations.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Load Products from Cost of Sales Calculator</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Cost Per Unit</TableHead>
                <TableHead>Selling Price</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savedCostOfSalesCalculations.map((calc, index) => (
                <TableRow key={index}>
                  <TableCell>{calc.name}</TableCell>
                  <TableCell>{calc.isProduct ? 'Product' : 'Service'}</TableCell>
                  <TableCell>${formatNumber(calc.costPerUnit)}</TableCell>
                  <TableCell>${formatNumber(calc.sellingPrice)}</TableCell>
                  <TableCell>{new Date(calc.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button onClick={() => loadFromCostOfSales(calc, year)} size="sm" className="mr-2">
                      <FileInput className="h-4 w-4 mr-2" /> Load
                    </Button>
                    <Button onClick={() => deleteFromCostOfSales(index)} size="sm" variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );

  const renderSummaryTab = () => {
    const totalSales = Object.values(yearTotals).reduce((sum, year) => sum + year.totalSales, 0);
    const totalGrossProfit = Object.values(yearTotals).reduce((sum, year) => sum + year.totalGrossProfit, 0);
    const totalCostOfGoodsSold = Object.values(yearTotals).reduce((sum, year) => sum + year.totalCostOfGoodsSold, 0);
    const averageGrossProfitMargin = totalSales !== 0 ? (totalGrossProfit / totalSales) * 100 : 0;

    return (
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-4">3-Year Summary</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Year</TableHead>
              <TableHead>Total Sales</TableHead>
              <TableHead>Total Cost of Goods Sold</TableHead>
              <TableHead>Gross Profit</TableHead>
              <TableHead>Gross Profit Margin %</TableHead>
              <TableHead>Percent Increase</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(yearTotals).map(([year, totals]) => (
              <TableRow key={year}>
                <TableCell>{year.replace('year', 'Year ')}</TableCell>
                <TableCell>${formatNumber(totals.totalSales)}</TableCell>
                <TableCell>${formatNumber(totals.totalCostOfGoodsSold)}</TableCell>
                <TableCell>${formatNumber(totals.totalGrossProfit)}</TableCell>
                <TableCell>{totals.grossProfitMargin.toFixed(2)}%</TableCell>
                <TableCell>{year !== 'year1' ? `${percentIncrease[year]}%` : 'N/A'}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-bold bg-gray-100">
              <TableCell>Total</TableCell>
              <TableCell>${formatNumber(totalSales)}</TableCell>
              <TableCell>${formatNumber(totalCostOfGoodsSold)}</TableCell>
              <TableCell>${formatNumber(totalGrossProfit)}</TableCell>
              <TableCell>{averageGrossProfitMargin.toFixed(2)}%</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  };

  // Component return
  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">Multi-Year Sales Forecast Calculator</CardTitle>
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
        <Tabs defaultValue="year1">
          <TabsList>
            <TabsTrigger value="year1">Year 1</TabsTrigger>
            <TabsTrigger value="year2">Year 2</TabsTrigger>
            <TabsTrigger value="year3">Year 3</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>
          <TabsContent value="year1">{renderYearTab('year1')}</TabsContent>
          <TabsContent value="year2">{renderYearTab('year2')}</TabsContent>
          <TabsContent value="year3">{renderYearTab('year3')}</TabsContent>
          <TabsContent value="summary">{renderSummaryTab()}</TabsContent>
        </Tabs>

        {savedCalculations.length > 0 && (
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
        )}
      </CardContent>
    </Card>
  );
};

export default SalesForecastCalculator;