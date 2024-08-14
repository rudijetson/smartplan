import React, { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, Save, FileInput } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/Table";

// Utility functions
const formatNumber = (num) => (num || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const parseFormattedNumber = (str) => {
  if (typeof str !== 'string') return 0;
  return parseFloat(str.replace(/,/g, '')) || 0;
};

const CostOfSalesCalculator = () => {
  const [materials, setMaterials] = useState([{ name: 'Material 1', cost: '' }]);
  const [sellingPrice, setSellingPrice] = useState('');
  const [savedCalculations, setSavedCalculations] = useState(() => {
    const saved = localStorage.getItem('costOfSalesCalculations');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('costOfSalesCalculations', JSON.stringify(savedCalculations));
  }, [savedCalculations]);

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
    }
  };

  const saveData = () => {
    const calculationName = prompt('Enter a name for this calculation:');
    if (calculationName) {
      const newCalculation = {
        name: calculationName,
        materials,
        sellingPrice,
        date: new Date().toISOString()
      };
      setSavedCalculations([...savedCalculations, newCalculation]);
    }
  };

  const loadCalculation = (calculation) => {
    if (window.confirm(`Are you sure you want to load "${calculation.name}"? This will overwrite your current data.`)) {
      setMaterials(calculation.materials);
      setSellingPrice(calculation.sellingPrice);
    }
  };

  const deleteCalculation = (index) => {
    if (window.confirm('Are you sure you want to delete this saved calculation?')) {
      const newSavedCalculations = savedCalculations.filter((_, i) => i !== index);
      setSavedCalculations(newSavedCalculations);
    }
  };

  const calculateResults = () => {
    const totalCost = materials.reduce((sum, material) => sum + parseFormattedNumber(material.cost), 0);
    const revenue = parseFormattedNumber(sellingPrice);
    const profit = revenue - totalCost;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return { totalCost, revenue, profit, margin };
  };

  const results = calculateResults();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">Cost of Sales Calculator</CardTitle>
        <div className="flex space-x-2">
          <Button onClick={clearAll} variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-2" /> Reset
          </Button>
          <Button onClick={saveData} size="sm">
            <Save className="h-4 w-4 mr-2" /> Save
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <label className="block font-medium mb-1">Selling Price per Unit ($)</label>
          <Input
            value={sellingPrice}
            onChange={(e) => setSellingPrice(formatNumber(e.target.value))}
            className="w-1/3"
            placeholder="Selling Price"
          />
        </div>

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

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Results</h3>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Total Material Cost per Unit</TableCell>
                <TableCell>${formatNumber(results.totalCost.toFixed(2))}</TableCell>
              </TableRow>
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

export default CostOfSalesCalculator;