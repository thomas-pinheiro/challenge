import "dotenv/config";
import express from "express";
import { repoController } from "./controllers/repoController.js";
import { checkAuthorization } from "./middlewares/authorization.js";

// Configuração do servidor
const PORT = process.env.PORT || 3000;
const app = express();

// Endpoint principal
app.get("/repos", checkAuthorization, repoController);

// Tratamento de endpoints não encontradas
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});