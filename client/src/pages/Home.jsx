import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Loader from "../components/Loader/Loader";
import Layout from "../components/Layout";
import { useNavigate } from "react-router-dom";

const BackgroundShapes = () => {
  const shapes = [
    {
      className:
        "absolute w-[500px] h-[500px] bg-gradient-to-r from-blue-500 to-teal-400 opacity-40 rounded-full filter blur-3xl",
      initial: { x: -200, y: -200, scale: 1 },
      animate: {
        x: [0, 100, -100, 0],
        y: [0, -100, 100, 0],
        scale: [1, 1.2, 1],
        opacity: [0.4, 0.6, 0.4],
      },
      style: { top: "10%", left: "15%" },
      transition: { repeat: Infinity, duration: 10 },
    },
    {
      className:
        "absolute w-[400px] h-[400px] bg-gradient-to-r from-purple-500 to-pink-400 opacity-30 rounded-full filter blur-2xl",
      initial: { x: 200, y: 200, scale: 1 },
      animate: {
        x: [0, -150, 150, 0],
        y: [0, 150, -150, 0],
        scale: [1, 1.3, 1],
        opacity: [0.3, 0.5, 0.3],
      },
      style: { bottom: "20%", right: "10%" },
      transition: { repeat: Infinity, duration: 12 },
    },
    {
      className:
        "absolute w-[300px] h-[300px] bg-gradient-to-r from-yellow-500 to-orange-400 opacity-20 rounded-full filter blur-2xl",
      initial: { x: -150, y: 150, scale: 1 },
      animate: {
        x: [0, 120, -120, 0],
        y: [0, -120, 120, 0],
        scale: [1, 1.1, 1],
        opacity: [0.2, 0.4, 0.2],
      },
      style: { top: "50%", left: "40%" },
      transition: { repeat: Infinity, duration: 8 },
    },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden">
      {shapes.map((shape, index) => (
        <motion.div
          key={index}
          className={shape.className}
          initial={shape.initial}
          animate={shape.animate}
          transition={shape.transition}
          style={shape.style}
        ></motion.div>
      ))}
    </div>
  );
};

const Home = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getStarted = () => {
    navigate("get-started");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <Layout>
          <main className="relative h-screen w-screen overflow-hidden bg-gray-900 text-white">
            {/* Background Aesthetic Shapes */}
            <BackgroundShapes />

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-4 text-center">
              <motion.h1
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="text-5xl md:text-7xl font-bold mb-6"
              >
                Welcome to &nbsp;
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
                className="text-lg md:text-2xl max-w-3xl leading-relaxed"
              >
                We're committed to empowering communities to share and trade
                renewable energy efficiently and transparently.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
                className="mt-10"
              >
                <button
                  className="bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-2xl hover:scale-110 transform transition-transform duration-300"
                  onClick={getStarted}
                >
                  Get Started
                </button>
              </motion.div>
            </div>
          </main>
        </Layout>
      )}
    </>
  );
};

export default Home;
