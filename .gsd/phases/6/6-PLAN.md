---
phase: 6
plan: 1
wave: 1
---

# Plan 6.1: CI/CD Pipeline Setup

## Objective
Automate deployment to a VPS via SSH using GitHub Actions. The pipeline should build the Docker image on `main` push, push it to GitHub Container Registry (GHCR), SSH into the VPS, pull the latest image, and restart the `docker-compose` services.

## Context
- .gsd/SPEC.md
- .gsd/ROADMAP.md
- `Dockerfile`
- `docker-compose.yml`

## Tasks

<task type="auto">
  <name>Create GitHub Actions Deployment Workflow</name>
  <files>
    - `.github/workflows/deploy.yml`
    - `VPS_DEPLOYMENT_GUIDE.md`
  </files>
  <action>
    - Create a workflow file `.github/workflows/deploy.yml` that triggers on push to the `main` branch.
    - Add a `build-and-push` job that checks out the code, logs in to GHCR, builds the Docker image, and pushes it using `docker/build-push-action`.
    - Add a `deploy` job that requires `build-and-push` to complete. This job should use an SSH action (like `appleboy/ssh-action`) to connect to the VPS, pull the latest image, and restart the `web` container via `docker compose pull web && docker compose up -d web`.
    - Write a `VPS_DEPLOYMENT_GUIDE.md` document at the root detailing the required GitHub Secrets (`HOST`, `USERNAME`, `SSH_KEY`, `PASSPHRASE` (optional), and instructions for ensuring the `docker-compose.yml` is correctly placed on the VPS.
  </action>
  <verify>test -f .github/workflows/deploy.yml && test -f VPS_DEPLOYMENT_GUIDE.md</verify>
  <done>
    - `.github/workflows/deploy.yml` exists and contains correct steps for GHCR and SSH deployment
    - `VPS_DEPLOYMENT_GUIDE.md` is clear and lists all necessary GitHub secrets
  </done>
</task>

## Success Criteria
- [ ] The `.github/workflows/deploy.yml` file is configured for GHCR push and SSH automated deployment
- [ ] A `VPS_DEPLOYMENT_GUIDE.md` file explains which secrets need to be added to GitHub
