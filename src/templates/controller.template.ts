import { EntityConfig } from '../types';

/**
 * Generate REST Controller class following Exitus patterns
 */
export function generateController(config: EntityConfig): string {
  const { namePascalCase, nameCamelCase, nameKebabCase, packageName } = config;
  
  return `package ${packageName}.controller;

import ${packageName}.model.${namePascalCase};
import ${packageName}.search.${namePascalCase}Search;
import ${packageName}.service.${namePascalCase}Service;
import com.exitus.educ.auditoria.service.DadoService;
import com.exitus.educ.autenticacao.model.UserSession;
import com.exitus.educ.controller.GenericController;
import com.exitus.educ.seguranca.model.Usuario;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
public class ${namePascalCase}Controller extends GenericController<${namePascalCase}> {

    private static final Logger logger = LoggerFactory.getLogger(${namePascalCase}Controller.class);

    @Autowired
    ${namePascalCase}Service service;

    @Autowired
    private DadoService dadoService;

    @GetMapping("/rest/${nameKebabCase}/{codigo}")
    public ResponseEntity<${namePascalCase}> showJson(
            @PathVariable("codigo") String codigo, 
            final HttpSession session) {
        
        Usuario usuarioAtual = UserSession.getUser();
        ${namePascalCase} ${nameCamelCase} = service.selectByPrimaryKey(usuarioAtual, new ${namePascalCase}(codigo));
        
        return ${nameCamelCase} == null 
            ? new ResponseEntity<>(getHeaders(), HttpStatus.NOT_FOUND)
            : new ResponseEntity<>(${nameCamelCase}, getHeaders(), HttpStatus.OK);
    }

    @PostMapping("/rest/${nameKebabCase}/search")
    @ResponseBody
    public ResponseEntity<List<${namePascalCase}>> listJson(
            @RequestBody ${namePascalCase}Search search, 
            final HttpSession session) {
        
        Usuario usuarioAtual = UserSession.getUser();
        List<${namePascalCase}> lista = service.selectEntries(search, usuarioAtual);
        
        return lista == null 
            ? new ResponseEntity<>(getHeaders(), HttpStatus.NOT_FOUND)
            : new ResponseEntity<>(lista, getHeaders(), HttpStatus.OK);
    }

    @Transactional
    @PostMapping("/rest/${nameKebabCase}")
    public ResponseEntity<String> createFromJson(
            @RequestBody final ${namePascalCase} ${nameCamelCase}, 
            final HttpSession session) {
        try {
            dadoService.setSessionAuditoria();
            Usuario usuarioAtual = UserSession.getUser();
            
            ${nameCamelCase}.setUsuario(usuarioAtual);
            service.save(${nameCamelCase});
            
            return new ResponseEntity<>(getHeaders(), HttpStatus.CREATED);
        } catch(Exception e) {
            return new ResponseEntity<>(e.getCause().getMessage(), 
                getHeaders(), HttpStatus.UNPROCESSABLE_ENTITY);
        }
    }

    @Transactional
    @PutMapping("/rest/${nameKebabCase}")
    public ResponseEntity<String> updateFromJson(
            @RequestBody final ${namePascalCase} ${nameCamelCase}, 
            final HttpSession session) {
        try {
            dadoService.setSessionAuditoria();
            Usuario usuarioAtual = UserSession.getUser();
            
            if(!usuarioAtual.getCodigo().equals(${nameCamelCase}.getUsuario().getCodigo())) {
                return new ResponseEntity<>(getHeaders(), HttpStatus.UNAUTHORIZED);
            }
            
            service.save(${nameCamelCase});
            return new ResponseEntity<>(getHeaders(), HttpStatus.ACCEPTED);
        } catch(Exception e) {
            return new ResponseEntity<>(e.getCause().getMessage(), 
                getHeaders(), HttpStatus.UNPROCESSABLE_ENTITY);
        }
    }

    @Transactional
    @DeleteMapping("/rest/${nameKebabCase}/{codigo}")
    public ResponseEntity<String> deleteFromJson(
            @PathVariable("codigo") final String codigo, 
            final HttpSession session) {
        try {
            dadoService.setSessionAuditoria();
            Usuario usuarioAtual = UserSession.getUser();
            
            ${namePascalCase} ${nameCamelCase} = service.selectByPrimaryKey(
                usuarioAtual, 
                new ${namePascalCase}(codigo)
            );
            
            if(!usuarioAtual.getCodigo().equals(${nameCamelCase}.getUsuario().getCodigo())) {
                return new ResponseEntity<>(getHeaders(), HttpStatus.UNAUTHORIZED);
            }
            
            service.delete(${nameCamelCase});
            return new ResponseEntity<>(getHeaders(), HttpStatus.ACCEPTED);
        } catch(Exception e) {
            return new ResponseEntity<>(e.getCause().getMessage(), 
                getHeaders(), HttpStatus.UNPROCESSABLE_ENTITY);
        }
    }
}
`;
}
