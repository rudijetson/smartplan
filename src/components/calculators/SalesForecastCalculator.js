import React, { useState, useMemo } from 'react';
import { Plus, Minus } from 'lucide-react';
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

const NumberInput = ({ value, onChange, placeholder }) => {
  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full text-right"
    />
  );
};

const SalesForecastCalculator = () => {
  const initialProduct = { 
    name: '', 
    costPerItem: '', 
    sellingPrice: '', 
    quantity: { year1: '', year2: '', year3: '' },
    timeframe: 'month'
  };

  const [products, setProducts] = useState([initialProduct]);

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const parseFormattedNumber = (str) => {
    return parseFloat(str.replace(/,/g, '')) || 0;
  };

  const handleProductChange = (index, field, value, year = null) => {
    const updatedProducts = [...products];
    if (year) {
      updatedProducts[index].quantity[year] = formatNumber(value);
      // If changing Year 1, update Years 2 and 3
      if (year === 'year1') {
        updatedProducts[index].quantity.year2 = formatNumber(value);
        updatedProducts[index].quantity.year3 = formatNumber(value);
      }
    } else if (field === 'timeframe') {
      updatedProducts[index].timeframe = value;
    } else {
      updatedProducts[index][field] = field === 'name' ? value : formatNumber(value);
    }
    setProducts(updatedProducts);
  };

  const addProduct = () => {
    setProducts([...products, initialProduct]);
  };

  const removeProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

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
    return { perDay, perMonth, perYear };
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

    const grossProfitMargin = totalSales !== 0 ? (totalGrossProfit / totalSales) * 100 : 0;

    return { totalSales, totalGrossProfit, grossProfitMargin };
  };

  const yearTotals = useMemo(() => {
    const totals = {};
    ['year1', 'year2', 'year3'].forEach(year => {
      totals[year] = calculateTotals(products, year);
    });
    return totals;
  }, [products]);

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
                    placeholder={`Product / Service ${index + 1}`}
                    className="w-full"
                  />
                </TableCell>
                <TableCell>
                  <NumberInput
                    value={product.costPerItem}
                    onChange={(value) => handleProductChange(index, 'costPerItem', value)}
                    placeholder="Cost"
                  />
                </TableCell>
                <TableCell>
                  <NumberInput
                    value={product.sellingPrice}
                    onChange={(value) => handleProductChange(index, 'sellingPrice', value)}
                    placeholder="Price"
                  />
                </TableCell>
                <TableCell>
                  <NumberInput
                    value={product.quantity[year]}
                    onChange={(value) => handleProductChange(index, 'quantity', value, year)}
                    placeholder="Quantity"
                  />
                </TableCell>
                <TableCell>
                  <Select
                    value={product.timeframe}
                    onValueChange={(value) => handleProductChange(index, 'timeframe', value)}
                  >
                    <SelectTrigger className="w-full bg-white border border-gray-300">
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent className='w-full bg-white border border-gray-300 shadow-lg'>
                      <SelectItem value="day">Per Day</SelectItem>
                      <SelectItem value="month">Per Month</SelectItem>
                      <SelectItem value="year">Per Year</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{formatNumber(quantities.perDay.toFixed(2))}</TableCell>
                <TableCell>{formatNumber(quantities.perMonth.toFixed(2))}</TableCell>
                <TableCell>{formatNumber(quantities.perYear.toFixed(2))}</TableCell>
                <TableCell>${formatNumber((parseFormattedNumber(product.sellingPrice) * quantities.perYear).toFixed(2))}</TableCell>
                <TableCell>${formatNumber(((parseFormattedNumber(product.sellingPrice) - parseFormattedNumber(product.costPerItem)) * quantities.perYear).toFixed(2))}</TableCell>
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
            <TableCell>${formatNumber(yearTotals[year].totalSales.toFixed(2))}</TableCell>
            <TableCell>${formatNumber(yearTotals[year].totalGrossProfit.toFixed(2))}</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Button onClick={addProduct} className="mt-4">
        <Plus className="h-4 w-4 mr-2" /> Add Product/Service
      </Button>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(yearTotals).map(([year, totals]) => (
              <TableRow key={year}>
                <TableCell>{year.replace('year', 'Year ')}</TableCell>
                <TableCell>${formatNumber(totals.totalSales.toFixed(2))}</TableCell>
                <TableCell>${formatNumber(totals.totalGrossProfit.toFixed(2))}</TableCell>
                <TableCell>{totals.grossProfitMargin.toFixed(2)}%</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-bold bg-gray-100">
              <TableCell>Total</TableCell>
              <TableCell>${formatNumber(totalSales.toFixed(2))}</TableCell>
              <TableCell>${formatNumber(totalGrossProfit.toFixed(2))}</TableCell>
              <TableCell>{averageGrossProfitMargin.toFixed(2)}%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Multi-Year Sales Forecast Calculator</CardTitle>
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
      </CardContent>
    </Card>
  );
};

export default SalesForecastCalculator;