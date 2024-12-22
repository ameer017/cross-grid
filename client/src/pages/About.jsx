import React from "react";
import { FaHandshake } from "react-icons/fa";

const About = () => {
  return (
    <section className="min-h-screen bg-gray-100 text-gray-800">
      <div className="relative bg-gradient-to-r from-green-600 via-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center mt-10">
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
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-semibold text-blue-600">
              Our Mission
            </h2>
            <p className="mt-4 text-gray-600">
              To create an accessible and transparent platform for trading
              renewable energy and fostering environmental sustainability.
            </p>
          </div>

          <div className="p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-semibold text-green-600">
              Our Vision
            </h2>
            <p className="mt-4 text-gray-600">
              A world where communities collaborate to achieve energy
              independence and reduce reliance on non-renewable sources.
            </p>
          </div>

          <div className="p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-semibold text-purple-600">
              Our Values
            </h2>
            <p className="mt-4 text-gray-600">
              Sustainability, transparency, and community empowerment form the
              core of our actions and goals.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-200 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800">
            Meet the <span className="text-green-600">Team</span>
          </h2>
          <p className="mt-4 text-gray-600">
            Our team of dedicated professionals is committed to driving the
            success of our platform.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 mt-10">
            <div className="p-6">
              <img
                src="/abdullah.jpeg"
                alt="Team Member 1"
                className="w-32 h-32 mx-auto rounded-lg shadow-lg"
              />
              <h3 className="text-xl font-semibold text-gray-800 mt-4">
                Abdullahi Raji
              </h3>
              <p className="text-gray-500">Co-Founder, Technical Lead</p>
            </div>

            <div className="flex justify-center items-center">
              <div className="bg-white border-2 border-gray-300 rounded-full p-4 shadow-lg">
                <FaHandshake className="text-green-600" size={50} />
              </div>
            </div>

            <div className="p-6">
              <img
                src="/anate.jpeg"
                alt="Team Member 2"
                className="w-32 h-32 mx-auto rounded-lg shadow-lg"
              />
              <h3 className="text-xl font-semibold text-gray-800 mt-4">
                Anate Ibrahim
              </h3>
              <p className="text-gray-500">Co-Founder, Head of Operations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold">Ready to Join Us?</h2>
          <p className="mt-4 max-w-xl mx-auto">
            Become a part of the Cross Grid journey and help revolutionize
            energy trading and sustainability.
          </p>
          <button className="mt-6 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-400 transition">
            Get Started
          </button>
        </div>
      </div>
    </section>
  );
};

export default About;
