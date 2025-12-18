# Production Deployment Checklist

**Last Updated**: December 18, 2025  
**Project**: ErrandBit  
**Version**: 1.0.0

## Pre-Deployment Checklist

### 1. Environment Configuration ✅

#### Environment Variables
- [ ] Copy `.env.example` to `.env.production`
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database credentials
- [ ] Set secure `JWT_SECRET` (min 32 characters)
- [ ] Configure `FRONTEND_URL` with production domain
- [ ] Set `ALLOWED_ORIGINS` with production domains
- [ ] Configure payment provider keys (Lightning Network)
- [ ] Set up Sentry DSN for error tracking
- [ ] Configure email service credentials (if applicable)
- [ ] Set up SMS provider keys (Twilio, if applicable)

#### Backend Environment Variables
```bash
# Required
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=<your-secure-32-char-secret>
FRONTEND_URL=https://errandbit.com

# Optional but Recommended
SENTRY_DSN=<your-sentry-dsn>
ALLOWED_ORIGINS=https://errandbit.com,https://www.errandbit.com
SESSION_SECRET=<your-session-secret>

# Lightning Network (if using)
LIGHTNING_ADDRESS=<your-lightning-address>
```

#### Frontend Environment Variables
```bash
VITE_API_URL=https://api.errandbit.com
VITE_ENVIRONMENT=production
```

### 2. Database Setup ✅

- [ ] Run all migrations: `npm run migrate`
- [ ] Verify schema with: `npm run db:verify`
- [ ] Create indexes for performance
- [ ] Set up database backups (automated)
- [ ] Configure connection pooling
- [ ] Test database connectivity
- [ ] Set up read replicas (if needed)
- [ ] Configure database monitoring

### 3. Security Audit ✅

- [ ] Run `npm audit` and fix all vulnerabilities
- [ ] Verify all dependencies are up to date
- [ ] Ensure HTTPS is enabled (TLS 1.3)
- [ ] Verify CSP headers are active
- [ ] Test rate limiting endpoints
- [ ] Verify CORS configuration
- [ ] Test authentication flows
- [ ] Verify secure cookie settings
- [ ] Review and rotate API keys
- [ ] Set up firewall rules
- [ ] Configure DDoS protection

### 4. Code Quality ✅

#### Frontend
- [ ] Run tests: `npm run test` (✅ 78/78 passing)
- [ ] Run linter: `npm run lint`
- [ ] Build production bundle: `npm run build`
- [ ] Check bundle size: Review `dist/stats.html`
- [ ] Verify no console.logs in production code
- [ ] Remove debug flags

#### Backend
- [ ] Run tests: `npm test` (✅ 64/64 passing, 16 skipped)
- [ ] Run linter: `npm run lint`
- [ ] Build TypeScript: `npm run build`
- [ ] Verify error handling
- [ ] Check logging configuration

### 5. Performance Optimization ✅

- [ ] Enable Gzip/Brotli compression ✅
- [ ] Configure CDN for static assets
- [ ] Set up cache headers
- [ ] Optimize images (WebP format)
- [ ] Verify code splitting ✅ (73% reduction)
- [ ] Test lazy loading ✅
- [ ] Run Lighthouse audit (target: 90+)
- [ ] Verify Web Vitals targets:
  - FCP < 1.8s
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
  - TTFB < 800ms

### 6. Monitoring & Logging ✅

- [ ] Set up error tracking (Sentry) ✅ (configured)
- [ ] Configure application logging
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure performance monitoring ✅
- [ ] Set up alerting (email/Slack)
- [ ] Configure log aggregation (CloudWatch, Datadog)
- [ ] Set up analytics (Google Analytics)
- [ ] Configure user session recording (optional)

### 7. Infrastructure Setup

#### Server Configuration
- [ ] Provision production servers (AWS, DigitalOcean, etc.)
- [ ] Configure load balancer
- [ ] Set up auto-scaling (if needed)
- [ ] Configure SSL certificates (Let's Encrypt)
- [ ] Set up reverse proxy (Nginx)
- [ ] Configure process manager (PM2, systemd)
- [ ] Set up health check endpoints
- [ ] Configure server backups

#### Docker Deployment (Optional)
- [ ] Build Docker images
- [ ] Push to container registry
- [ ] Set up Docker Compose for production
- [ ] Configure Docker secrets
- [ ] Set up container orchestration (Kubernetes)

### 8. DNS & Domain Configuration

- [ ] Purchase domain name
- [ ] Configure DNS records:
  - A record: `errandbit.com` → Server IP
  - A record: `www.errandbit.com` → Server IP
  - A record: `api.errandbit.com` → API Server IP
  - CNAME: `www` → `errandbit.com`
- [ ] Set up SSL/TLS certificates
- [ ] Configure CDN (Cloudflare, CloudFront)
- [ ] Set up email DNS records (SPF, DKIM, DMARC)

### 9. Testing in Production-Like Environment

#### Staging Environment
- [ ] Deploy to staging environment
- [ ] Run smoke tests
- [ ] Test authentication flows
- [ ] Test payment processing
- [ ] Test job creation and management
- [ ] Verify email notifications
- [ ] Test mobile responsiveness
- [ ] Perform load testing
- [ ] Test error scenarios
- [ ] Verify rate limiting
- [ ] Test database failover (if applicable)

#### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

### 10. Accessibility Verification ✅

- [ ] Run WAVE accessibility checker
- [ ] Test with screen reader (NVDA/JAWS)
- [ ] Verify keyboard navigation ✅
- [ ] Check color contrast (WCAG AA)
- [ ] Test with screen magnification
- [ ] Verify ARIA labels ✅
- [ ] Test focus management ✅

---

## Deployment Steps

### Initial Deployment

1. **Prepare Production Server**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 20.x
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PostgreSQL
   sudo apt install -y postgresql postgresql-contrib
   
   # Install Nginx
   sudo apt install -y nginx
   
   # Install PM2
   sudo npm install -g pm2
   ```

2. **Clone Repository**
   ```bash
   cd /var/www
   git clone https://github.com/yourusername/errandbit.git
   cd errandbit
   ```

3. **Install Dependencies**
   ```bash
   # Backend
   cd backend
   npm ci --production
   npm run build
   
   # Frontend
   cd ../frontend
   npm ci
   npm run build
   ```

4. **Configure Environment**
   ```bash
   # Copy and edit .env files
   cp .env.example .env.production
   nano .env.production
   ```

5. **Set Up Database**
   ```bash
   cd backend
   npm run migrate
   npm run db:seed # Optional: seed initial data
   ```

6. **Start Services**
   ```bash
   # Start backend with PM2
   cd backend
   pm2 start dist/server.js --name errandbit-api
   pm2 save
   pm2 startup
   
   # Configure Nginx for frontend
   sudo cp nginx.conf /etc/nginx/sites-available/errandbit
   sudo ln -s /etc/nginx/sites-available/errandbit /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

7. **Configure SSL**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d errandbit.com -d www.errandbit.com -d api.errandbit.com
   ```

### Using Docker

1. **Build Images**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Start Services**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Run Migrations**
   ```bash
   docker-compose -f docker-compose.prod.yml exec backend npm run migrate
   ```

---

## Post-Deployment Checklist

### Immediate (Within 1 hour)

- [ ] Verify application is accessible
- [ ] Test core user flows:
  - [ ] User registration
  - [ ] User login
  - [ ] Job creation
  - [ ] Job browsing
  - [ ] Runner profile creation
  - [ ] Payment processing
- [ ] Check error tracking dashboard
- [ ] Monitor server resources (CPU, RAM, disk)
- [ ] Verify SSL certificate is active
- [ ] Test API endpoints
- [ ] Check database connectivity
- [ ] Verify email delivery
- [ ] Test Lightning payments

### Within 24 Hours

- [ ] Review error logs
- [ ] Check performance metrics
- [ ] Monitor Web Vitals
- [ ] Review uptime status
- [ ] Check database performance
- [ ] Review rate limiting logs
- [ ] Monitor API response times
- [ ] Check user feedback

### Within 1 Week

- [ ] Set up automated backups
- [ ] Configure monitoring alerts
- [ ] Review security logs
- [ ] Perform security audit
- [ ] Review performance bottlenecks
- [ ] Optimize slow queries
- [ ] Set up log rotation
- [ ] Configure backup restoration testing

---

## Rollback Plan

### Quick Rollback Steps

1. **Revert to Previous Version**
   ```bash
   # With Git
   git checkout <previous-stable-commit>
   npm ci
   npm run build
   pm2 restart errandbit-api
   
   # With Docker
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml pull <previous-tag>
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Database Rollback** (if needed)
   ```bash
   # Restore from backup
   pg_restore -U username -d errandbit backup_file.dump
   ```

3. **Clear CDN Cache**
   ```bash
   # Cloudflare
   curl -X POST "https://api.cloudflare.com/client/v4/zones/<zone_id>/purge_cache" \
     -H "Authorization: Bearer <api_token>" \
     -H "Content-Type: application/json" \
     --data '{"purge_everything":true}'
   ```

---

## Health Check Endpoints

### Backend Health Checks
- **GET** `/health` - Basic health check
- **GET** `/health/db` - Database connectivity check
- **GET** `/health/ready` - Readiness probe (all services ready)

### Expected Responses
```json
{
  "status": "healthy",
  "timestamp": "2025-12-18T10:00:00.000Z",
  "uptime": 86400,
  "database": "connected",
  "redis": "connected"
}
```

---

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Application Metrics**
   - Request rate
   - Response times (p50, p95, p99)
   - Error rate (4xx, 5xx)
   - Active connections

2. **System Metrics**
   - CPU usage (alert if > 80%)
   - Memory usage (alert if > 85%)
   - Disk usage (alert if > 90%)
   - Network I/O

3. **Database Metrics**
   - Connection pool usage
   - Query performance
   - Slow query count
   - Database size

4. **Business Metrics**
   - Active users
   - Job creation rate
   - Payment success rate
   - Runner sign-up rate

### Alert Thresholds
- **Critical**: Downtime, 5xx errors > 5%
- **High**: Response time > 3s, Error rate > 1%
- **Medium**: CPU > 80%, Memory > 85%
- **Low**: Disk > 75%, Slow queries detected

---

## Backup Strategy

### Automated Backups

1. **Database Backups**
   ```bash
   # Daily full backup
   0 2 * * * pg_dump errandbit > /backups/errandbit_$(date +\%Y\%m\%d).sql
   
   # Weekly full backup with compression
   0 3 * * 0 pg_dump errandbit | gzip > /backups/errandbit_$(date +\%Y\%m\%d).sql.gz
   ```

2. **Application Backups**
   ```bash
   # Weekly code backup
   0 4 * * 0 tar -czf /backups/errandbit_app_$(date +\%Y\%m\%d).tar.gz /var/www/errandbit
   ```

3. **Backup Retention**
   - Daily backups: Keep for 7 days
   - Weekly backups: Keep for 4 weeks
   - Monthly backups: Keep for 12 months

### Backup Testing
- [ ] Test database restore monthly
- [ ] Verify backup integrity
- [ ] Document restore procedures
- [ ] Train team on restoration process

---

## Security Best Practices

### Ongoing Security Tasks

- [ ] Rotate JWT secrets quarterly
- [ ] Review and rotate API keys monthly
- [ ] Update SSL certificates (auto-renewal with certbot)
- [ ] Run security audits quarterly
- [ ] Review access logs weekly
- [ ] Update dependencies monthly
- [ ] Conduct penetration testing annually
- [ ] Review user permissions quarterly

### Incident Response Plan

1. **Detection**: Monitor alerts, error tracking
2. **Containment**: Isolate affected systems
3. **Eradication**: Remove threat, patch vulnerabilities
4. **Recovery**: Restore from backups if needed
5. **Post-Incident**: Document and improve processes

---

## Performance Targets

### Response Time Targets
- Homepage: < 1.5s
- API endpoints: < 200ms (95th percentile)
- Database queries: < 50ms (95th percentile)
- Job search: < 500ms

### Availability Target
- Uptime: 99.9% (8.76 hours downtime per year)
- Planned maintenance: < 4 hours per month

---

## Support & Maintenance

### Regular Maintenance Tasks

**Daily**
- [ ] Check error logs
- [ ] Monitor performance metrics
- [ ] Review security alerts

**Weekly**
- [ ] Review database performance
- [ ] Check backup status
- [ ] Analyze user feedback
- [ ] Review slow query logs

**Monthly**
- [ ] Update dependencies
- [ ] Review and optimize database indexes
- [ ] Conduct security audit
- [ ] Review and update documentation

**Quarterly**
- [ ] Rotate secrets
- [ ] Conduct load testing
- [ ] Review infrastructure costs
- [ ] Update disaster recovery plan

---

## Contact & Escalation

### Support Tiers

**Tier 1**: Application Errors
- Response time: 1 hour
- Resolution time: 4 hours

**Tier 2**: Performance Issues
- Response time: 2 hours
- Resolution time: 8 hours

**Tier 3**: Security Incidents
- Response time: 15 minutes
- Resolution time: 1 hour

### Emergency Contacts
- DevOps Lead: [contact]
- Security Lead: [contact]
- Database Admin: [contact]
- On-Call Engineer: [contact]

---

## Appendix

### Useful Commands

```bash
# View PM2 logs
pm2 logs errandbit-api

# Restart application
pm2 restart errandbit-api

# Monitor server resources
htop

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Database connection
psql -U username -d errandbit

# Check disk usage
df -h

# Check memory usage
free -m

# Network connections
netstat -tuln
```

---

**Deployment Sign-off**

- [ ] Development Lead: ____________________ Date: ________
- [ ] QA Lead: ____________________ Date: ________
- [ ] DevOps Lead: ____________________ Date: ________
- [ ] Security Lead: ____________________ Date: ________

**Ready for Production**: ☐ YES ☐ NO

**Notes**: _________________________________________________
