# Weeknary

Weeknary ist eine React/Vite-PWA für Wochenplanung: Wochenkalender, Ernährungs-, Trainings- und Schlafplan plus KI-gestützte Plan-Generierung über eine Supabase Edge Function.

## Entwicklung

```bash
npm install
npm run dev          # Vite-Devserver
npm run typecheck    # TypeScript ohne Emit
npm run build        # Production-Build (GitHub Pages, Basis /weeknary/)
```

Weitere Checks:

```bash
npm run check:architecture       # Schichten-Regeln (Domain importiert keine Infrastruktur/UI)
npm run test:supabase:live       # RLS- und CRUD-Test gegen das verknüpfte Supabase-Projekt
npm run test:supabase:live:trusted  # wie oben, mit Preflight für NODE_EXTRA_CA_CERTS (Corporate-Proxy)
npm run test:browser:smoke       # Headless-Browser-Smoke-Test der wichtigsten Routen
```

Es gibt derzeit kein `test`-Script (Unit-Tests).

## Architektur

Die Domain-Übersicht liegt in `docs/architecture/domain-model-v1.md`. Grobe Schichten: `src/domain` (Modelle), `src/application` (Services + Ports), `src/infrastructure` (Supabase, IndexedDB, In-Memory), `src/app` (React).

Runtime-Verhalten:

- **Ohne Supabase-Env:** Seeded In-Memory-Repositories (Demo-Modus).
- **Supabase konfiguriert, ausgeloggt:** Expliziter Signed-out-Zustand, kein stiller Demo-Fallback.
- **Supabase konfiguriert, eingeloggt:** WeekPlan läuft local-first über IndexedDB mit Supabase-Bestätigung (kein Sync-Queue, kein Konfliktlöser); MealPlan und TrainingPlan sind remote-only.

## Supabase-Setup

`.env.local` aus `.env.example` erstellen:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Für GitHub Pages müssen dieselben zwei Werte als Repository-Secrets hinterlegt sein; der Pages-Workflow bricht vor dem Build ab, wenn eines fehlt. Nach einem Secret-Wechsel Pages neu deployen und die installierte PWA hart aktualisieren (Service-Worker-Cache).

Migrationen in Reihenfolge anwenden (`npx supabase db push` nach `link`):

1. `supabase/migrations/202604150001_week_plans.sql`
2. `supabase/migrations/202604160001_meal_plans.sql`
3. `supabase/migrations/202604160002_training_plans.sql`
4. `supabase/migrations/202604170001_plan_source_columns.sql`
5. `supabase/migrations/202604210001_profiles_and_user_preferences.sql`

## KI Create Hub

Die Route `/app/create` erzeugt ein Plan-Bundle (MealPlan, TrainingPlan, WeekPlan) über die authentifizierte Edge Function `generate-plan-bundle`. Der Browser erhält nie den OpenAI-Key. Benötigte Function-Secrets:

```bash
npx supabase secrets set OPENAI_API_KEY=...
npx supabase secrets set OPENAI_MODEL=gpt-5.2
npx supabase secrets set PLAN_GENERATION_TIMEOUT_MS=60000
```

Lokal kann die Function mit `WEEKNARY_PLAN_GENERATION_MOCK=true` ein deterministisches Bundle ohne OpenAI-Call liefern (nur Entwicklung, kein Produktions-Fallback).

## Live-Validierung hinter Corporate-Proxy

`npm run test:supabase:live:trusted` erwartet `NODE_EXTRA_CA_CERTS` mit dem Pfad zur Unternehmens-Root-CA in der Prozessumgebung (nicht in `.env.local`). `NODE_TLS_REJECT_UNAUTHORIZED=0` wird vom Preflight abgelehnt. Die benötigten `.env.local`-Schlüssel für die Live-Tests stehen in `scripts/live-validation-config.mjs`.
