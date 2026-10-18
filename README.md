# PlayStation-RE

A high-fidelity browser reconstruction of the PS5 home interface, built with plain HTML, CSS and JavaScript. The highlighted game is **Grand Theft Auto VI**, with a simulated boot screen and fictional story-menu concept. This does not run GTA VI or Sony firmware.

## Running

Serve the folder using `python3 -m http.server 8000`, then open `http://localhost:8000`. You can also open `index.html` directly. For the full console presentation, use your browser's fullscreen mode. No install, bundler, framework, tracking, or backend required.

To import official GTA VI promotional imagery to local disk, run `python3 scripts/get_artwork.py`. For additional official screenshots, use `python3 scripts/get_artwork.py --screenshots`. For large video clips too, add `--clips`. These downloads come directly from Rockstar and are optional; the page ships with an original offline SVG backdrop. After import, the generated `assets/local-art.js` overrides the remote GTA VI background. Commit the imported assets separately if you want the media in your private repo.

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
- `assets/sfx/*.wav`: three original subtle synthesized UI sounds
- `assets/local-art.js`: generated image override map
- `assets/artwork.json`: image source inventory and acquisition notes

### Note
Independent fan concept, not affiliated with Sony or Rockstar; the GTA VI flow is not gameplay or evidence of an early copy.


## Fidelity work (October 2026)

The optional `fidelity.css` and `enhancements.js` layers are enabled in the default page. They tune typography, navigation sizes, tile focus/caption placement, the game hub and Welcome Hub, and add Rockstar promotional artwork with graceful local fallbacks.

**Asset discovery:** The full [source catalog](assets/source-catalog.json) lists the official media library, verified source pages, known public CDN filenames and GitHub references. The latest Rockstar media index advertises 25 wallpapers/artworks, 99 screenshots, 9 clips, 51 Ultimate Edition images and 12 Vintage Vice City images. Those are **available from Rockstar**, not all copied into this repository.

To cache the assets locally, run:

```bash
node tools/fetch-artwork.mjs
# Smaller download:
node tools/fetch-artwork.mjs --cover-only
```

The fetcher validates HTTP content types and image signatures before writing `assets/downloaded/`. It updates `assets/local-art.json` with the successful downloads; missing/revised CDN URLs fall back to the bundled vector scene or existing artwork. It does not download game files or PlayStation firmware.

### Actual bundled assets

- `assets/vice-city.svg`: original fallback sunset city background.
- `assets/controller-symbols.svg`: original browser control-symbol sheet.
- `assets/vendor/flat-gamepad-icons/icons.svg`: attributed vector gamepad icons from [RobTheFiveNine/flat-gamepad-icons](https://github.com/RobTheFiveNine/flat-gamepad-icons), supplied under **CC BY-SA 4.0** with its original `LICENSE.md` in the same folder.
- `assets/source-catalog.json`: link inventory and acquisition notes.
- `assets/local-art.json`: local downloaded-art override when populated.

**Scope:** This is an independent UI recreation, not a byte-identical Sony shell, real PS5 firmware, or a working copy of Grand Theft Auto VI. The GTA VI launch sequence is only a staged visual simulation. Official marketing images remain owned by their publishers.
