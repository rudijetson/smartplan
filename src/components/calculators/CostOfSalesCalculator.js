import React, { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/Table";
import { Switch } from '../ui/Switch';
import { Alert, AlertDescription } from '../ui/Alert';

// Utility functions
const formatNumber = (num) => (num || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const parseFormattedNumber = (str) => {
  if (typeof str !== 'string') return 0;
  return parseFloat(str.replace(/,/g, '')) || 0;
};

const CostOfSalesCalculator = () => {
  // State definitions
  const [isProduct, setIsProduct] = useState(true);
  const [name, setName] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [materials, setMaterials] = useState(() => {
    const saved = localStorage.getItem('costOfSalesMaterials');
    return saved ? JSON.parse(saved) : [{ name: 'Material 1', cost: '' }];
  });
  const [savedCalculations, setSavedCalculations] = useState(() => {
    const saved = localStorage.getItem('savedCostOfSalesCalculations');
    return saved ? JSON.parse(saved) : [];
  });
  const [alertMessage, setAlertMessage] = useState('');

  // useEffect for localStorage
  useEffect(() => {
    localStorage.setItem('costOfSalesMaterials', JSON.stringify(materials));
    localStorage.setItem('costOfSalesSellingPrice', JSON.stringify(sellingPrice));
    localStorage.setItem('costOfSalesIsProduct', JSON.stringify(isProduct));
    localStorage.setItem('costOfSalesName', JSON.stringify(name));
    localStorage.setItem('savedCostOfSalesCalculations', JSON.stringify(savedCalculations));
  }, [materials, sellingPrice, isProduct, name, savedCalculations]);

  // Event handlers
  const handleMaterialChange = (index, field, value) => {
    const newMaterials = [...materials];
    newMaterials[index][field] = field === 'name' ? value : formatNumber(value);
    setMaterials(newMaterials);
  };

  const addMaterial = () => {
    setMaterials([...materials, { name: `Material ${materials.length + 1}`, cost: '' }]);
  };

  const removeMaterial = (index) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all data? This will reset the form.')) {
      setMaterials([{ name: 'Material 1', cost: '' }]);
      setSellingPrice('');
      setName('');
      setIsProduct(true);
      setAlertMessage('');
    }
  };

  const saveCalculation = () => {
    if (!name) {
      setAlertMessage('Please enter a name for the product/service before saving.');
      return;
    }

    const totalCost = isProduct
      ? materials.reduce((sum, material) => sum + parseFormattedNumber(material.cost), 0)
      : 0; // For services, cost per unit is 0

    const newCalculation = {
      name,
      isProduct,
      costPerUnit: totalCost,
      sellingPrice: parseFormattedNumber(sellingPrice),
      date: new Date().toISOString()
    };

    setSavedCalculations([...savedCalculations, newCalculation]);
    setAlertMessage('Calculation saved successfully!');
  };

  const deleteCalculation = (index) => {
    if (window.confirm('Are you sure you want to delete this saved calculation?')) {
      const newSavedCalculations = savedCalculations.filter((_, i) => i !== index);
      setSavedCalculations(newSavedCalculations);
      setAlertMessage('Calculation deleted successfully!');
    }
  };

  const loadCalculation = (calc) => {
    setName(calc.name);
    setIsProduct(calc.isProduct);
    setSellingPrice(formatNumber(calc.sellingPrice));
    if (calc.isProduct) {
      setMaterials([{ name: 'Material 1', cost: formatNumber(calc.costPerUnit) }]);
    } else {
      setMaterials([{ name: 'Material 1', cost: '' }]);
    }
    setAlertMessage('Calculation loaded successfully!');
  };

  // Calculations
  const calculateResults = () => {
    const totalCost = materials.reduce((sum, material) => sum + parseFormattedNumber(material.cost), 0);
    const revenue = parseFormattedNumber(sellingPrice);
    const profit = revenue - (isProduct ? totalCost : 0); // For services, we don't subtract cost
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return { totalCost, revenue, profit, margin };
  };

  const results = calculateResults();

  // Render
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">Cost of Proudct Calculator</CardTitle>
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
        {alertMessage && (
          <Alert className="mb-4">
            <AlertDescription>{alertMessage}</AlertDescription>
          </Alert>
        )}

        <div className="mb-6">
          <label className="block font-medium mb-1">Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-1/3"
            placeholder="Product/Service Name"
          />
        </div>

        <div className="mb-6 flex items-center">
          <label className="block font-medium mr-4">Type:</label>
          <Switch
            checked={isProduct}
            onCheckedChange={setIsProduct}
          />
          <span className="ml-2">{isProduct ? 'Product' : 'Service'}</span>
        </div>

        <div className="mb-6">
          <label className="block font-medium mb-1">Selling Price per Unit ($)</label>
          <Input
            value={sellingPrice}
            onChange={(e) => setSellingPrice(formatNumber(e.target.value))}
            className="w-1/3"
            placeholder="Selling Price"
          />
        </div>

        {isProduct && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Materials (Cost per Unit)</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter the cost of each material that goes into making a single unit of your product.
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material Name</TableHead>
                  <TableHead>Cost per Unit ($)</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((material, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        value={material.name}
                        onChange={(e) => handleMaterialChange(index, 'name', e.target.value)}
                        className="w-full"
                        placeholder="Material Name"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={material.cost}
                        onChange={(e) => handleMaterialChange(index, 'cost', e.target.value)}
                        className="w-full"
                        placeholder="Cost per Unit"
                      />
                    </TableCell>
                    <TableCell>
                      <Button variant="destructive" size="icon" onClick={() => removeMaterial(index)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button onClick={addMaterial} className="mt-2">
              <Plus className="h-4 w-4 mr-2" /> Add Material
            </Button>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Results</h3>
          <Table>
            <TableBody>
              {isProduct && (
                <TableRow>
                  <TableCell className="font-medium">Total Cost per Unit</TableCell>
                  <TableCell>${formatNumber(results.totalCost.toFixed(2))}</TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell className="font-medium">Selling Price per Unit</TableCell>
                <TableCell>${formatNumber(results.revenue.toFixed(2))}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Profit per Unit</TableCell>
                <TableCell>${formatNumber(results.profit.toFixed(2))}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Profit Margin</TableCell>
                <TableCell>{results.margin.toFixed(2)}%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {savedCalculations.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Product List</h3>
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
                {savedCalculations.map((calc, index) => (
                  <TableRow key={index}>
                    <TableCell>{calc.name}</TableCell>
                    <TableCell>{calc.isProduct ? 'Product' : 'Service'}</TableCell>
                    <TableCell>${formatNumber(calc.costPerUnit.toFixed(2))}</TableCell>
                    <TableCell>${formatNumber(calc.sellingPrice.toFixed(2))}</TableCell>
                    <TableCell>{new Date(calc.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button onClick={() => loadCalculation(calc)} size="sm" className="mr-2">
                        Load
                      </Button>
                      <Button onClick={() => deleteCalculation(index)} size="sm" variant="destructive">
                        Delete
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

export default CostOfSalesCalculator;