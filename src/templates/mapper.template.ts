import { EntityConfig } from '../types';
import { camelToSnakeCase } from '../utils/string-utils';

/**
 * Generate MyBatis Mapper interface following Exitus patterns
 */
export function generateMapper(config: EntityConfig): string {
  const { namePascalCase, nameCamelCase, nameSnakeCase, packageName, schema, fields } = config;
  
  // Generate @Results mapping
  const resultMappings = fields.map(f => {
    const columnName = f.columnName || camelToSnakeCase(f.name);
    
    // Handle nested properties (e.g., usuario.codigo)
    if (f.type === 'Usuario') {
      return `        @Result(property = "${f.name}.codigo", column = "${columnName}"),
        @Result(property = "${f.name}.nome", column = "${f.name}_nome")`;
    }
    
    return `        @Result(property = "${f.name}", column = "${columnName}")`;
  }).join(',\n');

  // Generate selectEntries parameters (excluding complex types and codigo)
  const searchParams = fields
    .filter(f => f.type !== 'Usuario' && f.name !== 'codigo' && f.name !== 'dataCriacao')
    .map(f => `        + "p_${camelToSnakeCase(f.name)} := #{${f.name}}, "`)
    .join('\n');

  // Generate insert parameters
  const insertParams = fields
    .filter(f => f.name !== 'codigo' && f.name !== 'totalRegistros')
    .map(f => {
      if (f.type === 'Usuario') {
        return `        + "#{usuario.codigo}::uuid"`;
      }
      if (f.type === 'Date') {
        return `        + "#{${f.name}}"`;
      }
      return `        + "#{${f.name}}, "`;
    })
    .join('\n');

  // Generate update parameters
  const updateParams = fields
    .filter(f => f.name !== 'totalRegistros')
    .map(f => {
      if (f.name === 'codigo') {
        return `        + "#{codigo}::uuid, "`;
      }
      if (f.type === 'Usuario') {
        return `        + "#{usuario.codigo}::uuid"`;
      }
      if (f.type === 'Date') {
        return `        + "#{${f.name}}, "`;
      }
      return `        + "#{${f.name}}, "`;
    })
    .join('\n');

  return `package ${packageName}.mapper;

import ${packageName}.model.${namePascalCase};
import org.apache.ibatis.annotations.*;
import java.util.List;
import java.util.UUID;

@Mapper
public interface ${namePascalCase}Mapper {

    //Função para pesquisar dados de ${nameCamelCase}
    @Select("SELECT * FROM ${schema}.${nameSnakeCase}_pesquisar("
        + "p_usuario := #{usuario}, "
        + "p_codigo := #{codigo}"
    + ")")
    @Results(id = "${namePascalCase}Map", value = {
${resultMappings},
        @Result(property = "totalRegistros", column = "total_linhas")
    })
    ${namePascalCase} selectByPrimaryKey(
        @Param("usuario") UUID usuario,
        @Param("codigo") UUID codigo
    );

    //Função para pesquisar os registros de ${nameCamelCase} que o usuário tem acesso
    @Select("SELECT COUNT(*) OVER () AS total_linhas, * FROM ${schema}.${nameSnakeCase}_pesquisar("
        + "p_usuario := #{usuario}, "
        + "p_pesquisa := #{pesquisa}"
    + ") offset #{pagina} limit #{limite}")
    @ResultMap("${namePascalCase}Map")
    List<${namePascalCase}> selectEntries(
        @Param("usuario") UUID usuario,
        @Param("pesquisa") String pesquisa,
        @Param("pagina") Integer pagina,
        @Param("limite") Integer limite
    );

    //Função para cadastrar novo ${nameCamelCase}
    @Select("SELECT ${schema}.${nameSnakeCase}_inserir("
${insertParams}
    + ")")
    @Options(useGeneratedKeys = false)
    String insert(${namePascalCase} ${nameCamelCase});

    //Função para atualizar ${nameCamelCase}
    @Select("SELECT ${schema}.${nameSnakeCase}_atualizar("
${updateParams}
    + ")")
    String updateFull(${namePascalCase} ${nameCamelCase});

    //Função para excluir ${nameCamelCase}
    @Select("SELECT ${schema}.${nameSnakeCase}_excluir(#{codigo})")
    String delete(@Param("codigo") UUID codigo);
}
`;
}
