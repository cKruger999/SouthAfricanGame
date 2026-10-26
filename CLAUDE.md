# CLAUDE.md

A free mobile game app full of affectionate South African meme humour. It has no ads, no in-app purchases, no tracking and no analytics, ever, and it works fully offline.

## About the developer

- New to app development. Explain things in plain language, and say what you're doing and why.
- Works on Windows and tests on an Android phone.
- Installed: Node.js, npm, Git, Android Studio (with the Android SDK). Java isn't on the command line; use the JDK bundled with Android Studio.

## Rules (always apply)

- **No ads, purchases, tracking or analytics.** Don't add any library that phones home.
- **Offline only.** Bundle every font, sound and image inside the app. The game makes no network requests while playing.
- **No real brand names or logos.** Say "2L cooldrink" and "quarts", never Coca-Cola, Black Label and so on. Drawings must not look like a real brand's product either.
- **Humour is affectionate**, about everyday SA life, never mean-spirited.
- **Never impossible.** The player can always dodge every pothole and taxi. The `passable()` check in the spawner guarantees this. Keep it working, and update it whenever spawning changes. Traffic officers are left out of the check on purpose: they cost time but never end a run.
- **Test in a headless browser** before saying a change works. So far this uses the installed Microsoft Edge in headless mode, driven by small Node scripts over the Chrome DevTools Protocol (nothing to install). If a proper tool like Playwright is needed, ask before installing it.
- **One change at a time.** Remind the developer to commit when something works.

## Current state

The app is called **South African Brainrot**. It runs through Vite (dev tool only; Capacitor comes later, once the game is further along).

- `index.html` is the home menu: a card per game (Bottle Store Dash and Hadeda Alarm Clock playable, the rest "Coming soon"). It shows each game's best score from `localStorage` (`BEST_KEYS` in its script).
- `games/bottle-store-dash/index.html` is the Bottle Store Dash prototype: one file holding the canvas, JavaScript, drawing and UI. Its start, pause and game-over screens link back to the menu (`../../index.html`).
- `games/hadeda-alarm-clock/index.html` is Hadeda Alarm Clock, built the same way (one file, plain canvas, sounds generated in code).
- `shared/fonts.css` declares the fonts; every page links it rather than declaring fonts itself.
- `public/fonts/` holds the bundled Bungee and Archivo font files (Latin only, woff2) and their licences, which must ship with the app. Files in `public/` are copied as-is; reference them with a leading slash (`/fonts/...`) and Vite rewrites the path on build.
- `vite.config.js` lists every page. **Adding a game:** create `games/<name>/index.html`, link `../../shared/fonts.css`, add a menu link back, add the page to `vite.config.js`, and turn its "Coming soon" card on the home page into a link. Use relative links between pages (never a leading slash) so they work inside the Android app.
- `npm run dev` starts the dev server with instant reload. It prints a Local address (PC) and a Network address (phone on the same Wi-Fi).
- `npm run build` writes the finished game to `dist/` with relative paths. `npm run preview` serves that build to check it.
- `node_modules/`, `dist/` and `apk/` are generated and ignored by Git.

## Android app (Capacitor)

- `npm run apk` (runs `scripts/build-apk.mjs`) builds the games, copies them into `android/` with `cap sync`, builds a debug APK with Gradle, and copies it to `apk/South-African-Brainrot.apk`. It uses Android Studio's bundled Java (`C:\Program Files\Android\Android Studio\jbr`, Java 25) unless `JAVA_HOME` is set.
- `capacitor.config.json`: app ID `com.ckruger.sabrainrot` (can still change before the first Google Play upload, permanent after), name "South African Brainrot", `webDir: dist`. `SystemBars.style: DARK` gives light status-bar icons on the dark pages.
- **Gradle is pinned to 9.5.1** in `android/gradle/wrapper/gradle-wrapper.properties`. Gradle 8.14 can't run on Java 25, and Gradle 9.6+ broke the Android Gradle Plugin 8.13 that Capacitor 8 uses. Don't change it without testing a build.
- `android/app/src/main/AndroidManifest.xml`: **no INTERNET permission** (removed on purpose: the app must never go online) and portrait only. Keep it that way; check with `aapt dump permissions` after adding any plugin.
- `@capacitor/app` makes the phone's Back button go back a page (game to menu) instead of closing the app.
- Pages extend under the status bar (`viewport-fit=cover`); `env(safe-area-inset-*)` works in the app's WebView, so keep using it for top and bottom padding.
- Testing the app: the `Pixel_3` emulator boots headless (`emulator -avd Pixel_3 -no-window`). Debug builds allow the WebView to be inspected via `adb forward` to `webview_devtools_remote_<pid>`. When the developer's phone is plugged in, adb sees two devices, so always pass `-s <serial>`. Never install on the developer's phone without asking.
- Still Capacitor defaults: the app icon and the splash screen (blue X). Release builds for Google Play need a signing key; not set up yet.

## First game: Bottle Store Dash

It's Friday at 17:12 and the player must reach the bottle store before it closes at 18:00 to buy quarts. The road is 5 km long, and a run takes about 78 real seconds at base speed. Swipe left or right to change between 3 lanes: one swipe moves exactly one lane however long it is, so going two lanes takes two swipes (the developer found multi-lane swipes too sensitive on the phone). Arrow keys and A/D also work, and P or Esc pauses. With `?test` in the address, `window.__bsd.state()` exposes the game state for headless tests.

- **Potholes:** each hit pops a tyre and slows you down. Losing all four tyres ends the run.
- **Taxis:** stop anywhere, sometimes across two lanes, with hazards flashing and hooting. A crash stops you briefly and pops a tyre.
- **Traffic officers:** chase you. With a 2L they wave you through after a short stop. Without one you get a ticket and lose 9 minutes.
- **Pickups:** 2L cooldrinks (you start with one, max 9). Spare wheels only appear after you've lost a tyre.
- **Scenery:** hadedas fly over shouting "HAA-HAA", and road signs count down the kilometres.
- **Score:** only given on a win, from minutes to spare, tyres left and 2Ls left.
- **Saved data:** browser `localStorage` keys `bsd-best` (best score) and `bsd-muted`.

## Second game: Hadeda Alarm Clock

Saturday, 05:00. First-person view out of your bedroom window with a slingshot. Last until 06:00 (80 real seconds) by keeping the hadedas quiet.

- **Cutscene** (about 7 s, tap or Skip to skip; only before the first run): black screen, "Saturday. 04:58.", the hadeda screams, eyes open, curtains, burglar bars, window, slingshot, GO. It needs the Wake up tap first because phones block sound until the screen is touched.
- **Aiming:** touch where the stone should go, drag to adjust, let go to fire. Letting go below `cancelY` (on the slingshot) cancels. The stone takes 0.3 s to arrive, so flying birds need a lead.
- **Hadedas** land on perches (neighbour's ridge, power lines, tree, water tank, your dish, your gutter), shout, and sometimes move. A bonked hadeda flies off offended, never hurt. Perched = 100, flying = 150, plus a combo bonus.
- **Racket meter:** shouting birds fill it (closer = louder, flying birds count half). Full = "Whole street's up" and the run ends.
- **Ma's slippers (3):** hitting your own roof, the dish or next door's car loses one and a point penalty. None left = "Confiscated".
- **Fairness:** a hadeda is always hittable; in `resolve()` a bird beats whatever it sits on (like the dish). Keep that order.
- **Balance** (checked with simulated players): doing nothing loses in about 33 s; good aim survives with the racket under about 40%; slow, inaccurate play mostly loses.
- **Test hook:** with `?test` in the address, `window.__hac` exposes `state`, `layout`, `update`, `fire`, `start` and `skipCut`, so headless tests can fast-forward games. It doesn't exist otherwise.
- **Saved data:** `localStorage` keys `hac-best` and `hac-muted`.

## Known issues in the prototype

1. The 2L bottle (brown with a red cap and label) looks too much like a famous cola. Restyle it as a generic cooldrink.
2. The code calls the cooldrink "coke" internally (`cokes`, `type: 'coke'`). Rename it to "cooldrink".
3. Lines that use `window.claude?.hot` are leftovers from the tool the prototype was made in. Remove them during the Vite move.

## Roadmap (in order)

1. Move the prototype into a Vite project with plain canvas, split into modules.
2. ~~Wrap it as an Android app with Capacitor.~~ Done (debug APK). Next: own app icon and splash screen, then a signed release build.
3. Grow it into a collection of SA mini-games. A simple card menu exists; it may later become a fun hub such as a taxi rank or kasi map where each spot opens a game.
4. Add short cutscenes, for example the traffic officer saying "Eish, it's very hot today hey chief" before a run. (Hadeda Alarm Clock already has one.)
5. Add one shared save file for best scores, settings and unlocks, where finishing one game opens the next. Copy across the existing `bsd-best` and `hac-best` scores so nobody loses them.
6. Possible future games: Braai Master, Load Shedding Dash, Taxi Rank Rush, Car Guard Hero.
7. Move to Phaser 3 (one scene per mini-game) when the second game arrives, not before.
8. Publish free on Google Play.
