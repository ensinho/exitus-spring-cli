import { EntityConfig } from '../types';

/**
 * Generate Search Record (Java Record for search parameters) following Exitus patterns
 */
export function generateSearch(config: EntityConfig): string {
  const { namePascalCase, packageName } = config;
  
  return `package ${packageName}.search;

public record ${namePascalCase}Search(
    String pesquisa,
    Integer pagina,
    Integer totalRegistros
) {}
`;
}
