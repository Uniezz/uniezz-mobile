# Uniezz — Design

Source of truth: **`uniezz-web-app.pen`** (pen.dev). Everything below is exported from it — regenerate the exports rather than editing them by hand.

## Screens

| # | Web (1440×1024) | iOS (393×852) | Android (412×915) |
|---|---|---|---|
| 01 | [Sign In](exports/web/01-sign-in.png) | [Sign In](exports/ios/01-sign-in.png) | [Sign In](exports/android/01-sign-in.png) |
| 02 | [Sign In · Email Code](exports/web/02-sign-in-email-code.png) | [Feed](exports/ios/02-feed.png) | [Feed](exports/android/02-feed.png) |
| 03 | [Feed](exports/web/03-feed.png) | [Chat](exports/ios/03-chat.png) | [Chat](exports/android/03-chat.png) |
| 04 | [Exams & Courses](exports/web/04-exams-and-courses.png) | [Meet](exports/ios/04-meet.png) | [Meet](exports/android/04-meet.png) |
| 05 | [Chat](exports/web/05-chat.png) | [Study](exports/ios/05-study.png) | [Study](exports/android/05-study.png) |
| 06 | [Connections](exports/web/06-connections.png) | [Guide](exports/ios/06-guide.png) | [Guide](exports/android/06-guide.png) |
| 07 | [Student Guide](exports/web/07-student-guide.png) | [Moderation](exports/ios/07-moderation.png) | [Moderation](exports/android/07-moderation.png) |
| 08 | [Moderation Sign In](exports/web/08-moderation-sign-in.png) | — | — |

Also: [UI Kit](exports/kit/00-ui-kit.png) · [all screens as one PDF](exports/all-screens.pdf)

The web app uses a left sidebar; mobile collapses it to five bottom tabs — **Feed · Chat · Meet · Study · Guide**. `My Profile` and `Saved` have no tab; profile sits behind the avatar in the app bar.

## Platform conventions

Brand typography (Plus Jakarta Sans / Inter) and all colour tokens are shared. Only the chrome is platform-native.

| | iOS | Android |
|---|---|---|
| Status bar | Dynamic Island, 54pt | 36dp, Material icons |
| Navigation | tab bar + hairline + home indicator | nav bar with pill indicator + gesture bar |
| Titles | large titles (30pt) | top app bar (22sp), 48dp icon buttons |
| Search | inset rounded rect | Material search bar, pill |
| Filters | pill chips | filter chips, radius 8, check when selected |
| Sub-nav | segmented control | underline tabs |
| Primary action | inline in app bar | FAB / extended FAB |
| Cards | 1px border | elevation, no border |
| Sheets | 22pt corners + grabber | 28dp corners + drag handle |

## Colour tokens

Defined as variables in the `.pen` file; see the [UI Kit](exports/kit/00-ui-kit.png) for swatches.

- **Brand** — `navy-900` `#05102E`, `navy-800`, `navy-700`, `navy-600`, `brand` `#2D4195`, `brand-hover`, `brand-soft`, `periwinkle`
- **Accent** — `accent` `#6D5BF5`, `accent-hover`, `accent-soft`, `ember` `#F0703A`, `ember-soft`, `teal` `#12A594`, `teal-soft`
- **Surface & text** — `surface`, `surface-tint`, `surface-raised`, `canvas`, `ice-100`, `ice-50`, `border`, `border-strong`, `text-primary`, `text-secondary`, `text-muted`, `on-brand`, `on-navy`, `on-navy-muted`, `navy-line`
- **Semantic** — `success`, `warning`, `danger` (each with a `-soft` pair)
- **Glow** — `glow-brand`, `glow-accent`
- **Type / radius** — `font-display` (Plus Jakarta Sans), `font-body` (Inter), `r-sm` 8, `r-md` 12, `r-lg` 16

Gradients are not tokens — they are composed inline from the colours above. Four canonical recipes are documented in the UI Kit's GRADIENTS group: primary-button sheen, console mesh, accent CTA, card sheen.

> Mesh gradients need an explicit `points` array. The schema marks it optional, but omitting it renders a fully transparent fill.

## Components

Reusable frames in the `.pen`, instanced across the screens.

**Web** — Button / Primary, Button / Secondary, Button / Gradient, Field / Text, Badge / Status, Card / Stat, Tag / University, Avatar, Nav Item, Post Card, Sidebar, Topbar

**Mobile** — M · Status Bar / iOS, M · Status Bar / Android, M · Tab Bar / iOS, M · Tab Bar / Android, M · Post Card

## Notes on the moderation screens

`08 · Moderation Sign In` and its two mobile counterparts propose a **separate credential path** for moderators — email, password and a TOTP authenticator code — deliberately not the student login.

This is a design proposal, not a decided flow. [`../auth/AUTHENTICATION.en.md`](../auth/AUTHENTICATION.en.md) covers the three *student* providers (USOS, Entra ID, email OTP) and says nothing about moderator authentication. The 30-minute idle timeout, the TOTP second factor and the queue statistics shown on the panel are all invented for the mock. Settle them in the auth doc before building.

## Regenerating the exports

In pen.dev, with `uniezz-web-app.pen` open:

```js
Export([...screenIds], "png", "./exports/web", { scale: 2 })
Export([...allScreenIds], "pdf", "./exports")
```

Files land as `<nodeId>.png` and are renamed to the slugs above.
