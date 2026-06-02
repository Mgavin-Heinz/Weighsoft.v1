# Deployment Documentation

## Overview

Weighsoft backend is deployed using Docker with Nginx and PHP-FPM. The frontend is deployed separately as a static site served by Nginx.

## Backend Deployment

### Docker Configuration

**Base Image:** `nginx:1.19-alpine`

**Components:**
- Nginx web server
- PHP 8.3 with FPM
- Composer for dependency management
- Cron for scheduled tasks

### Dockerfile Structure

```dockerfile
FROM nginx:1.19-alpine

# Install PHP and dependencies
RUN apk add --no-cache php8 php8-fpm php8-opcache ...

# Set timezone
ENV TZ=Africa/Johannesburg

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php

# Copy application
COPY ./ /var/www/laravel/

# Install dependencies
RUN composer install --no-dev

# Configure environment
RUN cp docker.env .env
RUN php artisan jwt:secret

# Configure cron
COPY ./docker-build/cronjobs /etc/crontabs/root

# Start services
CMD /usr/sbin/php-fpm8 -D; nginx -g "daemon off;"
```

### Environment Configuration

**File:** `docker.env`

**Key Variables:**
```env
DB_HOST=mysql_host
DB_DATABASE=weighsoft
DB_USERNAME=username
DB_PASSWORD=password
JWT_SECRET=generated_secret
APP_ENV=production
APP_DEBUG=false
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=email@example.com
MAIL_PASSWORD=password
# Optional: for numberplate recognition (OpenAI Vision). Omit or leave empty to disable LPR.
OPENAI_API_KEY=
```

#### LPR (Numberplate Recognition) API Key

The LPR feature uses OpenAI’s Vision API. The key is **only** used by the backend and must **never** be shipped in the frontend or committed to source control.

**Where to set it**

| Deployment type | Where to set `OPENAI_API_KEY` |
|-----------------|-------------------------------|
| **Docker (build-time env)** | In `docker.env` before building. Ensure `docker.env` is not committed if it contains real secrets (use a template or CI secret → file). |
| **Docker (runtime)** | Prefer passing at run time so the key is not baked into the image: `docker run -e OPENAI_API_KEY=sk-... ...` or use `--env-file` pointing at a host file that is gitignored and permission-restricted (e.g. `chmod 600`). |
| **Non-Docker (e.g. IIS, PHP-FPM)** | In the backend `.env` file (the same file that holds `DB_*`, `JWT_SECRET`, etc.). `.env` is already in `.gitignore`. |
| **CI/CD pipelines** | Store `OPENAI_API_KEY` in the pipeline’s secret store and write it into `docker.env` or `.env` during the build/deploy step, or inject it as a runtime env var into the container. |

**Security practices**

- **Do not commit** `OPENAI_API_KEY` (or any env file that contains it) to the repo. Use `.env.example` / `docker.env.example` with empty or placeholder values only.
- **Prefer runtime injection** over baking into the image: e.g. `docker run -e OPENAI_API_KEY=...` or a secure `--env-file`, so the key never lives inside the image layers.
- **Restrict file permissions** on any env file that holds the key: e.g. `chmod 600 docker.env` or `chmod 600 .env` so only the app/user running the process can read it.
- **Rotate the key** periodically in the OpenAI dashboard and update it in your deployment config.
- **Use a scoped key** if your provider allows it (e.g. project- or usage-limited) to limit impact if it is ever exposed.

**Behaviour when the key is missing**

If `OPENAI_API_KEY` is empty or unset, the backend does not call OpenAI. The numberplate-recognition endpoint returns HTTP 503 with a generic “Numberplate recognition is not configured” message, and the weighing UI shows “Numberplate not recognized” when the user clicks the NPR button. No key is required to build or run the rest of Weighsoft.

### Build Process

1. **Build Docker Image:**
```bash
docker build -t weighsoft-backend .
```

2. **Run Container:**
```bash
docker run -d \
  --name weighsoft-backend \
  -p 8000:80 \
  -v /path/to/storage:/var/www/laravel/storage \
  weighsoft-backend
```

### Database Setup

1. **Run Migrations:**
```bash
docker exec weighsoft-backend php artisan migrate
```

2. **Generate JWT Secret:**
```bash
docker exec weighsoft-backend php artisan jwt:secret
```

3. **Seed Initial Data (if needed):**
```bash
docker exec weighsoft-backend php artisan db:seed
```

### Scheduled Tasks

**Cron Configuration:** `/etc/crontabs/root`

**Tasks:**
- Report email sending
- Data cleanup
- Maintenance tasks

**Example:**
```
0 0 * * * cd /var/www/laravel && php artisan reporting:email {reportId}
```

### Nginx Configuration

**File:** `docker-build/laravel.conf`

**Key Settings:**
- PHP-FPM upstream
- Laravel routing
- Static file serving
- Security headers

### PHP Configuration

**File:** `docker-build/php.ini`

**Key Settings:**
- Memory limits
- Upload limits
- Timezone
- Error reporting

### Storage Permissions

```bash
chmod -R 777 storage
chmod -R 777 bootstrap/cache
```

## Frontend Deployment

### Docker Configuration

**Base Image:** `alpine:3.18.5` (build) + `nginx:alpine` (runtime)

**Components:**
- Node.js for build
- Yarn for dependencies
- Nginx for serving

### Dockerfile Structure

```dockerfile
# Build stage
FROM alpine:3.18.5 AS angularapp
WORKDIR /var/www
COPY package*.json ./
RUN yarn install
COPY ./ ./

# Runtime stage
FROM nginx:alpine
COPY --from=angularapp /var/www/ /usr/share/nginx/html/
COPY ./docker/default.conf /etc/nginx/conf.d/
EXPOSE 80
```

### Build Process

1. **Build Docker Image:**
```bash
docker build -t weighsoft-frontend .
```

2. **Run Container:**
```bash
docker run -d \
  --name weighsoft-frontend \
  -p 80:80 \
  weighsoft-frontend
```

### Environment Configuration

**File:** `app/js/env.js`

**Configuration:**
```javascript
window.__env = window.__env || {};
window.__env.base = "http://api.example.com";
window.__env.scale = "http://scale-service:3000";
window.__env.logo = "assets/images/logos/logo.png";
```

**For Production:**
- Set API base URL
- Configure scale service URL
- Set logo path

### Nginx Configuration

**File:** `docker/default.conf`

**Key Settings:**
- SPA routing (all routes to index.html)
- Static file serving
- Gzip compression
- Security headers

## Production Deployment

### Prerequisites

- Docker and Docker Compose
- MySQL database
- Domain name and SSL certificates
- Email server configuration

### Deployment Steps

1. **Prepare Environment:**
   - Copy `docker.env` to `.env`
   - Configure database credentials
   - Set JWT secret
   - Configure email settings

2. **Build Images:**
```bash
cd Weighsoft.back.v1
docker build -t weighsoft-backend .

cd Weighsoft.ui.v1
docker build -t weighsoft-frontend .
```

3. **Run Containers:**
```bash
# Backend
docker run -d \
  --name weighsoft-backend \
  --restart unless-stopped \
  -p 8000:80 \
  -v weighsoft-storage:/var/www/laravel/storage \
  weighsoft-backend

# Frontend
docker run -d \
  --name weighsoft-frontend \
  --restart unless-stopped \
  -p 80:80 \
  weighsoft-frontend
```

4. **Run Migrations:**
```bash
docker exec weighsoft-backend php artisan migrate --force
```

5. **Setup Cron:**
```bash
docker exec weighsoft-backend crond
```

### Reverse Proxy Setup

**Nginx Reverse Proxy:**
```nginx
server {
    listen 443 ssl;
    server_name api.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 443 ssl;
    server_name app.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
    }
}
```

### SSL/TLS Configuration

**Let's Encrypt:**
```bash
certbot --nginx -d api.example.com -d app.example.com
```

**Manual Certificates:**
- Place certificates in `/etc/nginx/ssl/`
- Configure in Nginx config

### Database Backup

**Automated Backup:**
```bash
#!/bin/bash
docker exec mysql-container mysqldump -u user -ppassword weighsoft > backup_$(date +%Y%m%d).sql
```

**Restore:**
```bash
docker exec -i mysql-container mysql -u user -ppassword weighsoft < backup.sql
```

## Monitoring

### Log Files

**Backend Logs:**
```bash
docker logs weighsoft-backend
docker logs weighsoft-backend -f  # Follow
```

**Frontend Logs:**
```bash
docker logs weighsoft-frontend
```

**Application Logs:**
- Laravel logs: `storage/logs/laravel.log`
- Access via Docker volume

### Health Checks

**Backend Health:**
```bash
curl http://localhost:8000/api/me
```

**Frontend Health:**
```bash
curl http://localhost/
```

### Performance Monitoring

- Monitor container resource usage
- Database query performance
- API response times
- Frontend load times

## Scaling

### Horizontal Scaling

**Backend:**
- Multiple backend containers
- Load balancer (Nginx/HAProxy)
- Shared database
- Shared storage volume

**Frontend:**
- Multiple frontend containers
- Load balancer
- CDN for static assets

### Database Scaling

- Read replicas for read-heavy operations
- Connection pooling
- Query optimization
- Index optimization

## Security

### Container Security

- Run containers as non-root user
- Limit container resources
- Use secrets for sensitive data (e.g. `DB_PASSWORD`, `JWT_SECRET`, `OPENAI_API_KEY`): inject via runtime env or a restricted `--env-file`, not baked into the image. See **LPR (Numberplate Recognition) API Key** under Environment Configuration.
- Regular security updates

### Network Security

- Firewall rules
- VPN for admin access
- SSL/TLS for all connections
- Rate limiting

### Application Security

- JWT token security
- Input validation
- SQL injection prevention
- XSS protection
- CSRF protection

## Backup and Recovery

### Database Backups

**Daily Backup:**
```bash
0 2 * * * docker exec mysql-container mysqldump -u user -ppassword weighsoft > /backups/db_$(date +\%Y\%m\%d).sql
```

**Backup Retention:**
- Daily backups: 30 days
- Weekly backups: 12 weeks
- Monthly backups: 12 months

### Application Backups

**Storage Backups:**
```bash
docker cp weighsoft-backend:/var/www/laravel/storage /backups/storage_$(date +%Y%m%d)
```

### Recovery Procedures

1. **Database Recovery:**
```bash
docker exec -i mysql-container mysql -u user -ppassword weighsoft < backup.sql
```

2. **Application Recovery:**
```bash
docker stop weighsoft-backend
docker rm weighsoft-backend
docker run ... # Restore from backup
```

## Troubleshooting

### Common Issues

**Container Won't Start:**
- Check logs: `docker logs container-name`
- Verify environment variables
- Check port conflicts

**Database Connection Issues:**
- Verify database credentials
- Check network connectivity
- Verify database is running

**API Not Responding:**
- Check backend container status
- Verify Nginx configuration
- Check PHP-FPM status

**Frontend Not Loading:**
- Check frontend container status
- Verify Nginx configuration
- Check browser console for errors

### Debug Mode

**Enable Debug (Development Only):**
```env
APP_DEBUG=true
APP_ENV=local
```

**View Logs:**
```bash
docker exec weighsoft-backend tail -f storage/logs/laravel.log
```

## Maintenance

### Regular Maintenance

- Update dependencies
- Security patches
- Database optimization
- Log rotation
- Backup verification

### Update Procedure

1. **Backup Current Version:**
```bash
docker commit weighsoft-backend weighsoft-backend:backup
```

2. **Pull New Code:**
```bash
git pull origin main
```

3. **Rebuild Images:**
```bash
docker build -t weighsoft-backend .
```

4. **Run Migrations:**
```bash
docker exec weighsoft-backend php artisan migrate
```

5. **Restart Containers:**
```bash
docker restart weighsoft-backend
```

## Environment-Specific Configurations

### Development

- Debug mode enabled
- Detailed error messages
- Local database
- Development API URL

### Staging

- Debug mode disabled
- Staging database
- Staging API URL
- Test data

### Production

- Debug mode disabled
- Production database
- Production API URL
- SSL/TLS required
- Monitoring enabled

