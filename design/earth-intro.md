# Earth → NTU arrival

The home-page intro uses one WGS84 globe and a continuously moving camera. NASA's
Blue Marble composite supplies the orbital view; a geographically aligned fade
reveals streamed Esri World Imagery as the camera approaches Southeast Asia. The
camera follows Singapore and finishes over the EEE S2 building at
103.68074742° E, 1.34240034° N. It then dissolves into an official NTU photograph
of the school: the S2 facade on desktop, or the entrance on a phone. Buildings are real satellite photographs on the globe, not 3D building
models. The imagery is an archived composite, not a live satellite feed.

## Files and motion

- `space-intro.js`: lazy loading, camera, source layers, lifecycle and controls.
- `space-intro.css`: full-screen scene and responsive text/controls.
- `assets/images/intro/`: original NASA texture and source attribution.
- `assets/vendor/cesium/`: pinned, local CesiumJS 1.121.0 browser build and licenses.

After the initial imagery has loaded, the flight takes 12.4 seconds, holds the
EEE aerial view for 1.5 seconds, and displays the school photograph for 4.4 seconds
(including its 1.1-second dissolve). The intro then fades into the page in 0.8
seconds. Camera altitude is interpolated logarithmically with smooth acceleration
and deceleration, ending at 950 m on desktop and 1,200 m on mobile. The location
marker is projected from the S2 building's geographic coordinates.

The globe uses NASA's original 8,192 × 4,096 source for desktop and a 4,096 × 2,048
version derived from that source for mobile / save-data mode. Rendering follows
the screen's native RAF cadence, with camera updates inside Cesium's preUpdate
rather than a second animation loop. Retina resolution is capped at 2×, with a 2.5-million-pixel budget during
movement and five million pixels when paused or landed. Resolution changes only
at those state boundaries. Multisampling is limited to one sample to avoid
multiplying full-screen fill cost. A 1.75 screen-space-error target during flight
changes to 1.25 when paused or landed for finer satellite detail.
A small, three-request-concurrent prefetch warms only the approach corridor in
the normal browser HTTP cache; it is skipped in save-data mode and aborted on
exit. There is no application tile store or offline tile package.

The view contains no slogans, route labels or coordinate readouts. It retains
pause/skip, a thin progress line and source credits. The only destination label
is “NTU · EEE”; the closing school photograph has the school name. Its gentle
photo movement and dissolve use the same animation timeline and respect pause.

## Playback and failure behavior

The intro plays once per browser session. `?intro=replay` replays it and
`?intro=off` goes directly to the page. OS reduced-motion preferences skip the
intro, including when the preference changes during playback. Pause freezes the
camera while allowing remaining imagery to finish rendering. Background tabs
pause the camera, and Skip / Escape always dismiss the overlay. The rest of the
page is temporarily inert; exit restores keyboard focus, scrolling and the
original inert states. Exit also destroys the WebGL scene and its listeners.

If the engine or imagery cannot load within 12 seconds, or WebGL fails, the local
EEE photograph (when decoded) and school name are briefly shown before entering
the page. A separate
head-script watchdog exposes the page if the entry module never loads. The large
globe engine is never requested on subsequent visits or reduced-motion visits.

## Sources and hosting

- [NASA Blue Marble](https://science.nasa.gov/earth/earth-observatory/the-blue-marble-true-color-global-imagery-at-1km-resolution/): original 8192 × 4096 source, with 8K desktop and 4K mobile JPEGs. Full credit in `assets/images/intro/ATTRIBUTION.md`.
- [Esri World Imagery](https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer): online streamed imagery with native Cesium source attribution retained. This is publicly accessible without a token at the configured endpoint, but it is **not open-license imagery**. Production use requires the applicable Esri software/subscription entitlement under its [use terms](https://goto.arcgis.com/termsofuse/viewsummary). Tiles are not downloaded, packaged or redistributed with the website. `IMAGERY_URL` is the single provider endpoint to replace if another licensed service is used.
- [NTU visitor information](https://www.ntu.edu.sg/about-us/visiting-ntu): main campus, 50 Nanyang Avenue, Singapore.
- EEE S2 location: [NTU EEE contact information](https://www.ntu.edu.sg/eee/about-us/contact-us) confirms the office at S2-B2a-01. The map point is the center of [OpenStreetMap S2 building way 49967820](https://www.openstreetmap.org/way/49967820), not a surveyed doorway or the lab office.
- Official EEE photographs and full image URLs are documented in `assets/images/intro/ATTRIBUTION.md`; copyright remains with NTU / NTU EEE. Native imagery credits stay visible throughout the map-to-photo dissolve, then change to “Photo: NTU EEE”.
- [CesiumJS provider API](https://cesium.com/learn/cesiumjs/ref-doc/ArcGisMapServerImageryProvider.html).

This remains a plain static website; no build step, backend or secret is included.
Serve over HTTP(S), including GitHub Pages. Online satellite requests require
access to `services.arcgisonline.com`. For local preview, run:

```sh
python3 -m http.server 4174 --bind 127.0.0.1
```

Then open `http://127.0.0.1:4174/?intro=replay`.
