import "./connection/connection";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Layout from "./components/Layout";
import About from "./pages/About";
import MarketPlace from "./pages/MarketPlace";
import ListEnergy from "./pages/ListEnergy";

function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/about"
          element={
            <Layout>
              <About />
            </Layout>
          }
        />
        <Route
          path="/list-energy"
          element={
            <Layout>
              <ListEnergy />
            </Layout>
          }
        />
        <Route
          path="/energy-marketplace"
          element={
            <Layout>
              <MarketPlace />
            </Layout>
          }
        />
      </Routes>
    </>
  );
}

export default App;
