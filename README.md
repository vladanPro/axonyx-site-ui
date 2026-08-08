# axonyx-site-ui

Future public showcase for Axonyx UI and the Foundry registry.

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

```bash
cargo ax run dev
```

Before sharing or deploying:

```bash
cargo ax check
cargo ax doctor
cargo ax test
cargo ax build --clean
```

## V0 scope

Start with a small complete loop:

- Components: `Button`, `Card`, `Field`, `AppShell`, `Sidebar`.
- Blocks: `marketing-01`, `docs-01`, `dashboard-01`, `login-01`, `settings-01`, `cms-admin-01`.
- Mode: native Axonyx examples on every page.
- Themes: `silver`, `bronze`, `gold`, then custom theme packages later.
