# Liquid Glass mobile navigation

Target: Chromium browsers. This is a web implementation informed by Apple's
design guidance, not Apple's native renderer or a claim of identical pixels.

## Research used before implementation

- [Apple HIG: Tab bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars): floating bottom navigation, persistent destinations, visible labels and a clear selected state. Keep navigation separate from actions. Existing destinations remain accessible; no overflow menu was introduced.
- [Apple HIG: Materials](https://developer.apple.com/design/human-interface-guidelines/materials): use the regular material for navigation over mixed content. Clear material is intended for media-rich contexts. The material must preserve legibility rather than just maximise transparency.
- [WWDC25: Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/), Dynamics and Principles chapters: lensing, touch-driven illumination, a quiet resting state, temporary elevation and elastic response during interaction. Reduced motion removes elastic effects; reduced transparency and increased contrast change the material.
- [WWDC25: Get to know the new design system](https://developer.apple.com/videos/play/wwdc2025/356/): geometry and grouping express hierarchy; scroll-edge effects provide separation, and text/icons remain above optical distortion.
- [MDN: feDisplacementMap](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDisplacementMap) and [backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter): Chromium can displace backdrop pixels using an SVG red/green normal field. The map uses sRGB so its neutral centre does not shift the background.

## Implementation choices and limits

The outer bar is a capsule with a regular translucent material, a soft scroll-edge
transition and a neutral resting selection. During dragging, the selection lifts
into a transparent lens. Illumination follows contact; icon emphasis interpolates
continuously between tab centres. Direction/speed affect bounded stretch and tilt.
Position follows the pointer directly; release settles into the destination with
one uninterrupted spring. Leaving the bar, Escape or pointer cancellation restores
the selected tab. Navigation still commits once at release, preserving the earlier
interaction requirement and avoiding intermediate page loads.

The displacement field approximates a rounded capsule's optical rim. It is
generated once per size change, never per pointer frame. Optical filters affect
backdrops only. Drag geometry is measured once per gesture; motion values update
without a React render on every pointer move. Haptics remain best-effort.

The spring constants, dimensions, hold threshold and displacement strength are
implementation tuning, not values published by Apple. The official sources do not
specify exact tab-scrubbing timing or this app's release-to-commit rule. Apple's
per-pixel adaptive contrast, native compositor, optical model and SF Symbols are
not reproduced. Contrast follows the site's theme and the real backdrop's blur and
colour; existing Lucide icons retain the site's identity. Auto-minimisation is an
optional native feature and was not added: this app has no persistent accessory
and its six destinations should stay reachable.

`prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-contrast` and
forced colours have explicit treatments. Unsupported optical rendering leaves
navigation usable. No Safari refraction parity is a target for this change.

Use `npm test` for optics/gesture/haptics checks and `npm run build` for production
validation. Browser checks should include 320/390px, both themes, a long drag,
cancel, ordinary tap and keyboard activation. Physical haptics, phone performance
and installed-PWA system-bar behaviour still require an actual device.
