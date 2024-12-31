import "./connection/connection";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Layout from "./components/Layout";
import About from "./pages/About";
import MarketPlace from "./pages/MarketPlace";
import ListEnergy from "./pages/ListEnergy";
import Dashboard from "./pages/Dashboard";
import DisputesPage from "./pages/DisputesPage";
import NotificationsPage from "./pages/NotificationsPage";

function App() {
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
              <Home />
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
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/dispute-overview"
          element={
            <Layout>
              <DisputesPage />
            </Layout>
          }
        />
        <Route
          path="/notifications"
          element={
            <Layout>
              <NotificationsPage />
            </Layout>
          }
        />
      </Routes>
    </>
  );
}

export default App;
