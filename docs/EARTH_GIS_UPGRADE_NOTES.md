# Earth-Scale GIS Upgrade Notes

## Implementation direction

Aegis Atlas will replace its illustrative map canvas with a map-first interaction model. The recommended production architecture uses a **2D operational map** for fast everyday work and an optional **3D globe/local-terrain view** for exploration, altitude, terrain, building, and time-dynamic context.

CesiumJS is a suitable globe layer because it supports a high-precision WGS84 globe, imagery and terrain layers, 3D Tiles, KML/GeoJSON/CZML, time-dynamic data, and runtime 2D/2.5D/3D modes. MapLibre GL JS is suitable for the standard operational map because its WebGL map model supports interactive vector/raster tiles, satellite and terrain examples, drawing, clustering, heatmaps, globe projection, and layer styling.

## Aegis Atlas safety model

The public demonstration must continue to use only fictional organizations, `.example` domains, documentation IP ranges, and synthetic assessment records. Satellite and terrain views provide **geographic context**; they are not a justification for unapproved collection, physical targeting, or real-world reconnaissance. Every imagery layer needs an attribution, acquisition-time indicator, coverage notice, and analyst-controlled precision label.

## Phased implementation choice

The next build will first add a true 2D Earth map with controlled basemap modes, synthetic geographic pointers, layers, selection, search, drawing, buffers, coordinates, and GeoJSON display. It will then add a separate optional 3D globe/terrain module plus STAC-style catalog metadata, time controls, local/indoor planning overlays, and offline/field workflow structures.

## References

1. [CesiumJS platform](https://cesium.com/platform/cesiumjs/) — globe, terrain, imagery, 3D Tiles, geometry, time-dynamic visualization, and runtime 2D/2.5D/3D modes.
2. [MapLibre GL JS hybrid satellite terrain example](https://maplibre.org/maplibre-gl-js/docs/examples/display-a-hybrid-satellite-map-with-terrain-elevation/) — WebGL mapping, satellite imagery, terrain elevation, globe, drawing, clustering, heatmaps, and layers.
3. [STAC specification](https://stacspec.org/) — common metadata language for discoverable spatiotemporal geospatial assets.
