import chalk from 'chalk';
import ora from 'ora';
import { GeneratorOptions, EntityConfig, EntityField, GeneratedFile } from '../types';
import { 
  toPascalCase, 
  toCamelCase, 
  toKebabCase, 
  toSnakeCase,
  parseFields 
} from '../utils/string-utils';
import { generateFiles, previewFiles } from '../utils/file-generator';
import { generateModel } from '../templates/model.template';
import { generateMapper } from '../templates/mapper.template';
import { generateService } from '../templates/service.template';
import { generateController } from '../templates/controller.template';
import { generateSearch } from '../templates/search.template';

export async function newCommand(entityName: string, options: GeneratorOptions): Promise<void> {
  console.log(chalk.cyan(`\n Generating Spring Boot components for: ${chalk.bold(entityName)}\n`));

  // Validate entity name
  if (!entityName || entityName.trim() === '') {
    console.log(chalk.red('Error: Entity name is required'));
    process.exit(1);
  }

  // Parse fields if provided
  const fields: EntityField[] = options.fields 
    ? parseFields(options.fields).map(f => ({
        name: f.name,
        type: f.type,
        columnName: toSnakeCase(f.name)
      }))
    : getDefaultFields();

  // Create entity configuration
  const entityConfig: EntityConfig = {
    name: entityName,
    namePascalCase: toPascalCase(entityName),
    nameCamelCase: toCamelCase(entityName),
    nameKebabCase: toKebabCase(entityName),
    nameSnakeCase: toSnakeCase(entityName),
    fields,
    packageName: options.package || 'com.exitus.educ.academico',
    schema: options.schema || 'academico'
  };

  // Determine which components to generate
  const componentsToGenerate = getComponentsToGenerate(options);

  console.log(chalk.gray('Configuration:'));
  console.log(chalk.gray(`  Package: ${entityConfig.packageName}`));
  console.log(chalk.gray(`  Schema: ${entityConfig.schema}`));
  console.log(chalk.gray(`  Output: ${options.out}`));
  console.log(chalk.gray(`  Components: ${componentsToGenerate.join(', ')}`));
  console.log();

  // Generate files
  const generatedFiles: GeneratedFile[] = [];

  if (componentsToGenerate.includes('model')) {
    generatedFiles.push({
      path: `${options.out}/model/${entityConfig.namePascalCase}.java`,
      content: generateModel(entityConfig),
      type: 'model'
    });
  }

  if (componentsToGenerate.includes('mapper')) {
    generatedFiles.push({
      path: `${options.out}/mapper/${entityConfig.namePascalCase}Mapper.java`,
      content: generateMapper(entityConfig),
      type: 'mapper'
    });
  }

  if (componentsToGenerate.includes('service')) {
    generatedFiles.push({
      path: `${options.out}/service/${entityConfig.namePascalCase}Service.java`,
      content: generateService(entityConfig),
      type: 'service'
    });
  }

  if (componentsToGenerate.includes('controller')) {
    generatedFiles.push({
      path: `${options.out}/controller/${entityConfig.namePascalCase}Controller.java`,
      content: generateController(entityConfig),
      type: 'controller'
    });
  }

  if (componentsToGenerate.includes('search')) {
    generatedFiles.push({
      path: `${options.out}/search/${entityConfig.namePascalCase}Search.java`,
      content: generateSearch(entityConfig),
      type: 'search'
    });
  }

  // Preview or create files
  if (options.dryRun) {
    previewFiles(generatedFiles);
  } else {
    const spinner = ora('Generating files...').start();
    
    try {
      await generateFiles(generatedFiles);
      spinner.succeed(chalk.green('Files generated successfully c:'));
      
      console.log(chalk.cyan('\nGenerated files:'));
      generatedFiles.forEach(file => {
        console.log(chalk.white(`  ✓ ${file.path}`));
      });
    } catch (error) {
      spinner.fail(chalk.red('Failed to generate files'));
      console.error(error);
      process.exit(1);
    }
  }

  console.log(chalk.cyan('\n✨ Done!\n'));
}

function getComponentsToGenerate(options: GeneratorOptions): string[] {
  // Check for "only" options first
  if (options.onlyModel) return ['model'];
  if (options.onlyMapper) return ['mapper'];
  if (options.onlyService) return ['service'];
  if (options.onlyController) return ['controller'];
  if (options.onlySearch) return ['search'];

  // Build list based on skip options
  const components: string[] = [];
  
  if (!options.skipModel) components.push('model');
  if (!options.skipMapper) components.push('mapper');
  if (!options.skipService) components.push('service');
  if (!options.skipController) components.push('controller');
  if (!options.skipSearch) components.push('search');

  return components;
}

function getDefaultFields(): EntityField[] {
  return [
    { name: 'codigo', type: 'String', columnName: 'codigo' },
    { name: 'nome', type: 'String', columnName: 'nome' },
    { name: 'dataCriacao', type: 'Date', columnName: 'criacao_dt' },
    { name: 'usuario', type: 'Usuario', columnName: 'usuario_codigo' }
  ];
}
