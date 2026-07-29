# Ember

**A new way to play your PlayStation 1 library on your PlayStation 2 — from a disc image, with no extra hardware.**

Ember is a PS1 emulator that runs on the PS2 itself. You drop it onto a USB stick or storage device of choice, and add the `.cue`/`.bin` files for your games library. This can be launched from whatever homebrew you so choose, and it plays from there.


## How you actually use it

Ember is a single executable program (`ember.elf`) along with the games you want to run, kept within a self-contained folder:

```
Ember/
├── ember.elf                       # the emulator
├── bios.bin                        # a PS1 BIOS — you supply this yourself
└── games/
    └── Spyro/                      # one folder per game, named however you like
        ├── Spyro.cue
        └── Spyro.bin
```

This makes Ember portable to any drive or device of your choice. USB, MMCE etc. Ember acts as a simple back end, leaving you to start your games from a launcher of choice.

You bring your own `bios.bin` (a legally-required BIOS dump from your own console) — Ember does not and will not ship one.

### Launching Ember from homebrew

Ember picks which game to boot from an **argument** — you pass it the name of a folder under `games/`, and it plays that one. It ships with its own small launcher that does this for you, but nothing about it is special: any PS2 homebrew menu that can start an ELF with an argument can drive Ember directly, so you can wire it into whatever front-end you already use — uLaunchELF, OPL, a shortcut, or a custom menu of your own.

**The optional argument** can be a plain folder name, or a path relative to Ember's home folder, example usage:

```
ember.elf "Crash Bandicoot"        # games/Crash Bandicoot/
ember.elf "games/Crash"            # a folder, spelled out
ember.elf "games/Crash/game.cue"   # a specific disc image
```

Inside a game folder Ember takes a `.cue` if there is one, otherwise a `.bin`. If it can't mount anything, it drops you into the BIOS shell rather than quietly booting something else — if you asked for a game and didn't get it, you'll know.

Things to know if you're wiring this up:

- The argument isn't split on spaces, so a name like `Crash Bandicoot` is a single argument passed through as-is. No escaping needed, but also no way to pass two things in one argument.
- Paths are relative to Ember's own folder. Ember works out of where it lives from (the path it was started with). So if you launch `mass:/Ember/ember.elf`, a game argument resolves under `mass:/Ember/`.

If you're building a front-end and have any questions or need something specific, please ask.


---

## Where it stands today

Ember runs real games on real PS2 silicon, at close to full speed, and the speed is *measured* — read off the PS2's own onboard performance counters while a game is running, not estimated.

- **The CPU side is essentially solved.** Emulated PS1 code executes at roughly the PS1's real-time speed — around the low-90s percent of the console's frame-time budget — and that holds steady across games. In the scene it's most tuned against, the emulator sits right on the real-time line (≈300M EE cycles used against a ≈295M budget).
- **Spyro runs at full speed.** Its scenes ask for a lighter per-frame draw load, so the whole frame stays inside budget.
- **Crash runs mostly full-speed.** It is still actively being worked on, however it holds 28-30 fps within the first level.
- **Other games remain untested.** I have started development with games I personally know. This leaves Crash and the Spyro trilogy with strong performance. There's more perf work to come, meaning Ember will only get better from here.


---

## Demo Release

Ember is still pre-release and not feature complete. We have a current demo without sound and other features to simply prove it works, and find bugs.

The provided launcher is a basic solution to get you started. Place it the same directory as `Ember.elf` and launch it from there.

**Currently Missing, Will Come:**

- **No sound.** The sound hardware is modelled well enough that games think it's working — they start music, they wait on it, they get sensible answers back — but nothing is actually rendered to the speakers yet. Audio is deliberately parked until after the demo.
- **No memory cards.** Saves don't persist. The console answers "nothing plugged in" when a game looks for a card.
- **Digital pad only.** No analog sticks, no rumble. Games that require a DualShock won't be happy.

**Known bugs:**

- **FMVs run slow.** Full-motion video is sluggish in every game that has it, not just one — so it's a shared piece of the video-decode and upload path rather than a per-game problem. One fix should help everywhere.
- **Some games still hang.** Crash Team Racing wedges partway in, and there are certainly others I haven't found — coverage testing is ongoing.
- **Assorted visual glitches.** A moving tear line in a select few titles, odd bright boxes around objects (Silent Hill). There are known random flickers in certain games (Crash).

If you hit something that isn't on this list, please share! This helps speed up development, as I can only test so many titles myself. Fixes are not per game, and will improve overall library compatibility with each find.

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

## Source Code!?!?

Eventual source code will be released. I plan on finishing a certain set amount of milestones prior to this.
