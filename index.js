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

// Buscar repositórios com paginação e filtro
const fetchRepositories = async (user, language, per_page=5, page=1) => {
  let repositories = [];
  let page = 1;
  let total_repositories = per_page * page

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

    const startIndex = per_page * (page - 1);
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

  // Validação dos parâmetros, language é opcional
  if (!user) {
    return res.status(400).json({ error: "The 'user' parameter is required in the query." });
  }

  try {
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
