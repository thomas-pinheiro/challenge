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
  const authHeader = req.headers['Authorization'];

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
    }
  });
};

// Buscar repositórios com paginação e filtro
const fetchRepositories = async (token, user, language, per_page = 5, user_page = 1) => {
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

      const filtered = data.filter((repo) =>
        language ? repo.language?.toLowerCase() === language.toLowerCase() : true
      );

      repositories = [...repositories, ...filtered];

      if (data.length < 100) break; // Quando houver menos itens que o máximo, logo não há páginas seguintes.
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
  const { user, language, per_page, page } = req.query;
  const token = req.token;

  try {
    validateQueryParams(req.query);

    const repositories = await fetchRepositories(token, user, language, per_page, page);
    
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
