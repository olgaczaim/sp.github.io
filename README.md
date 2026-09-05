# SharePoint Farm Architecture Designer

An interactive React application for modelling SharePoint Server farm topologies, checking common availability risks, estimating draft resources, and exporting the selected Search topology as a PowerShell script.

## Run locally

Requirements: Node.js 24 and npm.

```bash
npm ci
npm run typecheck
npm run build
```

The production-ready static files are created in `dist/`.

## Publish with GitHub Pages

The repository contains `.github/workflows/deploy-pages.yml`. It builds and deploys the application whenever the `main` branch changes.

1. Open the repository on GitHub.
2. Go to **Settings > Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push a commit to `main`, or run the workflow manually from **Actions > Deploy website to GitHub Pages > Run workflow**.
5. After the workflow succeeds, open the URL shown in the deployment job or in **Settings > Pages**.

For a project repository, the default URL is:

```text
https://YOUR-GITHUB-USERNAME.github.io/YOUR-REPOSITORY-NAME/
```

The Vite configuration uses relative asset paths, so the site works under both a repository subpath and a custom domain.

## Important publication note

GitHub Pages is a public website. Review the source and generated PowerShell before publishing, and do not commit passwords, tokens, production server names, internal DNS names, or other confidential environment details.
