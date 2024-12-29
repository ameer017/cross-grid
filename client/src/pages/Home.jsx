import React from "react";

const Home = () => {
  return (
    <main>
      <div
        className="h-[100vh] bg-cover bg-left bg-blend-multiply relative overflow-hidden"
        style={{
          backgroundImage:
            'url("https://images.pexels.com/photos/33062/pinwheel-wind-power-enerie-environmental-technology.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle, rgba(255,223,186,0.4) 0%, rgba(255,140,0,0.2) 50%, rgba(0,0,0,0.8) 100%)`,
          }}
        ></div>

        <div className="absolute inset-0 z-0 animate-float">
          <div className="absolute w-3 h-3 rounded-full bg-teal-400 opacity-70 animate-pulse left-[20%] top-[30%]"></div>
          <div className="absolute w-3 h-3 rounded-full bg-pink-500 opacity-70 animate-pulse right-[25%] bottom-[40%]"></div>
          <div className="absolute w-2 h-2 rounded-full bg-indigo-400 opacity-70 animate-pulse left-[45%] top-[60%]"></div>
          <div className="absolute w-2 h-2 rounded-full bg-teal-500 opacity-70 animate-pulse right-[40%] top-[20%]"></div>
        </div>

        <div className="relative flex justify-center items-center h-full flex-col text-white px-6 text-center z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            Welcome to{" "}
            <span
              className="text-transparent bg-clip-text inline-block"
              style={{
                WebkitTextStroke: "2px white",
              }}
            >
              Cross Grid
            </span>
          </h1>
          <p className="text-lg md:text-2xl max-w-3xl">
            We're committed to empowering communities to share and trade
            renewable energy efficiently and transparently.
          </p>

          <div className="mt-8">
            <button className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded hover:-translate-y-2 hover:transition-all">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
