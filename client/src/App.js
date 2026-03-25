import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Layout from "./Layout";
import Dashboard from "./Dashboard";
import Sites, { SiteDetail, VendorDetail } from "./Sites";
import Bills from "./Bills";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="sites" element={<Sites />} />
          <Route path="sites/:id" element={<SiteDetail />} />
          <Route path="sites/:id/vendors/:vendorIndex" element={<VendorDetail />} />
          <Route path="bills" element={<Bills />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;