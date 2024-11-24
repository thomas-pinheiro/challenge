import "dotenv/config";
import express from "express";
import { Octokit } from "@octokit/core";

// Configurações da aplicação
const PORT = process.env.PORT || 3000;
const app = express();

// Classe de erro personalizada para HTTP
class HttpError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'HttpError';
  }
}

// Middleware para verificar o header Authorization
const checkAuthorization = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'Token is missing in Authorization header' });
  }

  req.token = authHeader

  next();
};

// Função de validação de parâmetros
const validateQueryParams = (params) => {
  const paramConfigs = [
    { name: 'user', type: 'string', required: true },
    { name: 'language', type: 'string', required: false },
    { name: 'per_page', type: 'integer', required: false, maxValue: 10 },
    { name: 'page', type: 'integer', required: false },
    { name: 'archived', type: 'boolean', required: false },
  ];

  paramConfigs.forEach(paramConfig => {
    const param = params[paramConfig.name];
    if (paramConfig.required && !param) {
      throw new HttpError(`${paramConfig.name} is required.`, 400);
    }

    if (param) {
      if (paramConfig.type === 'string' && typeof param !== 'string') {
        throw new HttpError(`${paramConfig.name} must be a string.`, 400);
      }
      if (paramConfig.type === 'integer' && (!Number.isInteger(Number(param)) || Number(param) <= 0)) {
        throw new HttpError(`${paramConfig.name} must be a positive integer.`, 400);
      }
      if (paramConfig.maxValue && Number(param) > paramConfig.maxValue) {
        throw new HttpError(`${paramConfig.name} cannot exceed ${paramConfig.maxValue}.`, 400);
      }
      if (paramConfig.type === 'boolean') {
        if (param !== 'true' && param !== 'false') {
          throw new HttpError(`${paramConfig.name} must be 'true' or 'false'.`, 400);
        }
        // Converte para booleano
        params[paramConfig.name] = param === 'true'; 
      }
    }
  });
};

// Buscar repositórios com paginação e filtro
const fetchRepositories = async (token, user, language, archived = null, per_page = 5, user_page = 1) => {
  let repositories = [];
  let page = 1;
  let total_repositories = per_page * user_page;

  try {
    const octokit = new Octokit({ auth: token });

    while (repositories.length < total_repositories) {
      const { data } = await octokit.request("GET /users/{user}/repos", {
        user: user,
        headers: { "X-GitHub-Api-Version": "2022-11-28" },
        per_page: 100,
        page,
      });

      const filtered = data.filter((repo) => {
        // Verifica se a linguagem é compativel (se fornecida)
        const languageMatch = language ? repo.language?.toLowerCase() === language.toLowerCase() : true;

        // Se 'archived' foi fornecido, filtra os repositórios com base nesse valor
        const archivedMatch = archived !== null ? repo.archived === Boolean(archived) : !repo.archived;

        return languageMatch && archivedMatch;
      });

      repositories = [...repositories, ...filtered];

      if (data.length < 100) break; // Quando houver menos itens que o máximo da página (100), não haverá páginas seguintes.
      page++;
    }

    const startIndex = per_page * (user_page - 1);
    const endIndex = startIndex + per_page;

    return repositories.slice(startIndex, endIndex);
  } catch (error) {
    console.error(`Error fetching repositories: ${error.message}`);
    if (error.response) {
      throw new HttpError(`GitHub API returned an error: ${error.response.status}`, error.response.status);
    }
    throw new HttpError("Failed to fetch repositories from GitHub", 500);
  }
};

// Rota principal
app.get("/repos", checkAuthorization, async (req, res) => {
  const { user, language, per_page, page, archived } = req.query;
  const token = req.token;

  try {
    validateQueryParams(req.query);

    const repositories = await fetchRepositories(token, user, language, archived, per_page, page);

    res.status(200).json({
      success: true,
      data: repositories,
    });

  } catch (error) {
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
});

// Capturar rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
