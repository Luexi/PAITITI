# Paititi del Mar - Restaurant Reservation System

Sistema completo de reservaciones para Paititi del Mar, restaurante de mariscos en Acapulco Diamante.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account
- Git

### Installation

1. **Clone and install dependencies:**
```bash
cd PAITITI
npm install
```

2. **Configure environment variables:**
Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

3. **Run database migrations:**
- Go to your Supabase project dashboard
- Navigate to SQL Editor
- Run the migration file: `supabase/migrations/001_initial_schema.sql`
- Run the seed file: `supabase/seed.sql`

4. **Create admin user:**
- In Supabase Dashboard → Authentication → Users
- Click "Add user" and create an account
- Copy the user UUID
- In SQL Editor, run:
```sql
INSERT INTO staff_profiles (user_id, venue_id, role) 
VALUES ('YOUR_USER_UUID', 1, 'owner');
```

5. **Start development server:**
```bash
npm run dev
```

Visit `http://localhost:3000`

## 📁 Project Structure

```
PAITITI/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Home page
│   ├── menu/                # Menu page
│   ├── galeria/             # Gallery page
│   ├── contacto/            # Contact page
│   ├── reservar/            # Reservation page
│   ├── admin/               # Admin panel (Phase 2)
│   └── api/                 # API routes
│       ├── availability/    # Check available time slots
│       └── reservations/    # Create reservations
├── components/              # React components
│   └── layout/             # Header, Footer
├── lib/                     # Utilities
│   └── supabase/           # Supabase clients
├── public/                  # Static assets
└── supabase/               # Database migrations
```

## 🎨 Features

### Phase 0-1 (✅ Completed)
- ✅ Premium oceanic themed website
- ✅ Responsive design (mobile-first)
- ✅ Home, Menu, Gallery, Contact pages
- ✅ Real-time availability checking
- ✅ Online reservation system
- ✅ Multi-tenant database architecture
- ✅ Row Level Security (RLS)

### Phase 2 (🚧 In Progress)
- Admin authentication
- Dashboard with metrics
- Reservation management (CRUD)
- Date/time blocking system
- Opening hours configuration

### Phase 3-5 (📋 Planned)
- 2D table map with real-time status
- Walk-in customer management
- Advanced calendar views
- WhatsApp/Messenger integrations

## 🗄️ Database Schema

See `supabase/migrations/001_initial_schema.sql` for complete schema.

Key tables:
- `venues` - Restaurant configuration
- `reservations` - Customer reservations
- `tables` - Table layout and capacity
- `opening_hours` - Business hours
- `blocks` - Date/time closures
- `staff_profiles` - Admin users

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Public can only create reservations
- Admin operations require authentication
- Service role key never exposed to frontend
- Input validation with Zod
- Audit logging for all changes

## 📱 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Validation:** Zod
- **Icons:** Lucide React

## 🌐 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker
```bash
docker-compose up
```

## 📞 Support

For issues or questions, contact the development team.

## 📄 License

Proprietary - Paititi del Mar © 2026
