# Candy Flow

A physics-based arcade game where you draw freehand lines to guide colorful candy particles into a collector bucket. Navigate through 50 increasingly challenging levels packed with hazards, obstacles, and surprises.

---

## How to Play

1. **Draw lines** on the screen using your mouse or finger (touch supported) to create temporary ramps and guides
2. **Direct the falling candies** into the glowing bucket at the bottom of the screen
3. **Collect enough candies** to reach the level target before your stability drops too low
4. **Avoid hazards** that destroy, slow, or redirect your candies

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
- Targets increase as you progress (starting at 35, scaling up to 385 by level 50)

### Stability (HP)
- Every candy that falls off-screen or is destroyed by a hazard reduces your stability
- If stability drops below the threshold, the game is over
- Displayed as a health bar in the top-right corner -- flashes red when critically low

### Candy Physics
- Candies spawn from the top of the screen with slight horizontal randomness
- They obey gravity (which increases per level), bounce off surfaces, and interact with all obstacles
- Maximum of 400 candies on screen at once

---

## Obstacles (4 Types)

| Obstacle | Introduced | Description |
|---|---|---|
| **Deflector Bars** | Level 2 | Angled static bars that bounce candies in new directions |
| **Wind Zones** | Level 4 | Large areas that push candies horizontally with a constant breeze |
| **Spinners** | Level 6 | Rotating cross-shaped obstacles that fling candies unpredictably |
| **Moving Platforms** | Level 9 | Horizontally oscillating platforms that carry candies back and forth |

---

## Hazards (8 Types)

| Hazard | Introduced | Description |
|---|---|---|
| **Black Holes** | Level 12 | Gravitational vortexes that pull nearby candies inward and destroy them at the center |
| **Lava Pools** | Level 16 | Static pools that instantly destroy any candy on contact |
| **Ice Zones** | Level 20 | Slow zones that dramatically reduce candy velocity, making them crawl |
| **Teleporters** | Level 25 | Portal pairs that transport candies between two locations on the map |
| **EMP Pulses** | Level 30 | Periodic expanding shockwaves that blast candies outward from the epicenter |
| **Gravity Flippers** | Level 35 | Anti-gravity zones that launch candies upward against normal gravity |
| **Laser Gates** | Level 40 | Rotating laser beams that destroy candies on contact |
| **Asteroids** | Level 45 | Bouncing rocky bodies that knock candies around on collision |

---

## Level Progression

The game spans **50 levels** with gradual difficulty scaling:

- **Spawn rate** increases each level (candies fall faster and more frequently)
- **Gravity** scales from 1.0x to 1.75x across all 50 levels
- **Target score** grows with each level
- **New obstacles and hazards** are introduced at milestone levels
- Multiple hazard types stack on top of each other in later levels, creating complex combinations

### Milestone Levels

| Level | Milestone |
|---|---|
| 1 | Game Start |
| 12 | Black Holes introduced |
| 16 | Lava Pools introduced |
| 20 | Ice Zones introduced |
| 25 | Teleporters introduced |
| 30 | EMP Pulses introduced |
| 35 | Anti-Gravity Zones introduced |
| 40 | Laser Gates introduced |
| 45 | Asteroids introduced |
| 50 | Final Level / Victory |

You can jump to any unlocked milestone from the start menu.

---

## Visual and Audio Design

### Visuals
- Space-themed background with twinkling stars
- Each candy has animated eyes, a mouth, a shine effect, and a color-matched motion trail
- Spark effects on collection, destruction, and missed candies
- Bucket pulses and glows when catching candies
- All hazards have distinct animated visual identities (rotating rings, bubbling lava, drifting snowflakes, pulsing portals, etc.)
- Drawn lines appear as colorful ribbons with a rotating hue

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
    GameCanvas.tsx      Main game canvas and loop
    GameUI.tsx          In-game HUD (score, HP, controls)
    StartMenu.tsx       Title screen and level selection
  game/
    audio.ts            Synthesized music and SFX system
    bucket.ts           Collector bucket creation and animation
    constants.ts        Game config, level scaling, collision categories
    drawing.ts          Freehand line drawing mechanics
    engine.ts           Matter.js physics engine setup
    hazards.ts          All 8 hazard types (creation, update, forces, kills)
    hazards-renderer.ts Hazard visual rendering
    obstacles.ts        All 4 obstacle types (creation, update, forces)
    progress.ts         LocalStorage save/load for level progress
    renderer.ts         Main render pipeline (background, particles, UI)
    spawner.ts          Candy spawning, trails, stuck detection
    vfx.ts              Spark and particle effect system
  App.tsx               Root component and game state machine
  main.tsx              Entry point
  index.css             Global styles
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
