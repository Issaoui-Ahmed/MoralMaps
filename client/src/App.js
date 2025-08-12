import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MapRoute from "./MapRoute";
import ThankYou from "./ThankYou";

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
