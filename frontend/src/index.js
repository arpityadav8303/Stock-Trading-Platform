import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import HomePage from "./landing_Page/Home/HomePage";
import AboutPage from "./landing_Page/About/AboutPage";
import ProductPage from "./landing_Page/Products/ProductsPage";
import PricingPage from "./landing_Page/Pricing/PricingPage";
import SignUp from "./landing_Page/SignUp/SignUp";
import SupportPage from "./landing_Page/Support/SupportPage";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/SignUp" element={<SignUp />} />
      <Route path="/About" element={<AboutPage />} />
      <Route path="/Products" element={<ProductPage />} />
      <Route path="/Pricing" element={<PricingPage />} />
      <Route path="/Support" element={<SupportPage />} />
    </Routes>
  </BrowserRouter>
);