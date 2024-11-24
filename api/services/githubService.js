import { Octokit } from "@octokit/core";
import { HttpError } from "../utils/error.js";

export const fetchRepositories = async (token, user, language, archived = null, perPage = 5, userPage = 1) => {
    let repositories = [];
    let page = 1;
    let totalRepositories = perPage * userPage;

    try {
        const octokit = new Octokit({ auth: token });

        while (repositories.length < totalRepositories) {
            const { data } = await octokit.request("GET /users/{user}/repos", {
                user: user,
                headers: { "X-GitHub-Api-Version": "2022-11-28" },
                per_page: 100,
                page,
            });

            const filtered = data.filter((repo) => {
                const languageMatch = language ? repo.language?.toLowerCase() === language.toLowerCase() : true;
                const archivedMatch = archived !== null ? repo.archived === archived : true;
                return languageMatch && archivedMatch;
            });

            repositories = [...repositories, ...filtered];

            if (data.length < 100) break;
            page++;
        }

        const startIndex = perPage * (userPage - 1);
        const endIndex = startIndex + perPage;

        return repositories.slice(startIndex, endIndex);
    } catch (error) {
        console.error(`Error fetching repositories: ${error.message}`);
        if (error.response) {
            throw new HttpError(`GitHub API returned an error: ${error.response.status}`, error.response.status);
        }
        throw new HttpError("Failed to fetch repositories from GitHub", 500);
    }
};
