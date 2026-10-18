# PlayStation-RE

A browser-based, PS5-inspired home screen recreation built with plain HTML, CSS and JavaScript. The highlighted game is **Grand Theft Auto VI**, with a simulated boot screen and fictional story-menu concept. This does not run GTA VI or Sony firmware.

## Running

Open `index.html` in a modern browser, or serve the folder using `python3 -m http.server 8000`. For the full console presentation, use your browser's fullscreen mode. No install, bundler, framework, tracking, or backend required.

## Controls

- Arrow keys / D-pad: move between tiles and options
- Enter / X button: select
- Escape / B button: back
- P / Home button: toggle Control Center
- O: game options
- F: fullscreen
- Mouse/touch: click or tap controls directly
- Gamepad API: connected controller navigation is supported when the page is focused

The interface includes Games/Media tabs, responsive game tiles, a cinematic game hub, settings, profile, library, a contextual menu, Control Center, system-style notifications, and the GTA VI **fictional** launch flow. All demo status/progress is locally simulated.

## Artwork and asset references

Source repository | Usage
---|---
[Blaze414/ps5-theme](https://github.com/Blaze414/ps5-theme) | PS5 UI resource types, icon/background mapping, sounds and font behavior; system resources are *not* included in this project.
[elripalda/psgfx](https://github.com/elripalda/psgfx) | PS5 game icon and banner proportions and behavior.
[majedkarimi/ps5](https://github.com/majedkarimi/ps5) | Lightweight HTML/CSS/JS reference.
[eduqg/PageStation-inspired-on-ps5-reactjs](https://github.com/eduqg/PageStation-inspired-on-ps5-reactjs) | Layout and transition reference (MIT).
[blackbearreloaded/ps5-homebrew-ui](https://github.com/blackbearreloaded/ps5-homebrew-ui) | Focus motion, UI feedback and console-grade interaction reference.
[Rockstar official GTA VI media](https://www.rockstargames.com/VI/media) | Official downloadable promotional artwork. Use the asset manifest to substitute or localize art for private previews.

No code was copied wholesale from these projects. The included vector scenery and interface symbols are independently made approximations. The `assets/artwork.json` manifest lists real artwork sources; the browser uses remote media when available and falls back to bundled SVG artwork. Third-party brand/game marks and promotional images belong to their owners.

## Files

- `index.html`: semantic app shell
- `styles.css`: responsive PS5-inspired styling
- `app.js`: catalog, navigation, gamepad, overlays, simulated launch
- `assets/vice-city.svg`: original fallback skyline artwork
- `assets/artwork.json`: image source inventory and acquisition notes

### Note
Independent fan concept, not affiliated with Sony or Rockstar; the GTA VI flow is not gameplay or evidence of an early copy.
