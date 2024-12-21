import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <header className="w-full h-20 flex justify-between items-center px-4">
      <Link to="/" className="text-3xl font-bold">
        Cross Grid
      </Link>
      <nav>
        <Link   
          to="/about"
          className="mx-4"
        >
          About
        </Link>
        <Link   
          to="/list-energy"
          className="mx-4"
        >
          List Energy
        </Link>
        <Link
          to="/energy-marketplace"
          className="mx-4"
        >
          Marketplace
        </Link>
      </nav>
      <appkit-button size="md" />
    </header>
  );
};

export default Navbar;
