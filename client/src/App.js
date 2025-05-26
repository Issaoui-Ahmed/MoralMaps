import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MapRoute from "./MapRoute";
import ThankYou from "./ThankYou"; // Make sure this file exists

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapRoute />} />
        <Route path="/thank-you" element={<ThankYou />} />
      </Routes>
    </Router>
  );
}

export default App;
