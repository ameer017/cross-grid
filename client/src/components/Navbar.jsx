import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";
import { IoMdNotifications } from "react-icons/io";
import { RiShoppingCartLine } from "react-icons/ri";
import { CgProfile } from "react-icons/cg";
import { MdCreateNewFolder } from "react-icons/md";
const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="w-full h-20 flex justify-between items-center px-4 text-white bg-gray-900 shadow-md fixed top-0 left-0 z-30">
      <Link to="/" className="text-2xl font-bold">
        Cross Grid
      </Link>

      <nav className="hidden md:flex items-center space-x-8">
        {/* <Link
          to="/about"
          className="hover:text-yellow-400 transition duration-300"
        >
          About
        </Link> */}
        <Link
          to="/dashboard"
          className="hover:text-cyan-400 transition duration-300 hover:-translate-y-2"
        >
          <CgProfile  size={25}/>
        </Link>
        {/* <Link
          to="/dispute-overview"
          className="hover:text-yellow-400 transition duration-300"
        >
          Dispute
        </Link> */}
        <Link
          to="/list-energy"
          className="hover:text-cyan-400 transition duration-300 hover:-translate-y-2"
        >
          <MdCreateNewFolder size={25} />
        </Link>
        <Link
          to="/energy-marketplace"
          className="hover:text-cyan-400 transition duration-300 hover:-translate-y-2"
        >
          <RiShoppingCartLine size={25} />
        </Link>

        <Link
          to="/notifications"
          className="hover:text-cyan-400 transition duration-300 hover:-translate-y-2"
        >
          <IoMdNotifications size={25} />
        </Link>

        <appkit-button size="md" />
      </nav>

      <button
        onClick={toggleMenu}
        className="text-3xl md:hidden focus:outline-none z-40"
      >
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div
        className={`absolute top-0 left-0 w-full h-screen bg-gray-900 text-white flex flex-col items-center justify-center transform transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link
          to="/about"
          className="text-xl py-2 hover:text-yellow-400 transition duration-300"
          onClick={toggleMenu}
        >
          About
        </Link>
        <Link
          to="/dashboard"
          className="text-xl py-2 hover:text-yellow-400 transition duration-300"
          onClick={toggleMenu}
        >
          Dashboard
        </Link>
        {/* <Link
          to="/dispute-overview"
          className="text-xl py-2 hover:text-yellow-400 transition duration-300"
          onClick={toggleMenu}
        >
          Dispute
        </Link> */}
        <Link
          to="/list-energy"
          className="text-xl py-2 hover:text-yellow-400 transition duration-300"
          onClick={toggleMenu}
        >
          List Energy
        </Link>
        <Link
          to="/energy-marketplace"
          className="text-xl py-2 hover:text-yellow-400 transition duration-300"
          onClick={toggleMenu}
        >
          Marketplace
        </Link>

        <div className="mt-4">
          <appkit-button size="md" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
