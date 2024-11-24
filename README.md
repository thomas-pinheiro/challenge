# Desafio Técnico - Chatbot Blipper

Olá, bem-vindo ao meu repositório! ✌️

Aqui está o meu trabalho desenvolvido para o desafio técnico Blipper, onde o objetivo foi construir um chatbot na plataforma Blip, integrado com a API pública do GitHub. Esse bot exibe informações sobre os 5 repositórios mais antigos de [github.com/takenet](https://github.com/orgs/takenet/repositories), tudo de forma automatizada e interativa!

## Estrutura do repositório

- `/flow`: Contém o arquivo JSON exportado do Blip Builder, que representa todo o fluxo conversacional do chatbot.
- `/medias`: Aqui estão as imagens que aparecem nos cards do carrossel dos valores.
- `/api`: A API intermediária que desenvolvi para integrar com o GitHub e buscar informações sobre os repositórios. Para hospedar a API, estou usando o [Railway](https://railway.com/), uma plataforma que facilita a implementação conectada com este repositório.

## O que você precisa saber para rodar o projeto

Para garantir que tudo funcione corretamente, existe uma **configuração importante** na plataforma Blip. Você precisa criar uma variável sensível chamada `gitToken`, onde será armazenado o seu token válido da API GitHub. Com isso, a integração entre o chatbot e a API intermediária com GitHub vai funcionar sem problemas!

## Como rodar o projeto

1. Importe o fluxo JSON para o Blip Builder.
2. Configure a variável sensível `gitToken` com um token válido da API GitHub.
3. Pronto! O chatbot estará funcionando e pronto para mostrar os repositórios mais antigos de [github.com/takenet](https://github.com/orgs/takenet/repositories).

---

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

- `Authorization`: **Obrigatório**. O cabeçalho `Authorization` deve conter apenas o token de autenticação do GitHub (exemplo: `Authorization`: `<token_do_github>`).

#### Parâmetros

| Parâmetro  | Tipo      | Descrição                                                                                                                                    |
| :--------- | :-------- | :------------------------------------------------------------------------------------------------------------------------------------------- |
| `user`     | `string`  | **Obrigatório**. Nome de usuário ou organização do GitHub a ser consultado.                                                                  |
| `language` | `string`  | Opcional. Linguagem de programação para filtrar os repositórios. Se não fornecido, retornará repositórios de qualquer linguagem. Exemplo: C# |
| `per_page` | `integer` | Opcional. Opcional. Define o número de repositórios a serem retornados por página. O valor padrão é 5. Máximo permitido: 10.                 |
| `page`     | `integer` | Opcional. Indica o número da página de resultados que você deseja retornar. O valor padrão é 1.                                              |
| `archived`     | `boolean` | Opcional. Indica se deve retornar apenas repositórios arquivados ou não. Aceita `true` ou `false`. Se não fornecido, o filtro será ignorado e retornará tanto repositórios arquivados quanto não arquivados.                                              |

#### Exemplo de requisição

```
curl --location 'http://localhost:3000/repos?user=takenet&language=C%23&per_page=5&page=1&archived=false' \
--header 'Authorization: <token_do_github>'
```

#### Exemplo de resposta

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

## Erros da API

- `400` Bad Request: O parâmetro `user` é obrigatório e deve ser fornecido.
- `401` Unauthorized: O Token de autenticação do GitHub deve ser fornecido no cabeçalho `Authorization`.
- `500` Internal Server Error: Ocorreu um erro ao tentar buscar os repositórios do GitHub ou ao processar a solicitação no servidor da API.
