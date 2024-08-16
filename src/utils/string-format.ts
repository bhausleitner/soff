export function formatCurrency(amount: number): string {
  // Convert the number to a fixed 2 decimal places string
  const fixedAmount = amount.toFixed(2);

  // Split the string into integer and decimal parts
  const [integerPart, decimalPart] = fixedAmount.split(".");

  // Add commas to the integer part
  const formattedIntegerPart = integerPart?.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ","
  );

  // Combine the parts and return with a dollar sign
  return `$${formattedIntegerPart}.${decimalPart}`;
}
