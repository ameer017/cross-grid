import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes, FaInfo } from "react-icons/fa";
import { IoMdNotifications } from "react-icons/io";
import { RiShoppingCartLine } from "react-icons/ri";
import { CgProfile } from "react-icons/cg";
import { MdCreateNewFolder } from "react-icons/md";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const liquidVariants = {
    initial: {
      clipPath: "circle(0% at 0% 50%)",
      opacity: 0,
    },
    animate: {
      clipPath: "circle(150% at 0% 50%)",
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 40,
        damping: 15,
      },
    },
    exit: {
      clipPath: "circle(0% at 0% 50%)",
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
  };

  const menuItemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        type: "spring",
        stiffness: 120,
        damping: 20,
      },
    }),
  };

  return (
    <header className="w-full h-20 flex justify-between items-center px-4 text-black bg-[#fcf252] shadow-md fixed top-0 left-0 z-30">
      <Link to="/" className="text-2xl font-bold">
        Cross Grid
      </Link>

      <nav className="hidden md:flex items-center space-x-8">
        
        <Link
          to="/about"
          className="hover:text-[#476124] transition duration-300 hover:-translate-y-2"
        >
          <FaInfo size={25} />
        </Link>
        <Link
          to="/dashboard"
          className="hover:text-[#476124] transition duration-300 hover:-translate-y-2"
        >
          <CgProfile size={25} />
        </Link>
        <Link
          to="/list-energy"
          className="hover:text-[#476124] transition duration-300 hover:-translate-y-2"
        >
          <MdCreateNewFolder size={25} />
        </Link>
        <Link
          to="/energy-marketplace"
          className="hover:text-[#476124] transition duration-300 hover:-translate-y-2"
        >
          <RiShoppingCartLine size={25} />
        </Link>
        <Link
          to="/notifications"
          className="hover:text-[#476124] transition duration-300 hover:-translate-y-2"
        >
          <IoMdNotifications size={25} />
        </Link>
        <appkit-button size="md"  />
      </nav>

      <button
        onClick={toggleMenu}
        className="text-3xl md:hidden focus:outline-none z-40"
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
      >
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed top-0 left-0 w-full h-screen bg-gradient-to-r from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center"
            variants={liquidVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <nav className="flex flex-col items-center space-y-6">
              {[
                { to: "/about", text: "About" },
                { to: "/dashboard", text: "Dashboard" },
                { to: "/list-energy", text: "List Energy" },
                { to: "/energy-marketplace", text: "Marketplace" },
              ].map((item, index) => (
                <motion.div
                  key={item.to}
                  variants={menuItemVariants}
                  initial="initial"
                  animate="animate"
                  custom={index}
                >
                  <Link
                    to={item.to}
                    className="text-2xl font-semibold hover:text-yellow-400 transition duration-300"
                    onClick={toggleMenu}
                  >
                    {item.text}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                variants={menuItemVariants}
                initial="initial"
                animate="animate"
                custom={4}
              >
                <appkit-button size="md" />
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;

