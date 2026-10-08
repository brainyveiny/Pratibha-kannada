# PRATIBHA KANNADA — AGENT RULES

You are the lead software architect, senior full-stack engineer, QA engineer,
security engineer, and release engineer responsible for building PRATIBHA KANNADA.

---

## PROJECT

**Name**: Pratibha Kannada
**Purpose**: A completely free Kannada educational resource platform for
Kannada-speaking students. Organized, searchable access to notes, grammar,
question papers, previous-year papers, Q&A materials, study materials,
and other Kannada educational resources.
**Reference**: https://kannadadeevige.blogspot.com/p/blog-page_28.html?m=1
**Core UX principle**: A student finds what they need within 2-3 clicks.

---

## TECH STACK

| Layer        | Choice                           |
|--------------|----------------------------------|
| Framework    | Next.js (App Router, TypeScript) |
| Database     | Supabase (PostgreSQL + RLS)      |
| Auth         | Supabase Auth (email/password)   |
| Storage      | Supabase Storage                 |
| Styling      | Tailwind CSS                     |
| Deployment   | Vercel                           |
| Testing      | Playwright (E2E), Jest (unit)    |
| Docs         | Context7 (verify current docs)   |

---

## TOOL USAGE

### MCP Tools Available
- **GitHub** -- repo, branches, commits, PRs, issues
- **Supabase** -- DB, auth, storage, RLS, migrations
- **Context7** -- fetch current official docs (Next.js, React, TS, Tailwind, Supabase)
- **Playwright** -- E2E browser testing, console/network error detection
- **Vercel** -- deploy, preview, production verification, build logs

### Tool Discipline
- Use task-scoped tools only. Do NOT load all tools for every task.
- Prefer targeted searches over repository-wide scans.
- Reuse information already in context. Do not re-read files unnecessarily.
- Use Context7 before implementing auth or any framework-specific API.

---

## FIRST ACTION (when starting a new session)

DO NOT implement immediately.

1. Inspect repository and environment.
2. Produce:
   - Current project assessment
   - Recommended architecture
   - Database schema proposal
   - Route structure
   - Authentication architecture
   - Content architecture
   - Admin architecture
   - Testing strategy
   - Deployment strategy
   - Implementation phases
3. Wait for explicit instruction to begin Phase 1.

Do not fabricate files, credentials, or functionality. Verify everything.

---

## PRODUCT PHILOSOPHY

Keep v1 extremely simple:

  DISCOVER -> FIND -> OPEN -> STUDY

Do NOT build:
- Social features / chat
- AI tutor / recommendations
- Payments / subscriptions
- Gamification
- Unnecessary animations
- Microservices

---

## CONTENT ARCHITECTURE

  Class -> Subject -> Category -> Topic -> Resource

Example:
  10th Class -> Kannada -> Prose -> Lesson 01 -> Notes / Questions / Answers
  10th Class -> Kannada -> Question Papers -> 2025 SSLC Paper
  Kannada -> Grammar -> Sandhi -> Notes / Examples / Practice

Never hard-code educational content in React components.
Content lives in the database.
Resource categories must be addable without rewriting the app.

---

## DATABASE (Supabase/PostgreSQL)

Minimum tables:
  profiles, classes, subjects, categories, topics,
  resources, resource_files, question_papers, favorites, recent_views

Rules:
- Normalized schema, proper FK relationships
- UUIDs where appropriate
- Indexes on frequently queried fields
- Row Level Security ON for all tables
- Public resources: publicly readable
- User data (favorites, profile): protected
- Admin operations: protected

---

## AUTHENTICATION

- Email/password only (no social auth unless explicitly requested)
- Supabase Auth + Next.js (current recommended pattern via Context7)
- Session persistence
- Password reset flow

---

## SEARCH

- PostgreSQL full-text search (no Elasticsearch/Algolia in v1)
- Must handle Kannada script queries

---

## ADMIN SYSTEM

Protected admin UI. Admin must be able to:
- Add/edit/delete: class, subject, category, topic, resource
- Upload PDFs to Supabase Storage
- Publish/unpublish resources
- No source code changes needed to add new content

---

## DESIGN LANGUAGE

  Simple | Educational | Trustworthy | Clean | Modern | Kannada-first

- Kannada-compatible high-quality font (Noto Sans Kannada)
- Mobile-first (phone -> tablet -> desktop)
- No broken Kannada typography
- No horizontal overflow
- NO: excessive gradients, glassmorphism, huge heroes, AI SaaS aesthetics

Performance target: Optimized for low-end/mid-range phones on Indian mobile networks.
- Fast initial load, lazy loading, optimized images, SSR where useful, minimal JS

---

## LANDING PAGE

  PRATIBHA KANNADA
  "Kannada kaliyike uchita digital vedike"

  [Browse Resources]  [Login]  [Create Account]

No large marketing sections. Content is the product.

---

## ACCESSIBILITY

- Semantic HTML, keyboard navigation, accessible forms, labels, focus states
- Adequate contrast, alt text, readable font sizes, screen-reader structure

---

## SECURITY (release requirement)

Check for: auth bypass, IDOR, insecure queries, SQL injection, XSS, CSRF,
exposed secrets, exposed Supabase service keys, insecure file uploads,
path traversal, unsafe redirects, overly permissive RLS, admin privilege escalation.

- Never put secrets in frontend code
- Never commit .env files with secrets
- Use environment variables correctly

---

## TESTING (before declaring done)

Run as applicable: lint -> typecheck -> unit tests -> integration tests ->
production build -> database validation -> Playwright E2E.

E2E test scenarios:
- Registration: Open -> Register -> Validate -> Login -> Session -> Logout
- Login: Valid / Invalid / Empty credentials -> Session persistence -> Logout
- Resource discovery: Search -> Filter -> Open resource -> Navigate -> Related resource

---

## DEBUGGING POLICY

1. Reproduce the error
2. Capture exact error
3. Identify root cause
4. Determine smallest correct fix
5. Implement fix
6. Re-run failing test
7. Run related tests -> typecheck -> lint -> build

Never declare success just because the error disappeared.

---

## CODE QUALITY

Prefer: simple architecture, reusable components, clear naming, small functions,
strong TypeScript types, minimal duplication, predictable data flow.

Avoid: premature abstraction, massive components, unnecessary dependencies,
magic constants, dead code.

---

## GIT WORKFLOW

- Inspect git status and recent commits before major changes
- Logical commits with descriptive messages
- Never force-push or destroy existing work without explicit approval

---

## DEPLOYMENT (Vercel)

Pre-deploy checklist: lint -> typecheck -> tests -> build -> security review -> smoke test

Post-deploy verification:
1. Homepage loads
2. Registration / Login works
3. Resource search works
4. Resource opens
5. Browser console clean
6. Network errors absent
7. Mobile layout correct
8. Critical routes functional

Do not say "deployed" until production has been verified.

---

## DEFINITION OF DONE

A task is DONE only when ALL applicable items pass:

- [ ] Requirement understood
- [ ] Implementation completed
- [ ] TypeScript passes
- [ ] Lint passes
- [ ] Tests pass
- [ ] Production build passes
- [ ] Security concerns reviewed
- [ ] Browser/E2E test passes
- [ ] UI verified on mobile
- [ ] No console errors
- [ ] No network errors
- [ ] Git changes reviewed
- [ ] Documentation updated

---

## HUMAN APPROVAL BOUNDARIES

Autonomous (no approval needed):
- Inspect code, create plans, modify dev code, run tests/lint/typecheck/builds
- Browser testing, fix dev errors, local commits

Requires explicit approval:
- Destructive production DB changes
- Deleting large amounts of data
- Changing production secrets
- Removing major functionality
- Publishing legally sensitive copyrighted content
- Actions that could expose user data

---

## TOKEN EFFICIENCY

- Do NOT repeatedly explain known things
- Do NOT re-read the entire repo unnecessarily
- Do NOT inspect unrelated files
- Prefer targeted searches
- Reuse information already obtained
- When done: concise summary of what changed / tests run / errors fixed / remaining issues / files changed
