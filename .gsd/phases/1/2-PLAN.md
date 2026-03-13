---
phase: 1
plan: 2  
wave: 2
---

# Plan 1.2: Auth Extension + Onboarding Update

## Objective
Extend the auth session to carry `user.mode` so routing logic can direct users to the right dashboard. Update the onboarding flow so new users pick Developer or Designer during Step 1.

## Context
- `.gsd/SPEC.md`
- `src/lib/auth.config.ts`
- `src/lib/auth.ts`
- `src/app/onboarding/OnboardingClient.tsx`

## Tasks

<task type="auto">
  <name>Extend JWT + session callbacks to carry user.mode</name>
  <files>
    src/lib/auth.config.ts
    src/lib/auth.ts
  </files>
  <action>
    1. In `src/lib/auth.ts`, add `mode?: string` to both the Session.user and User interface declarations in the `declare module "next-auth"` block.

    2. In `src/lib/auth.ts` authorize function for Credentials, add `mode: user.mode` to the returned user object for regular User logins (after the existing plan, role fields).

    3. In `src/lib/auth.config.ts` jwt callback, add:
    ```typescript
    token.mode = user.mode;
    ```
    (inside the `if (user)` block alongside existing token.plan, token.role)

    4. In `src/lib/auth.config.ts` session callback, add:
    ```typescript
    session.user.mode = token.mode as string | undefined;
    ```
    (alongside existing session.user.plan, session.user.role)

    IMPORTANT: Do not remove or alter any existing JWT/session fields.
  </action>
  <verify>TypeScript compiler: npx tsc --noEmit</verify>
  <done>No TypeScript errors; session.user.mode is typed and populated from JWT</done>
</task>

<task type="auto">
  <name>Update onboarding Step 1 to offer Developer vs Designer path</name>
  <files>src/app/onboarding/OnboardingClient.tsx</files>
  <action>
    Update Step 1 of the onboarding flow:

    1. Change the Step 1 heading from "How do you primarily work?" to "What best describes you?"

    2. Replace the 3 persona cards with 2 mode-selection cards:
       - Card 1: "Developer / Engineer" — "I build web apps and need to protect my projects until clients pay."
       - Card 2: "Designer / Creative" — "I create design assets and need to share previews securely with clients."

    3. Add a `mode` state variable: `const [mode, setMode] = useState<"DEVELOPER" | "DESIGNER">("")`

    4. When Card 1 is selected, set mode = "DEVELOPER"; Card 2 sets mode = "DESIGNER"

    5. In the Step 1 → Step 2 transition, check:
       - If mode === "DEVELOPER", show existing Step 2 (tech stack) and Step 3 (pain point)
       - If mode === "DESIGNER", show a tailored Step 2 for designers: "What tools do you primarily use?" with cards: Figma, Adobe XD, Sketch, Canva, Photoshop/Illustrator, Other

    6. When the onboarding form is submitted (handleFinish), include `mode` in the PATCH body sent to `/api/auth/onboarding` (or whatever onboarding API route exists). If the route does not exist, create `src/app/api/auth/onboarding/route.ts` that accepts PATCH and updates `user.mode`, `user.persona`, `user.techStack`, `user.painPoint`, `user.legalAccepted`, `user.onboardingComplete = true`.

    7. After completing onboarding, redirect:
       - mode === "DEVELOPER" → `/dashboard`
       - mode === "DESIGNER" → `/designer`
  </action>
  <verify>Manually navigate to /onboarding; verify Step 1 shows two cards; verify correct redirect after completion</verify>
  <done>Onboarding Step 1 shows Developer/Designer cards; mode is submitted to API; redirect is conditional on mode</done>
</task>

## Success Criteria
- [ ] `session.user.mode` is populated after login (verify in browser DevTools Network → /api/auth/session)
- [ ] Onboarding Step 1 shows "Developer / Engineer" and "Designer / Creative" cards
- [ ] Selecting Designer and completing onboarding redirects to /designer (404 expected until Phase 2)
- [ ] Existing developer onboarding path still works end-to-end
