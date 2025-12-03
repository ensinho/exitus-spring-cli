# exitus-spring-cli

CLI tool for generating Spring Boot components following Exitus patterns (Model, Mapper, Service, Controller, Search).

## Table of Contents

1. [Installation](#installation)
2. [Usage](#usage)
3. [Commands](#commands)
4. [Templates](#templates)
5. [Examples](#examples)
6. [Contributing](#contributing)
7. [License](#license)

## Installation

To install Exitus Spring CLI globally, run the following command:

```bash
npm install -g exitus-spring-cli
```

Or run locally with npx:

```bash
npx exitus-spring-cli new <entity-name>
```

## Usage

Once installed, you can use the CLI to generate new Spring Boot components. The basic syntax is:

```bash
exitus-spring-cli new <entity-name> [options]
```

Or using the short alias:

```bash
esc new <entity-name> [options]
```

## Commands

### `new`

The `new` command is used to create a new Spring Boot entity with all layers. It generates:

- **Model** - Java entity class with getters/setters
- **Mapper** - MyBatis mapper interface with CRUD operations
- **Service** - Business logic layer
- **Controller** - REST API endpoints
- **Search** - Java Record for search parameters

#### Options

| Option | Description | Default |
|--------|-------------|---------|
| `-o, --out <path>` | Output directory for generated files | `.` |
| `-p, --package <package>` | Base package name | `com.exitus.educ.academico` |
| `-s, --schema <schema>` | Database schema name | `academico` |
| `--skip-model` | Skip generating the Model class | `false` |
| `--skip-mapper` | Skip generating the Mapper interface | `false` |
| `--skip-service` | Skip generating the Service class | `false` |
| `--skip-controller` | Skip generating the Controller class | `false` |
| `--skip-search` | Skip generating the Search record | `false` |
| `--only-model` | Generate only the Model class | `false` |
| `--only-mapper` | Generate only the Mapper interface | `false` |
| `--only-service` | Generate only the Service class | `false` |
| `--only-controller` | Generate only the Controller class | `false` |
| `--only-search` | Generate only the Search record | `false` |
| `--dry-run` | Preview generated files without creating them | `false` |
| `-f, --fields <fields>` | Comma-separated list of fields | Default fields |

### `list`

Lists all available component types:

```bash
exitus-spring-cli list
```

### `init`

Initialize exitus-spring-cli configuration in your project (coming soon).

## Templates

Exitus Spring CLI generates the following files following Exitus patterns:

### Model

```java
package com.exitus.educ.academico.model;

import org.apache.commons.lang3.builder.*;
import java.util.Date;

public class Tarefa {
    private String codigo;
    private String nome;
    // ... getters, setters, equals, hashCode, toString
}
```

### Mapper

```java
package com.exitus.educ.academico.mapper;

import org.apache.ibatis.annotations.*;

@Mapper
public interface TarefaMapper {
    @Select("SELECT * FROM academico.tarefa_pesquisar(...)")
    Tarefa selectByPrimaryKey(@Param("usuario") UUID usuario, @Param("codigo") UUID codigo);
    // ... selectEntries, insert, updateFull, delete
}
```

### Service

```java
package com.exitus.educ.academico.service;

@Service("tarefaService")
public class TarefaService {
    @Autowired
    private TarefaMapper mapper;
    // ... selectByPrimaryKey, selectEntries, save, delete
}
```

### Controller

```java
package com.exitus.educ.academico.controller;

@RestController
public class TarefaController extends GenericController<Tarefa> {
    // GET /rest/tarefa/{codigo}
    // POST /rest/tarefa/search
    // POST /rest/tarefa
    // PUT /rest/tarefa
    // DELETE /rest/tarefa/{codigo}
}
```

### Search

```java
package com.exitus.educ.academico.search;

public record TarefaSearch(
    String pesquisa,
    Integer pagina,
    Integer totalRegistros
) {}
```

## Examples

### Generate a complete entity

```bash
exitus-spring-cli new Tarefa -p com.exitus.educ.academico -s academico
```

### Generate with custom fields

```bash
exitus-spring-cli new MaterialAprendizagem \
  -p com.exitus.educ.academico \
  -s aprendizagem \
  -f "codigo:String,nome:String,conteudo:String,arquivado:Boolean,usuario:Usuario,dataCriacao:Date"
```

### Preview without creating files (dry-run)

```bash
exitus-spring-cli new Tarefa --dry-run
```

### Generate only the Model

```bash
exitus-spring-cli new Tarefa --only-model
```

### Skip specific components

```bash
exitus-spring-cli new Tarefa --skip-search --skip-controller
```

### Generate to a specific directory

```bash
exitus-spring-cli new Tarefa -o src/main/java/com/exitus/educ/academico
```

## Field Types

Supported field types:

| Java Type | Description |
|-----------|-------------|
| `String` | Text fields |
| `Integer` | Integer numbers |
| `Long` | Long integers |
| `Boolean` | Boolean values |
| `Date` | Date/time fields |
| `Double` | Decimal numbers |
| `Float` | Float numbers |
| `BigDecimal` | Precise decimal numbers |
| `UUID` | UUID identifiers |
| `Usuario` | User entity reference |

## Project Structure

Generated files follow this structure:

```
src/main/java/com/exitus/educ/academico/
├── controller/
│   └── TarefaController.java
├── mapper/
│   └── TarefaMapper.java
├── model/
│   └── Tarefa.java
├── search/
│   └── TarefaSearch.java
└── service/
    └── TarefaService.java
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch for your feature or bug fix
3. Make your changes and commit them
4. Push your branch and create a pull request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**Version:** 0.1.0  
**Author:** Exitus Team  
**Repository:** [github.com/ensinho/exitus-spring-cli](https://github.com/ensinho/exitus-spring-cli)
