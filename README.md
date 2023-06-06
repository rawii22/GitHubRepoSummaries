# GitHubRepoSummaries
Given a username, this website will fetch the summary of all the user's repositories on GitHub.

## Features

- You can choose to view the summary in a rendered format or as a JSON object.
- You can choose to include forked repositories in the user summary.
- Results include:
    1. Username
    1. Total Repositories
    1. Total Stargazers
    1. Total Forks
    1. Size of all repos
    1. Average repo size
    1. Languages used across all repos
- The profile picture of the searched user will appear next to the summary. Clicking on it will redirect you to the user's GitHub page.

## Notes
This website is intended to be used with a GitHub API token. To create one, refer to this guide: [Managing your personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)

Once you have created your token, open app.js and replace TOKEN_HERE with your token. Make sure it stays within the single-quotes.