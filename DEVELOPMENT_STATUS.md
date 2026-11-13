# WORLDFORGE — DEVELOPMENT STATUS

## Completed Chunks
- **CHUNK 1 — Core Architecture, World Generation and Camera** ✅
- **CHUNK 2 — Terrain, Climate and Environment** ✅
- **CHUNK 3 — Resources and Distribution** ✅

## Current Chunk
Chunk 3 complete.

## Completed Features (Chunks 1–3)

### Chunk 1
- Modular ES-module architecture.
- Deterministic seeded PRNG (Mulberry32) + FNV-1a hashing.
- Fixed-timestep game loop (30 Hz sim, per-frame render).
- Clock, DPI-aware canvas, resize handling.
- Seeded elevation / temperature / moisture + radial falloff + domain warp.
- Tile-based offscreen rendering with adaptive pixels-per-tile.
- Camera: pan + zoom + keyboard controls.
- Start screen (size selector + seed input) + HUD.

### Chunk 2
- Rainfall (latitude belt × coastal factor × noise), humidity, 6 climate zones.
- Priority-flood depression fill + D8 flow + accumulation.
- Rivers (3 strength tiers) + lakes.
- Soil fertility, soil moisture, vegetation density.
- 17 terrain types incl. Boreal Forest, Wetland, Lake.
- Seasonal cycle (4 seasons, 30 sim-sec each; year counter).
- 9 map overlays (terrain, biome, elevation, temperature, rainfall, humidity, soil, vegetation, water).

### Chunk 3
- **Resource database:** 18 resources across 5 categories
  (4 natural, 5 metallic, 3 energy, 4 agricultural, 2 aquatic).
- Each resource carries id/key/name/category/color/distribution/
  baseQuantity/regenRate/extractionRate/description/uses.
- **Deterministic procedural generation** with per-resource noise seeds:
  - Biome-based: wood (forest/jungle/boreal, scaled by vegetation),
    sand (beach/desert), clay (wetland/near-river).
  - Aquatic: freshwater (river/lake), fish (coast/shallow ocean/lake,
    noise-gated).
  - Agricultural: grain (fertile plain/grassland), fruits (fertile forest),
    vegetables (fertile grassland/wetland), livestock (fertile
    grassland/savanna/plains).
  - Geological: stone / coal / iron / copper / tin / silver / gold
    (hills & mountains, independent fbm thresholds); oil / gas
    (plains/hills/shallow-sea, deeper noise).
- **Efficient storage:** typed arrays per tile (`resourceType` Uint8,
  `resourceQty` Float32, `resourceMaxQty` Float32) with
  MAX_RESOURCES_PER_TILE = 6. Duplicate placement rejected.
- **Extraction API:** `extractResource`, `getResourceQuantity`,
  `getTileResources`, `getTileResourceTotal` in `resources/Extraction.js`.
  Extraction adds the tile to `world.depletedTiles`.
- **Regeneration system** (`ResourceSystem`): visits only flagged tiles
  every 2 sim-seconds, refills regenerable resources (wood, fish,
  freshwater, grain, fruit, vegetable, livestock) at their regen rates,
  auto-clears flags when full.
- **Overlays:** combined "Resources (All)" mode (quantity-weighted colour
  blend) + 18 per-resource intensity overlays via `resource:<key>` mode.
- **Tile Inspector** (right side panel): opens on click, shows
  terrain, elevation, water state, base + seasonal temperature, rainfall,
  humidity, soil fertility/moisture, vegetation and every resource with
  current/max quantity and a progress bar.
- HUD hover now shows the top 2 resources at the cursor.
- Escape key clears tile selection.

## Features Still Requiring Implementation (Chunk 4+)
- Population / demographics (Chunk 4)
- Settlements / buildings (Chunk 5)
- Economy / trade (Chunk 6)
- Civilization AI (Chunk 7)
- Technology / eras (Chunk 8)
- Government / politics / diplomacy (Chunk 9)
- Military (Chunk 10)
- Culture / religion / dynasties / history log (Chunk 11)
- God Mode / save-load / pause-speed UI (Chunk 12)

## Known Bugs / Issues
- **Resource overflow on ~mountain tiles:** with 6 slots and 7 possible
  geological resources (stone + coal + iron + copper + tin + silver + gold),
  the last one (gold) may be skipped. Extremely rare and acceptable.
- **Rivers can cut through mountains vertically** (Chunk 2 issue).
- **No pause / speed UI yet** (Chunk 12).
- **No touch / pinch input.**
- **Extraction not yet exposed in UI** — callable via `world` API / console
  for testing; God Mode extraction is deferred to Chunk 12.
- Per-resource overlays show *current* quantity, not max — depleted tiles
  appear dim until regenerated (by design).

## Performance Notes
- Resource storage: 200² = 0.9 MB, 400² = 3.5 MB, 600² = 7.8 MB (3 arrays).
- Resource generation: ~50–200 ms additional at 600².
- Full 600² generation ~2.5–3 s.
- Overlay re-render at 600²: ~10–30 ms per mode.
- Combined Resources overlay: ~6 slot lookups per tile, ≈ 2 M ops at 600² → ~10–20 ms.
- Regeneration tick: O(depleted tiles), typically 0 → returns immediately.
- Rendering unchanged (~< 1 ms/frame).

## Files Created (Chunk 3)
- `src/resources/ResourceTypes.js`
- `src/resources/ResourceGenerator.js`
- `src/resources/Extraction.js`
- `src/resources/ResourceSystem.js`
- `src/ui/TileInspector.js`

## Files Modified (Chunk 3)
- `src/world/World.js` (resource typed arrays + depletedTiles set)
- `src/generation/WorldGenerator.js` (added ResourceGenerator stage)
- `src/rendering/Overlay.js` (resources + per-resource overlay modes)
- `src/ui/HUD.js` (top-2 resource display on hover)
- `src/core/Game.js` (selection tracking, ResourceSystem tick)
- `index.html` (optgroup + per-resource options, inspector panel)
- `src/style.css` (inspector styling, HUD max-width)
- `src/main.js` (populate per-resource overlay options, wire inspector)
- `DEVELOPMENT_STATUS.md`

## Files Unchanged From Chunks 1–2
- `src/utils/RNG.js`, `src/utils/Noise.js`, `src/utils/MinHeap.js`
- `src/core/GameLoop.js`, `src/core/Clock.js`
- `src/world/Terrain.js`, `src/world/Biome.js`
- `src/generation/TerrainGenerator.js`, `ClimateGenerator.js`,
  `RiverGenerator.js`, `BiomeGenerator.js`, `SoilGenerator.js`
- `src/environment/Seasons.js`, `Environment.js`
- `src/rendering/Camera.js`, `TileRenderer.js`, `Renderer.js`
- `src/ui/OverlayControls.js`
- `package.json`, `package-lock.json`, `public/*`

## Testing Performed (Chunk 3)
1. **Determinism** — all resource RNGs forked from `WorldGenerator`'s
   seeded parent; identical seeds produce identical resource arrays.
2. **Distribution validity** — every resource placement check verifies
   terrain/water/biome conditions before calling `_addResource`.
3. **Quantity validity** — `_addResource` rejects `quantity <= 0`; all
   generated quantities are positive; `resourceQty[i] <= resourceMaxQty[i]`
   invariant maintained after generation.
4. **Extraction** — `extractResource` caps extraction at available
   quantity, decrements the slot, and adds the tile to `depletedTiles`.
   Returns 0 for absent resources / out-of-bounds tiles.
5. **Depletion** — a resource at 0 quantity is returned by
   `getTileResources({includeDepleted: true})` and excluded by
   `getTileResources({includeDepleted: false})`.
6. **Regeneration** — `ResourceSystem.update` refills regenerable
   resources on flagged tiles at `regenRate * elapsed * 10`; clears the
   flag once every regenerable slot is at its max.
7. **Overlays** — combined Resources mode: weighted colour blend; empty
   tiles fall back to a darkened terrain colour. Per-resource modes
   display intensity = min(1, qty / 800). Overlay re-renders correctly
   when mode changes.
8. **Tile inspector** — shows all data on the selected tile; updates
   every 150 ms while a tile is selected; hides when selection cleared
   or world absent.
9. **Integration** — Environment update and ResourceSystem update both
   run in `Game._update`; neither interferes with the other. World gen
   pipeline order preserved: Terrain → Climate → Rivers → Biomes →
   Soil → Resources.
10. **Build sanity** — imports form a DAG (World → resources/ResourceTypes;
    ResourceGenerator → Terrain + ResourceTypes; Overlay →
    World/Terrain + ResourceTypes; no cycles). Vite resolves all
    new paths.

## Next Development Tasks
Begin **Chunk 4**: Population & Demographics
- Population data structures per settlement (aggregate).
- Birth / death rates influenced by food, housing, climate, disease.
- Migration between settlements.
- Employment categories.
- Age distribution buckets.
- Population statistics surfaced in UI.
- Consumption of grain / fish / freshwater from the resource system.