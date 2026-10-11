# ಪ್ರತಿಭಾ ಕನ್ನಡ (Pratibha Kannada)

> **ಕನ್ನಡ ಕಲಿಕೆಗೆ ಉಚಿತ ಡಿಜಿಟಲ್ ವೇದಿಕೆ**  
> A dedicated, 100% free digital learning platform for Kannada-speaking students.

**Production Website:** [https://pratibha-kannada-v8ym.vercel.app/](https://pratibha-kannada-v8ym.vercel.app/)  
**Repository:** [https://github.com/brainyveiny/Pratibha-kannada](https://github.com/brainyveiny/Pratibha-kannada)

---

## 1. ಯೋಜನೆಯ ಪರಿಚಯ (Project Overview)

**Pratibha Kannada** is a modern educational web platform designed to provide high-quality, organized, and freely accessible learning materials for secondary and pre-university students studying Kannada in Karnataka. 

### Core UX Principle
**"Discover → Find → Open → Study"**: A student finds what they need within 2 to 3 clicks, without paywalls, popups, or unnecessary complexity.

### Scope & Subject Focus
- **Strictly Kannada Subject Only:** Pratibha Kannada focuses exclusively on the **Kannada language and literature** curriculum (First Language Kannada, Second Language Kannada, and Pre-University Kannada). It does not provide content for other subjects like Mathematics, Science, or Social Studies.
- **Academic Levels:** Supported exclusively for five academic levels:
  1. **8ನೇ ತರಗತಿ (Class 8)**
  2. **9ನೇ ತರಗತಿ (Class 9)**
  3. **10ನೇ ತರಗತಿ / SSLC (Class 10)**
  4. **1ನೇ ಪಿಯುಸಿ (1st PUC)**
  5. **2ನೇ ಪಿಯುಸಿ (2nd PUC)**

> **Note on Lower Classes:** Classes 6 and 7 are deliberately **not supported** by Pratibha Kannada. All navigation, user registration, search filters, and content catalogs are strictly scoped to Classes 8 through 10 and PUC.

---

## 2. ಪ್ರಮುಖ ವೈಶಿಷ್ಟ್ಯಗಳು (Current Features)

1. **ಸಂಪನ್ಮೂಲ ಅನ್ವೇಷಣೆ (Resource Discovery & Filtering)**:
   - Filter by academic level: **8ನೇ ತರಗತಿ**, **9ನೇ ತರಗತಿ**, **10ನೇ ತರಗತಿ (SSLC)**, **1ನೇ ಪಿಯುಸಿ**, **2ನೇ ಪಿಯುಸಿ**, or **ಎಲ್ಲಾ ಬೆಂಬಲಿತ ತರಗತಿಗಳು (All Supported Classes)**.
   - Filter by content category: **ಗದ್ಯ (Prose)**, **ಪದ್ಯ (Poetry)**, **ವ್ಯಾಕರಣ (Grammar)**, **ಪ್ರಶ್ನೆ ಪತ್ರಿಕೆಗಳು (Question Papers)**, **ಮಾದರಿ ಪತ್ರಿಕೆಗಳು (Model Papers)**, and **ಅಧ್ಯಯನ ಸಾಮಗ್ರಿ (Study Materials)**.
   - Dedicated resource view page (`/dashboard/resource/[slug]`) with full summary, key takeaways, and PDF study material downloads.

2. **ಬುದ್ಧಿವಂತ ಹುಡುಕಾಟ & ಲಿಪ್ಯಂತರ (Intelligent Kannada Search & Transliteration)**:
   - Real-time search autocomplete with keyboard navigation (`↑`, `↓`, `Enter`, `Escape`).
   - Dual-language search support: Search directly in Kannada script or in Romanized English script (e.g., typing `sandhi` or `samasa` automatically transliterates to `ಸಂಧಿ` and `ಸಮಾಸ` via `@indic-transliteration/sanscript`).
   - Comprehensive Kannada grammar glossary linking technical terms directly to relevant resources.

3. **ಆಧುನಿಕ ವಿನ್ಯಾಸ (Modern Design & Visual System)**:
   - **ಲೈವ್ ಕನ್ನಡ ಅಕ್ಷರ ಹಿನ್ನೆಲೆ (Live Kannada Particle Background):** Fluid, non-intrusive HTML5 canvas particle system scattering tiny, drifting Kannada glyphs across the viewport.
   - **ಗ್ಲಾಸ್ಮಾರ್ಫಿಸಂ (Liquid Glass Styling):** Neutral, color-preserving translucent glass cards and floating navigation bars that reveal underlying typography and soft ambient gradients without artificial color tinting.
   - **ಮೊಬೈಲ್ ಆದ್ಯತೆ (Mobile-First):** Fully responsive layout optimized for mobile screens on Indian mobile networks.

4. **ವಿದ್ಯಾರ್ಥಿ ನೋಂದಣಿ & ಲಾಗಿನ್ (Authentication & Student Profiles)**:
   - Simple email and password registration.
   - Mandatory academic level selection during sign-up restricted strictly to supported classes (8, 9, 10, 1st PUC, 2nd PUC).
   - Session persistence via secure HTTP-only cookies and Supabase Auth.
   - Built-in password reset request workflow (`/api/auth/reset-password`).

5. **ನಿರ್ವಾಹಕ ವ್ಯವಸ್ಥೆ (Admin & Content Management)**:
   - Protected admin dashboard (`/admin`) accessible to authorized email addresses or via administrative secret.
   - Real-time metrics: total resources, published vs. draft content count, registered student count, and class-wise student breakdowns.
   - Filter existing content by supported class and publication status.
   - Create and draft new educational resources, bind them to class and subject hierarchy, and publish or unpublish instantly.
   - **CSV Export:** One-click CSV export of registered student metrics (`/api/admin/users?export=csv`).

---

## 3. ತಂತ್ರಜ್ಞಾನ ಸ್ಟ್ಯಾಕ್ (Technology Stack)

| Layer | Choice | Details |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | Server Components, Route Handlers, TypeScript |
| **Language** | TypeScript 5.6 | Strict type checking across components and APIs |
| **Styling** | Tailwind CSS 3.4 + Vanilla CSS | CSS variables, custom glassmorphism utilities (`globals.css`) |
| **Typography** | Google Fonts | `Noto Sans Kannada` + Kannada system font fallback |
| **Icons** | Lucide React | Clean, accessible vector icons |
| **Database** | Supabase (PostgreSQL) | Normalized schema with Row Level Security (RLS) |
| **Authentication** | Supabase Auth + Session Cookies | Email/password auth with local cryptographic cookie fallback |
| **File Storage** | Supabase Storage | `educational-resources` bucket for PDF files |
| **Transliteration**| Sanscript | `@indic-transliteration/sanscript` for Roman-to-Kannada mapping |
| **Unit Testing** | Jest | Testing security, suggestions, transliteration, classes |
| **E2E Testing** | Playwright | Multi-browser end-to-end regression testing |
| **Deployment** | Vercel | Automatic CI/CD deployments connected to GitHub |

---

## 4. ಪ್ರಾಜೆಕ್ಟ್ ರಚನೆ (Directory Structure)

```
pratibha-kannada/
├── src/
│   ├── app/
│   │   ├── page.tsx                      # Homepage with Hero, 5 Supported Classes, Highlights
│   │   ├── layout.tsx                    # Root layout with Noto Sans Kannada font & metadata
│   │   ├── globals.css                   # Tailwind styles, Liquid Glass tokens & animations
│   │   ├── login/page.tsx                # Student login page
│   │   ├── register/page.tsx             # Student registration page (Classes 8, 9, 10, PUC)
│   │   ├── dashboard/
│   │   │   ├── page.tsx                  # Resource discovery, search & class filter dashboard
│   │   │   └── resource/[slug]/page.tsx  # Resource detail & PDF download viewer
│   │   ├── admin/
│   │   │   ├── page.tsx                  # Admin overview & metrics server component
│   │   │   └── AdminContentManager.tsx   # Interactive admin content and resource manager
│   │   └── api/
│   │       ├── auth/                     # login, register, logout, reset-password endpoints
│   │       ├── admin/                    # admin content and users management APIs
│   │       ├── search/suggestions/       # Search autocomplete API endpoint
│   │       └── upload/                   # PDF file upload to Supabase Storage API
│   ├── components/
│   │   ├── auth/                         # LoginForm, RegisterForm components
│   │   ├── background/                   # KannadaParticleBackground canvas component
│   │   ├── dashboard/                    # LiveSearchAutocomplete, ResourceCard components
│   │   └── ui/                           # Navbar, Footer, and shared UI controls
│   ├── data/
│   │   ├── classes.ts                    # Single source of truth for supported academic levels
│   │   ├── resources.ts                  # Static resource catalog and types
│   │   └── kannadaGlossary.ts            # Educational Kannada terminology glossary
│   ├── lib/
│   │   ├── authServer.ts                 # Server-side auth and admin role verification
│   │   ├── kannadaTransliteration.ts     # Kannada phonetic transliteration engine
│   │   ├── searchSuggestions.ts          # Relevance scoring and suggestions engine
│   │   ├── security.ts                   # Password hashing, HMAC sessions, CSRF validation
│   │   ├── session.ts                    # Cookie session helpers
│   │   └── supabase/                     # Supabase client, server, and middleware helpers
│   └── __tests__/                        # Jest unit tests (classes, security, transliteration)
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql        # Supabase PostgreSQL schema, tables, RLS & seed data
├── .env.example                          # Environment configuration template
├── package.json                          # Scripts and dependencies
└── README.md                             # Documentation
```

---

## 5. ಸ್ಥಳೀಯ ಅಭಿವೃದ್ಧಿ ಸೆಟಪ್ (Local Development Setup)

### 1. Prerequisites
- **Node.js**: v18.18.0 or higher
- **npm**: v9.0.0 or higher

### 2. Clone the Repository
```bash
git clone https://github.com/brainyveiny/Pratibha-kannada.git
cd Pratibha-kannada
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy the example environment file and provide your credentials:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```ini
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin Authorization (comma-separated admin emails)
ADMIN_EMAILS=admin@pratibhakannada.org

# Optional Session & Admin Secrets
SESSION_SECRET=your_32_character_random_session_secret
ADMIN_SECRET=your_optional_admin_secret_token

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_STORAGE_BUCKET=educational-resources
```

> **Note:** The application includes a self-contained local fallback mode. If Supabase keys are not provided during local prototyping, static mock resources and local session cookies will continue to work for testing.

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. ಪರೀಕ್ಷೆ ಮತ್ತು ಗುಣಮಟ್ಟ ಪರಿಶೀಲನೆ (Testing & Quality Checks)

The repository includes a comprehensive verification suite:

### Unit Tests (Jest)
Runs tests for supported academic level constraints, session security, Kannada transliteration, and search suggestions:
```bash
npm test
```

### TypeScript Type Checking
Verifies type safety across all components and server functions:
```bash
npm run typecheck
```

### Code Linting (ESLint)
Checks for code style and Next.js best practices:
```bash
npm run lint
```

### End-to-End Tests (Playwright)
Validates critical user flows (homepage navigation, resource search, registration, login):
```bash
npm run test:e2e
```

### Production Build
Builds the Next.js application for production:
```bash
npm run build
```

---

## 7. ಕಂಟೆಂಟ್ ಮತ್ತು ಡೇಟಾಬೇಸ್ ಆರ್ಕಿಟೆಕ್ಚರ್ (Content & Database Architecture)

The database follows a normalized relational structure:

```
classes (8, 9, 10, puc-1, puc-2)
  └── subjects (kannada)
        └── categories (prose, poetry, grammar, question_papers, etc.)
              └── topics (individual lessons, sandhi, samasa, etc.)
                    └── resources (notes, question-answers, summaries, PDFs)
```

### Key Tables
- `profiles`: User information, email, role, and registered academic grade.
- `classes`: Academic levels with Kannada and English names, slugs, and sort order.
- `subjects`: Academic subjects (scoped to Kannada).
- `categories`: Resource categories (notes, grammar, question papers, etc.).
- `topics`: Granular chapters and curriculum topics.
- `resources`: Educational materials with titles, descriptions, draft/published status, and view counts.
- `question_papers`: Board exam and preparatory question papers with years and download links.

### Row Level Security (RLS)
- Public users can view only `is_published = true` resources.
- Authenticated students can access their personal profile and bookmarks.
- Admins with authorized credentials can create, update, and publish resources.

---

## 8. ನಿಯೋಜನೆ (Deployment Workflow)

Pratibha Kannada is deployed on **Vercel** with continuous integration connected to the GitHub repository:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Implement and test changes locally (`npm test`, `npm run typecheck`, `npm run build`).
3. Push to GitHub and create a Pull Request.
4. Once verified, merge into the `main` branch.
5. Vercel automatically deploys the updated `main` branch to production:
   - **Live Production URL:** [https://pratibha-kannada-v8ym.vercel.app/](https://pratibha-kannada-v8ym.vercel.app/)

---

## 9. ಪ್ರಮುಖ ಮಿತಿಗಳು (Known Limitations)

- **Kannada-Only Scope:** Materials are strictly restricted to the Kannada curriculum. English, Hindi, Mathematics, and Science subjects are not covered.
- **Academic Levels:** Only Classes 8, 9, 10 (SSLC), 1st PUC, and 2nd PUC are supported. Primary and middle school levels (Classes 1–7) are intentionally outside the platform's scope.
- **PDF Hosting:** Educational PDF downloads require public access configured on the Supabase Storage `educational-resources` bucket.

---

## 10. ಪರವಾನಗಿ (License)

This project is dedicated to Kannada educational empowerment and is released for free educational use.
