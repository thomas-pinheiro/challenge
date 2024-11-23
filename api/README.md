# API para Buscar Repositórios do GitHub

Esta API permite buscar repositórios de um usuário no GitHub com a possibilidade de filtrar por linguagem de programação. Ela utiliza o `Octokit` da GitHub para interagir com a API do GitHub e exibe de 5 até 10 repositórios, com suporte a paginação.

## Requisitos

Antes de rodar a aplicação, você precisa garantir que tem as seguintes dependências instaladas:

- [Node.js](https://nodejs.org/)
- [GitHub Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-personal-access-token-classic) para autenticação via Octokit.

## Instalação

1. **Clone o repositório**:

```
 git clone https://github.com/thomas-pinheiro/challenge.git
```

2. **Instale as dependências do projeto**:

```
npm install
```

3. **Iniciar o Servidor**
   Para iniciar o servidor, execute:

```
npm start
```

A API estará disponível em http://localhost:3000.

4. **Deploy**

Você pode realizar o deploy em [Railway](https://railway.com/) conectando com o seu repositório do Github.

## Como funciona?

A autenticação da API é realizada por meio de um token de acesso pessoal, que deve ser incluído no cabeçalho `Authorization` (Header) da requisição.

Ao acessar o endpoint `/repos`, a aplicação busca repositórios públicos mais antigos de um usuário ou organização do GitHub. Caso um filtro de linguagem seja passado, ele é aplicado para retornar apenas repositórios com a linguagem especificada.

A API retorna informações sobre os repositórios, como nome, descrição, linguagem, avatar, link para o repositório no GitHub e mais.

## Endpoint

`GET /repos`

Este endpoint retorna uma lista de 5 até 10 repositórios de uma organização ou usuário do GitHub. Você pode passar parâmetros para filtrar os repositórios por linguagem de programação.

#### Cabeçalhos

- Authorization: **Obrigatório**. O cabeçalho `Authorization` deve conter apenas o token de autenticação do GitHub (exemplo: Authorization: <token_do_github>).

#### Parâmetros

| Parâmetro  | Tipo      | Descrição                                                                                                                        |
| :--------- | :-------- | :------------------------------------------------------------------------------------------------------------------------------- |
| `user`     | `string`  | **Obrigatório**. Nome de usuário ou organização do GitHub a ser consultado.                                                      |
| `language` | `string`  | Opcional. Linguagem de programação para filtrar os repositórios. Se não fornecido, retornará repositórios de qualquer linguagem. Exemplo: C# |
| `per_page` | `integer` | Opcional. Opcional. Define o número de repositórios a serem retornados por página. O valor padrão é 5. Máximo permitido: 10.     |
| `page`     | `integer` | Opcional. Indica o número da página de resultados que você deseja retornar. O valor padrão é 1.                                  |

#### Exemplo de requisição:

```
curl --location 'http://localhost:3000/repos?user=fulano&language=javascript&per_page=5&page=1' \
--header 'Authorization: <token_do_github>'
```

#### Exemplo de resposta:

```
{
   "success":true,
   "data":[
      {
         "id":801331837,
         "node_id":"R_kgDOL8Naff",
         "name":"sos-rs",
         "full_name":"thomas-pinheiro/sos-rs",
         "private":false,
         "language":"JavaScript",
         ...
      },
      {
         "id":801331838,
         "node_id":"R_kgDOL8Nafr",
         "name":"other",
         "full_name":"thomas-pinheiro/other",
         "private":false,
         "language":"Python",
         ...
      },
      ...
   ]
}
```

## Erros:

- `400` Bad Request: O parâmetro `user` é obrigatório e deve ser fornecido.
- `401` Unauthorized: O Token de autenticação do GitHub deve ser fornecido no cabeçalho `Authorization`.
- `500` Internal Server Error: Ocorreu um erro ao tentar buscar os repositórios do GitHub ou ao processar a solicitação no servidor da API.