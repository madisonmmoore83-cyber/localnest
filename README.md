# LocalNest — Step 2: Real Accounts + Database

This build upgrades LocalNest from browser-only prototype storage to a real Supabase-backed marketplace foundation.

## What Step 2 adds

- Customer and provider account creation
- Email/password sign-in
- Persistent sessions
- Profiles table
- Jobs table
- Row Level Security (RLS)
- Signed-in job posting
- Live jobs stored in Postgres and visible across devices for authenticated users
- Customer email is never displayed on job cards
- Graceful browser-only fallback until the backend is connected

## Files

- `index.html`
- `styles.css`
- `app.js`
- `config.js`
- `supabase-setup.sql`

## Setup order

1. Create a Supabase project.
2. Open Supabase SQL Editor and run `supabase-setup.sql`.
3. In Supabase project settings/API, copy:
   - Project URL
   - Publishable key (or legacy anon public key)
4. Paste those two public values into `config.js`.
5. In Supabase Auth URL configuration, set the Site URL to your live Vercel site.
6. Upload all changed files to the existing GitHub `localnest` repository.
7. Vercel will redeploy automatically.
8. Create a test customer account, confirm email if required, sign in, and post a test job.

## Security

`config.js` is browser-visible by design, so only use Supabase's public Publishable/anon key there.

**Never place a service_role key, secret API key, database password, or other private credential in GitHub or browser JavaScript.**

The database uses Row Level Security policies from `supabase-setup.sql` so signed-in users can write only their own profile and jobs.

## Next build stage

Step 3: real provider profiles with service category, pricing, bio, service radius, availability, profile photo, and publish/unpublish controls.
