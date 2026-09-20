# Uniezz — Zadania mobile

Expo. Taby: **Feed · Chat · Meet · Study · Guide**. Profil i Saved za avatarem. Tylko Bun. Tylko Go API.

Szacunki: **0.5d albo 1d**. Sprint = dwa tygodnie, około 10d.

---

## Sprint 1 — Wygląd i logowanie

**Cel:** Student wybiera uczelnię i loguje się z telefonu. Taby ok na iOS i Android.

| ID | Zadanie | d | Zależy | Gotowe, gdy |
|----|---------|---|--------|-------------|
| MO-1.1 | Wspólne kolory i czcionka | 1 | — | Te same tokeny co na webie. |
| MO-1.2 | Bary i tytuły iOS vs Android | 1 | MO-1.1 | Jak w notatkach designu. |
| MO-1.3 | Ikony i etykiety tabów | 1 | MO-1.1 | Pięć tabów. Właściwe ikony. |
| MO-1.4 | Szukanie i chipy jak na platformie | 0.5 | MO-1.2 | Pigułki iOS, chipy Android. |
| MO-1.5 | Języki pl, uk, ru, en | 1 | — | Jeden string można przełączyć. |
| MO-1.6 | Logowanie: wybór uczelni | 1 | BE-1.6 | Ekran 01. Bez pola hasła. |
| MO-1.7 | Start USOS albo Entra | 1 | MO-1.6, BE-1.5 | Otwiera stronę uczelni. |
| MO-1.8 | Powrót do aplikacji | 0.5 | MO-1.7 | Deep link kończy logowanie. |
| MO-1.9 | Ekran kodu z maila | 1 | BE-1.11, MO-1.6 | 6 cyfr i ponów. |
| MO-1.10 | Zapisać login na telefonie | 1 | BE-1.4, BE-1.5 | Jak zdecydował backend. `/auth/me` działa. |
| MO-1.11 | Usunąć szablonową rejestrację | 0.5 | MO-1.6 | Ekranu sign-up nie ma. |
| MO-1.12 | Wylogowanie i zamek na tabach | 0.5 | MO-1.10 | Gość nie otworzy Feedu. |

**Suma: 10.5d**

---

## Sprint 2 — Feed i profil

| ID | Zadanie | d | Zależy | Gotowe, gdy |
|----|---------|---|--------|-------------|
| MO-2.1 | Tab feedu i karta | 1 | BE-2.6, MO-1.3 | Ekran 02 pokazuje posty. |
| MO-2.2 | Filtry | 1 | MO-2.1, BE-2.8 | Jak na iOS/Android. |
| MO-2.3 | Komentarze | 1 | MO-2.1, BE-2.7 | Czytanie i pisanie. |
| MO-2.4 | Nowy post | 1 | BE-2.5 | Formularz idzie do API. |
| MO-2.5 | Obrazek w poście | 1 | BE-2.4, MO-2.4 | Przez API. |
| MO-2.6 | Profil z avatara | 1 | BE-2.1 | Pola widać. |
| MO-2.7 | Edycja profilu i prywatności | 1 | MO-2.6 | Zapisuje. |
| MO-2.8 | Odznaka zaufania | 0.5 | MO-2.6 | Poprawna. |
| MO-2.9 | Zapisane z profilu | 1 | MO-2.1 | Bez osobnego taba. |
| MO-2.10 | Zgłoszenie | 1 | BE-2.9 | Działa. |

**Suma: 9.5d**

---

## Sprint 3 — Czat

| ID | Zadanie | d | Zależy | Gotowe, gdy |
|----|---------|---|--------|-------------|
| MO-3.1 | Tab czatu i lista | 1 | BE-3.1 | Ekran 03. |
| MO-3.2 | Rozmowa jeden na jeden | 1 | MO-3.1, BE-3.2 | Jest historia. |
| MO-3.3 | Wysłać | 1 | MO-3.2 | Wiadomość się pojawia. |
| MO-3.4 | Grupy | 1 | BE-3.3 | Działają. |
| MO-3.5 | Pisać w grupie | 1 | MO-3.4, BE-3.4 | Członkowie widzą. |
| MO-3.6 | Żywe wiadomości | 1 | BE-3.5 | Bez pull-to-refresh. |
| MO-3.7 | Plik | 1 | BE-3.7 | Widać. |
| MO-3.8 | Klawiatura i safe area | 1 | MO-3.2 | Pole wpisu jest wygodne. |
| MO-3.9 | Nieprzeczytane na tabie | 0.5 | BE-3.9 | Jest odznaka. |

**Suma: 8.5d**

---

## Sprint 4 — Nauka

| ID | Zadanie | d | Zależy | Gotowe, gdy |
|----|---------|---|--------|-------------|
| MO-4.1 | Tab nauki | 1 | BE-4.2 | Ekran 05. |
| MO-4.2 | Szukanie | 1 | MO-4.1, BE-4.3 | Filtruje. |
| MO-4.3 | Filtry | 1 | BE-4.7 | Uczelnia i wydział. |
| MO-4.4 | Strona kursu | 1 | BE-4.4 | Są szczegóły. |
| MO-4.5 | Ocenić kurs | 1 | MO-4.4, BE-4.5 | Zapisuje się. |
| MO-4.6 | Komentarz | 1 | MO-4.4, BE-4.6 | Widać. |
| MO-4.7 | Upload (iOS w barze, Android FAB) | 1 | BE-4.1 | Przez API. |
| MO-4.8 | Zgłoszenie | 0.5 | BE-4.9 | Działa. |

**Suma: 7.5d**

---

## Sprint 5 — Meet i przewodnik

| ID | Zadanie | d | Zależy | Gotowe, gdy |
|----|---------|---|--------|-------------|
| MO-5.1 | Karty Meet | 1 | BE-5.1 | Ekran 04. |
| MO-5.2 | Swipe like i pass | 1 | MO-5.1, BE-5.2 | Gest woła API. |
| MO-5.3 | Filtry Meet | 1 | MO-5.1, BE-5.3 | Karty się zmieniają. |
| MO-5.4 | Match otwiera tab czatu | 1 | BE-5.4, MO-3.2 | Nowy wątek widać. |
| MO-5.5 | Lista przewodnika | 1 | BE-5.8 | Ekran 06. Brak „dodaj miejsce”. |
| MO-5.6 | Strona miejsca | 1 | MO-5.5 | Są szczegóły. |
| MO-5.7 | Opinia o akademiku | 1 | BE-5.9, MO-5.6 | Zapisuje się. |
| MO-5.8 | Mapa | 1 | BE-5.10 | Są piny. |
| MO-5.9 | Meet bez zdjęcia zamknięty | 1 | BE-5.5 | Jasny komunikat, bez kart. |

**Suma: 9d**

---

## Sprint 6 — Moderatorzy, języki, store

**Nie wymyślać TOTP, jeśli auth-dok je usuwa.**

| ID | Zadanie | d | Zależy | Gotowe, gdy |
|----|---------|---|--------|-------------|
| MO-6.1 | Logowanie moderatora | 1 | BE-6.1, BE-6.2 | Jak w auth-doku. |
| MO-6.2 | Kolejka zgłoszeń | 1 | BE-6.4 | Lista jest. |
| MO-6.3 | Zatwierdzić albo odrzucić | 1 | MO-6.2, BE-6.5 | Akcje działają. |
| MO-6.4 | Tekst polski | 0.5 | MO-1.5 | pl kompletny. |
| MO-6.5 | Tekst ukraiński | 0.5 | MO-1.5 | uk kompletny. |
| MO-6.6 | Tekst rosyjski | 0.5 | MO-1.5 | ru kompletny. |
| MO-6.7 | Sprawdzenie angielskiego | 0.5 | MO-1.5 | en bez zbędnych kluczy. |
| MO-6.8 | Usunąć konto | 1 | BE-2.10 | Flow działa. |
| MO-6.9 | Profil EAS i ikony | 1 | — | Ustawienia builda są. |
| MO-6.10 | Splash z designu | 1 | MO-6.9 | Jak w designie. |
| MO-6.11 | Sprawdzenie wyglądu iOS | 0.5 | MO-1.2 | Taby jak w notatkach iOS. |
| MO-6.12 | Sprawdzenie wyglądu Android | 0.5 | MO-1.2 | Taby jak w notatkach Android. |

**Suma: 9d**

---

*Dokument: TASKS mobile (PL) · Uniezz · v1.1*
