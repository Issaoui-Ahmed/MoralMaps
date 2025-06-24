import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MapRoute from "./MapRoute";

// New inline ThankYou component that embeds Microsoft Form
const ThankYou = () => {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <iframe
        width="640px"
        height="480px"
        src="https://forms.office.com/Pages/ResponsePage.aspx?id=sdof1BV-_Uy1-nIA5U3ra9Sa9rH8Ha1GrT0GgsGOJKVUNUVQTUw5Mk5UVzVGQTBSWEVXWFNLTkJURS4u&r4e2137dcf52946c9900dfff16a521df9=safe"
        frameBorder="0"
        marginWidth="0"
        marginHeight="0"
        style={{ border: "none", maxWidth: "100%", maxHeight: "100vh" }}
        allowFullScreen
        webkitallowfullscreen="true"
        mozallowfullscreen="true"
        msallowfullscreen="true"
        title="Microsoft Form"
      ></iframe>
    </div>
  );
};

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