# BALIORA Villa Management

Premium villa management website for Bali-based owners who want hands-off operations, transparent reporting, and stronger long-term asset performance.

## Overview

This repository is now a local-first React + Vite application.
The original project was exported from a hosted app builder, but the current runtime has been adapted so the app can run on a laptop without depending on that platform.

Current scope:

- public marketing pages for `Home`, `About`, `Services`, `Why Baliora`, `How It Works`, `FAQ`, `Contact`, `Assessment`, `Villas`, `Villa Detail`, `Blog`, and `Blog Post`
- local authentication flow for `Login`, `Register`, `Forgot Password`, and `Reset Password`
- local-first admin portal under `/admin`
- EmailJS-based booking and consultation auto-reply flow
- optional Supabase REST sync for selected records
- route-level SEO metadata updates

## Local-First Runtime

Hosted-platform runtime dependencies have been replaced with local adapters:

- auth uses browser `localStorage`
- public entities use local persistence helpers
- admin CRUD uses the local data client in [src/api/localClientCore.js](src/api/localClientCore.js)
- image uploads in admin are stored locally as data URLs
- public content reads from admin-managed local records when available

That means the app still works even when Supabase is not configured.

## Main Architecture

### Public app

- [src/api/localClient.js](src/api/localClient.js)
  Local app client for auth and public entities.
- [src/lib/localAuth.js](src/lib/localAuth.js)
  Local email/password auth, OTP verification, demo Google login, and password reset.
- [src/lib/localEntities.js](src/lib/localEntities.js)
  Local persistence for villas, booking inquiries, owner inquiries, and assessments.
- [src/lib/siteContent.js](src/lib/siteContent.js)
  Reads admin-managed website settings, testimonials, FAQs, and service pillars for the public site.

### Admin app

- [src/api/localClientCore.js](src/api/localClientCore.js)
  Local data client for admin pages and shared entities.
- [src/components/admin/AdminLayout.jsx](src/components/admin/AdminLayout.jsx)
  Admin shell and navigation.
- [src/pages/admin](src/pages/admin)
  Admin dashboards, content editors, and CRUD screens.

### Serverless and remote sync

- [api/send-lead.js](api/send-lead.js)
  Vercel serverless function that sends booking and consultation auto-replies through EmailJS.
- [api/utils/sendLeadConfig.js](api/utils/sendLeadConfig.js)
  Shared payload builder for booking and consultation auto-reply templates.
- [src/lib/sendLeadNotification.js](src/lib/sendLeadNotification.js)
  Frontend helper that posts lead data to `/api/send-lead`.
- [src/lib/supabaseRest.js](src/lib/supabaseRest.js)
  Optional Supabase REST helpers for insert, list, upsert, update, and delete.

## Tech Stack

- React 18
- Vite 7
- React Router
- Tailwind CSS
- Framer Motion
- TanStack Query
- EmailJS
- optional Supabase REST API
- browser `localStorage` for local-first persistence

## Folder Structure

```text
api/
  send-lead.js
backend/
  sendLeadConfig.js
entities/
  VillaOwner.json
src/
  api/
  localClientCore.js
  localClient.js
  components/
    admin/
    home/
    layout/
    seo/
    services/
    shared/
    ui/
    villas/
  data/
    localVillas.js
  lib/
    AuthContext.jsx
    localAuth.js
    localEntities.js
    localStorage.js
    query-client.js
    sendLeadNotification.js
    siteContent.js
    supabaseRest.js
  pages/
    admin/
    About.jsx
    Assessment.jsx
    Blog.jsx
    BlogPost.jsx
    Contact.jsx
    Dashboard.jsx
    FAQ.jsx
    ForgotPassword.jsx
    Home.jsx
    HowItWorks.jsx
    Login.jsx
    Register.jsx
    ResetPassword.jsx
    Services.jsx
    VillaDetail.jsx
    Villas.jsx
    WhyBaliora.jsx
supabase/
  schema.sql
tests/
  localClientCore.test.mjs
  localAuth.test.mjs
  localEntities.test.mjs
  sendLeadConfig.test.mjs
  siteContent.test.mjs
```

## Environment Variables

Create `.env.local` in the project root when you want to connect EmailJS and Supabase.

```env
VITE_SUPABASE_URL=https://ovhknejyttlxokirwkps.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

EMAILJS_SERVICE_ID=service_ajp81e8
EMAILJS_PUBLIC_KEY=YOUR_EMAILJS_PUBLIC_KEY
EMAILJS_PRIVATE_KEY=YOUR_EMAILJS_PRIVATE_KEY
EMAILJS_CONSULTATION_TEMPLATE_ID=template_9ztsb6v
EMAILJS_BOOKING_TEMPLATE_ID=template_nvpkgni
LEADS_TO_EMAIL=uwildan544@gmail.com
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

Notes:

- if Supabase env vars are empty, the app still works locally with session-backed memory storage
- if EmailJS env vars are empty, leads are still saved locally but email delivery is skipped
- `.env.local` is ignored by git

## Supabase Tables

The starter schema lives at [supabase/schema.sql](supabase/schema.sql).

It currently includes (prefixed with `ba_` to match the custom schema):

- `ba_owner_inquiries`
- `ba_villa_assessments`
- `ba_booking_inquiries`
- `ba_villa_listings`
- `ba_villa_owners`
- `ba_blog_posts`
- `ba_faqs`
- `ba_testimonials`
- `ba_website_settings`
- `ba_activity_logs`
- `ba_app_users`

Important note:

- the current policies are intentionally permissive for local-first demo development
- before production use, tighten RLS and role access properly

## Form and Email Flow

### `/contact`

- saves owner inquiry locally through `localEntities.Inquiry.create()`
- optionally inserts into Supabase `ba_owner_inquiries`
- sends auto-reply to the user email (with a branded HTML table, excluding contact details)
- sends admin notification to the configured owner email (with all details including contact info)

### `/assessment`

- saves villa assessment locally through `localEntities.VillaAssessment.create()`
- optionally inserts into Supabase `ba_villa_assessments`

### `/villas/:slug`

- saves booking inquiry locally through `localEntities.BookingInquiry.create()`
- optionally inserts into Supabase `ba_booking_inquiries`
- sends auto-reply to the guest email (with a branded HTML table, excluding contact details)
- sends admin notification to the configured owner email (with all details including contact info)

### EmailJS Setup & Template Variables

EmailJS uses `api/send-lead.js` to dispatch emails. You should configure the templates on EmailJS with the following variables:

- `to_email` (recipient)
- `reply_to` (for replying directly to the user/lead)
- `subject` (email subject line)
- `heading` (header title inside the email)
- `intro` (introductory text)
- `html_content` (the pre-formatted HTML table containing submission details)
- `fields_summary` (plain-text summary of fields)

> [!IMPORTANT]
> To render the HTML table correctly in your EmailJS template, you **must** use triple curly braces for the `html_content` variable in your EmailJS template editor:
> ```html
> {{{html_content}}}
> ```
> Using double curly braces `{{html_content}}` will escape the HTML tags and print raw code.

---

## Admin Portal & Dashboards

The admin portal `/admin` has been modernized and standardized.

### Dashboard Core Features
- **Consistent Layout**: Clean grids, detail drawers, and interactive status filters.
- **Booking & Inquiry Management (`/admin/bookings` and `/admin/inquiries`)**:
  - **Interactive Tables**: Clickable rows that slide open a detailed side drawer instead of navigating away.
  - **Quick Action Triggers**: Inside the drawer, click to directly trigger prefilled **WhatsApp** messages or open a pre-formatted **Gmail Compose window** (`mail.google.com`) with automated email templates (e.g., reply scripts containing client/booking details).
  - **Pill-shaped Filters**: Select status tabs (e.g., All, Pending, Confirmed, Completed, Cancelled) dynamically with pill buttons.

### Admin Content Sync

The admin portal now updates local content that can appear on the public website.

Currently connected:

- navbar branding, navigation links, and CTA buttons
- homepage hero, trust statement, and CTA content
- about page content
- services page hero, CTA, and service pillars
- testimonials
- FAQs
- blog posts

Current behavior:

- local changes show immediately on the same browser profile
- if Supabase is configured, supported admin CRUD also attempts to sync remotely

## Authentication Notes

The auth flow is integrated with Supabase Auth when configured:

- **Register**: Registers a new user directly in Supabase Auth using the standard email confirmation flow. Once the confirmation link sent to the user's email is clicked, the account is activated.
- **Login**: Authenticates users against Supabase Auth.
- **Google Sign-In**: Fully integrated with Supabase OAuth. Users can sign in using their Google account once Google Auth Provider is configured in the Supabase Dashboard.
- **Forgot Password**: Requests a reset password link from Supabase Auth.
- **User profiles**: Profiles are mirrored to the `ba_app_users` table in the database to manage application roles and statuses.

### Google OAuth Configuration Setup

To enable Google Sign-In:

1. **Google Cloud Console**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/) and create a project.
   - Create **OAuth Client ID** credentials (Web application type).
   - Under **Authorized redirect URIs**, add the Redirect URI copied from your Supabase Project.
2. **Supabase Dashboard**:
   - Navigate to **Authentication** > **Providers** > **Google**.
   - Enable the Google provider.
   - Paste the **Client ID** and **Client Secret** generated from Google Cloud Console.
   - Copy the **Redirect URI** shown in Supabase and add it to Google Cloud Console.
3. **Supabase URL Configuration**:
   - Go to **Authentication** > **URL Configuration**.
   - Add `http://localhost:5173/**` and `http://localhost:5173/home` to the **Redirect URLs** whitelist.

### Demo Accounts

You can use the following credentials to log in and test different roles:

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@baliora.local` | `Admin@2026` |
| **Villa Manager** | `villa.manager@baliora.local` | `Villa@2026` |
| **Reservation Staff** | `reservation.staff@baliora.local` | `Booking@2026` |
| **Content Manager** | `content.manager@baliora.local` | `Content@2026` |
| **User** | `user@baliora.local` | `User@2026` |

## How To Run Locally

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Open the local Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

Other useful scripts:

```bash
npm run test
npm run lint
npm run build
npm run preview
npm run typecheck
```

Important note about email testing:

- `npm run dev` runs only the Vite frontend
- `/api/send-lead` is a Vercel-style serverless route
- for real local API testing, use `vercel dev`
- for simplest end-to-end email testing, use the deployed Vercel URL

## How To Deploy

Recommended target: Vercel

Deployment checklist:

1. set `VITE_SUPABASE_URL` if you want remote data sync
2. set `VITE_SUPABASE_ANON_KEY` if you want remote data sync
3. set `EMAILJS_SERVICE_ID`
4. set `EMAILJS_PUBLIC_KEY`
5. set `EMAILJS_PRIVATE_KEY`
6. set `EMAILJS_CONSULTATION_TEMPLATE_ID`
7. set `EMAILJS_BOOKING_TEMPLATE_ID`
8. set `LEADS_TO_EMAIL`
9. deploy
10. test `/contact` and a villa booking form from the deployed URL

## Current Limitations

- most persistence is still local-first, so browser storage can differ per device/browser
- admin upload images are stored as data URLs, not cloud assets
- Supabase sync is optional and still demo-oriented, not yet hardened for production multi-user admin
- some admin sections still point to placeholder pages where no final workflow exists yet
- older email experiments may still exist in the dependency tree, but active email delivery now uses EmailJS

## Test Status

The codebase currently includes tests for:

- local auth
- local entities
- local compatibility layer
- EmailJS payload generation
- public site content helpers

Run:

```bash
npm run test
```

## Documentation Scope

Project-owned markdown currently lives in:

- [README.md](README.md)

Most other `.md` files in the repository come from `node_modules` and are not part of the project documentation.

## Recommended Next Steps

1. configure Supabase and run [schema.sql](supabase/schema.sql)
2. configure EmailJS in Vercel
3. test lead delivery from deployed forms
4. tighten Supabase RLS before production use
5. decide which admin modules should stay local-first and which should become fully remote
