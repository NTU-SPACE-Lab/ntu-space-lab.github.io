# CesiumJS browser distribution

- Version: `cesium@1.121.0` (the browser bundle reports `1.121`).
- Source: https://registry.npmjs.org/cesium/-/cesium-1.121.0.tgz
- Download SHA-256: `fcb9f420f0f761c528f42b6e464ad0f03fed21fab58a3a36506a6bfa32858a45`
- Included without modification: `Build/Cesium/Cesium.js`, `Assets/`, `ThirdParty/`, `Widgets/`, and `Workers/`.
- Not included: CommonJS and ES-module entry bundles, source files, development tools, and unminified copies.

The Apache 2.0 license is in `LICENSE.md`. Upstream third-party license inventories are preserved as `ThirdParty.json` and `ThirdParty.extra.json`; license notices embedded in the browser build and its assets are retained.

Load `Widgets/widgets.css` and set `window.CESIUM_BASE_URL` to this directory before loading `Cesium.js`. For example, for a page at the website root:

```html
<link rel="stylesheet" href="assets/vendor/cesium/Widgets/widgets.css">
<script>window.CESIUM_BASE_URL = "assets/vendor/cesium/";</script>
<script src="assets/vendor/cesium/Cesium.js"></script>
```

Keep the directories together when publishing. Serve over HTTP(S) so Web Workers and imagery assets load correctly. Imagery providers and their attribution are configured by the application separately.
