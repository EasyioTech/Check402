# Phase 1.2 — Summary

## What was done

### Task 1: Auth session extended with user.mode
- `src/lib/auth.ts`: Added `mode?: string` to Session.user and User interface declarations; added `mode` to authorize return value (with safe cast while Prisma types regenerate)
- `src/lib/auth.config.ts`: Added `token.mode` in JWT callback and `session.user.mode` in session callback

### Task 2: Onboarding fully rewritten (Developer / Designer split)
`src/app/onboarding/OnboardingClient.tsx` rewritten with:
- **Step 1**: Mode selection cards — "Developer / Engineer" vs "Designer / Creative"
- **Developer path**: Step 2 = tech stack chips, Step 3 = pain point, Step 4 = legal (4 total)
- **Designer path**: Step 2 = primary design tool chips (Figma, Adobe XD, Sketch, etc.), Step 3 = legal (3 total)
- Progress bar scales dynamically based on totalSteps
- Legal step shared between both paths (same text, adapted wording)
- On finish: Developer → `/dashboard`, Designer → `/designer`

### Task 3: Onboarding API updated
`src/app/api/onboarding/route.ts` updated to:
- Accept `mode` field in request body
- Validate: Developer requires all 3 fields; Designer only requires persona (tool)
- Save `mode` to `user.mode` in DB
- Set `techStack: null` and `painPoint: null` for designers

## Files Modified
- `src/lib/auth.ts` — mode added to types + authorize return
- `src/lib/auth.config.ts` — mode in JWT + session callbacks
- `src/app/onboarding/OnboardingClient.tsx` — full rewrite
- `src/app/api/onboarding/route.ts` — accepts mode, handles both paths

## Verification
- TypeScript: `npx tsc --noEmit` (r2.ts module error will clear after npm install)
- Navigate to /onboarding, verify Step 1 shows two mode cards
- Select Designer → verify 3 steps and redirect to /designer after finish
