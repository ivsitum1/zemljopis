# Attribution

Third-party data and assets used in Obzor. Application source code is
proprietary (see `LICENSE`). Each entry below retains its own license.

## Planned / in use

| Asset | Source | License | Notes |
| --- | --- | --- | --- |
| Country / physical basemap data | [Natural Earth](https://www.naturalearthdata.com/) | Public domain | Preferred for country outlines, cities, physical features |
| Croatian county polygons | Natural Earth 10m Admin 1 (`ne_10m_admin_1_states_provinces`), filtered to HR, simplified | Public domain | Bundled as `content/hr/counties.json` and `src/data/geo/counties.json`. Retrieved 2026-08-11. One NE row mislabels Požega-Slavonia; corrected via `name_en` in extract script. |
| UI display font | [Bricolage Grotesque](https://github.com/ateliertriay/bricolage) | OFL 1.1 (SIL) | Bundled via `@fontsource-variable/bricolage-grotesque`, wght axis. Self-hosted so the app works offline. |
| UI body font | [Public Sans](https://github.com/uswds/public-sans) | OFL 1.1 (SIL) | Bundled via `@fontsource-variable/public-sans`, wght axis. Self-hosted so the app works offline. |
| Flag SVGs (if added) | Wikimedia Commons / PD sources | Verify each file | Some state symbols restrict use |

## Dependencies

Runtime and build dependencies are checked with `npm run licenses`. Prefer
MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, Zlib. Avoid GPL, AGPL, and
LGPL in the application bundle.

## How to add an asset

1. Confirm license allows use in a closed-source, possibly paid app.
2. Add a row to the table above (source URL, license, date retrieved).
3. Keep original license/NOTICE text beside the asset if the license requires it.
