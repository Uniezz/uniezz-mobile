# Uniezz — Mobile tasks

Expo app. Tabs: **Feed · Chat · Meet · Study · Guide**. Profile and Saved are behind the avatar. Use Bun (`bun` / `bunx`). Talks only to the Go API.

Estimates: **0.5d or 1d**. Sprint = two weeks, about 10d.

---

## Sprint 1 — Look and sign-in

**Goal:** A student can pick a university and sign in on the phone. Tabs look right on iOS and Android.

**Not this sprint:** Real Feed data, chat, Meet.

| ID | Task | d | Depends | Done when |
|----|------|---|---------|-----------|
| MO-1.1 | Shared colours and type | 1 | — | Same tokens as web. |
| MO-1.2 | iOS vs Android bars and titles | 1 | MO-1.1 | Status bar and titles match the design note. |
| MO-1.3 | Tab bar icons and labels | 1 | MO-1.1 | Five tabs. Correct icons. |
| MO-1.4 | Search and chips look native | 0.5 | MO-1.2 | iOS pills, Android chips. |
| MO-1.5 | Language files (pl, uk, ru, en) | 1 | — | One string can switch language. |
| MO-1.6 | Sign-in: pick a university | 1 | BE-1.6 | Screen 01. No password field. |
| MO-1.7 | Start USOS or Entra | 1 | MO-1.6, BE-1.5 | Opens the university page. |
| MO-1.8 | Come back into the app | 0.5 | MO-1.7 | Deep link finishes login. |
| MO-1.9 | Email code screen | 1 | BE-1.11, MO-1.6 | 6 digits and resend. |
| MO-1.10 | Save login on the phone | 1 | BE-1.4, BE-1.5 | Follows the backend choice. `/auth/me` works. |
| MO-1.11 | Remove template sign-up | 0.5 | MO-1.6 | Sign-up screen is gone. |
| MO-1.12 | Log out and lock the tabs | 0.5 | MO-1.10 | Guest cannot open Feed. |

**Sprint total: 10.5d**

---

## Sprint 2 — Feed and profile

**Goal:** A student can read Feed, post, and open profile from the avatar.

| ID | Task | d | Depends | Done when |
|----|------|---|---------|-----------|
| MO-2.1 | Feed tab list and card | 1 | BE-2.6, MO-1.3 | Screen 02 shows posts. |
| MO-2.2 | Feed filters | 1 | MO-2.1, BE-2.8 | Filters match iOS/Android. |
| MO-2.3 | Comments | 1 | MO-2.1, BE-2.7 | Read and write work. |
| MO-2.4 | New post | 1 | BE-2.5 | Form sends to the API. |
| MO-2.5 | Image on a post | 1 | BE-2.4, MO-2.4 | Upload through the API. |
| MO-2.6 | Profile from avatar | 1 | BE-2.1 | Fields show. |
| MO-2.7 | Edit profile and privacy | 1 | MO-2.6 | Saves. |
| MO-2.8 | Trust badge | 0.5 | MO-2.6 | Badge is correct. |
| MO-2.9 | Saved from profile | 1 | MO-2.1 | No extra tab. |
| MO-2.10 | Report on post or comment | 1 | BE-2.9 | Report works. |

**Sprint total: 9.5d**

---

## Sprint 3 — Chat

**Goal:** A student can chat one-to-one and in a group on the phone.

| ID | Task | d | Depends | Done when |
|----|------|---|---------|-----------|
| MO-3.1 | Chat tab and thread list | 1 | BE-3.1 | Screen 03 lists threads. |
| MO-3.2 | One-to-one thread | 1 | MO-3.1, BE-3.2 | History shows. |
| MO-3.3 | Send a message | 1 | MO-3.2 | Message appears. |
| MO-3.4 | Group list and open | 1 | BE-3.3 | Groups work. |
| MO-3.5 | Send in a group | 1 | MO-3.4, BE-3.4 | Members see it. |
| MO-3.6 | Live messages | 1 | BE-3.5 | No pull-to-refresh needed. |
| MO-3.7 | Attach a file | 1 | BE-3.7 | File shows. |
| MO-3.8 | Keyboard and safe area | 1 | MO-3.2 | Composer stays usable. |
| MO-3.9 | Unread on the Chat tab | 0.5 | BE-3.9 | Badge shows. |

**Sprint total: 8.5d**

---

## Sprint 4 — Study

**Goal:** A student can search exams and open a course on the phone.

| ID | Task | d | Depends | Done when |
|----|------|---|---------|-----------|
| MO-4.1 | Study tab list | 1 | BE-4.2 | Screen 05 lists files. |
| MO-4.2 | Search | 1 | MO-4.1, BE-4.3 | Search filters. |
| MO-4.3 | Filters | 1 | BE-4.7 | University and faculty work. |
| MO-4.4 | Course page | 1 | BE-4.4 | Details show. |
| MO-4.5 | Rate a course | 1 | MO-4.4, BE-4.5 | Rating saves. |
| MO-4.6 | Comment on a course | 1 | MO-4.4, BE-4.6 | Comment shows. |
| MO-4.7 | Upload (iOS in the bar, Android FAB) | 1 | BE-4.1 | Upload uses the API. |
| MO-4.8 | Report a file or course | 0.5 | BE-4.9 | Report works. |

**Sprint total: 7.5d**

---

## Sprint 5 — Meet and Guide

**Goal:** Swipe on Meet, open chat on a match, read Guide, review a dorm.

| ID | Task | d | Depends | Done when |
|----|------|---|---------|-----------|
| MO-5.1 | Meet cards | 1 | BE-5.1 | Screen 04 shows a card. |
| MO-5.2 | Swipe like and pass | 1 | MO-5.1, BE-5.2 | Gesture calls the API. |
| MO-5.3 | Meet filters | 1 | MO-5.1, BE-5.3 | Filters change cards. |
| MO-5.4 | Match opens Chat tab | 1 | BE-5.4, MO-3.2 | User sees the new thread. |
| MO-5.5 | Guide list | 1 | BE-5.8 | Screen 06 lists places. No “add place” for students. |
| MO-5.6 | Place page | 1 | MO-5.5 | Details show. |
| MO-5.7 | Dorm review | 1 | BE-5.9, MO-5.6 | Review saves. |
| MO-5.8 | Guide map | 1 | BE-5.10 | Pins show. |
| MO-5.9 | Meet blocked without photo | 1 | BE-5.5 | Clear message, no cards. |

**Sprint total: 9d**

---

## Sprint 6 — Moderators, languages, store

**Goal:** Moderator screens follow the auth doc. Copy is in four languages. App is ready to build.

**Do not invent TOTP if the auth doc drops it.**

| ID | Task | d | Depends | Done when |
|----|------|---|---------|-----------|
| MO-6.1 | Moderator sign-in | 1 | BE-6.1, BE-6.2 | Matches the auth doc. |
| MO-6.2 | Report queue | 1 | BE-6.4 | List shows. |
| MO-6.3 | Approve or reject | 1 | MO-6.2, BE-6.5 | Actions work. |
| MO-6.4 | Polish copy | 0.5 | MO-1.5 | pl is complete. |
| MO-6.5 | Ukrainian copy | 0.5 | MO-1.5 | uk is complete. |
| MO-6.6 | Russian copy | 0.5 | MO-1.5 | ru is complete. |
| MO-6.7 | English copy check | 0.5 | MO-1.5 | en has no leftover keys. |
| MO-6.8 | Delete account | 1 | BE-2.10 | Flow works. |
| MO-6.9 | EAS profile and icons | 1 | — | Build settings exist. |
| MO-6.10 | Splash from design | 1 | MO-6.9 | Splash matches design. |
| MO-6.11 | iOS look check | 0.5 | MO-1.2 | Main tabs match the iOS notes. |
| MO-6.12 | Android look check | 0.5 | MO-1.2 | Main tabs match the Android notes. |

**Sprint total: 9d**

---

*Document: TASKS mobile (EN) · Uniezz · v1.1*
