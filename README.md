# ಪ್ರತಿಭಾ ಕನ್ನಡ (Pratibha Kannada)

> **ಕನ್ನಡ ಕಲಿಕೆಗೆ ಉಚಿತ ಡಿಜಿಟಲ್ ವೇದಿಕೆ**  
> Free digital learning platform for Kannada students

---

## 🌟 ವೈಶಿಷ್ಟ್ಯಗಳು (Features)

1. **100% ಉಚಿತ ಸಂಪನ್ಮೂಲಗಳು (100% Free)**:
   - 10ನೇ ತರಗತಿ (SSLC), 9ನೇ ತರಗತಿ, 8ನೇ ತರಗತಿ, 7ನೇ ತರಗತಿ, 6ನೇ ತರಗತಿ & PUC ಸಂಪನ್ಮೂಲಗಳು.
   - ಕನ್ನಡ ವ್ಯಾಕರಣ (ವರ್ಣಮಾಲೆ, ಸಂಧಿ, ಸಮಾಸ, ವಿಭಕ್ತಿ ಪ್ರತ್ಯಯ, ಗಾದೆಗಳು, ಅಲಂಕಾರ).
   - SSLC ಮತ್ತು ವಾರ್ಷಿಕ ಪರೀಕ್ಷಾ ಮಾದರಿ ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆಗಳು & ಕೀ ಉತ್ತರಗಳು.
   - ಗದ್ಯ ಮತ್ತು ಪದ್ಯಗಳ ಸಾರಾಂಶ, ಸಂದರ್ಭ ಸಹಿತ ಸ್ಪಷ್ಟೀಕರಣ.
   - ಪ್ರಸಿದ್ಧ ಕವಿ-ಸಾಹಿತಿಗಳ ಪರಿಚಯ (ಕುವೆಂಪು, ಬೇಂದ್ರೆ, ಕಾರಂತ, ಮಾಸ್ತಿ, ಇತ್ಯಾದಿ).

2. **ಸರಳ ಲಾಗಿನ್ & ವಿದ್ಯಾರ್ಥಿ ಟ್ರ್ಯಾಕಿಂಗ್ (Student Sign-up & Tracking)**:
   - ಕನಿಷ್ಠ ಇಮೇಲ್ ಮತ್ತು ತರಗತಿಯೊಂದಿಗೆ ಸರಳ ನೊಂದಣಿ.
   - ಲಾಗಿನ್ ಆದ ನಂತರ ಯಾವುದೇ ಅಡೆತಡೆ ಇಲ್ಲದೆ ಎಲ್ಲಾ ಸಂಪನ್ಮೂಲಗಳಿಗೂ ಮುಕ್ತ ಪ್ರವೇಶ.

3. **ನಿರ್ವಾಹಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ & ಬಳಕೆದಾರರ ಡೌನ್‌ಲೋಡ್ (Admin & User Export)**:
   - `http://localhost:3000/admin`
   - ಒಟ್ಟು ನೋಂದಾಯಿತ ವಿದ್ಯಾರ್ಥಿಗಳ ಸಂಖ್ಯೆ ಮತ್ತು ತರಗತಿವಾರು ಅಂಕಿಅಂಶ.
   - **ಏಕ-ಕ್ಲಿಕ್ CSV ಡೌನ್‌ಲೋಡ್**: ಎಲ್ಲಾ ನೋಂದಾಯಿತ ಬಳಕೆದಾರರ ಪಟ್ಟಿಯನ್ನು ಎಕ್ಸೆಲ್/CSV ರೂಪದಲ್ಲಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿಕೊಳ್ಳಬಹುದು (`/api/admin/users?export=csv`).

---

## Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Framework  | Next.js 15 (App Router, TypeScript) |
| Database   | Supabase (PostgreSQL + RLS)         |
| Auth       | Supabase Auth + Session Cookies     |
| Storage    | Supabase Storage                    |
| Styling    | Tailwind CSS + Noto Sans Kannada    |
| Deploy     | Vercel                              |
| E2E Tests  | Playwright                          |

---

## Quick Start

### 1. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 2. Key Pages

- **ಮುಖಪುಟ (Landing Page)**: [http://localhost:3000](http://localhost:3000)
- **ಉಚಿತ ಖಾತೆ (Register)**: [http://localhost:3000/register](http://localhost:3000/register)
- **ಲಾಗಿನ್ (Login)**: [http://localhost:3000/login](http://localhost:3000/login)
- **ಸಂಪನ್ಮೂಲ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ (Dashboard)**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- **ನಿರ್ವಾಹಕ / ಬಳಕೆದಾರರ ಪಟ್ಟಿ (Admin & Export)**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **CSV ಡೌನ್‌ಲೋಡ್**: [http://localhost:3000/api/admin/users?export=csv](http://localhost:3000/api/admin/users?export=csv)

---

## Supabase Setup (Optional for cloud DB)

If connecting to a remote Supabase project:
1. Copy `.env.example` to `.env.local`
2. Add your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Run `supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor.
