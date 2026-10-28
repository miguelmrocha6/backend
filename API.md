# Documentacao da API

Este arquivo descreve os endpoints atualmente implementados pelo backend Express e Prisma.

## 1. Executar e acessar

A API usa MySQL. Configure a conexao no arquivo `.env` usando `DATABASE_URL` ou as variaveis `DB_HOST`, `DB_USER`, `DB_PASSWORD` e `DB_NAME` (opcionalmente `DB_PORT`). O exemplo de configuracao fica em `.env.example`.

```bash
npm install
npm run prisma:generate
npm start
```

O servidor usa a porta definida em `PORT`; se ela nao estiver configurada, usa `5000`. Com a configuracao padrao, a base e `http://localhost:5000`. Para desenvolvimento, use `npm run dev`.

A rota `GET /` entrega a pagina HTML inicial. As rotas de dados estao descritas abaixo.

## 2. Sintaxe basica

- Envie e receba dados no formato JSON.
- Para criar ou atualizar registros, envie `Content-Type: application/json`.
- Os endpoints nao usam parametros de consulta (`?campo=valor`) para filtrar ou paginar. `GET /recurso` lista todos os registros.
- `:id` representa o identificador numerico do registro. Exemplo: `/cliente/12`.
- Campos nao listados para um recurso nao podem ser enviados no corpo. IDs e campos de auditoria, como `criado_em` e `atualizado_em`, sao gerados ou gerenciados pelo banco e nao fazem parte dos campos aceitos pela API.

Exemplo de chamada HTTP:

```http
POST /cliente
Content-Type: application/json

{
  "nome": "Ana Silva",
  "email": "ana@example.com",
  "contato": "11999990000",
  "ativo": true
}
```

### Operacoes CRUD disponiveis

Todos os recursos abaixo usam os mesmos metodos:

| Metodo | Caminho | O que faz |
| --- | --- | --- |
| `GET` | `/recurso` | Lista todos os registros. |
| `GET` | `/recurso/:id` | Busca um registro pelo ID. |
| `POST` | `/recurso` | Cria um registro. |
| `PATCH` | `/recurso/:id` | Atualiza somente os campos enviados. |
| `DELETE` | `/recurso/:id` | Remove um registro. |

Exemplo para atualizar apenas o telefone de um funcionario:

```http
PATCH /funcionario/3
Content-Type: application/json

{
  "telefone": "11988887777"
}
```

`PATCH` exige pelo menos um campo, mas nao exige que todos os campos obrigatorios de criacao sejam reenviados. Para booleanos, a API aceita `true`, `false`, `1`, `0`, `"true"`, `"false"`, `"1"` ou `"0"`. Campos inteiros devem ser numeros inteiros; campos decimais devem ser numeros validos. Datas devem ser valores que o JavaScript consiga interpretar, preferencialmente no formato `YYYY-MM-DD`.

## 3. Recursos e campos

A coluna **Obrigatorio no POST** reflete a validacao feita pela API na criacao. `Sim` significa que o campo deve ser enviado. Campos opcionais podem ser omitidos. A nulabilidade tambem depende do schema do banco; erros de incompatibilidade podem ser retornados como erro interno.

### Clientes

Base: `/cliente`  
Resposta de listagem/busca: propriedade `clientes`.

| Campo | Tipo | Obrigatorio no POST | Descricao |
| --- | --- | --- | --- |
| `nome` | texto | Sim | Nome do cliente. |
| `email` | texto | Sim | Email do cliente; deve ser unico. |
| `contato` | texto | Nao | Telefone ou outro contato. |
| `ativo` | booleano | Nao | Indica se o cadastro esta ativo; o banco usa `true` por padrao. |

Exemplo de criacao:

```json
{
  "nome": "Ana Silva",
  "email": "ana@example.com",
  "contato": "11999990000",
  "ativo": true
}
```

### Usuarios

Base: `/usuario`  
Resposta de listagem/busca: propriedade `usuario`.

| Campo | Tipo | Obrigatorio no POST | Descricao |
| --- | --- | --- | --- |
| `nome` | texto | Sim | Nome do usuario. |
| `email` | texto | Sim | Email unico do usuario. |
| `senha` | texto | Sim | Senha recebida no cadastro. |
| `contato` | texto | Nao | Telefone ou outro contato. |
| `genero` | texto de 1 caractere | Nao | Genero conforme convencao adotada pela aplicacao. |
| `ativo` | booleano | Nao | Indica se o usuario esta ativo; o banco usa `true` por padrao. |

Exemplo de criacao:

```json
{
  "nome": "Joao Souza",
  "email": "joao@example.com",
  "senha": "minha-senha",
  "contato": "11999990000",
  "genero": "M",
  "ativo": true
}
```

As consultas de usuarios nao incluem o campo `senha` nas respostas. A API descrita aqui nao implementa autenticacao ou validacao de senha.

### Funcionarios

Base: `/funcionario`  
Resposta: propriedade `funcionarios`.

| Campo | Tipo | Obrigatorio no POST | Descricao |
| --- | --- | --- | --- |
| `nome` | texto | Sim | Nome do funcionario. |
| `cargo` | texto | Sim | Cargo ou funcao. |
| `salario` | numero decimal | Sim | Salario. |
| `telefone` | texto | Nao | Telefone de contato. |
| `email` | texto | Nao | Email de contato. |
| `data_admissao` | data | Nao | Data de admissao. |
| `ativo` | booleano | Nao | Situacao do cadastro; o banco usa `true` por padrao. |

### Fornecedores

Base: `/fornecedores`  
Resposta: propriedade `fornecedores`.

| Campo | Tipo | Obrigatorio no POST | Descricao |
| --- | --- | --- | --- |
| `nome` | texto | Sim | Nome do fornecedor. |
| `empresa` | texto | Nao | Empresa associada. |
| `email` | texto | Nao | Email; quando informado, deve ser unico. |
| `telefone` | texto | Nao | Telefone de contato. |
| `cidade` | texto | Nao | Cidade do fornecedor. |
| `estado` | texto de 2 caracteres | Nao | Sigla do estado. |
| `ativo` | booleano | Nao | Situacao do cadastro; o banco usa `true` por padrao. |

### Produtos

Base: `/produto`  
Resposta: propriedade `produtos`.

| Campo | Tipo | Obrigatorio no POST | Descricao |
| --- | --- | --- | --- |
| `nome` | texto | Nao | Nome do produto. |
| `descricao` | texto | Sim | Descricao do produto. |
| `preco` | numero decimal | Sim | Preco atual. |
| `imagem_produto` | texto | Sim | Caminho ou endereco da imagem do produto. |

### Entradas de estoque

Base: `/entrada`  
Resposta: propriedade `entradas`.

| Campo | Tipo | Obrigatorio no POST | Descricao |
| --- | --- | --- | --- |
| `id_produto` | inteiro | Sim | ID de um produto existente. |
| `id_fornecedor` | inteiro | Sim | ID de um fornecedor existente. |
| `quantidade` | inteiro | Sim | Quantidade recebida. |
| `valor_unitario` | numero decimal | Sim | Valor por unidade. |
| `data_entrada` | data | Nao | Data de entrada. |
| `observacao` | texto | Nao | Observacao de ate 200 caracteres. |

Exemplo de criacao:

```json
{
  "id_produto": 4,
  "id_fornecedor": 2,
  "quantidade": 15,
  "valor_unitario": 12.5,
  "data_entrada": "2026-10-22",
  "observacao": "Reposicao de estoque"
}
```

### Saidas de estoque

Base: `/saida`  
Resposta: propriedade `saidas`.

| Campo | Tipo | Obrigatorio no POST | Descricao |
| --- | --- | --- | --- |
| `id_produto` | inteiro | Sim | ID de um produto existente. |
| `id_funcionario` | inteiro | Sim | ID de um funcionario existente. |
| `quantidade` | inteiro | Sim | Quantidade retirada. |
| `valor_unitario` | numero decimal | Sim | Valor por unidade. |
| `data_saida` | data | Nao | Data da saida. |
| `destino` | texto | Nao | Destino ou finalidade da saida. |

### Pedidos

Base: `/pedidos`  
Resposta: propriedade `pedidos`.

| Campo | Tipo | Obrigatorio no POST | Descricao |
| --- | --- | --- | --- |
| `status` | booleano | Nao | Situacao do pedido; o banco usa `true` por padrao. |
| `data_pedido` | data | Nao | Data do pedido. |
| `id_cliente` | inteiro | Nao | ID do cliente associado. |

Exemplo de criacao:

```json
{
  "status": true,
  "data_pedido": "2026-10-22",
  "id_cliente": 1
}
```

### Historico de precos

Base: `/historico-de-precos`  
Resposta: propriedade `historico_de_precos`.

| Campo | Tipo | Obrigatorio no POST | Descricao |
| --- | --- | --- | --- |
| `id_produto` | inteiro | Nao | ID do produto associado. |
| `preco` | numero decimal | Nao | Preco registrado. |
| `vigencia` | data | Nao | Data de vigencia do preco. |

### Logs

Base: `/logs`  
Resposta: propriedade `logs`.

| Campo | Tipo | Obrigatorio no POST | Descricao |
| --- | --- | --- | --- |
| `usuarios` | texto | Nao | Usuario relacionado ao evento. |
| `tabela_afetada` | texto | Nao | Nome da tabela afetada. |
| `acao` | texto | Nao | Acao registrada. |
| `registro` | inteiro | Nao | Identificador do registro afetado. |
| `data_hora` | data e hora | Nao | Momento do evento. |

## 4. Formato das respostas

Uma listagem retorna HTTP `200` com uma propriedade cujo nome depende do recurso e um array de registros:

```json
{
  "clientes": [
    {
      "id_cliente": 1,
      "nome": "Ana Silva",
      "email": "ana@example.com",
      "contato": "11999990000",
      "ativo": true
    }
  ]
}
```

A busca por ID tambem retorna um array, com zero ou um registro; se nao encontrar, responde `404`:

```json
{
  "clientes": [
    {
      "id_cliente": 1,
      "nome": "Ana Silva",
      "email": "ana@example.com"
    }
  ]
}
```

Criacao responde `201` e retorna uma mensagem e o ID criado. Atualizacao e remocao respondem `200` com uma mensagem de sucesso.

```json
{
  "mensagem": "Registro criado com sucesso.",
  "id_cliente": 1
}
```

## 5. Erros comuns

Os erros seguem o formato abaixo:

```json
{
  "erro": {
    "mensagem": "Descricao do erro"
  }
}
```

- `400 Bad Request`: ID invalido, JSON em formato incorreto, campo nao permitido, campo obrigatorio ausente, tipo de valor invalido ou corpo vazio em criacao/atualizacao.
- `404 Not Found`: rota ou registro inexistente.
- `409 Conflict`: valor unico duplicado ou operacao que viola um relacionamento do banco, por exemplo, remover um registro ainda referenciado.
- `500 Internal Server Error`: erro inesperado ou falha nao tratada pelo backend.

## 6. Observacoes

- O CORS esta habilitado para qualquer origem (`*`) e permite `GET`, `POST`, `PUT`, `PATCH`, `DELETE` e `OPTIONS`. Apesar de `PUT` ser permitido pelo CORS, nao ha endpoint `PUT` implementado; use `PATCH` para atualizar.
- As rotas atuais nao possuem autenticacao nem autorizacao.
- Os campos `id_*` identificadores do proprio recurso sao gerados pelo banco e nao sao aceitos no corpo de criacao. IDs de relacionamento, como `id_produto`, devem apontar para registros existentes.
