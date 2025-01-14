import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Particles from "react-particles";
import { loadFull } from "tsparticles";
import Loader from "../components/Loader/Loader";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";
import ElectricityEffect from "../components/ElectricityEffect";


const Home = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getStarted = async () => {
    navigate("get-started");
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 4000);
  }, []);

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <Layout>
          <main className="relative h-screen overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-gray-900 "
            >
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle, rgba(255,223,186,0.4) 0%, rgba(255,140,0,0.2) 50%, rgba(0,0,0,0.8) 100%)`,
                }}
              ></div>
            </div>

            <Particles
              id="tsparticles"
              init={particlesInit}
              options={{
                fullScreen: { enable: false },
                background: {
                  color: {
                    value: "transparent",
                  },
                },
                fpsLimit: 120,
                interactivity: {
                  events: {
                    onClick: {
                      enable: true,
                      mode: "push",
                    },
                    onHover: {
                      enable: true,
                      mode: "repulse",
                    },
                    resize: true,
                  },
                  modes: {
                    push: {
                      quantity: 4,
                    },
                    repulse: {
                      distance: 200,
                      duration: 0.4,
                    },
                  },
                },
                particles: {
                  color: {
                    value: "#ffffff",
                  },
                  links: {
                    color: "#ffffff",
                    distance: 150,
                    enable: true,
                    opacity: 0.5,
                    width: 1,
                  },
                  move: {
                    direction: "none",
                    enable: true,
                    outModes: {
                      default: "bounce",
                    },
                    random: false,
                    speed: 2,
                    straight: false,
                  },
                  number: {
                    density: {
                      enable: true,
                      area: 800,
                    },
                    value: 80,
                  },
                  opacity: {
                    value: 0.5,
                  },
                  shape: {
                    type: "circle",
                  },
                  size: {
                    value: { min: 1, max: 5 },
                  },
                },
                detectRetina: true,
              }}
              className="absolute inset-0 z-10"
            />

            <div className="relative flex justify-center items-center h-full flex-col text-white px-6 text-center z-20">
              <motion.h1
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="text-5xl md:text-7xl font-bold mb-4"
              >
                Welcome to{" "}
                <span
                  className="text-transparent bg-clip-text inline-block"
                  style={{
                    WebkitTextStroke: "2px white",
                  }}
                >
                  Cross Grid
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="text-lg md:text-2xl max-w-3xl"
              >
                We're committed to empowering communities to share and trade
                renewable energy efficiently and transparently.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
                className="mt-8"
              >
                <button
                  className="bg-gray-800 text-white font-bold py-3 px-6 rounded-lg hover:-translate-y-2 transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-lg"
                  onClick={getStarted}
                >
                  Get Started
                </button>
              </motion.div>
            </div>

            <ElectricityEffect />
          </main>
        </Layout>
      )}
    </>
  );
};

export default Home;

