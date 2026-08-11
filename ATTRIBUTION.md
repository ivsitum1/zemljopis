# Attribution

Third-party data and assets used in Zemljopis. Application source code is
proprietary (see `LICENSE`). Each entry below retains its own license.

## Planned / in use

| Asset | Source | License | Notes |
| --- | --- | --- | --- |
| Country / physical basemap data | [Natural Earth](https://www.naturalearthdata.com/) | Public domain | Preferred for country outlines, cities, physical features |
| Croatian county (županija) boundaries | _TBD — verify before bundling_ | Must allow bundling in a proprietary app; **not GADM** for commercial path | Document exact URL + license before first GeoJSON commit |
| UI fonts | _TBD_ | Prefer OFL / SIL | Keep OFL notice if OFL fonts are embedded |
| Flag SVGs (if added) | Wikimedia Commons / PD sources | Verify each file | Some state symbols restrict use |

## Dependencies

Runtime and build dependencies are checked with `npm run licenses`. Prefer
MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, Zlib. Avoid GPL, AGPL, and
LGPL in the application bundle.

## How to add an asset

1. Confirm license allows use in a closed-source, possibly paid app.
2. Add a row to the table above (source URL, license, date retrieved).
3. Keep original license/NOTICE text beside the asset if the license requires it.
