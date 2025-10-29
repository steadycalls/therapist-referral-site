# Domain Setup Guide for leveragetherapy.com

This guide will help you configure your custom domain `leveragetherapy.com` to point to your SSDNodes VPS.

## Step 1: Configure DNS Records

Log in to your domain registrar (where you bought leveragetherapy.com) and add these DNS records:

### A Records (Required)

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | `YOUR_VPS_IP_ADDRESS` | 3600 |
| A | www | `YOUR_VPS_IP_ADDRESS` | 3600 |

**Replace `YOUR_VPS_IP_ADDRESS` with your actual SSDNodes VPS IP address.**

### Example:
If your VPS IP is `123.45.67.89`:
- `leveragetherapy.com` → `123.45.67.89`
- `www.leveragetherapy.com` → `123.45.67.89`

**Note:** DNS propagation can take 5 minutes to 48 hours. Usually it's within 1-2 hours.

## Step 2: Verify DNS Propagation

Check if DNS is working:

```bash
# Check from your local machine
dig leveragetherapy.com
dig www.leveragetherapy.com

# Or use online tools:
# https://dnschecker.org
```

You should see your VPS IP address in the results.

## Step 3: Configure Nginx on Your VPS

SSH into your SSDNodes VPS:

```bash
ssh root@YOUR_VPS_IP
```

Copy the Nginx configuration:

```bash
cd /opt/therapist-referral-site

# Copy the Nginx config to sites-available
cp nginx/leveragetherapy.com.conf /etc/nginx/sites-available/leveragetherapy.com

# Create symbolic link to enable the site
ln -s /etc/nginx/sites-available/leveragetherapy.com /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# If test passes, reload Nginx
systemctl reload nginx
```

## Step 4: Set Up SSL Certificate (HTTPS)

Install Certbot (if not already installed):

```bash
apt update
apt install certbot python3-certbot-nginx -y
```

Get SSL certificate for your domain:

```bash
certbot --nginx -d leveragetherapy.com -d www.leveragetherapy.com
```

Follow the prompts:
1. Enter your email address
2. Agree to terms of service
3. Choose whether to redirect HTTP to HTTPS (recommended: Yes)

Certbot will:
- Automatically obtain SSL certificates
- Configure Nginx for HTTPS
- Set up automatic renewal

Verify auto-renewal is working:

```bash
certbot renew --dry-run
```

## Step 5: Update Application Settings

Update your `.env` file if needed:

```bash
cd /opt/therapist-referral-site
nano .env
```

You can add domain-specific settings if needed, but the app should work as-is.

## Step 6: Test Your Site

Visit your domain:
- **HTTP:** http://leveragetherapy.com (should redirect to HTTPS)
- **HTTPS:** https://leveragetherapy.com ✅
- **WWW:** https://www.leveragetherapy.com ✅

## Firewall Configuration

Ensure your firewall allows HTTP and HTTPS:

```bash
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 22/tcp    # SSH
ufw enable
ufw status
```

## Troubleshooting

### DNS not resolving
- Wait longer (DNS can take up to 48 hours)
- Check DNS records at your registrar
- Use `dig leveragetherapy.com` to verify

### "Connection refused" error
- Check if Docker container is running: `docker-compose ps`
- Check if Nginx is running: `systemctl status nginx`
- Check Nginx logs: `tail -f /var/log/nginx/error.log`

### SSL certificate issues
- Make sure DNS is fully propagated before running Certbot
- Check Certbot logs: `tail -f /var/log/letsencrypt/letsencrypt.log`
- Verify port 80 and 443 are open

### "502 Bad Gateway" error
- Check if app is running: `docker-compose logs app`
- Restart app: `docker-compose restart app`
- Check Nginx proxy settings

## Optional: Redirect www to non-www (or vice versa)

If you want `www.leveragetherapy.com` to redirect to `leveragetherapy.com`:

Edit `/etc/nginx/sites-available/leveragetherapy.com`:

```nginx
# Redirect www to non-www
server {
    listen 80;
    listen [::]:80;
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name www.leveragetherapy.com;
    
    ssl_certificate /etc/letsencrypt/live/leveragetherapy.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/leveragetherapy.com/privkey.pem;
    
    return 301 https://leveragetherapy.com$request_uri;
}
```

Then reload Nginx:
```bash
nginx -t && systemctl reload nginx
```

## BetterHelp Affiliate Links

Make sure your BetterHelp affiliate URLs include your domain for tracking:

```
https://www.betterhelp.com/get-started/?utm_source=claritytherapy&utm_medium=referral
```

You can update these in your database or via the webhook API.

## Performance Optimization

### Enable HTTP/2
Already enabled in the Nginx config after SSL setup.

### Enable Caching
Add to your Nginx config:

```nginx
location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### CDN (Optional)
Consider using Cloudflare for:
- DDoS protection
- CDN caching
- Additional SSL options
- Analytics

Just point your DNS to Cloudflare instead of directly to your VPS.

## Monitoring

### Check site status
```bash
curl -I https://leveragetherapy.com
```

### Monitor SSL certificate expiry
```bash
certbot certificates
```

### Check Nginx access logs
```bash
tail -f /var/log/nginx/leveragetherapy.com.access.log
```

### Check application logs
```bash
docker-compose logs -f app
```

## Maintenance

### Renew SSL (automatic)
Certbot sets up automatic renewal. Check with:
```bash
systemctl status certbot.timer
```

### Update application
```bash
cd /opt/therapist-referral-site
git pull
docker-compose build
docker-compose up -d
```

### Backup
```bash
# Backup database
docker-compose exec mysql mysqldump -u root -p therapyconnect > backup.sql

# Backup .env
cp .env .env.backup
```

---

## Quick Reference

**Your domain:** https://leveragetherapy.com  
**Nginx config:** `/etc/nginx/sites-available/leveragetherapy.com`  
**SSL certs:** `/etc/letsencrypt/live/leveragetherapy.com/`  
**App directory:** `/opt/therapist-referral-site`  
**Logs:** `/var/log/nginx/leveragetherapy.com.*.log`

---

**Once DNS propagates and SSL is configured, your site will be live at:**  
🌐 **https://leveragetherapy.com** 🎉
