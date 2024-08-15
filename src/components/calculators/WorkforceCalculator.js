// Imports
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Minus, Save, FileInput, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/Accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/Table";
import { useBusinessPlan } from '../../hooks/useBusinessPlan';

// Component definition
const WorkforceCalculator = () => {
  // Initial state definitions
  const initialOwner = { name: '', monthlySalary: '', annualSalary: '' };
  const initialEmployee = { name: '', type: 'fullTime', hourlyPay: '', weeklyHours: '', annualSalary: '' };
  const initialPayrollTaxes = {
    socialSecurity: 6.2,
    medicare: 1.45,
    futa: 0.6,
    suta: 2.7,
    workersComp: 1.0,
    retirement401k: 3,
    otherBenefits: 1
  };
  const initialHealthInsurance = {
    participatingEmployees: 0,
    monthlyPremium: 0,
    employerContributionPercentage: 80
  };

  // State definitions
  const [owners, setOwners] = useState(() => {
    const saved = localStorage.getItem('workforceOwners');
    return saved ? JSON.parse(saved) : [initialOwner];
  });
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('workforceEmployees');
    return saved ? JSON.parse(saved) : [initialEmployee];
  });
  const [payrollTaxes, setPayrollTaxes] = useState(() => {
    const saved = localStorage.getItem('workforcePayrollTaxes');
    return saved ? JSON.parse(saved) : initialPayrollTaxes;
  });
  const [healthInsurance, setHealthInsurance] = useState(() => {
    const saved = localStorage.getItem('workforceHealthInsurance');
    return saved ? JSON.parse(saved) : initialHealthInsurance;
  });
  const [savedCalculations, setSavedCalculations] = useState(() => {
    const saved = localStorage.getItem('savedWorkforceCalculations');
    return saved ? JSON.parse(saved) : [];
  });

  // Context
  const { setWorkforce } = useBusinessPlan();

  // useEffect for localStorage
  useEffect(() => {
    localStorage.setItem('workforceOwners', JSON.stringify(owners));
    localStorage.setItem('workforceEmployees', JSON.stringify(employees));
    localStorage.setItem('workforcePayrollTaxes', JSON.stringify(payrollTaxes));
    localStorage.setItem('workforceHealthInsurance', JSON.stringify(healthInsurance));
    localStorage.setItem('savedWorkforceCalculations', JSON.stringify(savedCalculations));
  }, [owners, employees, payrollTaxes, healthInsurance, savedCalculations]);

  // Utility functions
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const parseFormattedNumber = (str) => {
    return parseFloat(str.replace(/,/g, '')) || 0;
  };

  // Event handlers
  const handleOwnerChange = (index, field, value) => {
    const updatedOwners = [...owners];
    if (field === 'monthlySalary') {
      const monthlySalary = parseFormattedNumber(value);
      updatedOwners[index].monthlySalary = formatNumber(value);
      updatedOwners[index].annualSalary = formatNumber((monthlySalary * 12).toFixed(2));
    } else if (field === 'annualSalary') {
      const annualSalary = parseFormattedNumber(value);
      updatedOwners[index].annualSalary = formatNumber(value);
      updatedOwners[index].monthlySalary = formatNumber((annualSalary / 12).toFixed(2));
    } else {
      updatedOwners[index][field] = value;
    }
    setOwners(updatedOwners);
  };

  const handleEmployeeChange = (index, field, value) => {
    const updatedEmployees = [...employees];
    if (field === 'type') {
      updatedEmployees[index][field] = value;
    } else if (field === 'hourlyPay' || field === 'weeklyHours') {
      updatedEmployees[index][field] = formatNumber(value);
      const hourlyPay = parseFormattedNumber(updatedEmployees[index].hourlyPay);
      const weeklyHours = parseFormattedNumber(updatedEmployees[index].weeklyHours);
      const annualSalary = hourlyPay * weeklyHours * 52;
      updatedEmployees[index].annualSalary = formatNumber(annualSalary.toFixed(2));
    } else {
      updatedEmployees[index][field] = value;
    }
    setEmployees(updatedEmployees);
  };

  const handlePayrollTaxChange = (field, value) => {
    setPayrollTaxes({ ...payrollTaxes, [field]: parseFloat(value) || 0 });
  };

  const handleHealthInsuranceChange = (field, value) => {
    setHealthInsurance({ ...healthInsurance, [field]: parseFloat(value) || 0 });
  };

  const addOwner = () => setOwners([...owners, initialOwner]);
  const removeOwner = (index) => setOwners(owners.filter((_, i) => i !== index));

  const addEmployee = () => setEmployees([...employees, initialEmployee]);
  const removeEmployee = (index) => setEmployees(employees.filter((_, i) => i !== index));

  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all data? This will reset the form and clear saved data.')) {
      setOwners([initialOwner]);
      setEmployees([initialEmployee]);
      setPayrollTaxes(initialPayrollTaxes);
      setHealthInsurance(initialHealthInsurance);
      localStorage.removeItem('workforceOwners');
      localStorage.removeItem('workforceEmployees');
      localStorage.removeItem('workforcePayrollTaxes');
      localStorage.removeItem('workforceHealthInsurance');
    }
  };

  const saveCalculation = () => {
    const calculationName = prompt('Enter a name for this calculation:');
    if (calculationName) {
      const newCalculation = {
        name: calculationName,
        owners,
        employees,
        payrollTaxes,
        healthInsurance,
        date: new Date().toISOString()
      };
      setSavedCalculations([...savedCalculations, newCalculation]);
    }
  };

  const loadCalculation = (calculation) => {
    if (window.confirm(`Are you sure you want to load "${calculation.name}"? This will overwrite your current data.`)) {
      setOwners(calculation.owners);
      setEmployees(calculation.employees);
      setPayrollTaxes(calculation.payrollTaxes);
      setHealthInsurance(calculation.healthInsurance);
    }
  };

  const deleteCalculation = (index) => {
    if (window.confirm('Are you sure you want to delete this saved calculation?')) {
      const newSavedCalculations = savedCalculations.filter((_, i) => i !== index);
      setSavedCalculations(newSavedCalculations);
    }
  };

  // Calculation functions
  const calculatePayroll = () => {
    const annualSalaries = owners.reduce((sum, owner) => sum + parseFormattedNumber(owner.annualSalary), 0);
    const annualWages = employees.reduce((sum, employee) => sum + parseFormattedNumber(employee.annualSalary), 0);

    const totalAnnualPayroll = annualSalaries + annualWages;
    const totalPayrollTaxRate = Object.values(payrollTaxes).reduce((sum, rate) => sum + rate, 0) / 100;
    const annualPayrollTaxes = totalAnnualPayroll * totalPayrollTaxRate;

    const annualHealthInsurance = (healthInsurance.participatingEmployees * healthInsurance.monthlyPremium * healthInsurance.employerContributionPercentage / 100) * 12;

    const totalAnnualExpenses = totalAnnualPayroll + annualPayrollTaxes + annualHealthInsurance;
    const totalMonthlyExpenses = totalAnnualExpenses / 12;

    return {
      annualSalariesAndWages: totalAnnualPayroll,
      monthlyPayrollTaxes: annualPayrollTaxes / 12,
      monthlyHealthInsurance: annualHealthInsurance / 12,
      totalMonthlyExpenses,
      totalAnnualExpenses
    };
  };

  const payrollSummary = useMemo(calculatePayroll, [owners, employees, payrollTaxes, healthInsurance]);

  // Update context
  useEffect(() => {
    setWorkforce(payrollSummary);
  }, [payrollSummary, setWorkforce]);

  // Render functions
const renderOwnersTable = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Monthly Salary</TableHead>
        <TableHead>Annual Salary</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {owners.map((owner, index) => (
        <TableRow key={index}>
          <TableCell>
            <Input
              value={owner.name}
              onChange={(e) => handleOwnerChange(index, 'name', e.target.value)}
              placeholder="Owner Name"
            />
          </TableCell>
          <TableCell>
            <Input
              value={owner.monthlySalary}
              onChange={(e) => handleOwnerChange(index, 'monthlySalary', e.target.value)}
              placeholder="Monthly Salary"
            />
          </TableCell>
          <TableCell>
            <Input
              value={owner.annualSalary}
              onChange={(e) => handleOwnerChange(index, 'annualSalary', e.target.value)}
              placeholder="Annual Salary"
            />
          </TableCell>
          <TableCell>
            <Button variant="destructive" size="icon" onClick={() => removeOwner(index)}>
              <Minus className="h-4 w-4" />
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const renderEmployeesTable = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Type</TableHead>
        <TableHead>Hourly Pay</TableHead>
        <TableHead>Weekly Hours</TableHead>
        <TableHead>Annual Salary</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {employees.map((employee, index) => (
        <TableRow key={index}>
          <TableCell>
            <Input
              value={employee.name}
              onChange={(e) => handleEmployeeChange(index, 'name', e.target.value)}
              placeholder="Employee Name"
            />
          </TableCell>
          <TableCell>
            <Select
              value={employee.type}
              onValueChange={(value) => handleEmployeeChange(index, 'type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fullTime">Full Time</SelectItem>
                <SelectItem value="partTime">Part Time</SelectItem>
              </SelectContent>
            </Select>
          </TableCell>
          <TableCell>
            <Input
              value={employee.hourlyPay}
              onChange={(e) => handleEmployeeChange(index, 'hourlyPay', e.target.value)}
              placeholder="Hourly Pay"
            />
          </TableCell>
          <TableCell>
            <Input
              value={employee.weeklyHours}
              onChange={(e) => handleEmployeeChange(index, 'weeklyHours', e.target.value)}
              placeholder="Weekly Hours"
            />
          </TableCell>
          <TableCell>
            <Input
              value={employee.annualSalary}
              readOnly
              placeholder="Annual Salary"
            />
          </TableCell>
          <TableCell>
            <Button variant="destructive" size="icon" onClick={() => removeEmployee(index)}>
              <Minus className="h-4 w-4" />
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const renderYearTab = (year) => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Owners</h3>
    {renderOwnersTable()}
    <Button onClick={addOwner} className="mt-4 mb-6">
      <Plus className="h-4 w-4 mr-2" /> Add Owner
    </Button>

    <h3 className="text-xl font-semibold mb-4">Employees</h3>
    {renderEmployeesTable()}
    <Button onClick={addEmployee} className="mt-4 mb-6">
      <Plus className="h-4 w-4 mr-2" /> Add Employee
    </Button>

    <Accordion type="single" collapsible className="mb-6">
      <AccordionItem value="payroll-taxes">
        <AccordionTrigger>Payroll Taxes and Benefits</AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(payrollTaxes).map(([key, value]) => (
              <div key={key} className="flex items-center">
                <label className="w-1/2">{key.charAt(0).toUpperCase() + key.slice(1)} (%)</label>
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => handlePayrollTaxChange(key, e.target.value)}
                  className="w-1/2"
                />
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="health-insurance">
        <AccordionTrigger>Health Insurance</AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <label className="w-1/2"># of Participating Employees</label>
              <Input
                type="number"
                value={healthInsurance.participatingEmployees}
                onChange={(e) => handleHealthInsuranceChange('participatingEmployees', e.target.value)}
                className="w-1/2"
              />
            </div>
            <div className="flex items-center">
              <label className="w-1/2">Monthly Premium per Person</label>
              <Input
                type="number"
                value={healthInsurance.monthlyPremium}
                onChange={(e) => handleHealthInsuranceChange('monthlyPremium', e.target.value)}
                className="w-1/2"
              />
            </div>
            <div className="flex items-center">
              <label className="w-1/2">% of Premium Paid by Employer</label>
              <Input
                type="number"
                value={healthInsurance.employerContributionPercentage}
                onChange={(e) => handleHealthInsuranceChange('employerContributionPercentage', e.target.value)}
                className="w-1/2"
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>

    <h3 className="text-xl font-semibold mb-4">Summary</h3>
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 bg-blue-50 p-4 rounded-md">
          <p className="text-lg font-semibold text-blue-700">Annual Salaries and Wages</p>
          <p className="text-2xl font-bold text-blue-900">${formatNumber(payrollSummary.annualSalariesAndWages.toFixed(2))}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-md">
          <p className="text-lg font-semibold text-green-700">Monthly Payroll Taxes and Benefits</p>
          <p className="text-2xl font-bold text-green-900">${formatNumber(payrollSummary.monthlyPayrollTaxes.toFixed(2))}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-md">
          <p className="text-lg font-semibold text-purple-700">Monthly Health Insurance Cost</p>
          <p className="text-2xl font-bold text-purple-900">${formatNumber(payrollSummary.monthlyHealthInsurance.toFixed(2))}</p>
        </div>
        <div className="col-span-2 bg-yellow-50 p-4 rounded-md">
          <p className="text-lg font-semibold text-yellow-700">Total Monthly Payroll Expenses</p>
          <p className="text-2xl font-bold text-yellow-900">${formatNumber(payrollSummary.totalMonthlyExpenses.toFixed(2))}</p>
        </div>
        <div className="col-span-2 bg-red-50 p-4 rounded-md">
          <p className="text-lg font-semibold text-red-700">Total Annual Payroll Expenses</p>
          <p className="text-2xl font-bold text-red-900">${formatNumber(payrollSummary.totalAnnualExpenses.toFixed(2))}</p>
        </div>
      </div>
    </div>
  </div>
);

// Component return
return (
  <Card className="w-full max-w-7xl mx-auto">
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="text-2xl">Workforce and Payroll Calculator</CardTitle>
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
        </TabsList>
        <TabsContent value="year1">{renderYearTab('year1')}</TabsContent>
        <TabsContent value="year2">{renderYearTab('year2')}</TabsContent>
        <TabsContent value="year3">{renderYearTab('year3')}</TabsContent>
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

}; // End of WorkforceCalculator component

export default WorkforceCalculator;