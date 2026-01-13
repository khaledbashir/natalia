# ANC CPQ Wizard

Conversational AI wizard for ANC (LED display company) that guides sales engineers through creating project proposals.

## Getting Started

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Production Deployment (Easypanel)

**IMPORTANT: Set `NEXT_PUBLIC_BASE_URL` in Easypanel environment**

1. In Easypanel, go to your project → Environment Variables
2. Add: `NEXT_PUBLIC_BASE_URL=https://your-domain.com`
3. Rebuild the container

Without this, share links will use `localhost:3000` instead of your production domain.

See `.env.production.example` for full environment variable reference.

## Features

- **Conversational AI wizard** — Chat to configure proposals, no boring forms
- **Auto-address search** — Type venue name, instantly finds address
- **Document extraction** — Upload PDF/brief, auto-extracts specs
- **Shareable client links** — Generate unique URLs for clients to view proposals
- **PDF/Excel export** — Download formatted documents
