# Uniezz — Design

Source of truth: **`uniezz-web-app.pen`** (pen.dev). Everything below is exported from it — regenerate the exports rather than editing them by hand.

## Screens

| #   | Web (1440×1024)                                                            | iOS (393×852)                                        |
| --- | -------------------------------------------------------------------------- | ---------------------------------------------------- |
| 01  | [Sign In · UMCS / USOS](exports/web/01-sign-in.png)                        | [Sign In](exports/ios/01-sign-in.png)                |
| 01b | [Sign In · Email university](exports/web/01b-sign-in-email-university.png) | [Sign In · Email](exports/ios/01b-sign-in-email.png) |
| 02  | [Sign In · Email](exports/web/02-sign-in-email.png)                        | [Sign In · Code](exports/ios/01c-sign-in-code.png)   |
| 02b | [Sign In · Code](exports/web/02b-sign-in-code.png)                         | —                                                    |
| 03  | [Feed](exports/web/03-feed.png)                                            | [Feed](exports/ios/02-feed.png)                      |
| 04  | [Exams & Courses](exports/web/04-exams-and-courses.png)                    | [Chat](exports/ios/03-chat.png)                      |
| 05  | [Chat](exports/web/05-chat.png)                                            | [Meet](exports/ios/04-meet.png)                      |
| 06  | [Connections](exports/web/06-connections.png)                              | [Study](exports/ios/05-study.png)                    |
| 07  | [Student Guide](exports/web/07-student-guide.png)                          | [Guide](exports/ios/06-guide.png)                    |
| 08  | [Moderation Sign In](exports/web/08-moderation-sign-in.png)                | [Moderation](exports/ios/07-moderation.png)          |

Also: [Web UI Kit](exports/kit/00-ui-kit.png) · [iOS UIKit](exports/kit/uikit.png) · [States & Variants](exports/kit/states-variants.png) · [all screens as one PDF](exports/all-screens.pdf)

### Student sign-in flow

| Selection                        | Continue                                   | Next steps                               |
| -------------------------------- | ------------------------------------------ | ---------------------------------------- |
| **UMCS** (USOS)                  | Opens USOS auth in the browser immediately | User finishes on USOS → redirect to feed |
| **Any other university** (Email) | Stays in Uniezz                            | Email input → 6-digit OTP → feed         |

Same pattern as any OAuth provider (USOS today; Google-style IdP would also leave the app on Continue). Non-USOS universities use university-domain email + OTP — no password on Uniezz.

The web app uses a left sidebar; mobile collapses it to five bottom tabs — **Feed · Chat · Meet · Study · Guide**. Tab bar is **iOS 26 liquid glass** (`UITabBar`). Status bar is native (not drawn). `My Profile` and `Saved` have no tab; profile sits behind the avatar in the app bar.

## Platform conventions

Brand typography (Plus Jakarta Sans / Inter) and all colour tokens are shared. Mobile chrome is iOS-native.

|                | iOS                                  |
| -------------- | ------------------------------------ |
| Status bar     | Native (not in mock)                 |
| Navigation     | iOS 26 floating liquid-glass tab bar |
| Titles         | large titles (30pt)                  |
| Search         | inset rounded rect                   |
| Filters        | pill chips                           |
| Sub-nav        | segmented control                    |
| Primary action | inline in app bar                    |
| Cards          | 1px border                           |
| Sheets         | 22pt corners + grabber               |

## Colour tokens

Defined as variables in the `.pen` file. Display names below match the **UIKit · States & Variants** board; variable keys stay kebab-case for code.

### Brand & accent

| Name        | Token          | Hex       |
| ----------- | -------------- | --------- |
| Midnight    | `navy-900`     | `#05102E` |
| Abyss       | `navy-800`     | `#0B1B45` |
| Harbor      | `navy-700`     | `#16296B` |
| Indigo      | `navy-600`     | `#243A8C` |
| Brand       | `brand`        | `#2D4195` |
| Brand Deep  | `brand-hover`  | `#233473` |
| Periwinkle  | `periwinkle`   | `#6D76B5` |
| Violet      | `accent`       | `#6D5BF5` |
| Violet Deep | `accent-hover` | `#5B49E0` |

### Semantic

| Name    | Token     | Hex       | Soft token     | Soft hex  |
| ------- | --------- | --------- | -------------- | --------- |
| Ember   | `ember`   | `#F0703A` | `ember-soft`   | `#FFEDE3` |
| Lagoon  | `teal`    | `#12A594` | `teal-soft`    | `#DDF4F0` |
| Meadow  | `success` | `#12875C` | `success-soft` | `#DFF3EA` |
| Amber   | `warning` | `#B5760A` | `warning-soft` | `#FBEFD9` |
| Crimson | `danger`  | `#C6374D` | `danger-soft`  | `#FBE6EA` |

Also: `brand-soft` `#E7ECFB`, `accent-soft` `#ECE9FE`.

### Washes & surfaces

| Name      | Token            | Hex       |
| --------- | ---------------- | --------- |
| Ice       | `ice-100`        | `#E7F0FF` |
| Mist      | `ice-50`         | `#F2F7FF` |
| Canvas    | `canvas`         | `#F4F7FD` |
| Paper     | `surface`        | `#FFFFFF` |
| Tint      | `surface-tint`   | `#FAFBFF` |
| Raised    | `surface-raised` | `#FFFFFF` |
| Hairline  | `border`         | `#E1E8F7` |
| Rule      | `border-strong`  | `#C8D4EC` |
| Navy Line | `navy-line`      | `#1D2C5E` |

### Text on color

| Name         | Token            | Hex       |
| ------------ | ---------------- | --------- |
| Ink          | `text-primary`   | `#0B1633` |
| Slate        | `text-secondary` | `#59648A` |
| Fog          | `text-muted`     | `#8E99B8` |
| On Brand     | `on-brand`       | `#F2F7FF` |
| On Navy      | `on-navy`        | `#EEF3FF` |
| On Navy Soft | `on-navy-muted`  | `#9AA6D4` |

### Glow · type · radius

- **Glow** — `glow-brand` `#2D419559`, `glow-accent` `#6D5BF54D`
- **Type** — `font-display` Plus Jakarta Sans, `font-body` Inter
- **Radius** — `r-sm` 8 · `r-md` 12 · `r-lg` 16 · pill `999`

## Components

Reusable frames in the `.pen`, instanced across the screens.

**Web** — Button / Primary, Button / Secondary, Button / Gradient, Field / Text, Badge / Status, Card / Stat, Tag / University, Avatar, Nav Item, Post Card, Sidebar, Topbar

**iOS UIKit** — UIText / Title · Headline · Body · Caption · UIButton / Primary · Secondary · Gradient · Icon · Ghost · UICard · UICard / Post · UIImage · UIAvatar · UIBadge · UIBadge / Count · UIChip / On · Off · UITag · UIRow · UIRow / Select · UISearch · UIField · UISegmented · UITabBar

### States · sizes · variants

Documented on the **UIKit · States & Variants** board ([export](exports/kit/states-variants.png)):

| Component             | Variants / sizes / states                                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| UIButton              | Primary · Secondary · Gradient · Icon · Ghost · SM / MD / LG · Default · Hover · Disabled · Danger · Icon 28 / 36 / 44 |
| UIBadge / Count / Tag | Ember · Meadow · Amber · Crimson · Brand · Lagoon · Violet color pairs                                                 |
| UIChip                | On · Off                                                                                                               |
| UIAvatar              | 24 · 32 · 40 · 48 · 64 · fill colors                                                                                   |
| UIField               | Default · Focus · Error · Disabled                                                                                     |
| UISearch              | Default · Filled · Focus                                                                                               |
| UISegmented / UIRow   | Selected · Idle                                                                                                        |

## Notes on the moderation screens

`08 · Moderation Sign In` and `iOS · 07 Moderation` use a **separate credential path** — email and password only. Moderators can be outside any university; they are appointed, not verified as students. No authenticator / TOTP step.

This is a design proposal, not a decided flow. [`../auth/AUTHENTICATION.en.md`](../auth/AUTHENTICATION.en.md) covers student providers and says nothing about moderator authentication yet. The 30-minute idle timeout and the queue statistics on the panel are invented for the mock — settle them in the auth doc before building.

## Regenerating the exports

In pen.dev, with `uniezz-web-app.pen` open:

```js
Export([...screenIds], "png", "./exports/web", { scale: 2 });
Export(["Esl4T", "RvmN4"], "png", "./exports/kit", { scale: 2 });
Export([...allScreenIds], "pdf", "./exports");
```

Files land as `<nodeId>.png` — rename `Esl4T.png` → `uikit.png`, `RvmN4.png` → `states-variants.png`, and screen ids to the slugs above.
