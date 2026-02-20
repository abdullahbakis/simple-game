# Candy Flow

A physics-based arcade game where you draw freehand lines to guide colorful candy particles into a collector bucket. Navigate through 100 increasingly challenging levels packed with hazards, obstacles, dynamic environments, and a full economy system.

---

## How to Play

1. **Draw lines** on the screen using your mouse or finger (touch supported) to create temporary ramps and guides
2. **Direct the falling candies** into the glowing bucket at the bottom of the screen
3. **Collect enough candies** to reach the level target before your stability drops too low
4. **Avoid hazards** that destroy, slow, or redirect your candies
5. **Earn coins** after each level to purchase cosmetic line skins from the shop

Your drawn lines last about 4.5 seconds before fading away, so keep drawing to maintain your paths.

---

## Controls

| Input | Action |
|---|---|
| Click + Drag / Touch + Drag | Draw guide lines |
| Release | Stop drawing |

---

## Game Mechanics

### Scoring
- Each candy that enters the bucket scores 1 point
- Reach the target score to complete the level
- Targets increase as you progress through all 100 levels

### Stability (HP)
- Every candy that falls off-screen or is destroyed by a hazard reduces your stability
- If stability drops below the threshold, the game is over
- Displayed as a health bar in the top-right corner -- flashes red when critically low

### Candy Physics
- Candies spawn from the top of the screen with slight horizontal randomness
- They obey gravity (which increases per level), bounce off surfaces, and interact with all obstacles
- Maximum of 400 candies on screen at once

### Coins & Economy
- Earn **15 base coins** per level completed, plus a bonus of 5-10 coins based on your stability performance
- Coins persist across sessions via localStorage
- Spend coins in the **Shop** on cosmetic line skins
- After failing a level 3 times, you can spend **500 coins** to skip to the next level

---

## Obstacles (4 Types)

| Obstacle | Introduced | Description |
|---|---|---|
| **Deflector Bars** | Level 2 | Angled static bars that bounce candies in new directions |
| **Wind Zones** | Level 4 | Large areas that push candies horizontally with a constant breeze |
| **Spinners** | Level 6 | Rotating cross-shaped obstacles that fling candies unpredictably |
| **Moving Platforms** | Level 9 | Horizontally oscillating platforms that carry candies back and forth |

---

## Hazards (20 Types)

The hazard system uses a **lifecycle window** approach. Each hazard type has a level range where it appears, peaks, and then phases out. At any given level, a maximum of **2-3 hazard types** are active simultaneously, keeping gameplay challenging but fair.

### Original Hazards

| Hazard | Level Range | Description |
|---|---|---|
| **Black Holes** | 12-30 | Gravitational vortexes that pull nearby candies inward and destroy them at the center |
| **Lava Pools** | 16-35 | Static pools that instantly destroy any candy on contact |
| **Ice Zones** | 20-42 | Slow zones that dramatically reduce candy velocity |
| **Teleporters** | 25-50 | Portal pairs that transport candies between two locations |
| **EMP Pulses** | 30-55 | Periodic expanding shockwaves that blast candies outward |
| **Gravity Flippers** | 35-60 | Anti-gravity zones that launch candies upward |
| **Laser Gates** | 40-65 | Rotating laser beams that destroy candies on contact |
| **Asteroids** | 45-70 | Bouncing rocky bodies that knock candies around |

### New Hazards

| Hazard | Level Range | Description |
|---|---|---|
| **Tesla Coils** | 48-73 | Paired poles that periodically fire a deadly lightning arc between them (2.5s interval, 0.5s arc) |
| **Repulsor Fields** | 52-77 | Force fields that push candies away from the center without destroying them |
| **Phase Walls** | 55-80 | Walls that alternate between solid and transparent states on a timer |
| **Magnetic Cores** | 58-83 | Attractive fields that pull candies toward the center (non-lethal, disrupts paths) |
| **Bumper Orbs** | 62-87 | Golden spheres that bounce candies on contact with high restitution |
| **Solar Flares** | 65-90 | Horizontal energy beams that sweep vertically across the screen, destroying candies |
| **Slow-Mo Fields** | 70-93 | Zones that apply heavy friction (0.94x velocity dampening) to slow candies to a crawl |
| **Void Zones** | 75-100 | Dark rectangular zones that bounce around the screen and destroy candies inside them |

### Hazard Lifecycle Windows

Each hazard fades in, reaches peak intensity, and fades out across its level range. This ensures the screen is never overcrowded and new challenges are always rotating in.

| Levels | Active Hazards |
|---|---|
| 1-11 | None (obstacles only) |
| 12-15 | Black Holes |
| 16-19 | Black Holes + Lava Pools |
| 20-24 | Lava Pools + Ice Zones |
| 25-29 | Ice Zones + Teleporters |
| 30-34 | Teleporters + EMP Pulses |
| 35-39 | EMP Pulses + Gravity Flippers |
| 40-44 | Gravity Flippers + Laser Gates |
| 45-47 | Laser Gates + Asteroids |
| 48-51 | Asteroids + Tesla Coils |
| 52-54 | Tesla Coils + Repulsor Fields |
| 55-57 | Repulsor Fields + Phase Walls |
| 58-61 | Phase Walls + Magnetic Cores |
| 62-64 | Magnetic Cores + Bumper Orbs |
| 65-69 | Bumper Orbs + Solar Flares |
| 70-74 | Solar Flares + Slow-Mo Fields |
| 75-89 | Slow-Mo Fields + Void Zones |
| 90-100 | Void Zones (endgame) |

---

## Dynamic Backgrounds

The visual environment changes across five themed zones as you progress:

| Levels | Theme | Description |
|---|---|---|
| 1-20 | **Deep Space** | Classic dark blue starfield |
| 21-40 | **Nebula** | Teal and blue-green cosmic clouds |
| 41-60 | **Cyber Grid** | Dark background with neon grid line overlay |
| 61-80 | **Inferno** | Deep red and orange fiery atmosphere |
| 81-100 | **Ethereal** | Deep dark void with shimmering light effects |

---

## Line Skins (15 Skins)

Customize the look of your drawn lines by purchasing skins from the shop. Each skin changes the color, pattern, or effect of the lines you draw.

| Skin | Cost | Description |
|---|---|---|
| Rainbow | Free | Default rotating hue rainbow |
| Neon Pink | 50 | Hot pink glow |
| Ocean Blue | 50 | Cool blue tones |
| Emerald | 75 | Rich green |
| Sunset | 75 | Warm orange to red gradient |
| Frost | 100 | Icy light blue |
| Lava | 100 | Deep red-orange fire |
| Electric | 150 | Bright cyan electricity |
| Toxic | 150 | Acid green |
| Royal Gold | 200 | Golden luxury |
| Shadow | 250 | Dark desaturated tones |
| Bubblegum | 300 | Bright pink |
| Midnight | 400 | Deep blue |
| Plasma | 500 | Magenta energy |
| RGB Gamer | 750 | Fast-cycling saturated colors |

---

## Level Progression

The game spans **100 levels** with carefully segmented difficulty scaling:

### Gravity Scaling
| Level Range | Gravity Increase | Description |
|---|---|---|
| 1-40 | +1.5% per level | Gentle ramp-up for learning |
| 41-70 | +1.0% per level | Moderate escalation |
| 71-100 | Capped at 1.885x | Maximum gravity, skill-based plateau |

### Other Scaling
- **Spawn rate** increases each level, capped at level 80
- **Target score** grows with each level
- **New obstacles and hazards** rotate in and out at milestone levels
- Hazard combinations are designed so no level presents an impossible scenario

### Milestone Levels (20 Checkpoints)

You can jump to any unlocked milestone from the start menu.

| Milestone | Level |
|---|---|
| 1 | 1 |
| 2 | 4 |
| 3 | 7 |
| 4 | 10 |
| 5 | 12 |
| 6 | 16 |
| 7 | 20 |
| 8 | 25 |
| 9 | 30 |
| 10 | 35 |
| 11 | 40 |
| 12 | 45 |
| 13 | 50 |
| 14 | 55 |
| 15 | 60 |
| 16 | 65 |
| 17 | 70 |
| 18 | 75 |
| 19 | 80 |
| 20 | 90 |

---

## Visual and Audio Design

### Visuals
- Dynamic themed backgrounds that change every 20 levels
- Each candy has animated eyes, a mouth, a shine effect, and a color-matched motion trail
- Spark effects on collection, destruction, and missed candies
- Bucket pulses and glows when catching candies
- All hazards have distinct animated visual identities (rotating rings, bubbling lava, drifting snowflakes, pulsing portals, lightning arcs, radial force fields, and more)
- Drawn lines appear as colorful ribbons styled by the equipped skin
- Neon glow aesthetic with low shadowBlur for performance

### Audio
- Fully synthesized soundtrack using the Web Audio API (no audio files required)
- Ambient drone-based music with randomized arpeggios
- Distinct sound effects for collection, misses, hazard kills, drawing, countdown, level complete, game over, and victory
- Volume controls for music and SFX in-game

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **React 18** | UI framework and component architecture |
| **TypeScript** | Type-safe codebase |
| **Matter.js** | 2D physics engine (gravity, collisions, forces) |
| **Canvas 2D API** | Game rendering |
| **Web Audio API** | Synthesized music and sound effects |
| **Tailwind CSS** | UI styling |
| **Vite** | Build tool and dev server |
| **Lucide React** | UI icons |
| **Supabase** | Database integration |

---

## Project Structure

```
src/
  components/
    GameCanvas.tsx      Main game canvas and render loop
    GameUI.tsx          In-game HUD (score, HP, coins, controls, level skip)
    ShopModal.tsx       Skin shop with buy/equip/preview functionality
    StartMenu.tsx       Title screen, level selection, shop access
  game/
    audio.ts            Synthesized music and SFX system
    bucket.ts           Collector bucket creation and animation
    constants.ts        Game config, level scaling, gravity segments, hazard lifecycles
    drawing.ts          Freehand line drawing mechanics
    engine.ts           Matter.js physics engine setup
    hazards.ts          All 20 hazard types (creation, update, forces, kill detection)
    hazards-renderer.ts Hazard visual rendering (20 distinct renderers)
    obstacles.ts        All 4 obstacle types (creation, update, forces)
    progress.ts         LocalStorage save/load for level progress and coins
    renderer.ts         Main render pipeline (dynamic backgrounds, particles, skin-aware lines)
    skins.ts            15 line skin definitions, unlock/select persistence
    spawner.ts          Candy spawning, trails, stuck detection
    vfx.ts              Spark and particle effect system
  App.tsx               Root component, game state machine, economy management
  main.tsx              Entry point
  index.css             Global styles and shop scrollbar
```

---

## Running Locally

```bash
npm install
npm run dev
```

---

## Build

```bash
npm run build
```

Output is written to the `dist/` directory.
