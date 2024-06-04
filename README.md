# Initially scaffolded with `create-t3-app`

# How to run:

0. Make sure you copy the `.env.example` file to `.env`.
1. Install dependencies with `pnpm install`
2. Run the development server with `pnpm dev`

The app broadscasts messages through webhooks between parties of a dispute using Liveblocks service.
The app uses tRPC for server-client communication and shadCN for UI components.
There is a lot going on in the app but the _really_ important parts are `src/server/api/root.ts` for BE bussiness logic,
the main dispute page at `src/app/dispute/[disputeId]/[partyId]/page.tsx` and maybe the DB schema at `src/server/db/schema.ts`.
