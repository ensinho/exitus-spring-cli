/**
 * Utility functions for string transformations
 */

/**
 * Converts a string to PascalCase
 * Handles: "material-aprendizagem", "material_aprendizagem", "MaterialAprendizagem"
 */
export function toPascalCase(str: string): string {
  // If already in PascalCase (starts with uppercase and contains lowercase), keep it
  if (/^[A-Z][a-zA-Z]*$/.test(str) && !str.includes('-') && !str.includes('_')) {
    return str;
  }
  
  return str
    .replace(/[-_]/g, ' ')
    // Also split by uppercase letters for camelCase input
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

/**
 * Converts a string to camelCase
 * Example: "material-aprendizagem" -> "materialAprendizagem"
 */
export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Converts a string to kebab-case
 * Example: "MaterialAprendizagem" -> "material-aprendizagem"
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Converts a string to snake_case
 * Example: "MaterialAprendizagem" -> "material_aprendizagem"
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * Converts a Java type to its PostgreSQL equivalent
 */
export function javaToPostgresType(javaType: string): string {
  const typeMap: Record<string, string> = {
    'String': 'varchar',
    'Integer': 'integer',
    'Long': 'bigint',
    'Boolean': 'boolean',
    'Date': 'timestamp',
    'Double': 'double precision',
    'Float': 'real',
    'BigDecimal': 'numeric',
    'UUID': 'uuid',
  };
  return typeMap[javaType] || 'varchar';
}

/**
 * Parse fields string into EntityField array
 * Format: "name:Type,name2:Type2"
 */
export function parseFields(fieldsStr: string): Array<{ name: string; type: string }> {
  if (!fieldsStr) return [];
  
  return fieldsStr.split(',').map(field => {
    const [name, type] = field.trim().split(':');
    return {
      name: name.trim(),
      type: type?.trim() || 'String'
    };
  });
}

/**
 * Convert camelCase to snake_case for database columns
 */
export function camelToSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate getter method name
 */
export function getterName(fieldName: string, type: string): string {
  const prefix = type === 'Boolean' ? 'is' : 'get';
  return prefix + capitalize(fieldName);
}

/**
 * Generate setter method name
 */
export function setterName(fieldName: string): string {
  return 'set' + capitalize(fieldName);
}
