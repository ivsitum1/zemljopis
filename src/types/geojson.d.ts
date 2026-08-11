declare module '*.geojson' {
  const value: {
    type: 'FeatureCollection'
    features: Array<{
      type: 'Feature'
      properties: Record<string, string>
      geometry: {
        type: 'Polygon' | 'MultiPolygon'
        coordinates: number[][][] | number[][][][]
      }
    }>
  }
  export default value
}
