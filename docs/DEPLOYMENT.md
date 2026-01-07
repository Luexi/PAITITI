# Deployment Guide - Paititi del Mar

This guide covers deployment options for the Paititi del Mar reservation system.

## Option 1: Vercel (Recommended - Easiest)

Vercel is the recommended platform for Next.js applications, offering:
- Zero-configuration deployment
- Automatic HTTPS
- Global CDN
- Serverless functions
- Free tier available

### Steps:

1. **Push code to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/paititi-del-mar.git
git push -u origin main
```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Configure project:
     - Framework Preset: Next.js
     - Root Directory: `./`
     - Build Command: `npm run build`
     - Output Directory: `.next`

3. **Add Environment Variables:**
   In Vercel dashboard → Settings → Environment Variables, add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://etfbgipaorilamlvgylu.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   NEXT_PUBLIC_VENUE_ID=1
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait ~2 minutes
   - Your site will be live at `https://your-project.vercel.app`

5. **Custom Domain (Optional):**
   - Settings → Domains
   - Add your custom domain (e.g., `paititidelmar.com`)
   - Follow DNS configuration instructions

## Option 2: Docker (Self-Hosted)

For full control over hosting, use Docker.

### Prerequisites:
- Docker installed
- Docker Compose installed
- Server with public IP (DigitalOcean, AWS, Azure, etc.)

### Steps:

1. **Prepare .env.local:**
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

2. **Build and run:**
```bash
docker-compose up -d
```

3. **Check status:**
```bash
docker-compose ps
docker-compose logs app
```

4. **Access:**
   - Visit `http://your-server-ip:3000`

### Production Recommendations:

1. **Use NGINX as reverse proxy:**

Create `nginx.conf`:
```nginx
server {
    listen 80;
    server_name paititidelmar.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

2. **Add SSL with Let's Encrypt:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d paititidelmar.com
```

3. **Update docker-compose.yml:**
```yaml
services:
  app:
    build: .
    restart: always
    ports:
      - "3000:3000"
    env_file:
      - .env.local
  
  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./certs:/etc/nginx/certs
    depends_on:
      - app
```

## Option 3: Traditional Hosting (VPS)

### Requirements:
- Node.js 18+ installed
- PM2 for process management
- NGINX for reverse proxy

### Steps:

1. **Clone repository on server:**
```bash
git clone https://github.com/YOUR_USERNAME/paititi-del-mar.git
cd paititi-del-mar
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set environment variables:**
```bash
cp .env.example .env.local
nano .env.local  # Edit with your credentials
```

4. **Build:**
```bash
npm run build
```

5. **Install PM2:**
```bash
npm install -g pm2
```

6. **Start with PM2:**
```bash
pm2 start npm --name "paititi" -- start
pm2 save
pm2 startup  # Follow instructions to enable auto-start
```

7. **Configure NGINX:**
Same as Docker option above.

## Environment Variables Checklist

Make sure these are set in production:

- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon public key
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Service role key (NEVER expose publicly)
- ✅ `NEXT_PUBLIC_VENUE_ID` - Venue ID (default: 1)
- ⚠️ `MESSENGER_PAGE_ACCESS_TOKEN` - (Phase 5)
- ⚠️ `WHATSAPP_ACCESS_TOKEN` - (Phase 5)

## Post-Deployment Checklist

After deploying:

1. **Test public site:**
   - [ ] Home page loads
   - [ ] Navigation works
   - [ ] Menu, Gallery, Contact pages work
   - [ ] Reservation form loads

2. **Test reservation flow:**
   - [ ] Select date and party size
   - [ ] Available slots appear
   - [ ] Can complete reservation
   - [ ] Confirmation screen displays

3. **Test admin panel:**
   - [ ] Can login at `/admin/login`
   - [ ] Dashboard shows stats
   - [ ] Can view/filter reservations
   - [ ] Can create blocks
   - [ ] Can edit configuration

4. **Security checks:**
   - [ ] HTTPS enabled
   - [ ] Service role key not exposed
   - [ ] RLS working (test unauthorized access)
   - [ ] Login protected by middleware

5. **Performance:**
   - [ ] Page load times < 3s
   - [ ] Images optimized
   - [ ] No console errors

## Monitoring (Recommended)

Set up monitoring to catch issues early:

### Vercel Analytics
- Built-in with Vercel
- Free tier available
- Shows Web Vitals, page views, etc.

### Sentry (Error Tracking)
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

### Uptime Monitoring
- Use UptimeRobot (free)
- Monitor: `https://yoursite.com`
- Alert if down > 5 minutes

## Backup Strategy

1. **Database:** Supabase handles automatic backups
2. **Code:** Stored in Git
3. **Images:** Backup Supabase Storage bucket monthly

## Scaling Considerations

Current architecture supports:
- ~10,000 requests/day on free tier
- ~500 concurrent users
- ~1,000 reservations/month

To scale beyond this:
1. Upgrade Supabase plan
2. Implement caching (Vercel Edge Config or Redis)
3. Optimize database queries
4. Consider CDN for images

## Rollback Plan

If deployment fails:

**Vercel:**
- Dashboard → Deployments → Select previous deployment → Promote to Production

**Docker:**
```bash
docker-compose down
git checkout previous-commit
docker-compose up -d --build
```

**PM2:**
```bash
pm2 stop paititi
git checkout previous-commit
npm install
npm run build
pm2 restart paititi
```

## Support

For deployment issues:
- Check logs: `docker-compose logs app` or Vercel logs
- Verify environment variables
- Test database connection
- Check Supabase project status

## Cost Estimates

### Free Tier (Suitable for small restaurant):
- Vercel: Free (100GB bandwidth)
- Supabase: Free (500MB DB, 1GB storage)
- **Total: $0/month**

### Production (Medium restaurant):
- Vercel Pro: $20/month (1TB bandwidth, analytics)
- Supabase Pro: $25/month (8GB DB, 100GB storage)
- Custom domain: ~$12/year
- **Total: ~$45/month**

### High-Volume (Multiple venues):
- Vercel Enterprise: Custom pricing
- Supabase Team: $599/month
- Consider dedicated hosting
