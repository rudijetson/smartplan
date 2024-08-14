// Imports
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Minus, Save, FileInput, Trash2 } from 'lucide-react';
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

// Component definition
const SalesForecastCalculator = () => {
  // Initial state definitions
  const initialProducts = [
    { 
      name: 'Product 1', 
      costPerItem: '', 
      sellingPrice: '', 
      quantity: { year1: '', year2: '', year3: '' },
      timeframe: 'month'
    },
    { 
      name: 'Service 1', 
      costPerItem: '', 
      sellingPrice: '', 
      quantity: { year1: '', year2: '', year3: '' },
      timeframe: 'month'
    }
  ];

  // State definitions
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem('salesForecastProducts');
    return savedProducts ? JSON.parse(savedProducts) : initialProducts;
  });
  const [savedCalculations, setSavedCalculations] = useState(() => {
    const savedCalcs = localStorage.getItem('savedSalesForecastCalculations');
    return savedCalcs ? JSON.parse(savedCalcs) : [];
  });
  const [savedCostOfSalesCalculations, setSavedCostOfSalesCalculations] = useState([]);
  const [percentIncrease, setPercentIncrease] = useState({ year2: 0, year3: 0 });

  // useEffect for localStorage
  useEffect(() => {
    localStorage.setItem('salesForecastProducts', JSON.stringify(products));
    localStorage.setItem('savedSalesForecastCalculations', JSON.stringify(savedCalculations));
  }, [products, savedCalculations]);

  // Load saved Cost of Sales calculations
  useEffect(() => {
    const savedCalcs = localStorage.getItem('costOfSalesCalculations');
    if (savedCalcs) {
      setSavedCostOfSalesCalculations(JSON.parse(savedCalcs));
    }
  }, []);

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
  const handleProductChange = (index, field, value, year = null) => {
    const updatedProducts = [...products];
    if (year) {
      updatedProducts[index].quantity[year] = value;
    } else if (field === 'timeframe') {
      updatedProducts[index].timeframe = value;
    } else {
      updatedProducts[index][field] = value;
    }
    setProducts(updatedProducts);
  };

  const addProduct = () => {
    setProducts([...products, { 
      name: `Product/Service ${products.length + 1}`, 
      costPerItem: '', 
      sellingPrice: '', 
      quantity: { year1: '', year2: '', year3: '' },
      timeframe: 'month'
    }]);
  };

  const removeProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all data? This will reset the form.')) {
      setProducts(initialProducts);
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

  const loadFromCostOfSales = (calculation) => {
    if (window.confirm(`Are you sure you want to load data from "${calculation.name}"? This will overwrite your current data.`)) {
      const totalMaterialCost = calculation.materials.reduce((sum, material) => sum + parseFormattedNumber(material.cost), 0);
      const newProduct = {
        name: calculation.name,
        costPerItem: formatNumber(totalMaterialCost),
        sellingPrice: calculation.sellingPrice,
        quantity: { year1: '', year2: '', year3: '' },
        timeframe: 'month'
      };
      setProducts([newProduct]);
    }
  };

  // Calculation functions
  const calculateQuantities = (product, year) => {
    const quantity = parseFormattedNumber(product.quantity[year]);
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

  const calculateTotals = (products, year) => {
    let totalSales = 0;
    let totalGrossProfit = 0;

    products.forEach(product => {
      const { perYear } = calculateQuantities(product, year);
      const productSales = parseFormattedNumber(product.sellingPrice) * perYear;
      const productGrossProfit = productSales - (parseFormattedNumber(product.costPerItem) * perYear);
      
      totalSales += productSales;
      totalGrossProfit += productGrossProfit;
    });

    // Apply percent increase for year 2 and 3
    if (year === 'year2') {
      totalSales *= (1 + percentIncrease.year2 / 100);
      totalGrossProfit *= (1 + percentIncrease.year2 / 100);
    } else if (year === 'year3') {
      totalSales *= (1 + percentIncrease.year3 / 100);
      totalGrossProfit *= (1 + percentIncrease.year3 / 100);
    }

    const grossProfitMargin = totalSales !== 0 ? (totalGrossProfit / totalSales) * 100 : 0;

    return { totalSales, totalGrossProfit, grossProfitMargin };
  };

  const yearTotals = useMemo(() => {
    const totals = {};
    ['year1', 'year2', 'year3'].forEach(year => {
      totals[year] = calculateTotals(products, year);
    });
    return totals;
  }, [products, percentIncrease]);

  // Render functions
  const renderYearTab = (year) => (
    <div>
      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead>Product / Service</TableHead>
            <TableHead>Cost Per Item</TableHead>
            <TableHead>Selling Price</TableHead>
            <TableHead>Quantity Sold</TableHead>
            <TableHead>Timeframe</TableHead>
            <TableHead>Per Day</TableHead>
            <TableHead>Per Month</TableHead>
            <TableHead>Per Year</TableHead>
            <TableHead>Total Sales</TableHead>
            <TableHead>Gross Profit</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, index) => {
            const quantities = calculateQuantities(product, year);
            return (
              <TableRow key={index}>
                <TableCell>
                  <Input
                    type="text"
                    value={product.name}
                    onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                    placeholder={`Product/Service ${index + 1}`}
                    className="w-full"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={product.costPerItem}
                    onChange={(e) => handleProductChange(index, 'costPerItem', e.target.value)}
                    placeholder="Cost per item"
                    className="w-full text-right"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={product.sellingPrice}
                    onChange={(e) => handleProductChange(index, 'sellingPrice', e.target.value)}
                    placeholder="Selling price"
                    className="w-full text-right"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={product.quantity[year]}
                    onChange={(e) => handleProductChange(index, 'quantity', e.target.value, year)}
                    placeholder="Quantity"
                    className="w-full text-right"
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={product.timeframe}
                    onValueChange={(value) => handleProductChange(index, 'timeframe', value)}
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
                <TableCell>${formatNumber(parseFormattedNumber(product.sellingPrice) * quantities.perYear)}</TableCell>
                <TableCell>${formatNumber((parseFormattedNumber(product.sellingPrice) - parseFormattedNumber(product.costPerItem)) * quantities.perYear)}</TableCell>
                <TableCell>
                  <Button variant="destructive" size="icon" onClick={() => removeProduct(index)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          <TableRow className="font-bold bg-gray-100">
            <TableCell colSpan={8}>Totals</TableCell>
            <TableCell>${formatNumber(yearTotals[year].totalSales)}</TableCell>
            <TableCell>${formatNumber(yearTotals[year].totalGrossProfit)}</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Button onClick={addProduct} className="mt-4">
        <Plus className="h-4 w-4 mr-2" /> Add Product/Service
      </Button>

      {/* Percent Increase Section */}
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
            This percentage will be applied to increase the total sales and gross profit for this year.
          </p>
        </div>
      )}
    </div>
  );

  const renderSummaryTab = () => {
    const totalSales = Object.values(yearTotals).reduce((sum, year) => sum + year.totalSales, 0);
    const totalGrossProfit = Object.values(yearTotals).reduce((sum, year) => sum + year.totalGrossProfit, 0);
    const averageGrossProfitMargin = totalSales !== 0 ? (totalGrossProfit / totalSales) * 100 : 0;

    return (
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-4">3-Year Summary</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Year</TableHead>
              <TableHead>Total Sales</TableHead>
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
                <TableCell>${formatNumber(totals.totalGrossProfit)}</TableCell>
                <TableCell>{totals.grossProfitMargin.toFixed(2)}%</TableCell>
                <TableCell>{year !== 'year1' ? `${percentIncrease[year]}%` : 'N/A'}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-bold bg-gray-100">
              <TableCell>Total</TableCell>
              <TableCell>${formatNumber(totalSales)}</TableCell>
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

        {savedCostOfSalesCalculations.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Load from Cost of Sales Calculations</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {savedCostOfSalesCalculations.map((calc, index) => (
                  <TableRow key={index}>
                    <TableCell>{calc.name}</TableCell>
                    <TableCell>{new Date(calc.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button onClick={() => loadFromCostOfSales(calc)} size="sm">
                        <FileInput className="h-4 w-4 mr-2" /> Load
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