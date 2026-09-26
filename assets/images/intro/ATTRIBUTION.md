# Intro imagery

## `earth-blue-marble.jpg`

- Image: NASA Blue Marble (2002), land surface, ocean color, sea ice, and clouds.
- Credit: NASA Goddard Space Flight Center; Reto Stöckli and Robert Simmon.
- Official source file: https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57735/land_ocean_ice_cloud_2048.jpg
- NASA explanation and full credits: https://science.nasa.gov/earth/earth-observatory/the-blue-marble-true-color-global-imagery-at-1km-resolution/
- NASA media usage guidelines: https://www.nasa.gov/nasa-brand-center/images-and-media/
- Retrieved: 2026-09-11. The original JPEG is included without editing or recompression.

This is a true-color global composite assembled from satellite observations, with
clouds, rather than a single photograph or live weather imagery. NASA permits
educational and informational website use under its media guidelines, with NASA
acknowledged as the source and without implying endorsement.

The file is a 2048 × 1024 equirectangular globe texture. Its geographic bounds are
longitude -180° to +180° from left to right, and latitude +90° to -90° from top to
bottom. The prime meridian is at the horizontal midpoint and the equator at the
vertical midpoint. For Cesium, use a `SingleTileImageryProvider` with
`Cesium.Rectangle.MAX_VALUE`; no rotation or Mercator projection is needed.

Visible attribution suitable for the animation: **Earth imagery: NASA Blue Marble**.

## `ntu-eee-s2.png`

- Image: real exterior photograph of NTU School of Electrical and Electronic
  Engineering, Block S2; the building lettering and S2 signs are visible.
- Credit: Nanyang Technological University, Singapore / School of EEE.
- Official publishing page: https://www.ntu.edu.sg/eee/giving
- Official source file: https://www.ntu.edu.sg/media/images/librariesprovider119/default-album/admissions/master-of-science-%28msc%29/microsoftteams-image-%281%29-%281%29-%281%29.png?sfvrsn=a635b061_0
- Retrieved: 2026-09-11. Original 3000 × 1344 PNG, without editing or recompression.
- Suitable for the landscape ending; this depicts EEE itself, not The Hive.

## `ntu-eee-exterior.jpg`

- Image: real upward-looking photograph of the School of Electrical and Electronic
  Engineering entrance, with the school's blue name lettering.
- Credit: Nanyang Technological University, Singapore / School of EEE.
- Official publishing page: https://www.ntu.edu.sg/eee/giving/where-to-give/giving-to-eee-campus-and-facilities
- Official source file: https://www.ntu.edu.sg/media/images/librariesprovider119/default-album/img_7630.jpg?sfvrsn=ff4f3574_0
- Retrieved: 2026-09-11. Original 3024 × 4032 JPEG, without editing or recompression.
- Suitable for a portrait/mobile ending.

These two photographs come from official NTU pages. They are credited to NTU;
they are not NASA imagery and are not represented as public-domain or
Creative Commons material. The source pages state © Nanyang Technological
University. Visible image credit: **Photo: NTU EEE**.

## EEE destination

- Official campus identity: https://www.ntu.edu.sg/eee/about-us/contact-us
  identifies EEE's four buildings as S1, S2, S2.1, and S2.2, and the school's
  mailing/office address as Block S2-B2a-01, 50 Nanyang Avenue, Singapore 639798.
- Destination is **Block S2**, the building shown in `ntu-eee-s2.png`.
- WGS84 building-centre coordinates: **1.34240034° N, 103.68074742° E**.
  This is a building centroid for the camera target, not a surveyed entrance.
- Coordinates were computed from the current OpenStreetMap building polygon:
  https://www.openstreetmap.org/way/49967820
- Original data used: https://www.openstreetmap.org/api/0.6/way/49967820/full.json
  (way version 7, updated 2026-02-06; retrieved 2026-09-11).
- Map-data credit: © OpenStreetMap contributors; ODbL 1.0:
  https://www.openstreetmap.org/copyright

## `earth-blue-marble-8k.jpg` and `earth-blue-marble-4k.jpg`

- Image: NASA Blue Marble (2002), land surface, ocean color, sea ice, and clouds.
- Credit: NASA Goddard Space Flight Center; Reto Stöckli and Robert Simmon.
- Official high-resolution source file: https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57735/land_ocean_ice_cloud_8192.tif
- NASA explanation and full credits: https://science.nasa.gov/earth/earth-observatory/the-blue-marble-true-color-global-imagery-at-1km-resolution/
- NASA media usage guidelines: https://www.nasa.gov/nasa-brand-center/images-and-media/
- Retrieved: 2026-09-11. The source is an original 8192 × 4096 RGB LZW TIFF
  (51,115,006 bytes), with real additional satellite-image detail beyond the
  previous 2048 × 1024 preview.
- Processing: the 8K image preserves the source's native 8192 × 4096 pixels and
  is encoded as an optimized progressive JPEG at quality 90 with 4:2:0 chroma.
  The 4K image is downsampled once from the original TIFF to 4096 × 2048 using
  Lanczos and encoded at quality 90 with 4:2:0 chroma. No AI image generation,
  upscaling, synthetic clouds, recoloring, cropping, or geometric edits are used.
- Projection and bounds: both files retain the original 2:1 equirectangular
  mapping, longitude -180° to +180° and latitude +90° to -90°, and use
  `Cesium.Rectangle.MAX_VALUE`.
- Output sizes: `earth-blue-marble-8k.jpg` is 9,544,980 bytes and
  `earth-blue-marble-4k.jpg` is 2,758,275 bytes.
