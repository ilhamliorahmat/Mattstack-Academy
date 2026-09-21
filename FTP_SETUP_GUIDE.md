# 🚀 Automated FTP Deployment Guide (`FTP_CRED` JSON Format)

This project is configured with Chairman Mathieu's **GitHub Actions Deployment Pipeline** (`.github/workflows/deploy.yml`) that parses credentials directly from your single `FTP_CRED` JSON secret.

---

## 🔑 GitHub Repository Secret Setup

Add **one single secret** named `FTP_CRED` in your GitHub repository (**Settings** ➔ **Secrets and variables** ➔ **Actions** ➔ **New repository secret**).

- **Secret Name**: `FTP_CRED`
- **Secret Value** (JSON format):

```json
{
  "server": "ftpupload.net",
  "username": "epiz_12345678",
  "password": "your_password",
  "server_dir": "/mattstack.xo.je/htdocs/",
  "port": 21
}
```

---

## 🔄 Deployment Pipeline (`.github/workflows/deploy.yml`)

```yaml
name: Deploy to InfinityFree

on:
  push:
    branches:
      - main
      - master

jobs:
  web-deploy:
    name: Deploy
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Dependencies
        run: npm install --legacy-peer-deps

      - name: Build Web Application
        run: npm run build

      - name: Sync files to InfinityFree
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: ${{ fromJSON(secrets.FTP_CRED).server }}
          username: ${{ fromJSON(secrets.FTP_CRED).username }}
          password: ${{ fromJSON(secrets.FTP_CRED).password }}
          server-dir: ${{ fromJSON(secrets.FTP_CRED).server_dir }}
          port: ${{ fromJSON(secrets.FTP_CRED).port || 21 }}
          local-dir: ./dist/
```
