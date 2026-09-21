# 🚀 Automated FTP Deployment Guide (GitHub Actions)

This project is pre-configured with a **GitHub Actions CI/CD Pipeline** (`.github/workflows/ftp-deploy.yml`) that automatically compiles and deploys production static web assets to your web host every time you push code to GitHub.

---

## 🔑 Step-by-step GitHub Secret Configuration

To enable automated deployment, add **one single secret** named `FTP_CRED` in your GitHub repository.

### 1. Open GitHub Secret Settings
1. Go to your GitHub Repository: `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME`
2. Click **Settings** (top navigation bar)
3. In the left sidebar, expand **Secrets and variables** ➔ Click **Actions**
4. Click the green button: **New repository secret**

---

### 2. Add the `FTP_CRED` Secret

- **Name**: `FTP_CRED`
- **Secret Value** (JSON format):

```json
{
  "server": "ftpupload.net",
  "username": "your_ftp_username",
  "password": "your_ftp_password",
  "server_dir": "mattstack.xo.je/htdocs/",
  "port": 21,
  "protocol": "ftp"
}
```

> 💡 **Note for InfinityFree / iFastNet / cPanel Users**:
> - Replace `ftpupload.net` with your host's FTP hostname or IP.
> - Ensure `server_dir` points to your target directory, e.g. `mattstack.xo.je/htdocs/` or `public_html/`.
> - Always include the trailing slash `/`.

---

## 🔄 How the Deployment Flow Works

1. **Trigger**: You execute `git push origin main`.
2. **Build**: GitHub Actions spins up an isolated runner, installs dependencies, and runs `npm run build` to output relative bundle assets into `/dist`.
3. **Upload**: `FTP-Deploy-Action` connects to your FTP server using the decrypted `FTP_CRED` secret payload and syncs updated production files directly into `/mattstack.xo.je/htdocs/`.
4. **Live Update**: Your website updates automatically in seconds without manual FTP file transfers!
