"""Extract Croatia admin-1 polygons from Natural Earth into simplified GeoJSON.

Natural Earth is public domain. Output is for offline quiz map rendering.
"""

from __future__ import annotations

import json
import math
from pathlib import Path

import shapefile

ROOT = Path(__file__).resolve().parents[1]
SHP = ROOT / "scripts" / "ne_admin1" / "ne_10m_admin_1_states_provinces.shp"
OUT = ROOT / "content" / "hr" / "counties.json"

ISO_TO_ID = {
    "HR-01": "zgz",
    "HR-02": "kzz2",
    "HR-03": "smz",
    "HR-04": "kzz",
    "HR-05": "vaz",
    "HR-06": "ksz",
    "HR-07": "bbz",
    "HR-08": "pgz",
    "HR-09": "lsz",
    "HR-10": "vpz",
    "HR-11": "psz",
    "HR-12": "bpz",
    "HR-13": "zdz",
    "HR-14": "obz",
    "HR-15": "szz",
    "HR-16": "vsz",
    "HR-17": "sdz",
    "HR-18": "isz",
    "HR-19": "dnz",
    "HR-20": "mez",
    "HR-21": "gzg",
}


def ring_area(ring: list[list[float]]) -> float:
    area = 0.0
    for i in range(len(ring) - 1):
        x1, y1 = ring[i]
        x2, y2 = ring[i + 1]
        area += x1 * y2 - x2 * y1
    return abs(area) * 0.5


def simplify_ring(ring: list[list[float]], tolerance: float) -> list[list[float]]:
    if len(ring) < 3:
        return ring

    def perp_dist(point, start, end):
        if start == end:
            return math.hypot(point[0] - start[0], point[1] - start[1])
        num = abs(
            (end[1] - start[1]) * point[0]
            - (end[0] - start[0]) * point[1]
            + end[0] * start[1]
            - end[1] * start[0]
        )
        den = math.hypot(end[1] - start[1], end[0] - start[0])
        return num / den if den else 0.0

    def rdp(points: list[list[float]]) -> list[list[float]]:
        if len(points) < 3:
            return points
        start, end = points[0], points[-1]
        max_d = -1.0
        index = 0
        for i in range(1, len(points) - 1):
            d = perp_dist(points[i], start, end)
            if d > max_d:
                max_d = d
                index = i
        if max_d > tolerance:
            left = rdp(points[: index + 1])
            right = rdp(points[index:])
            return left[:-1] + right
        return [start, end]

    closed = ring[0] == ring[-1]
    core = ring[:-1] if closed else ring
    simplified = rdp(core)
    if closed and simplified and simplified[0] != simplified[-1]:
        simplified.append(simplified[0])
    return simplified


def shape_to_geojson_geom(shape) -> dict | None:
    parts = list(shape.parts) + [len(shape.points)]
    rings: list[list[list[float]]] = []
    for i in range(len(parts) - 1):
        pts = [[float(p[0]), float(p[1])] for p in shape.points[parts[i] : parts[i + 1]]]
        if len(pts) >= 4:
            rings.append(simplify_ring(pts, 0.015))

    if not rings:
        return None

    rings.sort(key=ring_area, reverse=True)
    outer = rings[0]
    if len(outer) < 4:
        return None
    return {"type": "Polygon", "coordinates": [outer]}


def resolve_id(rec: dict) -> str | None:
    iso = str(rec.get("iso_3166_2") or "")
    name_en = str(rec.get("name_en") or "")
    name = str(rec.get("name") or "")

    # Natural Earth 10m has a known bad row: Požega labeled as Brodsko-Posavska / HR-12.
    if "požega" in name_en.lower() or "pozega" in name_en.lower() or "požega" in name.lower():
        return "psz"
    if name == "Grad Zagreb" or iso == "HR-21":
        return "gzg"
    return ISO_TO_ID.get(iso)


def main() -> None:
    reader = shapefile.Reader(str(SHP))
    fields = [f[0] for f in reader.fields[1:]]
    features = []
    found: set[str] = set()

    for sr in reader.iterShapeRecords():
        rec = dict(zip(fields, sr.record))
        if str(rec.get("iso_a2") or "") != "HR" and str(rec.get("adm0_a3") or "") != "HRV":
            admin0 = str(rec.get("admin") or rec.get("adm0_name") or "")
            if admin0 not in {"Croatia", "Hrvatska"}:
                continue

        county_id = resolve_id(rec)
        if county_id is None:
            continue
        if county_id in found:
            # Prefer keeping first unless this row is the Požega fix replacing a false bpz.
            continue

        geom = shape_to_geojson_geom(sr.shape)
        if geom is None:
            continue

        features.append(
            {
                "type": "Feature",
                "properties": {
                    "id": county_id,
                    "name": str(rec.get("name") or ""),
                    "name_en": str(rec.get("name_en") or ""),
                    "iso_3166_2": str(rec.get("iso_3166_2") or ""),
                },
                "geometry": geom,
            }
        )
        found.add(county_id)

    # Second pass for Požega if skipped due to order (bpz taken first from false row).
    if "psz" not in found:
        for sr in reader.iterShapeRecords():
            rec = dict(zip(fields, sr.record))
            if str(rec.get("iso_a2") or "") != "HR" and str(rec.get("adm0_a3") or "") != "HRV":
                admin0 = str(rec.get("admin") or "")
                if admin0 not in {"Croatia", "Hrvatska"}:
                    continue
            name_en = str(rec.get("name_en") or "")
            if "požega" not in name_en.lower() and "pozega" not in name_en.lower():
                continue
            geom = shape_to_geojson_geom(sr.shape)
            if geom is None:
                continue
            features.append(
                {
                    "type": "Feature",
                    "properties": {
                        "id": "psz",
                        "name": "Požeško-slavonska",
                        "name_en": "Požega-Slavonia",
                        "iso_3166_2": "HR-11",
                    },
                    "geometry": geom,
                }
            )
            found.add("psz")
            break

    OUT.parent.mkdir(parents=True, exist_ok=True)
    payload = json.dumps({"type": "FeatureCollection", "features": features}, ensure_ascii=False)
    OUT.write_text(payload, encoding="utf-8")
    src_out = ROOT / "src" / "data" / "geo" / "counties.json"
    src_out.parent.mkdir(parents=True, exist_ok=True)
    src_out.write_text(payload, encoding="utf-8")
    print(f"Wrote {len(features)} features -> {OUT}")
    print(f"Wrote {len(features)} features -> {src_out}")
    print("Missing ids:", sorted(set(ISO_TO_ID.values()) - found))


if __name__ == "__main__":
    main()
