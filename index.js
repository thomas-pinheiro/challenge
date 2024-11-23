import "dotenv/config";
import express from "express";
import { Octokit } from "@octokit/core";

// Configurações da aplicação
const PORT = process.env.PORT || 3000;
const app = express();

// Inicializar Octokit com validação de token
if (!process.env.GITHUB_TOKEN) {
  console.error("Error: Missing GITHUB_TOKEN in environment variables.");
  process.exit(1);
}

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Classe de erro personalizada para HTTP
class HttpError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'HttpError';
  }
}

// Função para validar um único parâmetro
const validateSingleParam = (param, paramConfig) => {
  const { name, type, required, maxValue } = paramConfig;

  if (required && !param) {
    throw new HttpError(`${name} is required.`, 400); // Erro 400 se o parâmetro for obrigatório e não fornecido
  }

  if (param) {
    if (type === 'string' && typeof param !== 'string') {
      throw new HttpError(`${name} must be a string.`, 400); // Erro 400 se o tipo estiver errado
    }
    if (type === 'integer' && (!Number.isInteger(Number(param)) || Number(param) <= 0)) {
      throw new HttpError(`${name} must be a positive integer.`, 400); // Erro 400 para valores inválidos
    }
    if (maxValue && Number(param) > maxValue) {
      throw new HttpError(`${name} cannot exceed ${maxValue}.`, 400); // Erro 400 para valores acima do limite
    }
  }
};

// Função para validar todos os parâmetros da query
const validateQueryParams = (params) => {
  const paramConfigs = [
    { name: 'user', type: 'string', required: true },
    { name: 'language', type: 'string', required: false },
    { name: 'per_page', type: 'integer', required: false, maxValue: 10 },
    { name: 'page', type: 'integer', required: false },
  ];

  paramConfigs.forEach(paramConfig => {
    validateSingleParam(params[paramConfig.name], paramConfig);
  });
};

// Buscar repositórios com paginação e filtro
const fetchRepositories = async (user, language, per_page = 5, user_page = 1) => {
  let repositories = [];
  let page = 1;
  let total_repositories = per_page * user_page;

  try {
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
    throw new HttpError("Failed to fetch repositories from GitHub", 500); // Erro 500 se ocorrer falha no GitHub
  }
};

// Rota principal
app.get("/repos", async (req, res) => {
  const { user, language, per_page, page } = req.query;

  try {
    validateQueryParams(req.query);

    const repositories = await fetchRepositories(user, language, per_page, page);
    res.json(repositories);
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
