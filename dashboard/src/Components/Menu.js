import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const Menu = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isProfileDropdown, setIsProfileDropdown] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleProfileClick = () => {
    setIsProfileDropdown(!isProfileDropdown);
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsProfileDropdown(false);
  };

  const initials = String(user?.fullName || "U")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleOpenProfile = () => {
    closeMenus();
    navigate("/profile");
  };

  const handleLogout = () => {
    logout();
    closeMenus();
    navigate("/auth");
  };

  return (
    <div className="menu-shell">
      <button
        type="button"
        className="menu-toggle"
        aria-label="Toggle navigation"
        aria-expanded={isMenuOpen}
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`menu-container ${isMenuOpen ? "open" : ""}`}>
        <nav className="menus" aria-label="Dashboard navigation">
          <ul>
          <li>
            <NavLink
              to="/"
              onClick={closeMenus}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/orders"
              onClick={closeMenus}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Orders
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/holdings"
              onClick={closeMenus}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Holdings
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/positions"
              onClick={closeMenus}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Positions
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/funds"
              onClick={closeMenus}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Funds
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/apps"
              onClick={closeMenus}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Apps
            </NavLink>
          </li>
          </ul>
        </nav>

        <div className="menu-actions">
          <div className="profile-area">
            <button type="button" className="profile" onClick={handleProfileClick}>
              <div className="avatar">{initials}</div>
              <div className="profile-copy">
                <p className="userName">{user?.fullName || "User"}</p>
                <span className="userRole">Verified account</span>
              </div>
            </button>
            {isProfileDropdown && (
              <div className="profile-dropdown">
                <p onClick={handleOpenProfile}>My Profile</p>
                <p onClick={handleLogout}>Logout</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
