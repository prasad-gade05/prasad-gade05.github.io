# Music Player

Offline, folder-based music player for Android. Pick a folder on your device, play your files. No accounts, no streaming, no network access.

## Features

- **Folder library** - pick any folder via the Storage Access Framework; subfolders are scanned recursively. Embedded title/artist/album metadata and album-art thumbnails are extracted once and cached.
- **Instant relaunch** - a scan snapshot restores the library immediately on startup; a background diff refresh picks up files added, removed, or changed since last time.
- **Search** - case-insensitive matching on title and artist.
- **Tags and filtering** - attach multiple free-form tags to any song; filters combine with AND logic and show live match counts. Ships with an optional seed tag set that never overwrites user edits.
- **Queue control** - play-next inserts directly after the current track, add-to-queue appends, remove and jump from the queue view. Current song and playback position survive force-stops.
- **Smart shuffle** - constraint-balanced order instead of naive randomness (see below).
- **Repeat modes** - off, one, all.
- **Background playback** - foreground media service with system notification and lock-screen controls via Media3.

## Design

Minimal by intent: one screen lists the library, one overlay holds the player. A single toolbar row carries folder, search, and filter; active filter chips appear only while a filter is applied. Dark neo-brutalist theme - flat surfaces, hard offset shadows, chunky borders - set in Manrope (bundled under the SIL Open Font License).

## Screenshots

| Library | Player | Filter |
|---|---|---|
| ![Main screen](screenshots/main_screen.png) | ![Queue and controls](screenshots/queue_control_screen.png) | ![Filter dialog](screenshots/filter_dialog.png) |

## Smart shuffle

Pure Fisher-Yates shuffles are mathematically uniform but perceptually clumpy: same-artist tracks cluster, and listeners notice. The planner (`data/ShufflePlanner.kt`) builds the order in three phases:

1. **Even spread** - each artist's songs are placed at ideal intervals with random offsets and spacing jitter; albums are bucketed into evenly spaced slots so one album cannot clump within an artist.
2. **Constraint repair** - validated swaps eliminate adjacent same-artist and same-album pairs and cap language runs at 3 and tempo runs at 4. Every candidate swap is checked against all constraints in both affected neighborhoods, so a repair can never create a new violation elsewhere; accepted swaps strictly reduce total violations, which guarantees termination.
3. **Look-ahead fallback** - if a violation survives repair on pathological libraries, a bounded window around it is re-ordered by a constraint-aware depth-first search that only tries valid candidates.

The result is deterministic for a given seed, relaxes constraints silently when infeasible (a single-artist library still works), and always terminates with a valid permutation. Unit tests cover randomized and adversarial libraries - 600 scripted scenarios with zero surviving constraint violations.

## Tech

| | |
|---|---|
| Language | Kotlin |
| UI | Jetpack Compose (Material 3) |
| Playback | Media3 ExoPlayer + MediaSessionService |
| Images | Coil |
| Persistence | SharedPreferences with JSON codecs (queue, tags, folder, scan cache) |
| Min SDK | 24 (Android 7.0) |
| Target SDK | 36 |

Release builds are R8-minified with resource shrinking (~2.6 MB APK). The test suite covers codecs, queue restoration, insert planning, tag filtering, search, and the shuffle planner.

## Build

Requirements: JDK 17, Android SDK with platform 36.

```
./gradlew assembleDebug     # debug APK
./gradlew assembleRelease   # minified release APK (unsigned)
```

## Install

Grab `MusicPlayer-v1.apk` from the [Releases](../../releases) page and sideload it. Android will ask to allow installs from your browser or file manager on first run.
