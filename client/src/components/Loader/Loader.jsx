import React from "react";
import "./Loader.css";

const Loader = () => {
  return (
    <section className="loader-container">
      <div className="loader-card">
        <div className="loader-text">
          <p className="loader-label">Loading</p>
          <div className="rotating-words">
            <span className="word">Decentralization</span>
            <span className="word">Energy</span>
            <span className="word">Resources</span>
            <span className="word">Sustainability</span>
            <span className="word">Transparency</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Loader;
