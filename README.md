# LocalNest — Step 3: Real Provider Profiles

Step 3 adds real provider listings on top of the working Step 2 account + jobs database.

## Adds
- Turn an existing customer account into a provider account
- Provider profile editor
- Service category, headline, bio, hourly rate
- Service radius, availability, years of experience
- City + ZIP
- Profile photo uploads using Supabase Storage
- Draft/publish control
- Public browsing of published providers
- Live provider profiles appear in the existing LocalNest provider grid
- Verification stays separate from publishing

## Install in this order
1. Run `supabase-step3.sql` in Supabase SQL Editor.
2. Upload `index.html`, `styles.css`, `app.js`, `step3.js`, and `README.md` to the existing GitHub repo.
3. DO NOT overwrite your existing `config.js` — it already contains your working public Supabase settings.
4. Wait for Vercel to redeploy.
5. Sign in to LocalNest and click **Offer a service**.
6. Build a provider profile, check **Publish my provider profile**, save, and verify it appears on the live site.

## Safety note
A published provider is not automatically verified. Real verification/background-check features should be implemented separately before LocalNest claims a provider is verified, especially for childcare or other higher-trust services.

## Next recommended stage
Step 4: real location matching and service areas.
