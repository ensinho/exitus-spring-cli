import { EntityConfig } from '../types';
import { capitalize, setterName, getterName } from '../utils/string-utils';

/**
 * Generate Model (Entity) class following Exitus patterns
 */
export function generateModel(config: EntityConfig): string {
  const { namePascalCase, packageName, fields } = config;
  
  // Determine imports based on field types
  const hasDate = fields.some(f => f.type === 'Date');
  const hasList = fields.some(f => f.type.startsWith('List'));
  const hasUsuario = fields.some(f => f.type === 'Usuario');

  let imports = `import org.apache.commons.lang3.builder.*;`;
  
  if (hasDate) {
    imports += `\nimport java.util.Date;`;
  }
  if (hasList) {
    imports += `\nimport java.util.List;`;
  }
  if (hasUsuario) {
    imports += `\nimport com.exitus.educ.seguranca.model.Usuario;`;
  }

  // Generate field declarations
  const fieldDeclarations = fields.map(f => {
    return `    private ${f.type} ${f.name};`;
  }).join('\n');

  // Generate getters and setters
  const gettersSetters = fields.map(f => {
    const getter = getterName(f.name, f.type);
    const setter = setterName(f.name);
    
    return `
    public ${f.type} ${getter}() {
        return ${f.name};
    }

    public void ${setter}(${f.type} ${f.name}) {
        this.${f.name} = ${f.name};
    }`;
  }).join('\n');

  // Find the primary key field (usually 'codigo')
  const pkField = fields.find(f => f.name === 'codigo') || fields[0];

  return `package ${packageName}.model;

${imports}

public class ${namePascalCase} {
    
${fieldDeclarations}
    private Integer totalRegistros;

    // Constructors
    public ${namePascalCase}() {}

    public ${namePascalCase}(${pkField.type} ${pkField.name}) {
        this.${pkField.name} = ${pkField.name};
    }

    // Getters and Setters
${gettersSetters}

    public Integer getTotalRegistros() {
        return totalRegistros;
    }

    public void setTotalRegistros(Integer totalRegistros) {
        this.totalRegistros = totalRegistros;
    }

    @Override
    public int hashCode() {
        return HashCodeBuilder.reflectionHashCode(this);
    }

    @Override
    public boolean equals(final Object obj) {
        return EqualsBuilder.reflectionEquals(this, obj);
    }

    @Override
    public String toString() {
        return ToStringBuilder.reflectionToString(this);
    }
}
`;
}
