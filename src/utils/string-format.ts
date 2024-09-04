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

export function convertToHtml(plainText: string): string {
  // Replace line breaks with <br> tags
  return plainText.replace(/\n/g, "<br>");
}

export const extractFilenameParts = (path: string): [string, string] => {
  // Get the part after the last '/'
  const filenameWithExtension: string = path.split("/").pop() ?? "";

  // Split the filename and extension
  const lastDotIndex: number = filenameWithExtension.lastIndexOf(".");

  if (lastDotIndex === -1) {
    // No extension found
    return [filenameWithExtension, ""];
  }

  const filename: string = filenameWithExtension.slice(0, lastDotIndex);
  const extension: string = filenameWithExtension.slice(lastDotIndex + 1);

  return [filename, extension];
};

export const truncateDescription = (description: string, maxLength = 30) => {
  if (description.length <= maxLength) return description;
  return `${description.substring(0, maxLength)}...`;
};
