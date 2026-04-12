import React from 'react';
import { Link } from 'react-router-dom';

function NavBar() {
  return (
    <nav className="navbar navbar-expand-lg border-bottom" style={{ backgroundColor: "#FFF" }}>
      <div className="container p-2">
        <Link className="navbar-brand" to="/">
          <img src="/media/logo.svg" style={{ width: "25%" }} alt="Logo" />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link active" to="/SignUp">SignUp</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link active" to="/About">About</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link active" to="/Products">Products</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link active" to="/Pricing">Pricing</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link active" to="/Support">Support</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;