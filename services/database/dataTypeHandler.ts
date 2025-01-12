import { types as pgTypes } from 'pg';

export function processResultSet(rows: any[]): any[] {
  return rows.map(row => {
    const processedRow: { [key: string]: any } = {};
    for (const [key, value] of Object.entries(row)) {
      processedRow[key] = processValue(value);
    }
    return processedRow;
  });
}

function processValue(value: any): any {
  if (value === null || value === undefined) {
    return null;
  }

  // Handle PostgreSQL-specific types
  if (value instanceof pgTypes.ArrayType) {
    return (value as any).elements.map(processValue);
  }

  if (value instanceof pgTypes.NumericType) {
    return Number(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  // Handle SQL Server-specific types
  if (typeof value === 'object' && 'value' in value && 'scale' in value) {
    // This is likely a SQL Server Decimal type
    return Number(value.value) / Math.pow(10, value.scale);
  }

  // Handle Snowflake-specific types
  if (typeof value === 'string') {
    // Check for Snowflake VARIANT type (JSON)
    try {
      return JSON.parse(value);
    } catch {
      // If it's not valid JSON, return the original string
      return value;
    }
  }

  // Handle array fields (for all database types)
  if (Array.isArray(value)) {
    return value.map(processValue);
  }

  // For other types, return as-is
  return value;
}

