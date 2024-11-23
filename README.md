# API para Buscar Repositórios do GitHub

Esta API permite buscar repositórios de um usuário no GitHub com a possibilidade de filtrar por linguagem de programação. Ela utiliza o `Octokit` da GitHub para interagir com a API do GitHub e exibe até 5 repositórios, com suporte a paginação.

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
3. **Definir Variáveis de Ambiente**:
Crie um arquivo .env na raiz do projeto e defina o token do GitHub da seguinte forma:

```
GITHUB_TOKEN=seu_token_do_github
PORT=3000
```
Você pode obter um GitHub Token através do GitHub.

4. **Iniciar o Servidor**
Para iniciar o servidor, execute:

```
npm start
```
A API estará disponível em http://localhost:3000.

## Como funciona?
A API se autentica com o GitHub utilizando um token de acesso pessoal (GITHUB_TOKEN).

Ao acessar o endpoint `/repos`, a aplicação busca até 5 repositórios públicos de um usuário do GitHub. Caso um filtro de linguagem seja passado, ele é aplicado para retornar apenas repositórios com a linguagem especificada.

A API retorna informações sobre os repositórios, como nome, descrição, linguagem, avatar, link para o repositório no GitHub e mais.

## Endpoint

`
GET /repos
`

Este endpoint retorna uma lista de até 5 repositórios de uma organização do GitHub. Você pode passar parâmetros para filtrar os repositórios por linguagem de programação.

| Parâmetro  | Tipo    | Descrição                                                                 |
| :--------- | :------ | :------------------------------------------------------------------------ |
| `user`     | `string` | **Obrigatório**. Nome de usuário ou organização do GitHub a ser consultado. |
| `language` | `string` | Opcional. Linguagem de programação para filtrar os repositórios. Se não fornecido, retornará repositórios de qualquer linguagem. |
| `per_page` | `integer` | Opcional. Opcional. Define o número de repositórios a serem retornados por página. O valor padrão é 5. Máximo permitido: 10. |
| `page` | `integer` | Opcional. Indica o número da página de resultados que você deseja retornar. O valor padrão é 1. |


#### Exemplo de requisição:
```
curl --location 'http://localhost:3000/repos?user=fulano&language=javascript'
```
#### Exemplo de resposta:

```
[
  {
    "id": 801331837,
    "node_id": "R_kgDOL8Naff",
    "name": "sos-rs",
    "full_name": "thomas-pinheiro/sos-rs",
    "private": false,
    "language": "JavaScript"
    ...
  },
  {
    "id": 801331838,
    "node_id": "R_kgDOL8Nafr",
    "name": "sos-rs",
    "full_name": "thomas-pinheiro/other",
    "private": false,
    "language": "Python"
    ...
  },
  ...
]
```

## Erros:
- `400` Bad Request: Se o parâmetro user não for fornecido.
- `500` Internal Server Error: Se ocorrer um erro ao buscar os repositórios do GitHub.

