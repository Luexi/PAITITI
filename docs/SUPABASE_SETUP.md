# Supabase Setup Guide - Paititi del Mar

## Prerequisites
- Supabase account (free tier is sufficient)
- Your Supabase project URL and API keys

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - Project name: `Paititi del Mar`
   - Database Password: (create a strong password)
   - Region: Choose closest to Mexico (e.g., US East)
5. Click "Create Project" and wait for provisioning (~2 minutes)

## Step 2: Get Your Credentials

1. Go to Project Settings → API
2. Copy these values:
   - **Project URL:** `https://YOUR_PROJECT.supabase.co`
   - **anon public key:** Starts with `eyJ...`
   - **service_role key:** Starts with `eyJ...` (keep secret!)

3. Update your `.env.local` file:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 3: Run Database Migrations

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the editor
5. Click "Run" (bottom right)
6. Verify: You should see "Success. No rows returned"

## Step 4: Load Seed Data

1. Still in SQL Editor, create another "New Query"
2. Copy the contents of `supabase/seed.sql`
3. Paste and click "Run"
4. Verify: Check that data was inserted successfully

## Step 5: Verify Tables

1. Go to **Table Editor** in Supabase Dashboard
2. You should see these tables:
   - venues
   - opening_hours
   - settings
   - tables
   - reservations
   - blocks
   - walkins
   - audit_log
   - staff_profiles

## Step 6: Create Admin User

### Option A: Via Supabase Dashboard (Easiest)
1. Go to **Authentication** → **Users**
2. Click "Add user"
3. Choose "Create new user"
4. Fill in:
   - Email: `admin@paititidelmar.com` (or your email)
   - Password: (create a strong password)
   - Auto Confirm User: **Enable this**
5. Click "Create user"
6. Copy the user's UUID (you'll need it next)

### Option B: Via SQL
```sql
-- This creates a user in Supabase Auth
-- You'll need to do this via the dashboard as direct SQL user creation is restricted
```

## Step 7: Give Admin Permissions

1. Go back to **SQL Editor**
2. Run this query (replace `YOUR_USER_UUID` with the UUID from Step 6):

```sql
INSERT INTO staff_profiles (user_id, venue_id, role)
VALUES ('YOUR_USER_UUID', 1, 'owner');
```

Example:
```sql
INSERT INTO staff_profiles (user_id, venue_id, role)
VALUES ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1, 'owner');
```

## Step 8: Verify Row-Level Security

RLS is already enabled in the migration. Test it:

1. Try accessing tables without auth (should work forpublic reads):
```sql
SELECT * FROM venues;
SELECT * FROM opening_hours;
```

2. Try inserting as public (should fail except for reservations):
```sql
INSERT INTO blocks (venue_id, start_datetime, end_datetime, reason)
VALUES (1, NOW(), NOW() + INTERVAL '1 hour', 'Test');
-- Should fail with RLS error
```

## Step 9: Test the Application

1. Back in your local project, make sure `.env.local` is updated
2. Run `npm run dev`
3. Visit `http://localhost:3000/admin/login`
4. Login with your admin credentials
5. You should see the dashboard!

## Troubleshooting

### "Failed to create reservation"
- Check that Your service_role_key is set in `.env.local`
- Restart the Next.js dev server after updating env vars

### "No tienes permisos de administrador"
- Verify the staff_profile was created correctly
- Check that the user_id matches exactly

### "Cannot read properties of null"
- Make sure seed data was loaded successfully
- Check that venue_id = 1 exists in venues table

### RLS Blocking Admin Operations
- Verify you're using the service_role_key for server-side operations
- Check middleware.ts is working correctly

## Next Steps

- Upload restaurant photos to Supabase Storage (optional)
- Configure Email Templates in Authentication settings
- Set up Database Backups under Project Settings

## Storage Setup (Optional)

For uploading gallery images:

1. Go to **Storage** in Supabase Dashboard
2. Create a new bucket: `gallery`
3. Set bucket to **Public**
4. Upload images
5. Use URLs in your application:
   `https://YOUR_PROJECT.supabase.co/storage/v1/object/public/gallery/image.jpg`

## Security Checklist

- ✅ RLS enabled on all tables
- ✅ Service role key never exposed to frontend
- ✅ Anon key safely used (has limited permissions)
- ✅ Staff profiles required for admin access
- ✅ Audit logging for all changes
- ⚠️ Enable email confirmation in production
- ⚠️ Set up rate limiting for reservation API
- ⚠️ Configure SMTP for email notifications

## Production Recommendations

1. **Enable Email Confirmation:**
   - Authentication → Email Auth → Confirm email

2. **Set Up Custom SMTP:**
   - Authentication → Email Templates
   - Configure your email provider (SendGrid, AWS SES, etc.)

3. **Database Backups:**
   - Project Settings → Database → Enable automatic backups

4. **Monitor Usage:**
   - Check Dashboard for API usage
   - Free tier: 500MB database, 1GB file storage, 2GB bandwidth
   - Upgrade if needed

5. **API Rate Limiting:**
   - Consider implementing rate limiting middleware
   - Use Upstash or similar for distributed rate limiting in production

## Support

If you encounter issues:
- Check Supabase Documentation: https://supabase.com/docs
- Supab Dashboard Logs: Project → Logs
- Next.js Console: Check for error messages in terminal
