import React from "react";
import "./Loader.css";

const Loader = () => {
  return (
    <section className="flex items-center justify-center h-screen">
      <div className="card">
        <div className="loader">
          <p>loading</p>
          <div className="words">
            <span className="word">Cross Grid ✌🏽</span>
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
