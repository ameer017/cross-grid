import React, { useEffect } from "react";
import { FaHandshake } from "react-icons/fa";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import { Link, Element } from "react-scroll";

const About = () => {
  useEffect(() => {
    AOS.init({ duration: 1200 });
  }, []);

  const sections = ["mission", "team", "join"];

  return (
    <section className="min-h-screen bg-gray-100 text-gray-800">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative bg-gradient-to-r from-green-600 via-blue-600 to-purple-700 text-white h-[70vh] flex items-center justify-center"
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold">
            About <span className="text-yellow-300">Cross Grid</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto">
            Empowering communities to share and trade renewable energy
            efficiently and transparently. Together, we build a sustainable
            future.
          </p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/60"></div>
      </motion.div>

      {sections.map((section, index) => (
        <Element
          key={section}
          name={section}
          className="h-[70vh] flex items-center justify-center bg-gray-100"
        >
          {section === "mission" && (
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-6 bg-white shadow-lg rounded-lg"
                  data-aos="fade-up"
                >
                  <h2 className="text-2xl font-semibold text-blue-600">
                    Our Mission
                  </h2>
                  <p className="mt-4 text-gray-600">
                    To create an accessible and transparent platform for trading
                    renewable energy and fostering environmental sustainability.
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-6 bg-white shadow-lg rounded-lg"
                  data-aos="fade-up"
                >
                  <h2 className="text-2xl font-semibold text-green-600">
                    Our Vision
                  </h2>
                  <p className="mt-4 text-gray-600">
                    A world where communities collaborate to achieve energy
                    independence and reduce reliance on non-renewable sources.
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-6 bg-white shadow-lg rounded-lg"
                  data-aos="fade-up"
                >
                  <h2 className="text-2xl font-semibold text-purple-600">
                    Our Values
                  </h2>
                  <p className="mt-4 text-gray-600">
                    Sustainability, transparency, and community empowerment form
                    the core of our actions and goals.
                  </p>
                </motion.div>
              </div>
            </div>
          )}

          {section === "team" && (
            <div className="container mx-auto px-4 text-center">
              <h2
                className="text-3xl font-bold text-gray-800"
                data-aos="fade-down"
              >
                Meet the <span className="text-green-600">Team</span>
              </h2>
              <p className="mt-4 text-gray-600" data-aos="fade-up">
                Our team of dedicated professionals is committed to driving the
                success of our platform.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 mt-10">
                <motion.div
                  whileHover={{ y: -10 }}
                  className="p-6"
                  data-aos="fade-right"
                >
                  <img
                    src="/abdullah.jpeg"
                    alt="Team Member 1"
                    className="w-32 h-32 mx-auto rounded-lg shadow-lg"
                  />
                  <h3 className="text-xl font-semibold text-gray-800 mt-4">
                    Abdullahi Raji
                  </h3>
                  <p className="text-gray-500">Co-Founder, Technical Lead</p>
                </motion.div>

                <motion.div
                  className="flex justify-center items-center"
                  data-aos="zoom-in"
                >
                  <div className="bg-white border-2 border-gray-300 rounded-full p-4 shadow-lg">
                    <FaHandshake className="text-green-600" size={50} />
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -10 }}
                  className="p-6"
                  data-aos="fade-left"
                >
                  <img
                    src="/anate.jpeg"
                    alt="Team Member 2"
                    className="w-32 h-32 mx-auto rounded-lg shadow-lg"
                  />
                  <h3 className="text-xl font-semibold text-gray-800 mt-4">
                    Anate Ibrahim
                  </h3>
                  <p className="text-gray-500">
                    Co-Founder, Head of Operations
                  </p>
                </motion.div>
              </div>
            </div>
          )}

          {section === "join" && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="container mx-auto px-4 text-center"
            >
              <h2 className="text-3xl font-bold">Ready to Join Us?</h2>
              <p className="mt-4 max-w-xl mx-auto">
                Become a part of the Cross Grid journey and help revolutionize
                energy trading and sustainability.
              </p>
              <Link
                to="/get-started"
                smooth={true}
                duration={800}
                className="mt-6 inline-block px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition cursor-pointer"
              >
                Get Started
              </Link>
            </motion.div>
          )}
        </Element>
      ))}
    </section>
  );
};

export default About;
