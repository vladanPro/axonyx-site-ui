# axonyx-site-ui

Public showcase for Axonyx UI and the Foundry registry.

The local Foundry redesign pilot separates the promotional homepage from
documentation at `/docs`, `/docs/installation`, and `/docs/theming`. The Button
page is the first component documentation page using the new reading layout.

The reusable finish comes from the published Cargo dependency `axonyx-ui 0.0.82`.
Customization at `/docs/customization` requires cargo-axonyx 0.6.4 or newer
(axonyx-core 0.6.2), for root className/style forwarding.
Run `./scripts/sync-foundry-theme.ps1` after editing site-owned CSS or JavaScript
to update cache-versioned asset references. No package CSS is copied into public.
See `design/foundry-pilot/README.md` for design scope and verification evidence.

This site is authored in Axonyx and lives at `ui.axonyx.dev`.
It is separate from:

- `axonyx-site`: the main Rust-first framework site.
- `axonyx-web`: the React adapter site at `react.axonyx.dev`.
- `axonyx-ui`: the source package for Foundry CSS, JS helpers, and native `.ax` components.
- `axonyx-react`: the React adapter package.

## Purpose

Axonyx UI should follow the best part of the shadcn model for native Axonyx:
open components, installable blocks, clear previews, and code that teams can own.

The Axonyx version is Cargo-first:

```bash
cargo ax add button
cargo ax add block dashboard-01
cargo ax add theme silver
```

React, Vite, TanStack, and React Router examples belong on `react.axonyx.dev`,
not on this native Rust showcase.

## Initial routes

- `/` - UI registry homepage.
- `/components` - Foundry component catalog.
- `/components/button` - Button V0 page.
- `/components/card` - Card V0 page.
- `/components/field` - Field V0 page.
- `/components/app-shell` - AppShell V0 page.
- `/components/sidebar` - Sidebar V0 page.
- `/blocks` - responsive block catalog.
- `/blocks/marketing-01` - marketing block V0 preview.
- `/blocks/docs-01` - docs block V0 preview.
- `/blocks/dashboard-01` - dashboard block V0 preview.
- `/blocks/login-01` - authentication block V0 preview.
- `/blocks/settings-01` - application settings block V0 preview.
- `/themes` - bronze, silver, and gold theme direction.
- `/registry` - Cargo and npm registry model.

## Develop

This UI release requires `cargo-axonyx 0.6.3` or newer for component
`return ASX` imports. Update an older CLI before running the checks:

```bash
cargo install cargo-axonyx --version 0.6.4 --locked --force
```

```bash
cargo ax run dev
```

Before sharing or deploying:

```bash
cargo ax check
cargo ax doctor
cargo ax test
cargo ax build --clean --compiled
```

The existing Render service was configured in the dashboard, so changes to
`render.yaml` alone do not update its build command. Keep the dashboard build
command equal to the one in `render.yaml` when changing the CLI version.
The Settings demo uses a generated server validation action and requires compiled
mode in both build and start commands. Do not deploy it with the preview server.

Build: `cargo install cargo-axonyx --version 0.6.4 --locked --force && cargo ax build --clean --compiled`

Start: `cargo ax run start --compiled --host 0.0.0.0 --port $PORT`

## V0 scope

Start with a small complete loop:

- Components: `Button`, `Card`, `Field`, `AppShell`, `Sidebar`.
- Blocks: `marketing-01`, `docs-01`, `dashboard-01`, `login-01`, `settings-01`, `cms-admin-01`.
- Mode: native Axonyx examples on every page.
- Themes: `silver`, `bronze`, `gold`, then custom theme packages later.


Foundry styles come from the Cargo dependency declared in `Cargo.toml`.
There is no local foundation snapshot or compatibility patch.
`scripts/sync-foundry-theme.ps1` now only versions site-owned CSS and JavaScript.
