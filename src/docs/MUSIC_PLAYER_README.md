### Background Music Player Feature

What was added
- A global background music player with a pause/resume button pinned to the bottom-left of the screen.
- Tenant-level toggle `autoPlayMusic` to control autoplay behavior.

Files changed/added
- Added `src/components/ui/music-player.tsx` — the player component. It plays `/house-music-1.mp3` (looped) and shows a Play/Pause button.
- Updated `src/App.tsx` — mounted `MusicPlayer` inside providers so it has access to tenant context.
- Updated `src/lib/tenants.ts` — extended `Tenant` type and sample tenants with an optional `autoPlayMusic` flag.

How it works
- The component reads the current tenant via `useCurrentTenant()`.
- If `autoPlayMusic` is true, it attempts to autoplay. Note that browsers may block autoplay without user interaction; the control still works for manual play.
- The control is always visible on all pages and uses minimal styling to blend with the UI.

Usage
- Default track path: `/house-music-1.mp3` in `public/`.
- Configure per tenant in `src/lib/tenants.ts`:
  - `autoPlayMusic: true` to try autoplay.
  - `autoPlayMusic: false` to disable autoplay.

Example tenant config
```
export const tenants: Tenant[] = [
  {
    id: "hoodti",
    name: "Hoodti",
    // ...
    autoPlayMusic: true,
  },
  // ...
];
```

Notes
- Autoplay is best-effort due to browser policies. Users can press the button to start playback if blocked.

