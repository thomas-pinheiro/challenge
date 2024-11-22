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

// Utilitário para buscar repositórios com paginação e filtro
const fetchRepositories = async (organization, language) => {
  let repositories = [];
  let page = 1;

  try {
    while (repositories.length < 5) {
      const { data } = await octokit.request("GET /orgs/{org}/repos", {
        org: organization,
        headers: { "X-GitHub-Api-Version": "2022-11-28" },
        per_page: 100,
        page,
      });

      const filtered = data.filter((repo) =>
        language ? repo.language?.toLowerCase() === language.toLowerCase() : true
      );

      repositories = [...repositories, ...filtered];

      if (data.length < 100) break; // Não há mais páginas
      page++;
    }

    return repositories.slice(0, 5);
  } catch (error) {
    console.error(`Error fetching repositories: ${error.message}`);
    throw new Error("Failed to fetch repositories from GitHub");
  }
};

// Rota principal
app.get("/repos", async (req, res) => {
  const { organization, language } = req.query;

  // Validação dos parâmetros
  if (!organization) {
    return res.status(400).json({ error: "Organization is required as a query parameter." });
  }

  try {
    const repositories = await fetchRepositories(organization, language);
    res.json(repositories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
