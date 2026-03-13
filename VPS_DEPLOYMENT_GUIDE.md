# VPS Deployment Guide

This repository uses GitHub Actions to automate the building of a Docker image and deploying it to your VPS.

## 1. Directory Structure on the VPS

Before the deployment can work, you need to set up the target directory on your VPS.

1. SSH into your VPS:
   ```bash
   ssh root@your_vps_ip
   ```
2. Create the application directory (the GitHub Action expects `/opt/check402`):
   ```bash
   mkdir -p /opt/check402
   cd /opt/check402
   ```
3. Copy your `.env` and `docker-compose.yml` (and `Caddyfile` if used) to this directory.
   - For `docker-compose.yml`, make sure the image name for the `web` service points to the ghcr.io image.
   - **Important:** Modify your `docker-compose.yml` on the VPS to point to the pulled image instead of building it from source.

   **Example `docker-compose.yml` snippet on VPS:**
   ```yaml
   services:
     web:
       image: ghcr.io/your-github-username/payment-status-tracker:latest # <-- MUST MATCH YOUR GHCR PATH in lowercase
       restart: always
       # ... rest of your environment variables and ports
   ```

## 2. GitHub Secrets Configuration

If you haven't already, add the following Repository Secrets to your GitHub settings (`Settings` > `Secrets and variables` > `Actions`):

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `VPS_HOST` | The IP address or domain name of your VPS | `203.0.113.50` |
| `VPS_USERNAME` | The SSH username for your VPS | `root` or `ubuntu` |
| `VPS_SSH_KEY` | Your private SSH key associated with the VPS | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `VPS_PASSPHRASE` | (Optional) The passphrase for your SSH key, if you set one | `mysecret` |
| `GHCR_PAT` | A Personal Access Token (PAT) with `read:packages` permission. | `ghp_something12345` |

*(Note: `GHCR_PAT` is only explicitly required during the SSH pull step if your repository is Private. The GitHub Actions token `secrets.GITHUB_TOKEN` is used for pushing the image but cannot generally be used by the VPS to pull it).*

## 3. Generating a Personal Access Token (PAT) for GHCR

1. Go to your GitHub Profile Settings → Developer Settings → Personal access tokens → Tokens (classic).
2. Generate a new token with at least the `read:packages` scope.
3. Save this value to the `GHCR_PAT` repository secret.

## 4. How the Pipeline Works

1. **Trigger:** The pipeline runs on every push to the `main` branch.
2. **Build Stage:** It checks out the code, logs into the GitHub Container Registry (GHCR), builds the Docker image, and tags it with `latest` and the commit SHA.
3. **Deploy Stage:** It SSHs into your VPS, pulls the new `latest` image from GHCR, restarts the `web` container via `docker compose`, and prunes old images to save disk space.
