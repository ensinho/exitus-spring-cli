#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { newCommand } from './commands/new';

const program = new Command();

console.log(chalk.cyan(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ${chalk.bold.yellow('Exitus Spring CLI')} - Spring Boot Component Generator   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`));

program
  .name('exitus-spring-cli')
  .description('CLI tool for generating Spring Boot components following Exitus patterns')
  .version('0.1.0');

program
  .command('new <entity-name>')
  .description('Generate a new Spring Boot entity with all layers (Model, Mapper, Service, Controller, Search)')
  .option('-o, --out [path]', 'Output directory for generated files (default: current directory)')
  .option('-p, --package <package>', 'Base package name (e.g., com.exitus.educ.academico)')
  .option('-s, --schema <schema>', 'Database schema name', 'aprendizagem')
  .option('--skip-model', 'Skip generating the Model class')
  .option('--skip-mapper', 'Skip generating the Mapper interface')
  .option('--skip-service', 'Skip generating the Service class')
  .option('--skip-controller', 'Skip generating the Controller class')
  .option('--skip-search', 'Skip generating the Search record')
  .option('--only-model', 'Generate only the Model class')
  .option('--only-mapper', 'Generate only the Mapper interface')
  .option('--only-service', 'Generate only the Service class')
  .option('--only-controller', 'Generate only the Controller class')
  .option('--only-search', 'Generate only the Search record')
  .option('--dry-run', 'Preview generated files without creating them')
  .option('-f, --fields <fields>', 'Comma-separated list of fields (e.g., "titulo:String,descricao:String,ativo:Boolean")')
  .action((entityName, options) => {
    // Handle empty or missing -o argument
    if (!options.out || options.out === true) {
      options.out = process.cwd();
    }
    newCommand(entityName, options);
  });

program
  .command('init')
  .description('Initialize exitus-spring-cli configuration in your project')
  .action(() => {
    console.log(chalk.yellow('📦 Initializing exitus-spring-cli configuration...'));
    console.log(chalk.gray('This feature will be available in a future version.'));
  });

program
  .command('list')
  .description('List all available component types')
  .action(() => {
    console.log(chalk.cyan('\n📋 Available component types:\n'));
    console.log(chalk.white('  • Model      - Entity class with getters/setters'));
    console.log(chalk.white('  • Mapper     - MyBatis mapper interface'));
    console.log(chalk.white('  • Service    - Business logic layer'));
    console.log(chalk.white('  • Controller - REST API endpoints'));
    console.log(chalk.white('  • Search     - Java Record for search parameters'));
    console.log();
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
