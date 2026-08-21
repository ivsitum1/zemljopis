# Task: Restore plate simulation and interpolate distance on map + compass - 2026-08-17

## Objectives

- Show a full simulated Croatian registration plate (EU band, city code, arms, serial) instead of city letters only.
- Draw the distance route as a geodesic interpolated onto the Croatia county map, with a compass inset.

## Prerequisites

- `RegistrationPlate` and `simulateHrSerial` already exist from `8d77545`.
- `CroatiaDistanceMap` and `CompassRose` exist but read as two dots and a straight line.

## Task Breakdown

- [ ] Failing test for geodesic interpolation
- [ ] Implement `interpolateGeodesic` and draw it on the distance map
- [ ] Overlay compass on the map; keep counties readable
- [ ] Wire `RegistrationPlate` back into Plates mode + CSS
- [ ] Verify tests, typecheck, and visual smoke

## Process Notes

- [2026-08-17] Root cause: merge/isolation restored `plate-badge`; distance still used a straight SVG line and a faded separate compass.

## Result

- Pending verification
