/**
 * Safely parses JSON strings while handling common errors
 * 
 * This utility prevents the common "[object Object]" is not valid JSON error
 * by checking if the input is already an object before parsing.
 */

/**
 * Safely stringify a value to JSON, handling circular references and non-serializable values
 */
export function safeStringify(value: unknown): string {
  if (value === undefined) return '';
  
  if (value === null) return 'null';
  
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch (err) {
      // Handle circular references or other JSON stringify errors
      console.warn('Failed to stringify object', err);
      return '{}';
    }
  }
  
  return String(value);
}

/**
 * Safely parse a JSON string to an object, handling common errors
 */
export function safeParse<T = any>(value: unknown, fallback: T | null = null): T {
  // If it's already an object (not a string), return it directly
  if (value !== null && typeof value === 'object') {
    return value as T;
  }
  
  // If it's undefined or null, return the fallback
  if (value === undefined || value === null) {
    return fallback as T;
  }
  
  // If it's a string representation of an object notation (like "[object Object]"), return fallback
  if (typeof value === 'string' && value.includes('[object ')) {
    console.warn('Attempted to parse "[object Object]" string:', value);
    return fallback as T;
  }
  
  // If it's a string, try to parse it
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch (err) {
      console.warn('Failed to parse JSON:', err, value);
      return fallback as T;
    }
  }
  
  // For other types, return as is
  return value as T;
}