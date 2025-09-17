export async function fetchRoute(waypoints, signal) {
  if (!Array.isArray(waypoints) || waypoints.length < 2) return null;
  const coordsString = waypoints
    .map(([lat, lng]) => `${lng},${lat}`)
    .join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return null;
    const data = await res.json();
    const coords = data?.routes?.[0]?.geometry?.coordinates;
    if (!coords) return null;
    return coords.map(([lng, lat]) => [lat, lng]);
  } catch {
    return null;
  }
}
