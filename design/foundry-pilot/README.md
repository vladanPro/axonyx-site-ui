# Foundry pilot: design and verification

## Scope

The approved direction separates a promotional homepage without a sidebar
from a documentation layout with sidebar navigation. The homepage includes
working native component specimens and a theme editor. Documentation includes
Introduction, Installation, Theming, and a rebuilt Button reference page.
Other component pages retain their content and benefit from the shared shell
and initial primitive styling; a complete rewrite of the catalog is outside
this pilot.

The user accepted approximate visual fidelity to the concepts and explicitly
requested reusable component styling. The implementation uses the existing
native Axonyx components and a shared opt-in foundation in
`axonyx-ui/src/css/foundry.css`, consumed through the published Cargo package
`axonyx-ui 0.0.73`. There is no site-local foundation snapshot.

## Visual references

Built-in image generation produced `workbench-concept.png` and
`docs-concept.png`. Brief: graphite surfaces, off-white typography, restrained
Bronze/Silver/Gold material accents, 8px controls, a live workspace form and
theme editor; documentation adds a sidebar, installation steps, code previews,
and an on-page index. The original complete generation prompts are in the
task tool history.

Browser screenshots are `home-desktop.png`, `home-mobile.png`,
`docs-desktop.png`, `docs-mobile.png`, and `button-desktop.png`.
Inspected the concepts and desktop browser renders with `view_image`.

Comparison points: dark surface palette; metal accent swatches; heading/body
hierarchy; control radius and borders; form/editor column proportions;
documentation sidebar and reading column; code readability; mobile wrapping.

Intentional differences: preserve the actual Axonyx logo; add Docs and
Get started/Browse components links per the user's promo/docs correction;
use real syntax and prerequisite guidance rather than generated placeholder
copy; include foreground-contrast tokens in exported CSS; use the real full
component navigation rather than the concept's shortened list. No fake
copyright date or logo redesign was adopted. The original image is a visual
direction, not a claim of pixel-identical reproduction.

## Verification

- Native `cargo ax check` and `cargo ax build --clean` passed.
- `cargo ax test`: 77 Aegis checks passed, including the new documentation
  routes and the existing component and block routes.
- UI package `cargo check` and `npm run build` passed.
- The foundation is served directly from the Cargo package asset route.
- In-app browser checked desktop at 1440px and mobile at 390px.
- Verified home -> documentation -> component navigation, all three finishes,
  custom hex color and radius, CSS clipboard copy, saved local form values
  after reload, discard, switches, component search, documentation copy,
  Button examples, and both mobile menus. No page-level horizontal overflow
  in the mobile checks. Long code blocks scroll within their own container.
- Browser console had no errors during the final documentation checks.
- Fixed inherited page padding, double mobile-sidebar toggles, fixed-height
  button previews, switch-thumb specificity and CSS editor clipping.
- Public static assets have immutable cache headers in the local runtime;
  the sync script now versions the affected CSS and JavaScript URLs by hash.

During the original pilot, `cargo ax doctor` reported one version warning: the site's runtime
dependency is 0.1.49 while the installed CLI expects 0.3.0. No runtime upgrade
or public deployment is included in this visual pilot.

## Continue

Use the new Button page as the reference layout when updating the remaining
component docs. Audit complex overlays, navigation and data controls separately
before claiming full design-system coverage.


Foundry styles now come from the published Cargo dependency `axonyx-ui 0.0.73`.
There is no local foundation snapshot or compatibility patch.
`scripts/sync-foundry-theme.ps1` now only versions site-owned CSS and JavaScript.
