import React from "react";

const SurveyPage = () => {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <iframe
        width="640px"
        height="480px"
        src="https://forms.office.com/Pages/ResponsePage.aspx?id=sdof1BV-_Uy1-nIA5U3ra9Sa9rH8Ha1GrT0GgsGOJKVUNUVQTUw5Mk5UVzVGQTBSWEVXWFNLTkJURS4u&embed=true"
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

export default SurveyPage;
