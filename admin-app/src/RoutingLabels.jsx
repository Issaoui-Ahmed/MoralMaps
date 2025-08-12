const RoutingLabels = ({ mapPoints, routes }) => {
  const formatDistance = (m) =>
    m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m.toFixed(0)} m`;
  const formatDuration = (ms) => `${Math.round(ms / 60000)} min`;

  return (
    <>
      {mapPoints.map((pt, i) => {
        const route = routes[i];
        if (!pt || !route?.summary) return null;

        return (
          <div
            key={`label-${i}`}
            style={{
              position: "absolute",
              left: pt.x + 8,
              top: pt.y - 20,
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "4px 6px",
              fontSize: "12px",
              fontFamily: "sans-serif",
              color: "#333",
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              width: "80px",
              pointerEvents: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#5f6368">
                <path d="M5 11h14l-1.5-4.5h-11L5 11zm0 2c-.6 0-1 .4-1 1v6h2v-2h12v2h2v-6c0-.6-.4-1-1-1H5zm3.5 3c-.8 0-1.5-.7-1.5-1.5S7.7 13 8.5 13s1.5.7 1.5 1.5S9.3 16 8.5 16zm7 0c-.8 0-1.5-.7-1.5-1.5S14.7 13 15.5 13s1.5.7 1.5 1.5S16.3 16 15.5 16z" />
              </svg>
              <span style={{ fontWeight: "bold", fontSize: "13px" }}>
                {formatDuration(route.summary.totalTime)}
              </span>
            </div>
            <div
              style={{
                color: "#5f6368",
                fontSize: "11px",
                marginTop: "2px",
              }}
            >
              {formatDistance(route.summary.totalDistance)}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default RoutingLabels;
