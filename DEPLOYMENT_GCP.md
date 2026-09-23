# Deploying Noroshi on Google Cloud Compute Engine (GCE)

This guide walks you through deploying the complete **Noroshi Platform** (PostgreSQL 17, Redis 7, Fastify API, React Manage Portal via Nginx, and the full LGTM Observability stack: Prometheus, Grafana, Tempo, Loki) on a single **Google Cloud Compute Engine VM**.

---

## 1. Recommended Architecture & VM Specs

* **Machine Type**: `e2-standard-2` (2 vCPUs, 8 GB Memory)
  * *Comfortably runs Postgres, Redis, Fastify, Nginx, and all 4 observability containers (~2.5GB RAM utilization).*
* **Operating System**: **Ubuntu 24.04 LTS** (or Debian 12)
* **Boot Disk**: `40 GB Balanced Persistent Disk` (`pd-balanced`)
* **Firewall Tags**: `http-server`, `https-server`

---

## 2. Step 1: Provision the VM on Google Cloud

### Option A: Using the `gcloud` CLI (Fastest)

```bash
gcloud compute instances create noroshi-prod \
    --project="YOUR_GCP_PROJECT_ID" \
    --zone="us-central1-a" \
    --machine-type="e2-standard-2" \
    --image-family="ubuntu-2404-lts-amd64" \
    --image-project="ubuntu-os-cloud" \
    --boot-disk-size="40GB" \
    --boot-disk-type="pd-balanced" \
    --tags="http-server,https-server"
```

### Create Firewall Rule (Allow Port 80, 443, and optional 3001 for Grafana):
```bash
gcloud compute firewall-rules create allow-noroshi-web \
    --allow=tcp:80,tcp:443,tcp:3001 \
    --target-tags=http-server,https-server \
    --description="Allow HTTP, HTTPS, and Grafana"
```

---

### Option B: Using GCP Console (Web UI)
1. Go to **Compute Engine** &rarr; **VM instances** &rarr; **Create instance**.
2. **Name**: `noroshi-prod`.
3. **Region / Zone**: Choose your nearest region (e.g. `us-central1`).
4. **Machine configuration**: `E2` &rarr; `e2-standard-2` (2 vCPU, 8 GB RAM).
5. **Boot disk**: Change to **Ubuntu 24.04 LTS**, **40 GB** Balanced persistent disk.
6. **Firewall**: Check both **Allow HTTP traffic** and **Allow HTTPS traffic**.
7. Click **Create**.

---

## 3. Step 2: Connect to the VM & Install Docker

SSH into your VM:
```bash
gcloud compute ssh noroshi-prod --zone="us-central1-a"
```

Run this 1-line script to install **Docker Engine** & **Docker Compose**:
```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg git

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Allow running docker without sudo
sudo usermod -aG docker $USER
newgrp docker
```

---

## 4. Step 3: Clone the Repository & Configure Secrets

```bash
# Clone the repository
git clone https://github.com/your-username/noroshi.git
cd noroshi

# Create your production environment file
cp infra/production/.env.prod.example infra/production/.env

# Edit secrets (e.g. database password, Sentry DSN)
nano infra/production/.env
```

Your `infra/production/.env` should contain:
```ini
POSTGRES_USER=noroshi
POSTGRES_PASSWORD=your_super_secret_db_password
POSTGRES_DB=noroshi

# Your Sentry DSN
VITE_SENTRY_DSN=https://e7aa5bcf86353998528dd25b3169254a@o4512135625703424.ingest.de.sentry.io/4512135628718160

# Grafana Admin Password
GRAFANA_USER=admin
GRAFANA_PASSWORD=your_secure_grafana_password
```

---

## 5. Step 4: Build & Start the Production Stack

```bash
docker compose --env-file infra/production/.env -f infra/production/docker-compose.prod.yml up -d --build
```

Docker Compose will automatically:
1. Initialize PostgreSQL 17 and Redis 7 with persistent volumes.
2. Build the Fastify Node API container and execute `drizzle-kit push` migrations.
3. Build the React Manage Portal with Vite and your Sentry DSN, then serve it through Nginx on Port 80.
4. Launch Prometheus, Grafana Tempo, Loki, and Grafana (`:3001`).

Check status:
```bash
docker compose -f infra/production/docker-compose.prod.yml ps
```

---

## 6. Step 5: (Optional) Free SSL Certificate via Let's Encrypt

If you point a domain name (e.g. `status.yourdomain.com`) to your GCE VM's External IP address:

```bash
sudo apt-get install -y certbot

# Stop container on port 80 temporarily for certificate issuance
docker compose -f infra/production/docker-compose.prod.yml stop web

# Generate free Let's Encrypt certificate
sudo certbot certonly --standalone -d status.yourdomain.com

# Restart web
docker compose -f infra/production/docker-compose.prod.yml start web
```

---

## 7. Step 6: Enable Auto-Restart on VM Reboot

To ensure Noroshi boots automatically if the Google Cloud VM restarts:

```bash
sudo tee /etc/systemd/system/noroshi.service > /dev/null <<EOF
[Unit]
Description=Noroshi Incident Management Platform
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$(pwd)
ExecStart=/usr/bin/docker compose --env-file infra/production/.env -f infra/production/docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f infra/production/docker-compose.prod.yml down

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable noroshi.service
```

---

## Summary of Production Endpoints

| Service | Path / Port | Description |
| :--- | :--- | :--- |
| **Manage Portal (Web)** | `http://<VM_IP>/` | Astryx operator portal (React + Nginx) |
| **Public Status Pages** | `http://<VM_IP>/status/:slug` | SSR server-side rendered status page |
| **API Endpoints** | `http://<VM_IP>/api/v1/...` | Fastify backend API |
| **Health Check** | `http://<VM_IP>/health` | Fastify service health |
| **Grafana Dashboard** | `http://<VM_IP>:3001` | LGTM Metrics, Logs & Tempo Traces |
| **Prometheus** | `http://<VM_IP>:9090` | Prometheus scraper & metrics explorer |
