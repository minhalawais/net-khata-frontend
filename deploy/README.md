# Net Khata VPS Deployment Automation

This folder gives you one-command deployment with:
- persistent uploads
- release-based deploys
- rollback support
- optional GitHub Actions auto-deploy

## 1) First-time setup on VPS

Run as root (or sudo user):

```bash
apt update
apt install -y git rsync python3 python3-venv python3-pip nodejs npm nginx
```

Clone repo path once:

```bash
mkdir -p /var/www/netkhata
cd /var/www/netkhata
git clone <YOUR_REPO_URL> repo
```

Run bootstrap:

```bash
cd /var/www/netkhata/repo
REPO_URL='<YOUR_REPO_URL>' bash deploy/bootstrap_server.sh
```

Edit environment file:

```bash
nano /var/www/netkhata/shared/api.env
```

Ensure uploads persist here:

```bash
ls -la /var/www/netkhata/shared/uploads
```

## 2) Nginx setup

Keep your existing frontend root if desired:
- `/var/www/html/ISP-MANAGEMENT-SYSTEM/build`

Proxy backend to Uvicorn on port 8000:

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:8000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    rewrite ^/api(/.*)$ /$1 break;
}
```

Reload:

```bash
nginx -t && systemctl reload nginx
```

## 3) Deploy commands (manual)

```bash
cd /var/www/netkhata/repo
bash deploy/deploy.sh
```

If you need DB migration during deploy:

```bash
RUN_MIGRATIONS=1 bash deploy/deploy.sh
```

## 4) Rollback command

```bash
cd /var/www/netkhata/repo
bash deploy/rollback.sh
```

## 5) GitHub Actions automatic deploy

Add these repo secrets:
- `VPS_HOST`
- `VPS_USER`
- `VPS_PORT` (optional)
- `VPS_SSH_KEY`

Workflow file:
- `.github/workflows/deploy-vps.yml`

Then every push to `main` deploys automatically.

## 6) Why this is better than your current flow

- No repeated manual install/clone steps.
- Uploads are never deleted (shared path is symlinked into each release).
- Release switching is atomic and rollback is fast.
- Same command every time, less human error.
