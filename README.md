# SPACE Lab website

Official website concept and static implementation for SPACE Lab at the School of
Electrical and Electronic Engineering, Nanyang Technological University.

The home page includes a real Earth-to-NTU satellite intro. See
[the intro notes](design/earth-intro.md) for playback, local preview, imagery
sources and hosting requirements.

The home hero preserves the original repository's `hero-world.png`, layout and
palette. `hero-world.js` adds looping SVG orbital signals, a point-cloud scan and
sensor pulses over the unmodified artwork, with the original gentle breathing
motion. No WebGL engine or external service is needed. The small pause button
stops/resumes all motion; reduced-motion preferences start it still. Animation
pauses offscreen or in a hidden tab and starts after the Earth intro finishes.
Open `http://127.0.0.1:4174/?intro=off` to preview the hero directly.
