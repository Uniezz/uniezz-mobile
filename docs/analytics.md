# Analytics

PostHog captures app lifecycle events and React Native touches. Touch properties
are limited to `testID` and `ph-label`; never put user content in these labels.
Screen events use Expo Router templates (for example `/chat/[id]`), not IDs or
query parameters. Native system dialogs and content inside WebViews are outside
React Native touch capture.

Every current TanStack mutation declares `meta.analyticsAction`. The shared
mutation cache emits `<action>_attempted`, `<action>_succeeded`, and
`<action>_failed`. An attempt starts when the mutation executes; a success means
its operation resolved, before its screen's success callback. Automatic retries
share one attempt and one final result. A manual retry is a new attempt.

Actions: `otp_request`, `otp_verify`, `login_exchange`, `post_create`,
`post_update`, `post_delete`, `post_like_set`, `comment_create`, `comment_update`,
`comment_delete`, `profile_update`, `programme_add`, `programme_update`,
`programme_delete`, `avatar_delete`, `images_upload`, and `report_create`.
New mutations must add a descriptive `meta.analyticsAction`; unlabelled mutations
still emit generic `mutation_*` events.

Form submissions rejected by React Hook Form emit `<form>_validation_failed`.
Disabled submit buttons do not submit forms. Image pickers emit attempt, success,
cancellation, and failure events; post photo filtering also emits validation
failures. Session persistence and clearing have separate outcomes, so a verified
OTP does not imply that saving the session succeeded. Clearing a session resets
the anonymous PostHog identity.

Local chat group creation, sending messages, and saving study material details
emit action outcomes with `storage: "local"`. They do not indicate server delivery
or persistence.

No mutation variables, results, error messages, form values, or route parameters
are sent. Events currently use PostHog's anonymous identity, not a profile ID.

Run `bun test tests/analytics.test.ts`, `bunx tsc --noEmit`, and `bunx expo lint`.
Device verification should check screen transitions, taps (including sheets),
successful/failed writes, and picker cancellation in PostHog's live events view.
