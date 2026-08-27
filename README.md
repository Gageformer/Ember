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
        └── Spyro.bin
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


**A refused or missing game drops you at the PS1 BIOS shell.** If you asked for something and didn't get it, you'll know immediately rather than wondering why the wrong title started.

Things to know if you're wiring this up:

- **Spaces are fine.** `"Crash Bandicoot (USA)"` is a single argument, passed through as-is. Some launchers may split arguments on spaces, so Ember stitches them back together for you — you don't need to escape anything.
- **Everything is relative to Ember's own folder**, worked out from wherever it was started. Launch `mass:/Ember/ember.elf` and your games are looked for in `mass:/Ember/games/`.
- **Name folders whatever you like.** Ember doesn't care about region tags, brackets or serial numbers.

If you're building a front-end and have any questions or need something specific, please ask.

---

## Settings

Next to `ember.elf` you can put an optional **`settings.txt`**. It's a plain text file, one `key: value` per line:

```
# Lines starting with # or ; are ignored.
# A space after the colon is optional.

display: 480
```

The file is completely optional — delete it and every default stands.

### Available keys

| Key | Values | What it does |
|---|---|---|
| `display` | `480` *(default)* | 480i. What almost every TV, capture device and upscaler expects. |
| | `240` | True 240p "double strike" — what a CRT actually wants, and sharper on one. Some TVs and scalers refuse to lock to it. |

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

Ember runs games at close to full speed, and the speed is *measured* — read off the PS2's own onboard performance counters while a game is running, rather than estimated or eyeballed.

- **Spyro runs at full speed** — locked 30fps with room to spare.
- **Crash runs mostly full speed.** It holds 28–30fps through the first level, but sits close enough to the line that you can occasionally notice it. Still being worked on.
- **Resident Evil 2 and Silent Hill are playable** and sit right around the real-time line, dipping under it in the heaviest scenes.
- **Other games remain largely untested.** Development started with games I personally know well, so those have the strongest performance. I have received reports and have started to work on more titles. There's more perf work to come, and Ember only gets better from here.

---

## Current Release

A lot of work has been done since the first demo, leaving this as the version many were waiting for. This is not complete, expect some bugs and titles with mediocre performance. Please be patient as these are worked out.

- **Sound.** Music, effects and CD/XA audio all play. There may be stutter or bugs still being worked out.
- **Memory cards.** Saves persist, two card slots, made automatically per game — and games can share a card if you want them to. *See [Memory cards](#memory-cards).*
- **Controller support.** Analog sticks and rumble. Digital pads work as they always did.
- **PAL games run.** PAL titles play on an NTSC signal with the picture correctly positioned, rather than cropped or shifted.
- **240p or 480i output**, your choice — see Settings above.

---

## Known bugs

- **Some games hang.** Crash Team Racing wedges partway in, and King's Field II shows the same fault — both are the same underlying issue with how a CD command finishes, so one fix should cover both. There are certainly others reported as well.
- **FMV audio quirks.** Full-motion videos run quite smooth, however some FMVs may have an audio stutter. This is being worked out, please be patient.
- **Audio delivery.** Some games do not have perfect or smooth audio. There are a few known bugs, and adjustments that need to be made. If a game is underperforming, the audio will have stutter.
- **Spyro 2's dialogue stutters** word by word. Isolated to that game so far.
- **Assorted visual glitches.** Most visual bugs have been fixed, however a few remain. Please be patient as these are worked out.

If you hit something that isn't on this list, please share! This helps speed up development. Fixes are rarely per-game — each one found tends to improve compatibility across the whole library.

---

## How it hits these speeds

- **Register pinning (near-identity mapping).** The PS1's CPU registers are mapped one-to-one onto the *same-numbered* EE registers during execution (POPS-style). A guest add on `$4` is just an EE add on `$4` — no loading state in and out around every instruction. The PS1's full hot CPU state also lives at a fixed address in the EE's fast on-chip scratchpad, reachable in a single instruction, so no register is wasted just pointing at it.

- **JIT compilation.** Instead of decoding each PS1 instruction every time it runs, Ember translates a block of PS1 code into native EE machine code once, caches it, and re-runs the compiled version. Hot paths get translated as longer traces so the CPU spends its time running code, not re-deciding what to run.

- **Fastmem (hardware-assisted memory).** The EE's memory-mapping hardware (TLB) is wired so that PS1 RAM, BIOS, and scratchpad addresses land directly on real memory. A PS1 load or store becomes an ordinary EE load or store — no software bounds-check, no lookup. A big recent win extended this to the PS1's own scratchpad, which games hammer constantly; routing it through the fast path instead of a slow fallback cut execution by a third.

- **GTE in EE integer math (MMI).** The PS1's geometry/lighting co-processor is fixed-point integer with saturation and status flags that games read back. Ember runs it as native integer routines on the EE — using its wide MMI (multimedia/SIMD) instructions — rather than on the PS2's floating-point VU0. This is a deliberate accuracy choice: the GTE's math needs more precision than VU0 floats can hold exactly, so doing it in EE integer keeps results **bit-exact by construction** instead of approximated.

- **Event scheduler.** Timers, the CD drive, DMA, and interrupts each register when they're *next due* to do something, instead of being checked on every single instruction. The CPU only stops to service a device at the moment that device actually needs it.

- **Self-modifying-code tracking.** Compiled code is only thrown out and re-translated when a game actually writes over code it already ran — so the common case (code that doesn't change) never pays for the rare case (code that does).

- **Async disc prefetch.** The emulator reads ahead of what the game is currently asking for, so gameplay doesn't stall waiting on the CD.

- **GPU-to-GS translation.** The PS1's 2D command-list GPU calls are rebuilt as Graphics Synthesizer draw calls, handling PS1-specific texture, palette, and interlace quirks explicitly.

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

Ember is **closed source for now**, and this is a deliberate, temporary decision.

The source will be released once the project hits a set of milestones I've laid
out for myself. This project has a high personal meaning to me, and I'd like to see through that vision at this moment.

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
