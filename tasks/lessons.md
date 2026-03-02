# Lessons Learned

## Supabase Presence: subscribe before track
- `channel.track()` must be called inside the `subscribe()` callback after `SUBSCRIBED` status
- Otherwise track can fire before the channel is ready, causing silent failures

## Supabase Presence: sync event fires before first track
- The `sync` event fires immediately on subscribe with an empty user list
- Never use `sync` event's empty state to trigger room deletion
- Use `leave` event instead and check `presenceState()` for remaining users

## Shared state across hooks: generate IDs at page level
- When multiple hooks (usePresence, useChat) need the same userId, generate it once in the parent component
- Passing as props avoids race conditions from `currentUser` being undefined initially
- `useRef` in the page component guarantees stability across re-renders

## Supabase Broadcast: self option required
- Supabase broadcast does NOT deliver events to the sender by default
- Must set `config: { broadcast: { self: true } }` in `supabase.channel()` options
- Without this, chat history won't show the sender's own messages
- Speech bubbles worked because they were added directly via state, not via broadcast listener

## Flexbox height chain: every level needs min-h-0
- `h-full` (percentage height) does NOT work inside flex items without explicit parent height
- Use `flex-1 min-h-0` instead of `h-full` for flex children
- Every flex container in the chain needs `min-h-0` to allow shrinking
- `overflow-y-auto` requires `min-h-0` on its flex parent to actually scroll

## isOnline stale closure in setInterval
- `isOnline` state inside `setInterval` captures the initial value
- Use `useRef` (`isOnlineRef`) to track mutable online state for interval callbacks

## visibilitychange is NOT a reliable proxy for tab close
- `visibilitychange` fires on tab switch, Alt-Tab, minimize — NOT just tab close
- Using `sendBeacon` in `visibilitychange` to delete rooms causes false deletions
- Use `beforeunload` only for cleanup on actual tab/window close
- For room deletion safety, rely on presence `leave` event + empty check as primary mechanism

## Campfire layout: keep a single source of truth for center position
- When positioning elements relative to a focal point (campfire), derive ALL positions from the same coordinates
- Don't mix CSS positioning (`bottom-24`) with JS calculations (`containerHeight / 2`)
- Use explicit `top: containerHeight * ratio` style for both the focal element and surrounding elements

## Broadcast events must be wired end-to-end
- Broadcasting an event (e.g. `speech-bubble`) is only half the work
- The receiver must actually call the UI update function (e.g. `showSpeechBubble`), not just `console.log`
- When `self: true` is set, the sender receives their own events — avoid double-calling the UI handler
- Use a callback parameter + `useRef` to avoid stale closures in channel listeners
