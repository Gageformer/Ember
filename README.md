# Ember

**A new way to play your PlayStation 1 library on your PlayStation 2 — from a disc image, with no extra hardware.**

Ember is a PS1 emulator that runs on the PS2 itself. You drop it onto a USB stick or storage device of choice, and add the `.cue`/`.bin` files for your games library. This can be launched from whatever homebrew you so choose, and it plays from there.

**Current version: 0.8**

[![Support me on Ko-fi](https://img.shields.io/badge/Ko--fi-Support%20Ember-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/gageformer)

---

## How you actually use it

Ember is a single executable program (`ember.elf`) along with the games you want to run, kept within a self-contained folder:

```
Ember/
├── ember.elf                       # the emulator
├── LICENSE.txt                     # the licence, keep it with ember.elf
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

### The included launcher

`launcher.elf` lists the folders in `games/` and starts the one you pick.

- **Next to `ember.elf`** (the normal setup): nothing to configure. It works from whatever device the folder is on.
- **Somewhere else** (an OPL APPS entry, a memory card, a different drive): put a file named `ember-launcher.cfg` beside the launcher with one line saying where the Ember folder is:

  ```
  ember=mass:/EMBER/
  ```

  Other devices: `ata:/EMBER/` (exFAT internal HDD), `hdd0:<partition>:pfs:/EMBER/` (APA/PFS HDD), `mmce?:/EMBER/`, `mx4sio:/EMBER/`, `ilink:/EMBER/`, `mc?:/EMBER/`, `udpbd:/EMBER/`, `udpfs:/EMBER/`. If `ember.elf` is beside the launcher the file is ignored. A ready-to-edit copy with every device listed ships with the launcher: [`ember-launcher.cfg`](launcher/ember-launcher.cfg).
- **No config?** The launcher searches MMCE first, then USB, the exFAT internal HDD, MX4SIO, i.Link and memory cards for `EMBER/ember.elf` by itself. APA/PFS and network locations always need the config line.

---

## Settings

Next to `ember.elf` you can put an optional **`settings.txt`**. It's a plain text file, one `key: value` per line:

```
# Lines starting with # or ; are ignored.
# A space after the colon is optional.

display: 480p
controller: auto
exit path: mass:/APPS/OPNPS2LD.ELF
```

The file is completely optional — delete it and every default stands. Keys Ember doesn't recognise are simply skipped, so an older or newer settings file won't break anything. Defaults are marked *(default)* below.

### Picture

| Key | Values | What it does |
|---|---|---|
| `display` | `480` *(default)* | 480i. What almost every TV, capture device and upscaler expects. |
| | `240` | True 240p — what a CRT actually wants, and sharper on one. Some TVs and scalers refuse to lock to it. |
| | `480p` | Progressive 480p. **Component or an HDMI adapter only**, composite shows no picture. Every game is shown at the PS1's own proportions. |
| `deinterlace` | `blend` *(default)* | Only affects `display: 480p`. This is how the PS1's 480i screens are displayed in 480p; weaving creates combing. `blend` softens it creating a more fluid picture. |
| | `weave` | Every line exactly as the game drew it, but moving things comb. |
| `shading` | `15` *(default)* | The PS1's native 15-bit colour. The accurate choice. |
| | `24` | Keeps colour at 24-bit, so gradients are smooth where the PS1 would band or dither. The game itself still sees a normal PS1 screen. |
| | `24d` | `24`, darkened the way 15-bit colour would darken it. Designed for Silent Hill, where `24` makes dark scenes too clear and shows the draw distance in the Otherworld. |
| `dither` | `on` *(default)* | The PS1's own dithering, as the games were made to look. |
| | `off` | Smooth shading without the dither pattern. |

With PAL timing (below), `240`, `480` and `480p` become 288p, 576i and 576p, so a PAL game's full picture is shown rather than squeezed.

`24` and `24d` ask more of the console than `15`. If a game slows down with them, go back to `15`.

### Timing

| Key | Values | What it does |
|---|---|---|
| `timing` | `auto` *(default)* | Follows the disc's region. PAL discs run at their own 50 Hz speed with a real 50 Hz PAL picture. Other discs run at 60 Hz. |
| | `ntsc` | Always 60 Hz. Use this if your TV or capture device shows no picture for PAL discs (some older 60 Hz-only sets). PAL games will run faster than intended. |
| | `pal` | Always 50 Hz. |

### Controller

| Key | Values | What it does |
|---|---|---|
| `controller` | `auto` *(default)* | Behaves like a real DualShock: starts with ANALOG off, and the game or the ANALOG button turns it on. |
| | `analog` | Starts with ANALOG on, for games that support the sticks but don't turn analog on themselves. The button still toggles. |
| | `d2a` | For games with **no** analog support: the left stick works as the d-pad. Don't use this on analog games, it will break native analog functionality. |

### Menu and system

| Key | Values | What it does |
|---|---|---|
| `menu` | `on` *(default)* | The Ember menu is available in game. See [The Ember menu](#the-ember-menu). |
| | `off` | No menu. Its button combination goes to the game instead. |
| `exit path` | *(empty, default)* | **Exit Game** in the menu returns to the PS2 browser. |
| | a full path to an ELF | **Exit Game** starts that program instead, e.g. `mass:/APPS/OPNPS2LD.ELF` or `mc0:/BOOT/BOOT.ELF`. Memory card paths are case-sensitive. If the file can't be read, you go to the browser. |
| `debug` | `off` *(default)* | Nothing is shown on screen while Ember starts. |
| | `on` | The start-up log is shown on the TV. Useful when reporting a problem. |

### Per-game settings

A `settings.txt` inside a game's own folder overrides the main one for that game. `controller`, `shading`, `timing`, `dither`, and `deinterlace` are read there. `display`, `menu`, `exit path` and `debug` stay one setting for the whole console. For example, put `controller: d2a` in an old digital-only game's folder, and leave everything else alone.

It is recommended to set controller settings per game instead of general. If you put your controller on analog and a game does not support it, you will have to toggle it off or the game may not read input. Similar for D2A (digital 2 analog), you will lose analog functionality in games that have it.

---

## The Ember menu

Hold **L1 + L2 + R1 + R2 + SELECT + START** during a game to open the Ember menu. The game pauses while it is open.

- **Resume Game** — back to the game.
- **Disc Control** — change discs in a multi-disc game. *See [Multi-disc games](#multi-disc-games).*
- **Cheats Manager** — switch cheats on and off. *See [Cheats](#cheats).*
- **System** — **Reset Game**, **Exit Game** (to the PS2 browser, or the program set by `exit path`), or **Power Off**.

Disc Control and Cheats Manager are dimmed for games that don't have a disc list or a cheat file.

### Multi-disc games

Keep every disc in one game folder, and add a **`Discs.txt`** listing the disc files in order, one per line:

```
games/
└── Final Fantasy VII/
    ├── Discs.txt
    ├── Final Fantasy VII (Disc 1).cue
    ├── Final Fantasy VII (Disc 2).cue
    └── Final Fantasy VII (Disc 3).cue
```

```
Final Fantasy VII (Disc 1).cue
Final Fantasy VII (Disc 2).cue
Final Fantasy VII (Disc 3).cue
```

The game boots disc 1. When it asks for the next disc, open the menu and pick it in **Disc Control**. All discs share the folder, so they share the same memory cards.

### Cheats

Put a **`Cheats.txt`** in a game's folder. Each cheat is a name in brackets followed by its GameShark codes, one per line:

```
[Infinite Health]
800A1234 0064

[*Fly Mode]
800110CC 5294
```

Cheats start off. Turn them on and off in **Cheats Manager**; the choice lasts until you leave the game. A cheat whose name starts with `*` is on from the moment the game boots. Switching a cheat off puts back what it changed.

### Protected PAL games

Some PAL games use LibCrypt copy protection and won't play correctly without its data. Put the game's `.sbi` (or `.lsd`) file beside its `.cue`, with the same name:

```
games/
└── MediEvil/
    ├── MediEvil (Europe).cue
    ├── MediEvil (Europe).bin
    └── MediEvil (Europe).sbi
```

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
└── Riptos Rage/
    └── SharedMC.txt         # one line: Spyro
```

Now Riptos Rage reads and writes Spyro's cards instead of making its own.

The named folder only has to exist inside `games/`. It doesn't need to be a game: an empty folder such as `games/Shared Cards/` works, and the cards are made there the first time.

A few things that make this safe to play with:

- **It's one hop.** A shared folder is never itself redirected, so you can't
  build a loop or a chain by accident.
- **A typo can't cost you a game.** If the name doesn't point at a real
  folder, Ember quietly uses that game's own cards.
  Worst case you lose the sharing, never the save.
- **It's just a folder name** — not a path. `Spyro`, not `games/Spyro`.

---

## Where it stands today

Ember runs most games at full speed, and this is backed by measurements in testing — read off PS2 performance counters while a game is running.

- **Spyro & Crash run at full speed** — locked 30fps with room to spare. These were my first two games heavily tested and developed with.
- **Resident Evil 2 and Silent Hill are playable** and run at or near full speed.
- **Many more titles have been tested.** Crash Team Racing, Ridge Racer Type 4, Tomb Raider II, Spider-Man, MediEvil, Breath of Fire III and others have all had performance and compatibility work, and most now run at or near full speed. Since the last release, Final Fantasy VIII and IX, Metal Gear Solid and Tekken 3 have had fixes as well. The heaviest scenes in some games can still dip.

---

## What's new in 0.8

- **The Ember menu.** Pause any game to reset it, exit, power off, change discs or manage cheats. *See [The Ember menu](#the-ember-menu).*
- **Multi-disc games.** Swap discs from the menu with a `Discs.txt` list.
- **Cheats.** GameShark codes from a `Cheats.txt` per game, switched on and off in the menu.
- **LibCrypt.** Protected PAL games play with their `.sbi` file.
- **Better 480p.** Games keep the PS1's own proportions, and `deinterlace` handles the few games that combed.
- **24-bit shading, redesigned.** `24` is reworked, and `24d` is added for dark games.
- **Exit to any program.** `exit path` sends Exit Game to a launcher of your choice.
- **A quiet start.** Ember no longer prints its start-up log on screen unless `debug: on` is set.
- **Sound.** Movie audio in Final Fantasy VIII and IX, Metal Gear Solid's music and briefing voices, Um Jammer Lammy's effects and more are fixed.
- **Fewer hangs and stalls.** Fixes for Tekken 3 freezing after a win, a minute-long load in Mortal Kombat Trilogy, and others.
- **New licence.** Ember 0.8 is released under the Ember Licence 1.0. *See [License](#license).*

This is not complete. There may still be some bugs and titles with mediocre performance. Please be patient as these are worked out.

---

## Known bugs

- **Some games may still hang.** Many hangs have been fixed, but there are certainly others still out there.
- **Some movies run slow.** A few full-motion videos (the initial Final Fantasy VIII intro, Blasto) still run below full speed.
- **Audio.** A few games may still have small sound bugs. If a game is underperforming, the audio will stutter.
- **Assorted visual glitches.** Most visual bugs have been fixed, however a few remain. Please be patient as these are worked out.

If you hit something that isn't on this list, please share! This helps speed up development. Fixes are rarely per-game — each one found tends to improve compatibility across the whole library.

---

## Why it's fast

The PS2 shares a lot with the PS1, and Ember is built around that.

- **It translates.** PS1 code is compiled directly into PS2 code. Both consoles use MIPS processors, so there is very little to convert. Each block of code is compiled once, then reused.

- **Hardware accelerated.** Graphics, sound and memory are handed to the PS2's own hardware wherever it can do the job. The PS2's graphics and sound chips do that work natively, leaving the main CPU free for the game.

- **Direct memory.** The PS1's memory map is laid onto the PS2's own memory manager. A PS1 read or write runs as a native PS2 one, with no software lookup in between, and the PS1's mirrored memory regions come from the same mapping.

- **It still stays exact.** None of this trades accuracy for speed. The PS1's 3D math is reproduced exactly, down to the rounding quirks games depend on, so games look the way they should.

---

## Support Ember

This has been a personal project of mine I have worked on for a while. I am completing this for multiple reasons, and am very happy to share the results with everyone involved with the PS2 community. However a lot of time and effort has gone into this, and any form of support goes a long way and really helps out with development. You help me out by donating over at my Ko-fi, or even by sharing any bugs you find throughout your playtime experience. Both go a long way.

[![Support me on Ko-fi](https://img.shields.io/badge/Ko--fi-Support%20Ember-FF5E5B?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/gageformer)

---

## Thank You

I'd like to give a personal thanks to a few people, as they have helped drastically with the development process.
Thank you to **zackcage6**, **TwistedZeon**, **chane2k1** and **Peter8Franz** for their help with personally testing & reporting issues. There are many more supporters than just listed here, and even if you're not directly listed I do genuinely appreciate your help provided. I do not want a long list, but want to give some acknowledgement to some who have gone out of their way to help me out.

I also owe credit to everyone who has helped with concepts & knowledge regarding the PS2. I have a large background in software development, but there were many learning curves starting on PS2 development that I had to overcome. **NathanNeurotic** was a huge help through this & phenomenal friend throughout the entire process. I appreciate the patience and hospitality of everyone involved.

---

## Source Code!?!?

Ember is **closed source for now**.

I'm updating this section just for full transparency. This has been a huge personal project for me, and it has come with a great amount of effort. There is a set design I have in mind and want to ensure that this vision is finished out. I understand there is great interest in the code and design of this project, however I will be keeping this closed source for some time to come. I may at Ember's end of life / development release the source, as I believe it is great to allow this scene to always continue forward & preserve gameplay (why I started this in the first place). However once again the personal meaning of this project has been huge for me, and this has grown more with the continued time and effort placed into development. I personally do not want to see the results go all over the place, or the original efforts disregarded by many variants or forks after any initial release.

---

## License

Ember 0.8 is distributed under the **Ember Licence, Version 1.0** — see
[`LICENSE.txt`](LICENSE.txt). Earlier beta builds stay under the
[Ember Public Beta Testing Licence](LICENSE-BETA.txt) they shipped with.

In plain terms — **use it, share what you find, build on top of it. Just don't
sell it, and don't take the credit.**

- **Yes:** run it, test it, stream it, record it, write about it. Monetised
  channels are completely fine.
- **Yes:** build a launcher or front-end for it. No permission needed, and
  honestly I'd love to see it.
- **Yes:** include it in a homebrew collection or front-end release, as long as
  it's unmodified, comes with `LICENSE.txt`, and is credited to me by name with
  a link back to the official release page.
- **No:** selling it, putting it behind a paywall or link locker, or shipping it
  on preloaded cards or drives for money.
- **No:** modifying or repackaging it, or presenting it as your own work.

Anything commercial, just ask. I'm easy-going about most things — the two I do
care about are keeping credit where it belongs and nobody personally profiting off work
I've given away.

Ember was created by **Gageformer**. Copyright © 2026. All rights reserved.

Ember contains no PlayStation BIOS or game data, and never will — you supply
your own, from hardware and discs you own.
