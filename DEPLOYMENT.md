# Deployment Guide for SSDNodes VPS

This guide will help you deploy Leverage Therapy to your SSDNodes VPS using Docker.

## Prerequisites

- SSDNodes VPS with Ubuntu/Debian
- SSH access to your VPS
- Domain name pointed to your VPS IP (optional but recommended)

## Step 1: Prepare Your VPS

SSH into your SSDNodes VPS:

```bash
ssh root@your-vps-ip
```

Update system packages:

```bash
apt update && apt upgrade -y
```

Install Docker and Docker Compose:

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Verify installation
docker --version
docker-compose --version
```

## Step 2: Clone Your Repository

```bash
cd /opt
git clone https://github.com/steadycalls/therapist-referral-site.git
cd therapist-referral-site
```

## Step 3: Configure Environment Variables

Create a `.env` file with your configuration:

```bash
nano .env
```

Add the following (replace with your actual values):

```env
# Required: Database Configuration
DATABASE_URL=mysql://user:password@host:3306/therapyconnect

# Required: Security
JWT_SECRET=your-random-32-character-secret-here
WEBHOOK_API_KEY=your-webhook-api-key-here

# Optional: OAuth (if you want user authentication)
VITE_APP_ID=your-app-id
OWNER_OPEN_ID=your-owner-id
OWNER_NAME=Your Name

# Optional: Application Settings
VITE_APP_TITLE=Leverage Therapy
VITE_APP_LOGO=/logo.png

# Production
NODE_ENV=production
```

**Important:** Generate a secure JWT_SECRET:
```bash
openssl rand -base64 32
```

Save and exit (Ctrl+X, then Y, then Enter).

## Step 4: Set Up Database

### Option A: Use External Database (Recommended)

Use a managed database service like:
- **PlanetScale** (MySQL-compatible, free tier available)
- **Railway** (PostgreSQL/MySQL)
- **TiDB Cloud** (MySQL-compatible)

Get your connection string and add it to `.env` as `DATABASE_URL`.

### Option B: Run MySQL in Docker

Uncomment the MySQL service in `docker-compose.yml`:

```yaml
  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=your-secure-password
      - MYSQL_DATABASE=therapyconnect
    volumes:
      - mysql_data:/var/lib/mysql
    restart: unless-stopped
    ports:
      - "3306:3306"

volumes:
  mysql_data:
```

Then update your `.env`:
```env
DATABASE_URL=mysql://root:your-secure-password@mysql:3306/therapyconnect
```

## Step 5: Build and Run

Build the Docker image:

```bash
docker-compose build
```

Start the application:

```bash
docker-compose up -d
```

Check if it's running:

```bash
docker-compose ps
docker-compose logs -f app
```

## Step 6: Set Up Nginx Reverse Proxy (Recommended)

Install Nginx:

```bash
apt install nginx -y
```

Create Nginx configuration:

```bash
nano /etc/nginx/sites-available/therapyconnect
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/therapyconnect /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## Step 7: Set Up SSL with Let's Encrypt (Recommended)

Install Certbot:

```bash
apt install certbot python3-certbot-nginx -y
```

Get SSL certificate:

```bash
certbot --nginx -d your-domain.com -d www.your-domain.com
```

Follow the prompts. Certbot will automatically configure SSL and set up auto-renewal.

## Step 8: Run Database Migrations

Push your database schema:

```bash
docker-compose exec app sh -c "cd /app && pnpm db:push"
```

## Step 9: Seed Initial Data (Optional)

If you have seed data:

```bash
docker-compose exec app sh -c "cd /app && npx tsx seed-data.ts"
```

## Management Commands

### View logs
```bash
docker-compose logs -f app
```

### Restart application
```bash
docker-compose restart app
```

### Stop application
```bash
docker-compose down
```

### Update application
```bash
cd /opt/therapist-referral-site
git pull
docker-compose build
docker-compose up -d
```

### Access database (if using Docker MySQL)
```bash
docker-compose exec mysql mysql -u root -p therapyconnect
```

## Firewall Configuration

Allow HTTP and HTTPS:

```bash
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

## Using the Webhook API

Once deployed, you can add content via webhooks:

```bash
# Add a blog post
curl -X POST https://your-domain.com/api/webhook/blog-post \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-webhook-api-key" \
  -d '{
    "slug": "understanding-anxiety",
    "title": "Understanding Anxiety",
    "content": "Your content here...",
    "isPublished": true
  }'

# Add a therapist
curl -X POST https://your-domain.com/api/webhook/therapist \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-webhook-api-key" \
  -d '{
    "slug": "jane-doe-lcsw",
    "name": "Jane Doe",
    "credentials": "LCSW",
    "bio": "Bio here...",
    "specialtyIds": [1, 2]
  }'
```

See `WEBHOOK_API.md` for complete API documentation.

## Monitoring

### Check application health
```bash
curl http://localhost:3000/
```

### Monitor resource usage
```bash
docker stats
```

### Set up automatic restarts
The `restart: unless-stopped` policy in docker-compose.yml ensures your app restarts automatically after crashes or server reboots.

## Troubleshooting

### Application won't start
```bash
docker-compose logs app
```

### Database connection issues
- Verify `DATABASE_URL` in `.env`
- Check if database is accessible
- Ensure database exists

### Port already in use
```bash
# Check what's using port 3000
lsof -i :3000
# Kill the process or change the port in docker-compose.yml
```

### Out of disk space
```bash
# Clean up Docker
docker system prune -a
```

## Performance Optimization

### Enable Docker logging limits
Add to `docker-compose.yml` under each service:

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

### Set up log rotation
```bash
nano /etc/logrotate.d/docker-containers
```

Add:
```
/var/lib/docker/containers/*/*.log {
  rotate 7
  daily
  compress
  missingok
  delaycompress
  copytruncate
}
```

## Backup Strategy

### Backup database (if using Docker MySQL)
```bash
docker-compose exec mysql mysqldump -u root -p therapyconnect > backup-$(date +%Y%m%d).sql
```

### Backup environment file
```bash
cp .env .env.backup
```

## Security Recommendations

1. **Change default passwords** in `.env`
2. **Use strong JWT_SECRET** (32+ characters)
3. **Keep WEBHOOK_API_KEY secret** - don't commit to Git
4. **Enable UFW firewall** as shown above
5. **Keep Docker and system updated**:
   ```bash
   apt update && apt upgrade -y
   ```
6. **Use SSL/HTTPS** with Let's Encrypt
7. **Regular backups** of database and `.env` file

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review `WEBHOOK_API.md` for API documentation
- Check GitHub issues: https://github.com/steadycalls/therapist-referral-site/issues

---

**Your site should now be live at:** `https://your-domain.com` 🎉
