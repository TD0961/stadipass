/**
 * Currency Formatting Utilities
 * 
 * IMPORTANCE:
 * - Consistent currency formatting across the app
 * - Prevents currency formatting code duplication
 * - Handles different currencies (future expansion)
 * - Proper decimal places and currency symbols
 * - Used in tickets, orders, pricing displays
 */

/**
 * Format number as currency
 * 
 * IMPORTANCE:
 * - Converts numbers to currency strings
 * - Consistent format: "$25.00"
 * - Used in ticket prices, order totals
 * - Prevents manual string formatting errors
 * 
 * @param amount - Amount to format
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format number as currency without symbol
 * 
 * IMPORTANCE:
 * - Used when currency symbol is shown separately
 * - Format: "25.00"
 * - Used in custom styled price displays
 * 
 * @param amount - Amount to format
 * @returns Formatted number string
 */
export function formatCurrencyAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Parse currency string to number
 * 
 * IMPORTANCE:
 * - Converts user input to numbers
 * - Used in price input fields
 * - Handles currency symbols and formatting
 * - Prevents parsing errors
 * 
 * @param value - Currency string to parse
 * @returns Parsed number or NaN if invalid
 */
export function parseCurrency(value: string): number {
  // Remove currency symbols and commas
  const cleaned = value.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}

