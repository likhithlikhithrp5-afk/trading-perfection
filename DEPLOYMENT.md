# Trade Journal AI - Deployment Guide

## Local Development

To run the application locally:

```bash
cd /path/to/trade-journal-ai

# Install dependencies (if not already done)
npm install

# Create .env.local with Supabase credentials
cp .env.example .env.local

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

This creates an optimized build in the `dist/` folder.

## Deployment Options

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

During deployment, add your environment variables in Vercel settings:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Option 2: Netlify

```bash
# Build
npm run build

# Deploy dist folder via Netlify CLI or drag & drop
netlify deploy --prod --dir=dist
```

### Option 3: Self-hosted (Any web server)

```bash
# Build
npm run build

# Copy dist folder to your web server
# Point your web server to serve index.html for all routes (SPA)
```

### Option 4: Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t trade-journal-ai .
docker run -p 80:80 trade-journal-ai
```

## Environment Variables

Required for production:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

Optional:
- `VITE_AI_PROVIDER` - AI provider (default: 'fallback')
- `VITE_AI_API_KEY` - API key for AI provider

## Database Backup

Supabase automatically handles daily backups. To manually backup:

1. Go to Supabase Dashboard
2. Project Settings → Backups
3. Click "Create backup"

## Monitoring

For production monitoring:

- **Supabase Console** - Monitor database and auth
- **Application Logs** - Browser dev tools console
- **Error Tracking** - Consider adding Sentry for production

## SSL/HTTPS

- **Vercel** - Automatic
- **Netlify** - Automatic  
- **Self-hosted** - Use Let's Encrypt (free)

## Performance Optimization

Already in place:
- Code splitting via Vite
- CSS minification
- JS minification
- Asset compression

## Scaling Considerations

- **Database**: Supabase automatically scales with free plan
- **Uploads**: Use Supabase Storage (free tier: 1GB)
- **API Calls**: Supabase free tier: 50,000 requests/day

## Maintenance

### Regular Tasks

- Monitor Supabase usage
- Check error logs
- Update dependencies: `npm update`
- Review and delete old images/backups
- Verify RLS policies security

### Updating

```bash
# Check for updates
npm outdated

# Update all packages
npm update

# Rebuild and test
npm run build
npm run preview
```

## Troubleshooting Production

### Blank white screen
- Check browser console for errors
- Verify environment variables are set correctly
- Check network tab for failed requests

### Database errors
- Verify Supabase credentials
- Check if tables are created (run migration SQL)
- Ensure RLS policies are enabled

### Slow performance
- Check Supabase bandwidth usage
- Review database query performance
- Monitor network waterfall in dev tools

### 404 errors on routes
- Ensure SPA routing is configured (rewrite to index.html)
- Check if build was successful

## Security Checklist

- ✅ Use HTTPS only
- ✅ Disable Supabase anonymous signup if needed
- ✅ Review RLS policies
- ✅ Set up rate limiting
- ✅ Enable CORS only for your domain
- ✅ Keep environment variables secure
- ✅ Regular security audits

## Support

For deployment help:
- Check Vercel/Netlify documentation
- Review Supabase docs
- Check GitHub Issues
- Contact support team

---

**Version**: 0.1.0
