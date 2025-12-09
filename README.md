# Fromentine Restaurant Website

A production-ready restaurant website built with Next.js, featuring online ordering, groceries, promotions, and an admin dashboard. Integrated with Supabase for database and realtime updates, and deployed on Vercel.

## Features

- **Single-page restaurant website** with multiple sections:
  - Hero section with branding
  - Food ordering with location selection (auto-detect via geolocation)
  - Groceries ordering section
  - Promotions & events display
  - Catering contact form
  - Drinks promo section with external link
- **Order tracking** with realtime status updates via Supabase Realtime
- **Admin dashboard** for managing orders and inventory
- **Responsive design** with mobile-first approach
- **Accessibility** features (keyboard navigation, ARIA labels, semantic HTML)

## Tech Stack

- **Next.js 14+** (App Router) with JSX
- **Tailwind CSS** for styling
- **Supabase** (PostgreSQL + Realtime + Auth)
- **Vercel** serverless functions (Next.js API routes)

## Prerequisites

- Node.js 18+ and npm
- A Supabase account and project
- A Vercel account (for deployment)

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Run the schema file: Copy and paste the contents of `supabase/schema.sql` and execute it
4. Run the seed file: Copy and paste the contents of `supabase/seed.sql` and execute it

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Public keys (safe to expose in client-side code)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Service role key (NEVER expose this in client-side code - server-side only)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google Places API Key (for address autocomplete)
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_api_key_here

# EmailJS Configuration (for contact form)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id_here
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id_here
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key_here

# Stripe Configuration (for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

You can find these values in your Supabase project settings:
- Go to **Settings** → **API**
- Copy the **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- Copy the **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy the **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

**Google Places API Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Places API** (for autocomplete)
   - **Maps JavaScript API** (required for Places API)
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key and add it to `.env.local` as `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`
6. (Optional) Restrict the API key to only allow requests from your domain for security

**EmailJS Setup (for Contact Form):**
1. Sign up for a free account at [EmailJS](https://www.emailjs.com/)
2. Go to **Email Services** → **Add New Service**
   - Choose your email provider (Gmail, Outlook, etc.)
   - Follow the setup instructions to connect your email
   - Copy the **Service ID** → `NEXT_PUBLIC_EMAILJS_SERVICE_ID`
3. Go to **Email Templates** → **Create New Template**
   - Template name: "Contact Form"
   - Subject: `New Contact Form Submission from {{from_name}}`
   - Content example:
     ```
     Name: {{from_name}}
     Email: {{from_email}}
     Phone: {{phone}}
     
     Message:
     {{message}}
     ```
   - Copy the **Template ID** → `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`
4. Go to **Account** → **General** → **API Keys**
   - Copy your **Public Key** → `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`
5. Add all three values to your `.env.local` file

**Stripe Setup (for Payments):**
1. Sign up for a Stripe account at [stripe.com](https://stripe.com)
2. Go to **Developers** → **API keys**
   - Copy your **Secret key** (starts with `sk_test_` for test mode) → `STRIPE_SECRET_KEY`
   - Keep this key secret! Never commit it to git.
3. Set up webhooks:
   - Go to **Developers** → **Webhooks**
   - Click **Add endpoint**
   - Endpoint URL: `https://yourdomain.com/api/webhook/payment` (use your production URL)
   - For local testing, use [Stripe CLI](https://stripe.com/docs/stripe-cli) to forward webhooks:
     ```bash
     stripe listen --forward-to localhost:3000/api/webhook/payment
     ```
   - Select events to listen to:
     - `checkout.session.completed`
     - `checkout.session.async_payment_succeeded`
     - `checkout.session.async_payment_failed`
   - Copy the **Signing secret** (starts with `whsec_`) → `STRIPE_WEBHOOK_SECRET`
4. Set your base URL:
   - For development: `NEXT_PUBLIC_BASE_URL=http://localhost:3000`
   - For production: `NEXT_PUBLIC_BASE_URL=https://yourdomain.com`
5. Add all Stripe values to your `.env.local` file

### 4. Create Admin User

**Method 1: Via Supabase Dashboard (Recommended)**
1. Go to your Supabase dashboard → **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Enter an email and password for your admin account
4. Save the credentials (you'll use these to log in to `/admin`)

**Method 2: Via Supabase SQL Editor**
You can also create admin users programmatically using SQL:
```sql
-- Create a new admin user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@example.com',
  crypt('your_secure_password', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW()
);
```

**Note:** After creating a user, they can log in at `/admin` using their email and password. All admin API routes require authentication.

### 5. Enable Realtime (if not already enabled)

1. Go to **Database** → **Replication** in your Supabase dashboard
2. Ensure the `orders` table has replication enabled
3. Alternatively, the schema.sql file includes: `ALTER PUBLICATION supabase_realtime ADD TABLE orders;`

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following tables:

- **locations**: Restaurant locations with coordinates
- **products**: Food, groceries, and drinks items
- **orders**: Customer orders with status tracking
- **order_items**: Items within each order
- **promotions**: Active promotions and events
- **catering_contacts**: Contact form submissions

See `supabase/schema.sql` for the complete schema with indexes and RLS policies.

## Project Structure

```
Fromentine/
├── src/
│   ├── app/
│   │   ├── page.jsx              # Homepage with all sections
│   │   ├── track/[orderId]/      # Order tracking page
│   │   ├── admin/                # Admin dashboard
│   │   └── api/                  # API routes
│   ├── components/               # React components
│   └── lib/                      # Utilities (Supabase, geolocation, cart)
├── supabase/
│   ├── schema.sql               # Database schema
│   └── seed.sql                 # Seed data
└── README.md
```

## API Routes

- `POST /api/stripe/create-checkout-session` - Create Stripe checkout session and order
- `POST /api/webhook/payment` - Stripe webhook handler for payment events
- `GET /api/orders/[id]` - Fetch order details
- `POST /api/contact` - Submit catering contact form (deprecated - now uses EmailJS)
- `PATCH /api/admin/orders/[id]/status` - Update order status (admin only)
- `PATCH /api/admin/products/[id]/inventory` - Update product inventory (admin only)

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New Project**
3. Import your GitHub repository
4. Configure environment variables in Vercel:
   - Go to **Settings** → **Environment Variables**
   - Add all three variables from `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
5. Click **Deploy**

### 3. Post-Deployment Checklist

- [ ] Verify environment variables are set in Vercel
- [ ] Test order creation flow
- [ ] Test order tracking with realtime updates
- [ ] Test admin login and order status updates
- [ ] Update drinks promo URL in `src/components/DrinksPromoSection.jsx` if needed
- [ ] Update location data in Supabase if using real addresses

## Environment Variables Checklist

Before deploying, ensure you have:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon/public key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service_role key (server-side only)
- [ ] `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` - Google Places API key (for address autocomplete)
- [ ] `NEXT_PUBLIC_EMAILJS_SERVICE_ID` - EmailJS Service ID (for contact form)
- [ ] `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` - EmailJS Template ID (for contact form)
- [ ] `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY` - EmailJS Public Key (for contact form)

## Security Notes

- **Never commit** `.env.local` or `.env` files to git
- The `SUPABASE_SERVICE_ROLE_KEY` should **only** be used in server-side API routes
- Client-side code uses the anon key for public reads
- Admin routes should be protected with Supabase Auth (currently scaffolded)

## Future Enhancements

- [ ] Payment integration (Stripe/PayPal) - TODO markers added in code
- [ ] Email notifications for order status changes
- [ ] SMS notifications for order updates
- [ ] Delivery driver assignment and tracking
- [ ] Customer accounts and order history
- [ ] Product images upload functionality
- [ ] Advanced admin reporting and analytics

## Troubleshooting

### Realtime not working

- Check that Realtime is enabled for the `orders` table in Supabase
- Verify your Supabase project has Realtime enabled (check project settings)
- Check browser console for subscription errors

### Geolocation not working

- Ensure HTTPS in production (geolocation requires secure context)
- Check browser permissions for location access
- Fallback to manual location selection is available

### Admin login issues

- Verify admin user exists in Supabase Auth
- Check that email/password are correct
- Ensure Supabase Auth is enabled in your project

## License

This project is private and proprietary.

## Support

For issues or questions, please contact the development team.







