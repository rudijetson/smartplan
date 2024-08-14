// Imports
import React, { useState, useEffect } from 'react';
import { Plus, Minus, Save, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/Table";

// Component definition
const SourceOfFundsCalculator = () => {
  // State definitions
  const [fundingSources, setFundingSources] = useState(() => {
    const saved = localStorage.getItem('fundingSources');
    return saved ? JSON.parse(saved) : [
      { source: "Owner's Cash Contribution", type: 'equity', percentage: 0, amount: 0 },
      { source: "Outside Investors", type: 'equity', percentage: 0, amount: 0 },
      { source: "Bank Loan", type: 'loan', percentage: 0, amount: 0, loanRate: 6, term: 60, monthlyPayment: 0, annualPayment: 0 },
      { source: "", type: 'equity', percentage: 0, amount: 0 },
    ];
  });

  const [savedCalculations, setSavedCalculations] = useState(() => {
    const saved = localStorage.getItem('savedSourceOfFundsCalculations');
    return saved ? JSON.parse(saved) : [];
  });

  // useEffect for localStorage
  useEffect(() => {
    localStorage.setItem('fundingSources', JSON.stringify(fundingSources));
    localStorage.setItem('savedSourceOfFundsCalculations', JSON.stringify(savedCalculations));
  }, [fundingSources, savedCalculations]);

  // Utility functions
  const formatPercentage = (num) => {
    return `${Math.round(num)}%`;
  };

  const formatAmount = (num) => {
    return num.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const formatPayment = (num) => {
    return num.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Event handlers
  const removeFundingSource = (index) => {
    setFundingSources(prevSources => prevSources.filter((_, i) => i !== index));
  };

  const handleInputChange = (index, field, value) => {
    const updatedSources = [...fundingSources];
    if (field === 'amount') {
      updatedSources[index][field] = parseFloat(value.replace(/[$,]/g, '')) || 0;
    } else if (field === 'loanRate' || field === 'term' || field === 'interestOnly') {
      updatedSources[index][field] = parseFloat(value) || 0;
    } else {
      updatedSources[index][field] = value;
    }
    setFundingSources(updatedSources);
    updateCalculations();
  };

  const handleTypeChange = (index, value) => {
    const updatedSources = [...fundingSources];
    updatedSources[index].type = value;
    if (value === 'equity' || value === 'grantDonation') {
      updatedSources[index].loanRate = 0;
      updatedSources[index].term = 0;
      updatedSources[index].interestOnly = 0;
    } else if (value === 'lineOfCredit') {
      updatedSources[index].term = 12;
      updatedSources[index].interestOnly = 12;
    }
    setFundingSources(updatedSources);
    updateCalculations();
  };

  const addFundingSource = () => {
    setFundingSources([...fundingSources, { source: '', type: 'equity', percentage: 0, amount: 0 }]);
  };

  // Calculation functions
  const calculatePMT = (rate, nper, pv) => {
    if (rate === 0) return -pv / nper;
    const pvif = Math.pow(1 + rate, nper);
    return rate / (pvif - 1) * -(pv * pvif);
  };

  const updateCalculations = () => {
    const total = fundingSources.reduce((acc, row) => acc + row.amount, 0);
    let monthlyPaymentSum = 0;
    let annualPaymentSum = 0;

    const updatedSources = fundingSources.map(row => {
      const percentage = total > 0 ? (row.amount / total) * 100 : 0;
      let monthlyPayment = 0;
      let annualPayment = 0;

      if (row.type !== 'equity' && row.type !== 'grantDonation' && row.term > 0) {
        const monthlyRate = (row.loanRate / 100) / 12;
        if (row.type === 'interestOnly' || row.type === 'lineOfCredit') {
          monthlyPayment = row.amount * monthlyRate;
        } else {
          monthlyPayment = Math.abs(calculatePMT(monthlyRate, row.term, -row.amount));
        }
        annualPayment = monthlyPayment * 12;
      }

      monthlyPaymentSum += monthlyPayment;
      annualPaymentSum += annualPayment;

      return { ...row, percentage, monthlyPayment, annualPayment };
    });

    setFundingSources(updatedSources);
  };

  // Save and load functions
  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all data? This will reset the form and clear saved data.')) {
      setFundingSources([
        { source: "Owner's Cash Contribution", type: 'equity', percentage: 0, amount: 0 },
        { source: "Outside Investors", type: 'equity', percentage: 0, amount: 0 },
        { source: "Bank Loan", type: 'loan', percentage: 0, amount: 0, loanRate: 6, term: 60, monthlyPayment: 0, annualPayment: 0 },
        { source: "", type: 'equity', percentage: 0, amount: 0 },
      ]);
      localStorage.removeItem('fundingSources');
    }
  };

  const saveCalculation = () => {
    const calculationName = prompt('Enter a name for this calculation:');
    if (calculationName) {
      const newCalculation = {
        name: calculationName,
        fundingSources,
        date: new Date().toISOString()
      };
      setSavedCalculations([...savedCalculations, newCalculation]);
    }
  };

  const loadCalculation = (calculation) => {
    if (window.confirm(`Are you sure you want to load "${calculation.name}"? This will overwrite your current data.`)) {
      setFundingSources(calculation.fundingSources);
    }
  };

  const deleteCalculation = (index) => {
    if (window.confirm('Are you sure you want to delete this saved calculation?')) {
      const newSavedCalculations = savedCalculations.filter((_, i) => i !== index);
      setSavedCalculations(newSavedCalculations);
    }
  };

  const renderFundingSourcesTable = () => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/4">SOURCE OF FUNDS</TableHead>
            <TableHead className="w-1/8">Type</TableHead>
            <TableHead className="w-1/12 text-right">% of Funding</TableHead>
            <TableHead className="w-1/8 text-right">Amount</TableHead>
            <TableHead className="w-1/12 text-right">Loan Rate</TableHead>
            <TableHead className="w-1/12 text-right">Term (Months)</TableHead>
            <TableHead className="w-1/12 text-right">Interest Only</TableHead>
            <TableHead className="w-1/12 text-right">Monthly Pay</TableHead>
            <TableHead className="w-1/12 text-right">Annual Pay</TableHead>
            <TableHead className="w-1/12 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fundingSources.map((row, index) => (
            <TableRow key={index}>
              <TableCell className="w-1/4">
                <Input
                  type="text"
                  value={row.source}
                  onChange={(e) => handleInputChange(index, 'source', e.target.value)}
                  className="w-full"
                  placeholder="Source Name"
                />
              </TableCell>
              <TableCell className="w-1/8">
                <Select value={row.type} onValueChange={(value) => handleTypeChange(index, value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="equity" className="hover:bg-gray-100">Equity</SelectItem>
                    <SelectItem value="grantDonation" className="hover:bg-gray-100">Grant/Donation</SelectItem>
                    <SelectItem value="loan" className="hover:bg-gray-100">Loan</SelectItem>
                    <SelectItem value="lineOfCredit" className="hover:bg-gray-100">Line of Credit</SelectItem>
                    <SelectItem value="interestOnly" className="hover:bg-gray-100">Interest Only</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="w-1/12 text-right">{formatPercentage(row.percentage)}</TableCell>
              <TableCell className="w-1/8">
                <Input
                  type="text"
                  value={formatAmount(row.amount).slice(1)}
                  onChange={(e) => handleInputChange(index, 'amount', e.target.value)}
                  className="w-full text-right"
                  placeholder="0"
                />
              </TableCell>
              <TableCell className="w-1/12">
                {row.type !== 'equity' && row.type !== 'grantDonation' && (
                  <Input
                    type="number"
                    value={row.loanRate}
                    onChange={(e) => handleInputChange(index, 'loanRate', e.target.value)}
                    className="w-full text-right"
                    placeholder="0"
                  />
                )}
              </TableCell>
              <TableCell className="w-1/12">
                {row.type !== 'equity' && row.type !== 'grantDonation' && (
                  <Input
                    type="number"
                    value={row.term}
                    onChange={(e) => handleInputChange(index, 'term', e.target.value)}
                    className="w-full text-right"
                    placeholder="0"
                  />
                )}
              </TableCell>
              <TableCell className="w-1/12">
                {(row.type === 'interestOnly' || row.type === 'lineOfCredit') && (
                  <Input
                    type="number"
                    value={row.interestOnly}
                    onChange={(e) => handleInputChange(index, 'interestOnly', e.target.value)}
                    className="w-full text-right"
                    placeholder="0"
                  />
                )}
              </TableCell>
              <TableCell className="w-1/12 text-right">
                {row.type !== 'equity' && row.type !== 'grantDonation' ? formatPayment(row.monthlyPayment) : ''}
              </TableCell>
              <TableCell className="w-1/12 text-right">
                {row.type !== 'equity' && row.type !== 'grantDonation' ? formatPayment(row.annualPayment) : ''}
              </TableCell>
              <TableCell className="w-1/12 text-right">
                <Button 
                  variant="destructive" 
                  size="icon"
                  onClick={() => removeFundingSource(index)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="font-bold bg-gray-100">
            <TableCell>Total Source of Funds</TableCell>
            <TableCell></TableCell>
            <TableCell className="text-right">{formatPercentage(fundingSources.reduce((sum, row) => sum + row.percentage, 0))}</TableCell>
            <TableCell className="text-right">{formatAmount(fundingSources.reduce((sum, row) => sum + row.amount, 0))}</TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
            <TableCell className="text-right">{formatPayment(fundingSources.reduce((sum, row) => sum + row.monthlyPayment, 0))}</TableCell>
            <TableCell className="text-right">{formatPayment(fundingSources.reduce((sum, row) => sum + row.annualPayment, 0))}</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );

  const renderSavedCalculations = () => (
    savedCalculations.length > 0 && (
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
    )
  );

  // Component return
  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl">Source of Funds Calculator</CardTitle>
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
        {renderFundingSourcesTable()}
        <Button onClick={addFundingSource} size="sm" className="mt-4">
          <Plus className="h-4 w-4 mr-2" /> Add Funding Source
        </Button>
        {renderSavedCalculations()}
      </CardContent>
    </Card>
  );
};

export default SourceOfFundsCalculator;