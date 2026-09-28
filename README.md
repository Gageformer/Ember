# Ember

**A new way to play your PlayStation 1 library on your PlayStation 2 — from a disc image, with no extra hardware.**

Ember is a PS1 emulator that runs on the PS2 itself. You drop it onto a USB stick or storage device of choice, and add the `.cue`/`.bin` files for your games library. This can be launched from whatever homebrew you so choose, and it plays from there.

[![Support me on Ko-fi](https://img.shields.io/badge/Ko--fi-Support%20Ember-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/gageformer)

---

## How you actually use it

Ember is a single executable program (`ember.elf`) along with the games you want to run, kept within a self-contained folder:

```
Ember/
├── ember.elf                       # the emulator
├── bios.bin                        # a PS1 BIOS — you supply this yourself
├── settings.txt                    # optional, see below
└── games/
    └── Spyro/                      # one folder per game, named however you like
        ├── Spyro.cue
        ├── Spyro.bin
        └── settings.txt            # optional, per-game (see Settings)
```

This makes Ember portable to any drive or device of your choice. USB, MMCE etc. Ember acts as a simple back end, leaving you to start your games from a launcher of choice.

You bring your own `bios.bin` (a legally-required BIOS dump from your own console) — Ember does not and will not ship one.

---

## Launching Ember from homebrew

Ember picks which game to boot from an **argument** — you pass it the name of a folder inside `games/`, and it plays that one. It ships with its own small launcher that does this for you, but nothing about it is special: any PS2 homebrew menu that can start an ELF with an argument can drive Ember directly, so you can wire it into whatever front-end you already use — uLaunchELF, OPL, a shortcut, or a custom menu of your own.

**The argument is the game folder name, that resides within `games/`.**

```
ember.elf "Crash Bandicoot (USA)"     -->  games/Crash Bandicoot (USA)/
ember.elf Spyro                       -->  games/Spyro/
```

Inside a game folder Ember takes a `.cue` if there is one, otherwise a `.bin`.

**Want a specific file?** Add it after the folder name, and Ember boots exactly that file from the folder:

```
ember.elf "Spyro/Spyro.cue"           -->  games/Spyro/Spyro.cue
```

Memory cards and settings still come from that game's folder. Disc images always live inside a game folder, so a bare `Spyro.cue` on its own won't be accepted.


**A refused or missing game drops you at the PS1 BIOS shell.** If you asked for something and didn't get it, you'll know immediately rather than wondering why the wrong title started.

Things to know if you're wiring this up:

- **Spaces are fine.** `"Crash Bandicoot (USA)"` is a single argument, passed through as-is. Some launchers may split arguments on spaces, so Ember stitches them back together for you — you don't need to escape anything.
- **Everything is relative to Ember's own folder**, worked out from wherever it was started. Launch `mass:/Ember/ember.elf` and your games are looked for in `mass:/Ember/games/`.
- **Name folders whatever you like.** Ember doesn't care about region tags, brackets or serial numbers.
- **Do not reset the IOP.** Ember inherits the drivers from its launcher. Ensure you do not reset anything as this will cause issues.
  - Ember reads `bios.bin`, `settings.txt` and your games through the storage drivers your launcher already has loaded (USB, MMCE, HDD etc.). It never loads storage drivers of its own. If the IOP is reset before Ember starts, it can't see its own folder, and you'll land in the BIOS or get a black screen.
  - Everything else Ember brings itself: its sound module is built into `ember.elf`, and the controller drivers come from the PS2's own ROM. Memory cards are files in the game folder, so no card drivers are needed either.
  - Both older-style and newer (iomanX/fileXio) driver setups work. Ember detects which one it's running under.
- **Pass the full path to `ember.elf` as the first argument (`argv[0]`).** That's how Ember finds its own folder, e.g. `mass:/Ember/ember.elf`. The game name goes after it (`argv[1]`). Most launchers already do this; a custom one that leaves `argv[0]` empty will leave Ember unable to find anything.

If you're building a front-end and have any questions or need something specific, please ask.

---

## Settings

Next to `ember.elf` you can put an optional **`settings.txt`**. It's a plain text file, one `key: value` per line:

```
# Lines starting with # or ; are ignored.
# A space after the colon is optional.

display: 480
```

The file is completely optional — delete it and every default stands. Keys Ember doesn't recognise are simply skipped, so an older or newer settings file won't break anything.

### Available keys

| Key | Values | What it does |
|---|---|---|
| `display` | `480` *(default)* | 480i. What almost every TV, capture device and upscaler expects. |
| | `240` | True 240p "double strike" — what a CRT actually wants, and sharper on one. Some TVs and scalers refuse to lock to it. |
| | `480p` | Progressive 480p. **Component or an HDMI adapter only**, composite shows no picture. |
| `timing` | `auto` *(default)* | Follows the disc's region. PAL discs run at their own 50 Hz speed with a real 50 Hz PAL picture (288p, 576i or 576p, per `display`), so the whole image is shown instead of squeezed. Other discs run at 60 Hz. |
| | `ntsc` | Always 60 Hz. Use this if your TV or capture device shows no picture for PAL discs (some older 60 Hz-only sets). PAL games will run faster than intended. |
| | `pal` | Always 50 Hz. |
| `dither` | `on` *(default)* | The PS1's own dithering, as the games were made to look. |
| | `off` | Smooth shading without the dither pattern. |
| `shading` | `15` *(default)* | The PS1's native 15-bit colour. |
| | `24` | Smoother gradients where the PS1 would band or dither. Experimental — if you want accuracy, stick with `15`. This is being redesigned for a future version, and may cause bugs or cost performance. |
| `controller` | `auto` *(default)* | Behaves like a real DualShock: ANALOG button toggles. If a game requests ANALOG, it will automatically turn on. |
| | `analog` | Starts with the ANALOG setting on, useful for games that support analog but do not request it. |
| | `d2a` | For games with **no** analog support: the left stick works as the d-pad. Don't use this on analog games, it will break native analog functionality. |

### Per-game settings

A `settings.txt` inside a game's own folder overrides the main one for that game. Only `controller`, `shading`, `timing` and `dither` are read there, since `display` stays one setting for the whole console. For example, put `controller: d2a` in an old digital-only game's folder, and leave everything else alone.

It is recommended to set controller settings per game instead of general. If you put your controller on analog and a game does not support it, you will have to toggle it off or the game may not read input. Similar for D2A (digital 2 analog), you will lose analog functionality in games that have it.

---

## Memory cards

Cards are automatic — you don't have to make or format anything. The first time
a game plays, Ember creates two cards inside that game's own folder:

```
games/
└── Spyro/
    ├── Spyro.cue
    ├── Spyro.bin
    ├── MC1.vmc          # slot 1, made for you
    └── MC2.vmc          # slot 2, made for you
```

Each game getting its own pair means one game can never overwrite another's
saves, and you can back a game up just by copying its folder.

### Sharing one card between games

Sometimes you *want* games to share — a series that carries saves forward, or
just to keep everything in one place. Drop a file called **`SharedMC.txt`** into
a game's folder, containing the name of the folder whose cards it should use:

```
games/
├── Spyro/
│   └── MC1.vmc              # the real cards live here
└── Ripto/
    └── SharedMC.txt         # one line: Spyro
```

Now Ripto reads and writes Spyro's cards instead of making its own.

A few things that make this safe to play with:

- **It's one hop.** A shared folder is never itself redirected, so you can't
  build a loop or a chain by accident.
- **A typo can't cost you a game.** If the name doesn't point at a real game
  folder, Ember quietly uses that game's own cards.
  Worst case you lose the sharing, never the save.
- **It's just a folder name** — not a path. `Spyro`, not `games/Spyro`.

---

## Where it stands today

Ember runs most games at full speed, and the speed is *measured* — read off the PS2's own onboard performance counters while a game is running, rather than estimated or eyeballed.

- **Spyro & Crash run at full speed** — locked 30fps with room to spare. These were my first two games heavily tested and developed with.
- **Resident Evil 2 and Silent Hill are playable** and sit right around the real-time line. They have randomly dipped under it in the heaviest scenes. Recent work may have fixed this.
- **Many more titles have been tested since the first release.** Crash Team Racing, Ridge Racer Type 4, Tomb Raider II, Spider-Man, MediEvil, Breath of Fire III and others have all had performance and compatibility work, and most now run at or near full speed. The heaviest scenes in some games can still dip. There's more perf work to come, and Ember only gets better from here.

---

## Current Release

A lot of work has been done since the first demo, leaving this as the version many were waiting for. This is not complete, expect some bugs and titles with mediocre performance. Please be patient as these are worked out.

- **Sound.** Music, effects, XA audio and CD audio tracks all play. Sound has had a big round of accuracy work: missing or wrong sound effects, music that sometimes played wrong, and reverb-driven music (Vib-Ribbon, Um Jammer Lammy) are all fixed. A few bugs remain.
- **Memory cards.** Saves persist, two card slots, made automatically per game — and games can share a card if you want them to. *See [Memory cards](#memory-cards).*
- **Controller support.** Analog sticks and rumble, including after switching analog mode or re-plugging a pad. Digital pads work as they always did, and digital-only games can be played on the stick. *See [Settings](#settings).*
- **PAL games run.** PAL titles play on an NTSC signal with the picture correctly positioned, rather than cropped or shifted.
- **240p, 480i or 480p output**, plus optional 24-bit shading. PAL discs run at their own 50 Hz with a full PAL picture (288p, 576i or 576p). See [Settings](#settings).

---

## Known bugs

- **Some games may still hang.** Many hangs have been fixed since the first release (Doom and Twisted Metal among them), but there are certainly others still out there.
- **FMV audio quirks.** Full-motion videos run quite smooth, however some FMVs may have an audio stutter. This is being worked out, please be patient.
- **Audio.** A few games still have small sound bugs (for example, Um Jammer Lammy is missing a sound effect when you hit notes). If a game is underperforming, the audio will stutter.
- **Assorted visual glitches.** Most visual bugs have been fixed, however a few remain. Please be patient as these are worked out.

If you hit something that isn't on this list, please share! This helps speed up development. Fixes are rarely per-game — each one found tends to improve compatibility across the whole library.

---

## How it hits these speeds

The PS2 and PS1 are close cousins, and Ember leans on that family resemblance everywhere it can. Instead of pretending to be a generic computer, it treats the PS2 as what it is: the PS1's bigger sibling.

- **Recompiling, not interpreting.** PS1 code is translated into native PS2 code the first time it runs, then reused. The PS2 mostly runs the game directly instead of re-reading every instruction.

- **Real hardware doing real work.** Wherever the PS2 has a part that can do a PS1 job natively (memory, graphics, sound), Ember hands the job to that part rather than simulating it in software. That's where most of the speed comes from.

- **Doing things only when they're due.** The CD drive, timers and other chips are only looked at when they actually have something to do, not constantly checked in the background.

- **Exact where it matters.** The PS1's 3D math is reproduced exactly, down to the rounding quirks games depend on, rather than approximated for speed.

- **Measured, not guessed.** Every speed change is timed on a real console with the PS2's own performance counters. If it doesn't make a measurable difference, it doesn't ship.

---

## Support Ember

This has been a personal project of mine I have worked on for a while. I am completing this for multiple reasons, and am very happy to share the results with everyone involved with the PS2 community. However a lot of time and effort has gone into this, and any form of support goes a long way and really helps out with development. You help me out by donating over at my Ko-fi, or even by sharing any bugs you find throughout your playtime experience. Both go a long way.

[![Support me on Ko-fi](https://img.shields.io/badge/Ko--fi-Support%20Ember-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/gageformer)

---

## Thank You

I'd like to give a personal thanks to a few people, as they have helped drastically with the development process.
A huge thanks to **zackcage6** & **TwistedZeon**! for all of their help with personally testing & reporting issues.
I also owe credit to everyone who has helped with concepts & knowledge regarding the PS2. I have a large background in software development, but there were many learning curves starting on PS2 development that I had to overcome. I appreciate the patience and hospitality of everyone involved.

---

## Source Code!?!?

Ember is **closed source for now**.

I'm updating this section just for full transparency. This has been a huge personal project for me, and it has come with a great amount of effort. There is a set design I have in mind and want to ensure that this vision is finished out. I understand there is great interest in the code and design of this project, however I will be keeping this closed source for some time to come. I may at Ember's end of life / development release the source, as I believe it is great to allow this scene to always continue forward & preserve gameplay (why I started this in the first place). However once again the personal meaning of this project has been huge for me, and this has grown more with the continued time and effort placed into development. I personally do not want to see the results go all over the place, or the original efforts disregarded by many variants or forks after any initial release.

---

## License

Ember beta builds are distributed under the **Ember Public Beta Testing
Licence** — see [`LICENSE-BETA.txt`](LICENSE-BETA.txt).

In plain terms — **use it, share what you find, build on top of it. Just don't
sell it, and don't take the credit.**

- **Yes:** run it, test it, stream it, record it, write about it. Monetised
  channels are completely fine.
- **Yes:** build a launcher or front-end for it. No permission needed, and
  honestly I'd love to see it.
- **Yes:** include it in a homebrew collection or front-end release, as long as
  it's unmodified, credited to me by name with a link back.
- **No:** selling it, putting it behind a paywall or link locker, or shipping it
  on preloaded cards or drives for money.
- **No:** repackaging it, or presenting it as your own work.

Anything commercial, just ask. I'm easy-going about most things — the two I do
care about are keeping credit where it belongs and nobody personally profiting off work
I've given away.

Ember was created by **Gageformer**. Copyright © 2026. All rights reserved.

Ember contains no PlayStation BIOS or game data, and never will — you supply
your own, from hardware and discs you own.
