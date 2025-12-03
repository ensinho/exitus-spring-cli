Documentação: Estrutura e Padrões do Projeto Spring Boot
Visão Geral
Este documento descreve a estrutura e padrões utilizados no projeto Spring Boot com MyBatis, seguindo a arquitetura em camadas adotada pela equipe.

Estrutura de Diretórios
src/main/java/com/exitus/educ/academico/
├── controller/       # Camada de apresentação (REST endpoints)
├── service/          # Camada de lógica de negócio
├── mapper/           # Camada de acesso a dados (MyBatis)
├── model/            # Entidades e DTOs
└── search/           # Classes de filtros de pesquisa
1. Model (Entidades)
Localização: src/main/java/com/exitus/educ/academico/model/

Padrões
Nome: Substantivo singular em PascalCase (ex: MaterialAprendizagem)
Implements: Interfaces específicas quando necessário (ex: Compartilhavel)
Atributos: CamelCase com encapsulamento (private + getters/setters)
Anotações Jackson: @JsonProperty quando nome difere do padrão
Commons Lang: Utilizar EqualsBuilder, HashCodeBuilder, ToStringBuilder
Exemplo Estrutural
package com.exitus.educ.academico.model;

import org.apache.commons.lang3.builder.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Date;
import java.util.List;

public class NomeDaEntidade {
    
    private String codigo;
    private String nome;
    private Date dataCriacao;
    
    @JsonProperty("nomeCustomizado")
    private String campo;
    
    // Construtores
    public NomeDaEntidade() {}
    
    public NomeDaEntidade(String codigo) {
        this.codigo = codigo;
    }
    
    // Getters e Setters
    public String getCodigo() {
        return codigo;
    }
    
    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }
    
    public String getNome() {
        return nome;
    }
    
    public void setNome(String nome) {
        this.nome = nome;
    }
    
    public Date getDataCriacao() {
        return dataCriacao;
    }
    
    public void setDataCriacao(Date dataCriacao) {
        this.dataCriacao = dataCriacao;
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
Exemplo Real: MaterialAprendizagem
package com.exitus.educ.academico.model;

import java.util.Date;
import java.util.List;
import org.apache.commons.lang3.builder.*;
import com.exitus.educ.compartilhamento.Compartilhavel;
import com.exitus.educ.seguranca.model.Usuario;
import com.fasterxml.jackson.annotation.JsonProperty;

public class MaterialAprendizagem implements Compartilhavel {
    
    private String codigo;
    private String nome;
    private String conteudo;
    private String assunto;
    private Usuario usuario;
    private Date dataCriacao;
    private Boolean arquivado;
    private Boolean publico;
    private String curso;
    private List<MaterialCompartilhado> listaMaterialCompartilhado;
    private Integer totalRegistros;
    private String compartilhado;
    private String tipoArquivo;
    private Date ultimoAcesso;
    private Disciplina disciplina;
    
    @JsonProperty("numeroAula")
    private Integer numero_aula;
    
    private String etapa;
    
    // Construtores, getters, setters...
    
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
2. Mapper (Acesso a Dados)
Localização: src/main/java/com/exitus/educ/academico/mapper/

Padrões
Nome: [Entidade]Mapper (ex: MaterialAprendizagemMapper)
Anotação: @Mapper do MyBatis
Interface: Apenas declaração de métodos
SQL: Usar funções do PostgreSQL (schema.funcao_*)
Parâmetros: Anotados com @Param
Tipo UUID: Sempre converter String para UUID
Comentários: Sempre documentar a função com comentário acima
Convenções de Nomenclatura
Operação	Prefixo	Exemplo
Consultar único	select...ByPrimaryKey	selectByPrimaryKey
Listar múltiplos	selectEntries	selectEntries
Inserir	insert	insert
Atualizar	update / updateFull	updateFull
Excluir	delete	delete
Exemplo Estrutural
package com.exitus.educ.academico.mapper;

import org.apache.ibatis.annotations.*;
import java.util.List;
import java.util.UUID;

@Mapper
public interface EntidadeMapper {

    //Função para pesquisar dados de uma entidade
    @Select("SELECT * FROM schema.entidade_pesquisar("
        + "p_usuario := #{usuario}, "
        + "p_codigo := #{codigo}"
    + ")")
    @Results(id = "EntidadeMap", value = {
        @Result(property = "codigo", column = "codigo"),
        @Result(property = "nome", column = "nome"),
        @Result(property = "usuario.codigo", column = "usuario_codigo"),
        @Result(property = "usuario.nome", column = "usuario_nome"),
        @Result(property = "dataCriacao", column = "criacao_dt"),
        @Result(property = "totalRegistros", column = "total_linhas")
    })
    Entidade selectByPrimaryKey(
        @Param("usuario") UUID usuario,
        @Param("codigo") UUID codigo
    );

    //Função para pesquisar as entidades que o usuário tem acesso
    @Select("SELECT COUNT(*) OVER () AS total_linhas, * FROM schema.entidade_pesquisar("
        + "p_usuario := #{usuario}, "
        + "p_pesquisa := #{pesquisa}"
    + ") offset #{pagina} limit #{limite}")
    @ResultMap("EntidadeMap")
    List<Entidade> selectEntries(
        @Param("usuario") UUID usuario,
        @Param("pesquisa") String pesquisa,
        @Param("pagina") Integer pagina,
        @Param("limite") Integer limite
    );

    //Função para cadastrar nova entidade
    @Select("SELECT schema.entidade_inserir("
        + "#{nome}, "
        + "#{usuario.codigo}::uuid"
    + ")")
    @Options(useGeneratedKeys = false)
    String insert(Entidade entidade);

    //Função para atualizar entidade
    @Select("SELECT schema.entidade_atualizar("
        + "#{codigo}::uuid, "
        + "#{nome}, "
        + "#{usuario.codigo}::uuid"
    + ")")
    String updateFull(Entidade entidade);

    //Função para excluir entidade
    @Select("SELECT schema.entidade_excluir(#{codigo})")
    String delete(@Param("codigo") UUID codigo);
}
Exemplo Real: MaterialAprendizagemMapper
package com.exitus.educ.academico.mapper;

import com.exitus.educ.academico.model.*;
import org.apache.ibatis.annotations.*;
import java.util.List;
import java.util.UUID;

@Mapper
public interface MaterialAprendizagemMapper {

    //Função para pesquisar dados de um material de aprendizagem
    @Select("SELECT * FROM aprendizagem.material_aprendizagem_pesquisar("
        + "p_usuario := #{usuario}, "
        + "p_material := #{codigo}"
    + ")")
    @Results(id = "MaterialAprendizagemMap", value = {
        @Result(property = "codigo", column = "codigo"),
        @Result(property = "nome", column = "nome"),
        @Result(property = "assunto", column = "assunto"),
        @Result(property = "curso", column = "curso"),
        @Result(property = "conteudo", column = "conteudo"),
        @Result(property = "usuario.codigo", column = "criador_codigo"),
        @Result(property = "usuario.nome", column = "criador_nome"),
        @Result(property = "ultimoAcesso", column = "usuario_ultimo_acesso"),
        @Result(property = "arquivado", column = "arquivado"),
        @Result(property = "dataCriacao", column = "criacao_dt"),
        @Result(property = "publico", column = "publico"),
        @Result(property = "totalRegistros", column = "total_linhas"),
        @Result(property = "compartilhado", column = "compartilhado"),
        @Result(property = "tipoArquivo", column = "tipo_arquivo"),
        @Result(property = "numero_aula", column = "numero_aula"),
        @Result(property = "etapa", column = "etapa")
    })
    MaterialAprendizagem selectByPrimaryKey(
        @Param("usuario") UUID usuario, 
        @Param("codigo") UUID codigo
    );
    
    //Função para pesquisar os materiais de aprendizagem que o usuário tem acesso
    @Select("SELECT COUNT(*) OVER () AS total_linhas, * FROM aprendizagem.material_aprendizagem_pesquisar("
        + "p_usuario := #{usuario}, "
        + "p_pesquisa := #{pesquisa}, "
        + "p_arquivado := #{arquivado}, "
        + "p_disciplina := #{disciplina}, "
        + "p_numero_aula := #{numeroAula}, "
        + "p_etapa := #{etapa}"
    + ") offset #{pagina} limit #{limite}")
    @ResultMap("MaterialAprendizagemMap")
    List<MaterialAprendizagem> selectEntries(
        @Param("usuario") UUID usuario,
        @Param("pesquisa") String pesquisa,
        @Param("arquivado") Boolean arquivado,
        @Param("disciplina") String disciplina,
        @Param("numeroAula") Integer numeroAula,
        @Param("etapa") String etapa,
        @Param("pagina") Integer pagina,
        @Param("limite") Integer limite
    );

    //Função para cadastrar novo material de aprendizagem
    @Select("SELECT aprendizagem.material_aprendizagem_inserir("
        + "#{nome}, "
        + "#{conteudo}::text, "
        + "#{usuario.codigo}::uuid, "
        + "#{arquivado}, "
        + "#{publico}, "
        + "#{tipoArquivo}, "
        + "#{assunto}::jsonb, "
        + "#{curso}::jsonb, "
        + "#{disciplina.codigo}::uuid, "
        + "#{numero_aula}::integer, "
        + "#{etapa}::varchar"
    + ")")
    @Options(useGeneratedKeys = false)
    String insert(MaterialAprendizagem material);

    //Função para atualizar material de aprendizagem
    @Select("SELECT aprendizagem.material_aprendizagem_atualizar("
        + "#{codigo}::uuid, "
        + "#{nome}, "
        + "#{conteudo}::text, "
        + "#{usuario.codigo}::uuid, "
        + "#{arquivado}, "
        + "#{publico}, "
        + "#{tipoArquivo}, "
        + "#{assunto}::jsonb, "
        + "#{curso}::jsonb, "
        + "#{disciplina.codigo}::uuid, "
        + "#{numero_aula}::integer, "
        + "#{etapa}::varchar"
    + ")")
    String updateFull(MaterialAprendizagem material);

    //Função para excluir material de aprendizagem
    @Select("SELECT aprendizagem.material_aprendizagem_excluir(#{codigo})")
    String delete(@Param("codigo") UUID codigo);
}
3. Service (Lógica de Negócio)
Localização: src/main/java/com/exitus/educ/academico/service/

Padrões
Nome: [Entidade]Service (ex: MaterialAprendizagemService)
Anotação: @Service("[nome]Service")
Logger: Sempre incluir private static final Logger logger
Autowired: Injeção de dependências via @Autowired
Conversão UUID: String ↔ UUID nas bordas do sistema
Nulls: Usar WebUtil.nullIfBlank() para strings opcionais
Responsabilidades
Validação de regras de negócio
Conversão de tipos (String para UUID)
Tratamento de nulos com WebUtil.nullIfBlank
Orquestração de múltiplos mappers
Upload/download de arquivos
Cálculos e processamento de dados
Exemplo Estrutural
package com.exitus.educ.academico.service;

import com.exitus.educ.academico.mapper.EntidadeMapper;
import com.exitus.educ.academico.model.Entidade;
import com.exitus.educ.academico.search.EntidadeSearch;
import com.exitus.educ.controller.WebUtil;
import com.exitus.educ.seguranca.model.Usuario;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service("entidadeService")
public class EntidadeService {

    private static final Logger logger = LoggerFactory.getLogger(EntidadeService.class);

    @Autowired
    private EntidadeMapper mapper;

    public Entidade selectByPrimaryKey(Usuario usuarioAtual, Entidade entidade) {
        UUID usuario = usuarioAtual.getCodigo() != null 
            ? UUID.fromString(usuarioAtual.getCodigo()) 
            : null;
        UUID codigo = entidade.getCodigo() != null 
            ? UUID.fromString(entidade.getCodigo()) 
            : null;
        
        return mapper.selectByPrimaryKey(usuario, codigo);
    }

    public List<Entidade> selectEntries(EntidadeSearch search, Usuario usuarioAtual) {
        UUID usuario = usuarioAtual.getCodigo() != null 
            ? UUID.fromString(usuarioAtual.getCodigo()) 
            : null;
        String pesquisa = WebUtil.nullIfBlank(search.pesquisa());
        Integer limite = search.totalRegistros();
        Integer pagina = limite * (search.pagina() - 1);
        
        return mapper.selectEntries(usuario, pesquisa, pagina, limite);
    }

    public String save(Entidade entidade) {
        if (entidade.getCodigo() == null) {
            return mapper.insert(entidade);
        } else {
            return mapper.updateFull(entidade);
        }
    }

    public String delete(Entidade entidade) {
        UUID codigo = entidade.getCodigo() != null 
            ? UUID.fromString(entidade.getCodigo()) 
            : null;
        return mapper.delete(codigo);
    }
}
Exemplo Real: MaterialAprendizagemService
package com.exitus.educ.academico.service;

import com.exitus.educ.academico.mapper.MaterialAprendizagemMapper;
import com.exitus.educ.academico.model.*;
import com.exitus.educ.academico.search.MaterialSearch;
import com.exitus.educ.autenticacao.model.UserSession;
import com.exitus.educ.controller.WebUtil;
import com.exitus.educ.seguranca.model.Usuario;
import com.exitus.educ.upload.service.UploadService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service("materialAprendizagemService")
public class MaterialAprendizagemService {

    private static final Logger logger = LoggerFactory.getLogger(MaterialAprendizagemService.class);

    @Autowired
    private MaterialAprendizagemMapper mapper;

    @Autowired
    private UploadService uploadService;

    public MaterialAprendizagem selectByPrimaryKey(Usuario usuarioAtual, MaterialAprendizagem materialAprendizagem) {
        UUID usuario = usuarioAtual.getCodigo() != null 
            ? UUID.fromString(usuarioAtual.getCodigo()) 
            : null;
        UUID material = materialAprendizagem.getCodigo() != null 
            ? UUID.fromString(materialAprendizagem.getCodigo()) 
            : null;

        MaterialAprendizagem mat = mapper.selectByPrimaryKey(usuario, material);
        mat.setConteudo(uploadService.generatePublicFileLink(mat.getConteudo()));

        return mat;
    }

    public List<MaterialAprendizagem> selectEntries(MaterialSearch search, Usuario usuarioAtual) {
        UUID usuario = usuarioAtual.getCodigo() != null 
            ? UUID.fromString(usuarioAtual.getCodigo()) 
            : null;
        String disciplina = search.codigoDisciplina();
        String pesquisa = WebUtil.nullIfBlank(search.pesquisa());
        Boolean arquivado = search.arquivado();
        Integer limite = search.totalRegistros();
        Integer pagina = limite * (search.pagina() - 1);
        Integer numeroAula = search.numeroAula();
        String etapa = search.etapa();

        return mapper.selectEntries(usuario, pesquisa, arquivado, disciplina, numeroAula, etapa, pagina, limite);
    }

    public String save(MaterialAprendizagem materialAprendizagem) {
        if (materialAprendizagem.getCodigo() == null) {
            String materialCodigo = mapper.insert(materialAprendizagem);
            return materialCodigo;
        } else {
            return mapper.updateFull(materialAprendizagem);
        }
    }

    public String delete(MaterialAprendizagem materialAprendizagem) {
        return mapper.delete(materialAprendizagem.getCodigo() != null 
            ? UUID.fromString(materialAprendizagem.getCodigo()) 
            : null);
    }

    public String uploadArquivoMaterial(MaterialAprendizagemRequest material) throws IOException {
        try {
            String objectName = "material_aprendizagem/"
                    + UserSession.getUser().getCodigo()
                    + "/" + material.arquivo().getOriginalFilename();

            uploadService.privateUpload(
                    objectName,
                    material.arquivo().getContentType(),
                    material.arquivo().getBytes()
            );

            logger.info("Upload realizado com sucesso: {}", objectName);
            return objectName;
        } catch (Exception e) {
            logger.error("Erro no upload do arquivo '{}': {}", 
                material.arquivo().getOriginalFilename(), e.getMessage(), e);
            throw e;
        }
    }
}
4. Controller (API REST)
Localização: src/main/java/com/exitus/educ/academico/controller/

Padrões
Nome: [Entidade]Controller (ex: MaterialAprendizagemController)
Anotação: @RestController
Herança: extends GenericController<T>
Logger: private static final Logger logger
Autowired: Injetar Service e DadoService
Convenções de Rotas
Operação	Método HTTP	Rota	Status Sucesso
Buscar único	GET	/rest/entidade/{codigo}	200 OK
Listar	POST	/rest/entidade/search	200 OK
Criar	POST	/rest/entidade	201 CREATED
Atualizar	PUT	/rest/entidade	202 ACCEPTED
Excluir	DELETE	/rest/entidade/{codigo}	202 ACCEPTED
Segurança
Sempre validar usuário logado: UserSession.getUser()
Verificar propriedade do recurso antes de operações
Usar @Transactional em operações de escrita
Chamar dadoService.setSessionAuditoria() antes de persistir
Tratamento de Erros
200 OK: Sucesso em leitura
201 CREATED: Sucesso em criação
202 ACCEPTED: Sucesso em atualização/exclusão
401 UNAUTHORIZED: Usuário não tem permissão
404 NOT_FOUND: Recurso não encontrado
422 UNPROCESSABLE_ENTITY: Erro de validação/processamento
Exemplo Estrutural
package com.exitus.educ.academico.controller;

import com.exitus.educ.academico.model.Entidade;
import com.exitus.educ.academico.search.EntidadeSearch;
import com.exitus.educ.academico.service.EntidadeService;
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
public class EntidadeController extends GenericController<Entidade> {

    private static final Logger logger = LoggerFactory.getLogger(EntidadeController.class);

    @Autowired
    EntidadeService service;

    @Autowired
    private DadoService dadoService;

    @GetMapping("/rest/entidade/{codigo}")
    public ResponseEntity<Entidade> showJson(
            @PathVariable("codigo") String codigo, 
            final HttpSession session) {
        
        Usuario usuarioAtual = UserSession.getUser();
        Entidade entidade = service.selectByPrimaryKey(usuarioAtual, new Entidade(codigo));
        
        return entidade == null 
            ? new ResponseEntity<>(getHeaders(), HttpStatus.NOT_FOUND)
            : new ResponseEntity<>(entidade, getHeaders(), HttpStatus.OK);
    }

    @PostMapping("/rest/entidade/search")
    @ResponseBody
    public ResponseEntity<List<Entidade>> listJson(
            @RequestBody EntidadeSearch search, 
            final HttpSession session) {
        
        Usuario usuarioAtual = UserSession.getUser();
        List<Entidade> lista = service.selectEntries(search, usuarioAtual);
        
        return lista == null 
            ? new ResponseEntity<>(getHeaders(), HttpStatus.NOT_FOUND)
            : new ResponseEntity<>(lista, getHeaders(), HttpStatus.OK);
    }

    @Transactional
    @PostMapping("/rest/entidade")
    public ResponseEntity<String> createFromJson(
            @RequestBody final Entidade entidade, 
            final HttpSession session) {
        try {
            dadoService.setSessionAuditoria();
            Usuario usuarioAtual = UserSession.getUser();
            
            entidade.setUsuario(usuarioAtual);
            service.save(entidade);
            
            return new ResponseEntity<>(getHeaders(), HttpStatus.CREATED);
        } catch(Exception e) {
            return new ResponseEntity<>(e.getCause().getMessage(), 
                getHeaders(), HttpStatus.UNPROCESSABLE_ENTITY);
        }
    }

    @Transactional
    @PutMapping("/rest/entidade")
    public ResponseEntity<String> updateFromJson(
            @RequestBody final Entidade entidade, 
            final HttpSession session) {
        try {
            dadoService.setSessionAuditoria();
            Usuario usuarioAtual = UserSession.getUser();
            
            if(!usuarioAtual.getCodigo().equals(entidade.getUsuario().getCodigo())) {
                return new ResponseEntity<>(getHeaders(), HttpStatus.UNAUTHORIZED);
            }
            
            service.save(entidade);
            return new ResponseEntity<>(getHeaders(), HttpStatus.ACCEPTED);
        } catch(Exception e) {
            return new ResponseEntity<>(e.getCause().getMessage(), 
                getHeaders(), HttpStatus.UNPROCESSABLE_ENTITY);
        }
    }

    @Transactional
    @DeleteMapping("/rest/entidade/{codigo}")
    public ResponseEntity<String> deleteFromJson(
            @PathVariable("codigo") final String codigo, 
            final HttpSession session) {
        try {
            dadoService.setSessionAuditoria();
            Usuario usuarioAtual = UserSession.getUser();
            
            Entidade entidade = service.selectByPrimaryKey(
                usuarioAtual, 
                new Entidade(codigo)
            );
            
            if(!usuarioAtual.getCodigo().equals(entidade.getUsuario().getCodigo())) {
                return new ResponseEntity<>(getHeaders(), HttpStatus.UNAUTHORIZED);
            }
            
            service.delete(entidade);
            return new ResponseEntity<>(getHeaders(), HttpStatus.ACCEPTED);
        } catch(Exception e) {
            return new ResponseEntity<>(e.getCause().getMessage(), 
                getHeaders(), HttpStatus.UNPROCESSABLE_ENTITY);
        }
    }
}
Exemplo Real: MaterialAprendizagemController
package com.exitus.educ.academico.controller;

import com.exitus.educ.academico.model.*;
import com.exitus.educ.academico.search.MaterialSearch;
import com.exitus.educ.academico.service.MaterialAprendizagemService;
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
import java.util.Map;

@RestController
public class MaterialAprendizagemController extends GenericController<MaterialAprendizagem> {

    private static final Logger logger = LoggerFactory.getLogger(MaterialAprendizagemController.class);

    @Autowired
    MaterialAprendizagemService materialAprendizagemService;
    
    @Autowired
    private DadoService dadoService;
    
    @GetMapping("/rest/material-aprendizagem/{codigo}")
    public ResponseEntity<MaterialAprendizagem> showJson(
            @PathVariable("codigo") String codigo, 
            final HttpSession session) {
        
        Usuario usuarioAtual = UserSession.getUser();
        MaterialAprendizagem materialAprendizagem = materialAprendizagemService.selectByPrimaryKey(
            usuarioAtual, 
            new MaterialAprendizagem(codigo)
        );
        
        return materialAprendizagem == null 
            ? new ResponseEntity<>(getHeaders(), HttpStatus.NOT_FOUND) 
            : new ResponseEntity<>(materialAprendizagem, getHeaders(), HttpStatus.OK);
    }
    
    @PostMapping("/rest/material-aprendizagem/search")
    @ResponseBody
    public ResponseEntity<List<MaterialAprendizagem>> listJson(
            @RequestBody MaterialSearch search, 
            final HttpSession session) {
        
        Usuario usuarioAtual = UserSession.getUser();
        List<MaterialAprendizagem> listaMaterialAprendizagem = 
            materialAprendizagemService.selectEntries(search, usuarioAtual);
        
        return listaMaterialAprendizagem == null 
            ? new ResponseEntity<>(getHeaders(), HttpStatus.NOT_FOUND) 
            : new ResponseEntity<>(listaMaterialAprendizagem, getHeaders(), HttpStatus.OK);
    }

    @Transactional
    @PostMapping("/rest/material-aprendizagem")
    public ResponseEntity<String> createFromJson(
            @RequestBody final MaterialAprendizagem materialAprendizagem, 
            final HttpSession session) {
        try {
            dadoService.setSessionAuditoria();
            Usuario usuarioAtual = UserSession.getUser();
            
            materialAprendizagem.setUsuario(usuarioAtual);
            materialAprendizagemService.save(materialAprendizagem);
            
            return new ResponseEntity<>(getHeaders(), HttpStatus.CREATED);
        } catch(Exception e) {
            return new ResponseEntity<>(e.getCause().getMessage(), 
                getHeaders(), HttpStatus.UNPROCESSABLE_ENTITY);
        }
    }
    
    @Transactional
    @PutMapping("/rest/material-aprendizagem")
    public ResponseEntity<String> updateFromJson(
            @RequestBody final MaterialAprendizagem materialAprendizagem, 
            final HttpSession session) {
        try {
            dadoService.setSessionAuditoria();
            Usuario usuarioAtual = UserSession.getUser();
            
            if(usuarioAtual.getCodigo().equals(materialAprendizagem.getUsuario().getCodigo())) {
                materialAprendizagemService.save(materialAprendizagem);
                return new ResponseEntity<>(getHeaders(), HttpStatus.ACCEPTED);
            } else {
                return new ResponseEntity<>(getHeaders(), HttpStatus.UNAUTHORIZED);
            }
        } catch(Exception e) {
            return new ResponseEntity<>(e.getCause().getMessage(), 
                getHeaders(), HttpStatus.UNPROCESSABLE_ENTITY);
        }
    }

    @Transactional
    @DeleteMapping("/rest/material-aprendizagem/{codigo}")
    public ResponseEntity<String> deleteFromJson(
            @PathVariable("codigo") final String codigo, 
            final HttpSession session) {
        try {
            dadoService.setSessionAuditoria();
            Usuario usuarioAtual = UserSession.getUser();
            MaterialAprendizagem materialAprendizagem = 
                materialAprendizagemService.selectByPrimaryKey(
                    usuarioAtual, 
                    new MaterialAprendizagem(codigo)
                );
            
            if(usuarioAtual.getCodigo().equals(materialAprendizagem.getUsuario().getCodigo())) {
                materialAprendizagemService.delete(materialAprendizagem);
                return new ResponseEntity<>(getHeaders(), HttpStatus.ACCEPTED);
            } else {
                return new ResponseEntity<>(getHeaders(), HttpStatus.UNAUTHORIZED);
            }
        } catch(Exception e) {
            return new ResponseEntity<>(e.getCause().getMessage(), 
                getHeaders(), HttpStatus.UNPROCESSABLE_ENTITY);
        }
    }

    @PostMapping("/rest/material/adicionar-arquivo")
    public ResponseEntity<Map<String,String>> adicionarMaterialComArquivo(
            @ModelAttribute MaterialAprendizagemRequest materialAprendizagem) {
        try {
            String codigoMaterial = materialAprendizagemService.adicionarMaterial(materialAprendizagem);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .headers(getHeaders())
                    .body(Map.of("codigo", codigoMaterial));
        } catch (Exception e) {
            logger.error("Erro ao adicionar material com arquivo: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body(Map.of("erro", "Falha ao adicionar material"));
        }
    }
}
5. Search (Filtros de Pesquisa)
Localização: src/main/java/com/exitus/educ/academico/search/

Padrões
Nome: [Entidade]Search (ex: MaterialSearch)
Tipo: Java Record (imutável)
Uso: Encapsular parâmetros de busca complexos
Exemplo
package com.exitus.educ.academico.search;

public record EntidadeSearch(
    String pesquisa,
    Integer pagina,
    Integer totalRegistros,
    String filtroAdicional
) {}
Exemplo Real: MaterialSearch
package com.exitus.educ.academico.search;

public record MaterialSearch(
    String pesquisa,
    Integer pagina,
    Integer totalRegistros,
    Boolean arquivado,
    String codigoDisciplina,
    Integer numeroAula,
    String etapa,
    Boolean enviado
) {}
6. Padrões de Banco de Dados
Nomenclatura de Schemas
aprendizagem - Dados relacionados ao conteúdo pedagógico
seguranca - Autenticação e autorização
auditoria - Logs e trilha de auditoria
Nomenclatura de Funções PostgreSQL
Operação	Padrão	Exemplo
Pesquisar	[tabela]_pesquisar	material_aprendizagem_pesquisar
Inserir	[tabela]_inserir	material_aprendizagem_inserir
Atualizar	[tabela]_atualizar	material_aprendizagem_atualizar
Excluir	[tabela]_excluir	material_aprendizagem_excluir
Parâmetros de Funções
Sempre usar nomenclatura com prefixo p_: p_usuario, p_codigo, p_pesquisa
Usar tipo uuid explicitamente quando necessário
JSONB para dados estruturados flexíveis
7. Resumo das Convenções
Nomenclatura
Packages: lowercase sem separadores (academico, controller)
Classes: PascalCase (MaterialAprendizagem, MaterialAprendizagemService)
Métodos/Variáveis: camelCase (selectByPrimaryKey, usuarioAtual)
Constantes: UPPER_SNAKE_CASE (MAX_UPLOAD_SIZE)
Organização de Código
Anotações de classe
Constantes estáticas
Logger
Atributos injetados (@Autowired)
Atributos privados
Construtores
Métodos públicos
Métodos privados
Overrides (equals, hashCode, toString)
Boas Práticas
Sempre logar operações importantes e erros
Tratamento de exceções em todas as camadas
Validação de nulos e autorizações de usuário
Usar @Transactional em operações de escrita (POST, PUT, DELETE)
Documentar métodos complexos com comentários
Converter UUIDs nas bordas do sistema (Controller/Service)
Não expor exceções internas ao cliente
Padrões de Retorno
Service: Retorna entidades ou listas
Mapper: Retorna String para operações de escrita, entidades para leitura
Controller: Retorna ResponseEntity<T> com status HTTP apropriado
8. Exemplo Completo: Nova Entidade
Para criar uma nova entidade chamada Tarefa, seguir esta estrutura:

8.1. Model
// src/main/java/com/exitus/educ/academico/model/Tarefa.java
package com.exitus.educ.academico.model;

import java.util.Date;
import org.apache.commons.lang3.builder.*;
import com.exitus.educ.seguranca.model.Usuario;

public class Tarefa {
    
    private String codigo;
    private String titulo;
    private String descricao;
    private Date dataVencimento;
    private Boolean concluida;
    private Usuario usuario;
    private Integer totalRegistros;
    
    public Tarefa() {}
    
    public Tarefa(String codigo) {
        this.codigo = codigo;
    }
    
    // Getters e Setters...
    
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
8.2. Mapper
// src/main/java/com/exitus/educ/academico/mapper/TarefaMapper.java
package com.exitus.educ.academico.mapper;

import com.exitus.educ.academico.model.Tarefa;
import org.apache.ibatis.annotations.*;
import java.util.List;
import java.util.UUID;

@Mapper
public interface TarefaMapper {

    //Função para pesquisar dados de uma tarefa
    @Select("SELECT * FROM academico.tarefa_pesquisar("
        + "p_usuario := #{usuario}, "
        + "p_codigo := #{codigo}"
    + ")")
    @Results(id = "TarefaMap", value = {
        @Result(property = "codigo", column = "codigo"),
        @Result(property = "titulo", column = "titulo"),
        @Result(property = "descricao", column = "descricao"),
        @Result(property = "dataVencimento", column = "data_vencimento"),
        @Result(property = "concluida", column = "concluida"),
        @Result(property = "usuario.codigo", column = "usuario_codigo"),
        @Result(property = "totalRegistros", column = "total_linhas")
    })
    Tarefa selectByPrimaryKey(
        @Param("usuario") UUID usuario,
        @Param("codigo") UUID codigo
    );

    //Função para pesquisar as tarefas que o usuário tem acesso
    @Select("SELECT COUNT(*) OVER () AS total_linhas, * FROM academico.tarefa_pesquisar("
        + "p_usuario := #{usuario}, "
        + "p_pesquisa := #{pesquisa}, "
        + "p_concluida := #{concluida}"
    + ") offset #{pagina} limit #{limite}")
    @ResultMap("TarefaMap")
    List<Tarefa> selectEntries(
        @Param("usuario") UUID usuario,
        @Param("pesquisa") String pesquisa,
        @Param("concluida") Boolean concluida,
        @Param("pagina") Integer pagina,
        @Param("limite") Integer limite
    );

    //Função para cadastrar nova tarefa
    @Select("SELECT academico.tarefa_inserir("
        + "#{titulo}, "
        + "#{descricao}, "
        + "#{dataVencimento}, "
        + "#{usuario.codigo}::uuid"
    + ")")
    @Options(useGeneratedKeys = false)
    String insert(Tarefa tarefa);

    //Função para atualizar tarefa
    @Select("SELECT academico.tarefa_atualizar("
        + "#{codigo}::uuid, "
        + "#{titulo}, "
        + "#{descricao}, "
        + "#{dataVencimento}, "
        + "#{concluida}"
    + ")")
    String updateFull(Tarefa tarefa);

    //Função para excluir tarefa
    @Select("SELECT academico.tarefa_excluir(#{codigo})")
    String delete(@Param("codigo") UUID codigo);
}
8.3. Search
// src/main/java/com/exitus/educ/academico/search/TarefaSearch.java
package com.exitus.educ.academico.search;

public record TarefaSearch(
    String pesquisa,
    Boolean concluida,
    Integer pagina,
    Integer totalRegistros
) {}
8.4. Service
// src/main/java/com/exitus/educ/academico/service/TarefaService.java
package com.exitus.educ.academico.service;

import com.exitus.educ.academico.mapper.TarefaMapper;
import com.exitus.educ.academico.model.Tarefa;
import com.exitus.educ.academico.search.TarefaSearch;
import com.exitus.educ.controller.WebUtil;
import com.exitus.educ.seguranca.model.Usuario;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service("tarefaService")
public class TarefaService {

    private static final Logger logger = LoggerFactory.getLogger(TarefaService.class);

    @Autowired
    private TarefaMapper mapper;

    public Tarefa selectByPrimaryKey(Usuario usuarioAtual, Tarefa tarefa) {
        UUID usuario = usuarioAtual.getCodigo() != null 
            ? UUID.fromString(usuarioAtual.getCodigo()) 
            : null;
        UUID codigo = tarefa.getCodigo() != null 
            ? UUID.fromString(tarefa.getCodigo()) 
            : null;
        
        return mapper.selectByPrimaryKey(usuario, codigo);
    }

    public List<Tarefa> selectEntries(TarefaSearch search, Usuario usuarioAtual) {
        UUID usuario = usuarioAtual.getCodigo() != null 
            ? UUID.fromString(usuarioAtual.getCodigo()) 
            : null;
        String pesquisa = WebUtil.nullIfBlank(search.pesquisa());
        Boolean concluida = search.concluida();
        Integer limite = search.totalRegistros();
        Integer pagina = limite * (search.pagina() - 1);
        
        return mapper.selectEntries(usuario, pesquisa, concluida, pagina, limite);
    }

    public String save(Tarefa tarefa) {
        if (tarefa.getCodigo() == null) {
            return mapper.insert(tarefa);
        } else {
            return mapper.updateFull(tarefa);
        }
    }

    public String delete(Tarefa tarefa) {
        UUID codigo = tarefa.getCodigo() != null 
            ? UUID.fromString(tarefa.getCodigo()) 
            : null;
        return mapper.delete(codigo);
    }
}
8.5. Controller
// src/main/java/com/exitus/educ/academico/controller/TarefaController.java
package com.exitus.educ.academico.controller;

import com.exitus.educ.academico.model.Tarefa;
import com.exitus.educ.academico.search.TarefaSearch;
import com.exitus.educ.academico.service.TarefaService;
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
public class TarefaController extends GenericController<Tarefa> {

    private static final Logger logger = LoggerFactory.getLogger(TarefaController.class);

    @Autowired
    TarefaService service;

    @Autowired
    private DadoService dadoService;

    @GetMapping("/rest/tarefa/{codigo}")
    public ResponseEntity<Tarefa> showJson(
            @PathVariable("codigo") String codigo, 
            final HttpSession session) {
        
        Usuario usuarioAtual = UserSession.getUser();
        Tarefa tarefa = service.selectByPrimaryKey(usuarioAtual, new Tarefa(codigo));
        
        return tarefa == null 
            ? new ResponseEntity<>(getHeaders(), HttpStatus.NOT_FOUND)
            : new ResponseEntity<>(tarefa, getHeaders(), HttpStatus.OK);
    }

    @PostMapping("/rest/tarefa/search")
    @ResponseBody
    public ResponseEntity<List<Tarefa>> listJson(
            @RequestBody TarefaSearch search, 
            final HttpSession session) {
        
        Usuario usuarioAtual = UserSession.getUser();
        List<Tarefa> lista = service.selectEntries(search, usuarioAtual);
        
        return lista == null 
            ? new ResponseEntity<>(getHeaders(), HttpStatus.NOT_FOUND)
            : new ResponseEntity<>(lista, getHeaders(), HttpStatus.OK);
    }

    @Transactional
    @PostMapping("/rest/tarefa")
    public ResponseEntity<String> createFromJson(
            @RequestBody final Tarefa tarefa, 
            final HttpSession session) {
        try {
            dadoService.setSessionAuditoria();
            Usuario usuarioAtual = UserSession.getUser();
            
            tarefa.setUsuario(usuarioAtual);
            service.save(tarefa);
            
            return new ResponseEntity<>(getHeaders(), HttpStatus.CREATED);
        } catch(Exception e) {
            return new ResponseEntity<>(e.getCause().getMessage(), 
                getHeaders(), HttpStatus.UNPROCESSABLE_ENTITY);
        }
    }

    @Transactional
    @PutMapping("/rest/tarefa")
    public ResponseEntity<String> updateFromJson(
            @RequestBody final Tarefa tarefa, 
            final HttpSession session) {
        try {
            dadoService.setSessionAuditoria();
            Usuario usuarioAtual = UserSession.getUser();
            
            if(!usuarioAtual.getCodigo().equals(tarefa.getUsuario().getCodigo())) {
                return new ResponseEntity<>(getHeaders(), HttpStatus.UNAUTHORIZED);
            }
            
            service.save(tarefa);
            return new ResponseEntity<>(getHeaders(), HttpStatus.ACCEPTED);
        } catch(Exception e) {
            return new ResponseEntity<>(e.getCause().getMessage(), 
                getHeaders(), HttpStatus.UNPROCESSABLE_ENTITY);
        }
    }

    @Transactional
    @DeleteMapping("/rest/tarefa/{codigo}")
    public ResponseEntity<String> deleteFromJson(
            @PathVariable("codigo") final String codigo, 
            final HttpSession session) {
        try {
            dadoService.setSessionAuditoria();
            Usuario usuarioAtual = UserSession.getUser();
            
            Tarefa tarefa = service.selectByPrimaryKey(
                usuarioAtual, 
                new Tarefa(codigo)
            );
            
            if(!usuarioAtual.getCodigo().equals(tarefa.getUsuario().getCodigo())) {
                return new ResponseEntity<>(getHeaders(), HttpStatus.UNAUTHORIZED);
            }
            
            service.delete(tarefa);
            return new ResponseEntity<>(getHeaders(), HttpStatus.ACCEPTED);
        } catch(Exception e) {
            return new ResponseEntity<>(e.getCause().getMessage(), 
                getHeaders(), HttpStatus.UNPROCESSABLE_ENTITY);
        }
    }
}
9. Checklist para Nova Entidade
Criar Model em model/
Criar Mapper em mapper/
Criar Search (Record) em search/
Criar Service em service/
Criar Controller em controller/
Criar funções PostgreSQL no banco
Testar endpoints via Postman/Swagger
Validar segurança e autorizações
Adicionar logs apropriados
Documentar APIs no Swagger
10. Tecnologias Utilizadas
Framework: Spring Boot 3.x
ORM: MyBatis
Banco de Dados: PostgreSQL
Segurança: Spring Security + OAuth2
Logger: SLF4J + Logback
Utilities: Apache Commons Lang3
Serialização: Jackson
Documentação: Swagger/OpenAPI
Versão: 1.0
Última Atualização: 2025-12-03