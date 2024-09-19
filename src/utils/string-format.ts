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

export const truncateDescription = (description: string, maxLength = 20) => {
  if (description.length <= maxLength) return description;
  return `${description.substring(0, maxLength)}...`;
};

export const getLastValueOfCommaString = (input: string): string => {
  if (typeof input !== "string") {
    throw new TypeError("Input must be a string");
  }

  const values = input.split(",");
  const lastValue = values[values.length - 1];

  return lastValue ? lastValue.trim() : "";
};

export function personalizeMessage(template: string, contactPerson: string) {
  const firstName = contactPerson ? contactPerson.split(" ")[0] : "";
  return template
    .replace("{{first_name}}", firstName!)
    .replace(/\s+,/, ",")
    .replace(/^\s*\n/, "\n"); // Remove empty first line if it occurs
}

export function isValidEmail(text: string): boolean {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  return emailRegex.test(text);
}

export function emailToName(email: string): string {
  // Check if the email is valid
  if (!email.includes("@") || !email.includes(".")) {
    throw new Error("Invalid email format");
  }

  // Get the local part of the email (before the @)
  const localPart = email.split("@")[0];

  if (!localPart) {
    throw new Error("Invalid email format");
  }

  // Split the local part by dots or numbers
  const nameParts = localPart.split(/[.\d]+/);

  // Capitalize each part and join them
  const name = nameParts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

  return name;
}
