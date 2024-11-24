import { HttpError } from "../utils/error.js";
import { validateQueryParams } from "../utils/validation.js";
import { fetchRepositories } from "../services/githubService.js";

export const repoController = async (req, res) => {
    try {
        validateQueryParams(req.query);

        const { user, language, per_page: perPage, page, archived } = req.query;
        const token = req.token;

        const repositories = await fetchRepositories(token, user, language, archived, perPage, page);

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
};
