const RoutingLabels = ({ mapPoints, routes }) => {
  return (
    <>
      {mapPoints.map((pt, i) => {
        const route = routes[i];
        if (!pt || route?.totalTimeMinutes == null) return null;

        return (
          <div
            key={`label-${i}`}
            style={{
              position: "absolute",
              left: pt.x,
              top: pt.y,
              transform: "translate(-50%, -100%)",
              pointerEvents: "none",
              fontFamily: "Roboto, sans-serif",
              fontSize: "13px",
              color: "#202124",
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: "4px",
                padding: "4px 8px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontWeight: 500,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#5f6368">
                <path d="M18.92 5.01C18.72 4.42 18.16 4 17.5 4h-11c-.66 0-1.23.42-1.43 1.01L3 11v7c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h10v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-7l-1.08-5.99zM6.85 6h10.29l1.04 3H5.81l1.04-3zM5 16v-3h14v3H5z" />
              </svg>
              <span>{route.totalTimeMinutes} min</span>
            </div>
            <div
              style={{
                width: 0,
                height: 0,
                margin: "0 auto",
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: "6px solid #fff",
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              }}
            />
          </div>
        );
      })}
    </>
  );
};

export default RoutingLabels;
