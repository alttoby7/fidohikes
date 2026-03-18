# Decap CMS

Decap CMS is mounted at `/admin`.

## Current Setup

- Admin shell: `public/admin/index.html`
- Config: `public/admin/config.yml`
- Content source of truth:
  - `src/content/pages/**/*.mdx`
  - `src/content/affiliate-products/*.json`

## Local Editing

For local content editing, Decap supports `local_backend: true` in `config.yml`.
This is intended for local workflows while developing the site.

## Production Auth on Vercel

FidoHikes is deployed on Vercel, not Netlify. Decap's GitHub backend requires a server-side
authentication flow for production login.

The current config is scaffolded for:

```yaml
backend:
  name: github
  repo: alttoby7/fidohikes
  branch: main
  # base_url: https://your-oauth-proxy.example.com
  # auth_endpoint: auth
```

To make `/admin` work in production, add a GitHub OAuth proxy and then fill in:

- `base_url`
- `auth_endpoint`

## Recommended Next Step

Keep the current repo-backed model:

1. Editors use Decap to update MDX and affiliate-product JSON.
2. Commits still flow through GitHub.
3. `npm run affiliate:check` remains the safety gate.

This preserves Astro's static speed while giving you a non-terminal editing UI.
