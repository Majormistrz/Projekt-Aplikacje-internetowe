import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Layouty
import Layout from "./components/Layout";
import LayoutWithSearch from "./components/LayoutWithSearch";

// Strony
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage"; 
import SearchResults from "./pages/SearchResults";
import OfferDetails from "./pages/OfferDetails";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import Cart from "./pages/Cart";
import UserPanel from "./pages/UserPanel";
import SellerPanel from "./pages/SellerPanel";
import AdminPanel from "./pages/AdminPanel";
import ResetPasswordRequest from "./pages/ResetPasswordRequest";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./components/VerifyEmail";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import About from "./pages/About";

// Konteksty
import { NotificationProvider } from "./context/NotificationContext";
import { UserProvider } from "./context/UserContext";
import { CartProvider } from "./context/CartContext";

function App() {
  return (
    <GoogleOAuthProvider clientId="454536949951-fbdfflqh9s0fuf86kglmoduaa67g54rj.apps.googleusercontent.com">
      <NotificationProvider>
        <UserProvider>
          <CartProvider>
            <Router>
              <Routes>
                {/* Layout z paskiem wyszukiwania */}
                <Route element={<LayoutWithSearch />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/category/:categoryId" element={<CategoryPage />} />
                  <Route path="/search" element={<SearchResults />} />
                </Route>

                {/* Layout bez paska wyszukiwania */}
                <Route element={<Layout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/user-panel" element={<UserPanel />} />
                  <Route path="/seller-panel" element={<SellerPanel />} />
                  <Route path="/offer/:id" element={<OfferDetails />} />
                  <Route path="/reset-password-request" element={<ResetPasswordRequest />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/admin-panel" element={<AdminPanel />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/about" element={<About />} />
                </Route>
              </Routes>
            </Router>
          </CartProvider>
        </UserProvider>
      </NotificationProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
