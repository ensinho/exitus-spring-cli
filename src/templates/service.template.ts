import { EntityConfig } from '../types';

/**
 * Generate Service class following Exitus patterns
 */
export function generateService(config: EntityConfig): string {
  const { namePascalCase, nameCamelCase, packageName } = config;
  
  return `package ${packageName}.service;

import ${packageName}.mapper.${namePascalCase}Mapper;
import ${packageName}.model.${namePascalCase};
import ${packageName}.search.${namePascalCase}Search;
import com.exitus.educ.controller.WebUtil;
import com.exitus.educ.seguranca.model.Usuario;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service("${nameCamelCase}Service")
public class ${namePascalCase}Service {

    private static final Logger logger = LoggerFactory.getLogger(${namePascalCase}Service.class);

    @Autowired
    private ${namePascalCase}Mapper mapper;

    public ${namePascalCase} selectByPrimaryKey(Usuario usuarioAtual, ${namePascalCase} ${nameCamelCase}) {
        UUID usuario = usuarioAtual.getCodigo() != null 
            ? UUID.fromString(usuarioAtual.getCodigo()) 
            : null;
        UUID codigo = ${nameCamelCase}.getCodigo() != null 
            ? UUID.fromString(${nameCamelCase}.getCodigo()) 
            : null;
        
        return mapper.selectByPrimaryKey(usuario, codigo);
    }

    public List<${namePascalCase}> selectEntries(${namePascalCase}Search search, Usuario usuarioAtual) {
        UUID usuario = usuarioAtual.getCodigo() != null 
            ? UUID.fromString(usuarioAtual.getCodigo()) 
            : null;
        String pesquisa = WebUtil.nullIfBlank(search.pesquisa());
        Integer limite = search.totalRegistros();
        Integer pagina = limite * (search.pagina() - 1);
        
        return mapper.selectEntries(usuario, pesquisa, pagina, limite);
    }

    public String save(${namePascalCase} ${nameCamelCase}) {
        if (${nameCamelCase}.getCodigo() == null) {
            return mapper.insert(${nameCamelCase});
        } else {
            return mapper.updateFull(${nameCamelCase});
        }
    }

    public String delete(${namePascalCase} ${nameCamelCase}) {
        UUID codigo = ${nameCamelCase}.getCodigo() != null 
            ? UUID.fromString(${nameCamelCase}.getCodigo()) 
            : null;
        return mapper.delete(codigo);
    }
}
`;
}
