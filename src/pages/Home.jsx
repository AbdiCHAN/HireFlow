import React from "react";
import hero from "../assets/hero.png";

function Home() {
  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-text">
          <h1>Find Your Dream Job</h1>
          <p>
            Connect with recruiters and discover opportunities with HireFlow.
          </p>

          <button className="hero-btn">
            Get Started
          </button>
        </div>

        <div className="hero-image">
          <img src={hero} alt="Hero" />
        </div>
      </div>
    </div>
  );
}

export default Home;