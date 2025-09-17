import L from "leaflet";

const createTextPinIcon = (color, label) =>
  L.divIcon({
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    html: `
      <svg width="40" height="40" viewBox="0 0 24 24">
        <path fill="${color}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <text x="12" y="16" text-anchor="middle" font-size="10" font-family="Arial" font-weight="bold" fill="#fff">${label}</text>
      </svg>
    `,
  });

export const startIcon = createTextPinIcon("#34A853", "S");
export const endIcon = createTextPinIcon("#EA4335", "E");

