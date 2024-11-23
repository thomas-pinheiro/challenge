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

// Função para validar um único parâmetro
const validateSingleParam = (param, paramConfig) => {
  const { name, type, required, maxValue } = paramConfig;

  if (required && !param) {
    throw new Error(`${name} is required.`);
  }

  if (param) {
    if (type === 'string' && typeof param !== 'string') {
      throw new Error(`${name} must be a string.`);
    }
    if (type === 'integer' && (!Number.isInteger(Number(param)) || Number(param) <= 0)) {
      throw new Error(`${name} must be a positive integer.`);
    }
    if (maxValue && Number(param) > maxValue) {
      throw new Error(`${name} cannot exceed ${maxValue}.`);
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
const fetchRepositories = async (user, language, per_page=5, user_page=1) => {
  let repositories = [];
  let page = 1;
  let total_repositories = per_page * user_page

  try {
    while (repositories.length < total_repositories) {
      // Pode-se utilizar GET /orgs/{org}/repos que resultaria no mesmo resultado, 
      // diferenciando apenas se houver permissões para visualizar repositórios privados.
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

      if (data.length < 100) break; // Quando houver menos itens que o máximo, logo não há paginas seguintes.
      page++;
    }

    const startIndex = per_page * (user_page - 1);
    const endIndex = startIndex + per_page;

    return repositories.slice(startIndex, endIndex);
  } catch (error) {
    console.error(`Error fetching repositories: ${error.message}`);
    throw new Error("Failed to fetch repositories from GitHub");
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
    res.status(500).json({ error: error.message });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
