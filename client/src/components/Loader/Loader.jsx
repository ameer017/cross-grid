import React from "react";
import "./Loader.css";

const Loader = () => {
  return (
    <section className="flex items-center justify-center h-screen">
      <div class="card">
        <div class="loader">
          <p>loading</p>
          <div class="words">
            <span class="word">Cross Grid ✌🏽</span>
            <span class="word">Decentralization</span>
            <span class="word">Energy</span>
            <span class="word">Resources</span>
            <span class="word">Sustainability</span>
            <span class="word">Transparency</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Loader;
