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

Ember picks which game to boot from an **argument** — you pass it the name of a folder under `games/`, and it plays that one. It ships with its own small launcher that does this for you, but nothing about it is special: any PS2 homebrew menu that can start an ELF with an argument can drive Ember directly, so you can wire it into whatever front-end you already use — uLaunchELF, OPL, a shortcut, or a custom menu of your own.

You bring your own `bios.bin` (a legally-required BIOS dump from your own console) — Ember does not and will not ship one.

**A playable demo will be released soon. I am fixing a few more issues prior to a public test**

On top of this, eventual source code will be released. I plan on finishing a certain set amount of milestones prior to this.

---

## Where it stands today

Ember runs real games on real PS2 silicon, at close to full speed, and the speed is *measured* — read off the PS2's own onboard performance counters while a game is running, not estimated.

- **The CPU side is essentially solved.** Emulated PS1 code executes at roughly the PS1's real-time speed — around the low-90s percent of the console's frame-time budget — and that holds steady across games. In the scene it's most tuned against, the emulator sits right on the real-time line (≈300M EE cycles used against a ≈295M budget).
- **Spyro runs at full speed.** Its scenes ask for a lighter per-frame draw load, so the whole frame stays inside budget.
- **Crash runs full-speed in normal scenes and dips in its busiest ones.** Its dense, geometry-heavy areas hand the GPU a much larger draw list each frame, and pushing that list to the Graphics Synthesizer is the current bottleneck. This is the active area of work.
- **Everything else is untested.** Based on how that bottleneck scales, games with Spyro-like draw loads should stay full-speed, and games with Crash-like dense scenes may dip until the GPU-submission path is optimized further.

There are still currently bugs being worked out, and all functionality is not currently implemented.

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
