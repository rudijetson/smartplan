// Demo data for different business types and calculators
const demoSuggestions = {
  restaurant: {
    'startup-costs': {
      bigPurchases: [
        { name: 'Commercial Kitchen Equipment', amount: 85000, depreciation: 7 },
        { name: 'Restaurant Furniture', amount: 35000, depreciation: 5 },
        { name: 'POS System', amount: 12000, depreciation: 3 },
        { name: 'Security System', amount: 8000, depreciation: 5 },
      ],
      startingCosts: [
        { name: 'Food Service License', amount: 1200 },
        { name: 'Initial Inventory', amount: 25000 },
        { name: 'Restaurant Insurance Deposit', amount: 3500 },
        { name: 'Lease Deposit', amount: 15000 },
      ],
      operatingMoney: 75000
    },
    'cost-of-sales': {
      materials: [
        { name: 'Food Ingredients', cost: 8.50 },
        { name: 'Packaging Materials', cost: 1.25 },
        { name: 'Beverages', cost: 2.75 },
      ],
      sellingPrice: 35.00
    },
    'opex': {
      expenses: [
        { name: 'Rent', amount: 8500, frequency: 'Monthly' },
        { name: 'Utilities', amount: 2500, frequency: 'Monthly' },
        { name: 'Insurance', amount: 1200, frequency: 'Monthly' },
        { name: 'Marketing', amount: 3000, frequency: 'Monthly' },
        { name: 'Maintenance', amount: 1500, frequency: 'Monthly' },
      ]
    }
  },
  retail: {
    'startup-costs': {
      bigPurchases: [
        { name: 'Store Fixtures', amount: 45000, depreciation: 7 },
        { name: 'POS System', amount: 8000, depreciation: 3 },
        { name: 'Security Equipment', amount: 12000, depreciation: 5 },
      ],
      startingCosts: [
        { name: 'Initial Inventory', amount: 75000 },
        { name: 'Store Insurance Deposit', amount: 2500 },
        { name: 'Lease Deposit', amount: 10000 },
      ],
      operatingMoney: 50000
    }
  }
};

export const getLLMSuggestions = async (businessType, calculatorType) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Get suggestions for the business type and calculator
  const suggestions = demoSuggestions[businessType]?.[calculatorType];
  
  if (!suggestions) {
    throw new Error('No suggestions available for this business type and calculator');
  }
  
  return suggestions;
}; 