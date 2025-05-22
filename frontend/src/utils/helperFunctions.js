// Helper function to format date
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

// Helper function to format scientific notation
export const formatScientific = (value) => {
  if (value === undefined || value === null) return "";
  return value.toExponential(2);
};

export const validateInput = (value, setter) => {
  // Empty is allowed (will show "Not set")
  if (!value) {
    setter("");
    return true;
  }

  // Handle cases where the user is in the middle of typing scientific notation
  // Allow a number followed by 'e' (as user is likely typing scientific notation)
  if (/^-?\d+\.?\d*e$/i.test(value) || /^-?\d*\.?\d+e$/i.test(value)) {
    setter("");
    return true;
  }

  // Allow a number followed by 'e' and an optional sign (still typing)
  if (
    /^-?\d+\.?\d*e[+-]?$/i.test(value) ||
    /^-?\d*\.?\d+e[+-]?$/i.test(value)
  ) {
    setter("");
    return true;
  }

  // Special case: just 'e' by itself is valid (represents 10^1)
  if (value === "e") {
    setter("");
    return true;
  }

  // Special case: 'e' followed by optional sign and at least one digit
  if (/^e[+-]?\d+$/i.test(value)) {
    setter("");
    return true;
  }

  // Special case: 'e' followed by sign but no digits (incomplete)
  if (/^e[+-]?$/i.test(value)) {
    setter(""); // Change to not show error during typing
    return true; // Allow this intermediate state
  }

  // Scientific notation validation (covers all forms)
  const scientificNotation = /^-?\d*\.?\d*(?:e[+-]?\d+)?$/i;

  // Test against the main scientific notation pattern
  if (scientificNotation.test(value)) {
    setter("");
    return true;
  }

  // If we get here, the format is invalid
  setter(
    "Only numbers and scientific notation (e.g., 1.23e-10 or e1) are allowed"
  );
  return false;
};

// Convert values to numbers, handling special case of 'e' alone
export const convertToNumber = (val) => {
    if (val === 'e') return 10; // 'e' alone represents 10^1 = 10
    if (/^e[+-]?\d+$/i.test(val)) {
      // Convert e notation like 'e2' to '1e2'
      return Number.parseFloat(`1${val}`);
    }
    return Number.parseFloat(val);
};
