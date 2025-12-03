export interface GeneratorOptions {
  out: string;
  package?: string;
  schema: string;
  skipModel?: boolean;
  skipMapper?: boolean;
  skipService?: boolean;
  skipController?: boolean;
  skipSearch?: boolean;
  onlyModel?: boolean;
  onlyMapper?: boolean;
  onlyService?: boolean;
  onlyController?: boolean;
  onlySearch?: boolean;
  dryRun?: boolean;
  fields?: string;
}

export interface EntityField {
  name: string;
  type: string;
  jsonProperty?: string;
  columnName?: string;
}

export interface EntityConfig {
  name: string;
  nameCamelCase: string;
  namePascalCase: string;
  nameKebabCase: string;
  nameSnakeCase: string;
  fields: EntityField[];
  packageName: string;
  schema: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
  type: 'model' | 'mapper' | 'service' | 'controller' | 'search';
}
