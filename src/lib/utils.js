import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function parseFormattedNumber(str) {
  return parseFloat(str.replace(/[^0-9.-]+/g,""));
}

export function calculateTotalStartupCosts(costs) {
  return Object.values(costs).reduce((total, cost) => total + parseFormattedNumber(cost.amount), 0);
}

export function calculateTotalFunding(sources) {
  return Object.values(sources).reduce((total, source) => total + parseFormattedNumber(source.amount), 0);
}

export function calculateProjectedRevenue(salesForecast) {
  // This is a simplified calculation. Adjust based on your specific sales forecast structure
  return Object.values(salesForecast).reduce((total, product) => total + (parseFormattedNumber(product.price) * parseFormattedNumber(product.quantity)), 0);
}

export function calculateTotalExpenses(workforce, opex, costOfSales) {
  const totalWorkforceCost = Object.values(workforce).reduce((total, employee) => total + parseFormattedNumber(employee.salary), 0);
  const totalOpex = Object.values(opex).reduce((total, expense) => total + parseFormattedNumber(expense.amount), 0);
  const totalCostOfSales = Object.values(costOfSales).reduce((total, cost) => total + parseFormattedNumber(cost.amount), 0);
  
  return totalWorkforceCost + totalOpex + totalCostOfSales;
}