# Deploying Voira Frontend to Vercel

This guide will walk you through deploying the Voira Next.js frontend to Vercel while keeping your LiveKit backend running on LiveKit Cloud.

## Prerequisites

Before deploying, ensure you have:

1. ✅ **LiveKit Cloud account** with your backend agent running
   - Your agent should be deployed and accessible via LiveKit Cloud
   - You have your `LIVEKIT_URL`, `LIVEKIT_API_KEY`, and `LIVEKIT_API_SECRET`

2. ✅ **Weaviate Cloud account** (for RAG functionality)
   - Create a cluster at [Weaviate Cloud Console](https://console.weaviate.cloud/)
   - Get your `WEAVIATE_URL` and `WEAVIATE_API_KEY`

3. ✅ **OpenAI API key** (for embeddings)
   - Get from [OpenAI Platform](https://platform.openai.com/api-keys)

4. ✅ **GitHub repository** (recommended)
   - Your code should be pushed to https://github.com/jagan-shanmugam/voira

5. ✅ **Vercel account**
   - Sign up at [vercel.com](https://vercel.com) (free tier works!)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

#### Step 1: Import Your Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your GitHub repository: `jagan-shanmugam/voira`
4. Vercel will automatically detect the Next.js framework

#### Step 2: Configure Build Settings

When prompted for project settings:

- **Framework Preset**: Next.js (should be auto-detected)
- **Root Directory**: `frontend` ⚠️ **IMPORTANT** - Set this to `frontend` since your Next.js app is not in the root
- **Build Command**: `pnpm build` (should be auto-detected from vercel.json)
- **Output Directory**: `.next` (default)
- **Install Command**: `pnpm install` (should be auto-detected)

#### Step 3: Add Environment Variables

Before deploying, click on "Environment Variables" and add the following:

```bash
# LiveKit Configuration
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=APIxxxxxxxxxxxxxxx
LIVEKIT_API_SECRET=your-secret-key

# Weaviate Configuration
WEAVIATE_URL=https://your-cluster.weaviate.network
WEAVIATE_API_KEY=your-weaviate-api-key

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
```

**How to get these values:**

- **LiveKit**: Run `lk cloud auth && lk app env` in your terminal, or copy from LiveKit Cloud dashboard
- **Weaviate**: Copy from your Weaviate Cloud cluster details
- **OpenAI**: Create at https://platform.openai.com/api-keys

#### Step 4: Deploy!

1. Click **Deploy**
2. Wait for the build to complete (usually 2-3 minutes)
3. Once deployed, Vercel will give you a URL like: `https://voira-xxxxx.vercel.app`

### Option 2: Deploy via Vercel CLI

If you prefer using the command line:

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to the frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy (follow prompts)
vercel

# For production deployment
vercel --prod
```

During the CLI setup:
- Set root directory to current directory (since you're in `/frontend`)
- Confirm build settings
- Add environment variables when prompted

## Post-Deployment Configuration

### 1. Verify Environment Variables

After deployment, go to your Vercel project dashboard:
- Navigate to **Settings** → **Environment Variables**
- Ensure all 6 variables are set correctly
- Environment variables are encrypted and hidden by default

### 2. Test Your Deployment

Visit your deployed URL and test:
- ✅ Main landing page loads
- ✅ Voice interface connects to LiveKit
- ✅ Agent responds to voice input
- ✅ Document ingestion works (if using RAG features)

### 3. Configure Custom Domain (Optional)

1. Go to your Vercel project → **Settings** → **Domains**
2. Add your custom domain (e.g., `voira.yourdomain.com`)
3. Follow Vercel's instructions to update DNS records
4. Vercel automatically provisions SSL certificates

## Continuous Deployment

Vercel automatically sets up continuous deployment:

- **Production**: Deployments from your `main` branch go to production
- **Preview**: Every pull request gets a unique preview URL
- **Instant Rollbacks**: Revert to any previous deployment instantly

## Architecture Overview

After deployment, your architecture will be:

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Users → https://voira-xxxxx.vercel.app         │
│         (Next.js Frontend on Vercel)            │
│                                                 │
└────────────┬────────────────────────────────────┘
             │
             │ API Calls
             │
     ┌───────┴───────┬──────────────┬─────────────┐
     │               │              │             │
     ▼               ▼              ▼             ▼
LiveKit Cloud   Weaviate      OpenAI        Next.js
(Voice Agent)   (RAG Docs)   (Embeddings)   API Routes
   Backend       Storage        API          (Vercel)
```

## Troubleshooting

### Build Fails

**Error: "Cannot find module"**
- Solution: Ensure `pnpm-lock.yaml` is committed to git
- Run `pnpm install` locally to verify dependencies

**Error: "Root directory not found"**
- Solution: Make sure root directory is set to `frontend` in Vercel settings

### Runtime Errors

**"LIVEKIT_URL is not defined"**
- Solution: Add environment variables in Vercel dashboard
- After adding variables, redeploy (Vercel → Deployments → Redeploy)

**Connection to LiveKit fails**
- Solution: Verify your LiveKit URL starts with `wss://` not `https://`
- Ensure your LiveKit agent is running in LiveKit Cloud

**Document ingestion fails**
- Solution: Check that WEAVIATE_URL, WEAVIATE_API_KEY, and OPENAI_API_KEY are set
- Test Weaviate connection from your local environment first

### Performance Issues

**Slow cold starts**
- This is normal for Vercel's free tier
- Consider upgrading to Pro for better performance
- Implement proper caching strategies

## Environment-Specific Configuration

### Development vs Production

You can set different environment variables for different environments:

1. Go to Vercel → Settings → Environment Variables
2. Select which environments each variable should apply to:
   - Production
   - Preview
   - Development

Example: Use different LiveKit projects for staging vs production.

## Security Best Practices

✅ **Do:**
- Keep environment variables in Vercel dashboard only
- Use different API keys for development and production
- Enable Vercel's "Secure Environment Variables" feature
- Regularly rotate API keys

❌ **Don't:**
- Never commit `.env.local` or `.env` files to git
- Don't expose API keys in client-side code
- Don't use production keys in preview deployments

## Monitoring & Analytics

### Built-in Vercel Analytics

Enable Vercel Analytics for free:
1. Go to your project → Analytics
2. Follow the setup instructions
3. Monitor page views, performance, and Web Vitals

### Custom Logging

Check deployment logs:
1. Vercel Dashboard → Deployments
2. Click on any deployment → Function Logs
3. View real-time logs for your API routes

## Cost Optimization

### Vercel Pricing

- **Hobby (Free)**: Perfect for development and small projects
  - Unlimited deployments
  - 100GB bandwidth/month
  - Automatic HTTPS
  - Preview deployments

- **Pro ($20/month)**: For production apps
  - 1TB bandwidth
  - Advanced analytics
  - Faster builds
  - Team collaboration

### Tips to Stay on Free Tier

1. Optimize images (use Next.js Image component)
2. Enable caching headers
3. Use serverless functions efficiently
4. Monitor bandwidth usage in Vercel dashboard

## Scaling Considerations

As your app grows:

1. **Edge Functions**: Consider moving some API routes to edge for better performance
2. **Database**: Add a proper database (Supabase, PlanetScale) instead of CSV files
3. **CDN**: Leverage Vercel's global CDN for static assets
4. **Caching**: Implement ISR (Incremental Static Regeneration) for better performance

## Updates & Redeployment

### Automatic Deployments

Every git push to your repository triggers a new deployment:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

Vercel automatically:
- Builds your app
- Runs tests (if configured)
- Deploys to production
- Updates your live URL

### Manual Redeployment

To redeploy without code changes (e.g., after updating environment variables):
1. Go to Vercel Dashboard → Deployments
2. Click on the latest deployment
3. Click "Redeploy" → "Use existing Build Cache" (or not)

## Support & Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **LiveKit Documentation**: https://docs.livekit.io
- **Vercel Community**: https://github.com/vercel/vercel/discussions

## Next Steps

After successful deployment:

1. ✅ Set up a custom domain
2. ✅ Configure analytics and monitoring
3. ✅ Set up error tracking (Sentry, LogRocket)
4. ✅ Enable Vercel Speed Insights
5. ✅ Configure preview deployments for your team
6. ✅ Set up proper CI/CD workflows
7. ✅ Consider adding E2E tests

---

## Quick Reference: Complete Checklist

- [ ] GitHub repository is up to date
- [ ] LiveKit backend is running on LiveKit Cloud
- [ ] Environment variables are collected
- [ ] Vercel account is created
- [ ] Project imported to Vercel
- [ ] Root directory set to `frontend`
- [ ] All 6 environment variables added
- [ ] Successful deployment
- [ ] Live URL tested
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled

---

**Need help?** Open an issue on your GitHub repository or check the Vercel deployment logs for detailed error messages.


