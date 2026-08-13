import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { college, navLinks } from "../data/collegeData";
import { useAuth } from "../context/AuthContext";
import Icon from "./Icons";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setDropdownOpen(false);
    setOpen(false);
    await logout();
    navigate("/");
  };

  return (
    <>
      <header className="site-header">
        <div className="container">
          <NavLink to="/" className="brand" onClick={() => setOpen(false)}>
            <span className="brand-mark">SKM</span>
            <span className="brand-text">
              <span className="dev">{college.motto}</span>
              <span className="name">{college.name}</span>
            </span>
          </NavLink>

          <nav className="nav-desktop" aria-label="Primary">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop User Menu / Auth Buttons */}
          <div className="header-auth-desktop">
            {isAuthenticated ? (
              <div className="user-menu-dropdown-container">
                <button
                  className="user-avatar-btn"
                  onClick={() => setDropdownOpen((v) => !v)}
                  aria-expanded={dropdownOpen}
                >
                  <span className="avatar-circle">
                    {user?.firstName ? user.firstName[0].toUpperCase() : 'U'}
                  </span>
                  <span className="user-name-text">{user?.firstName || 'Account'}</span>
                  <Icon name="chevron-down" />
                </button>

                {dropdownOpen && (
                  <div className="user-dropdown-menu" onClick={() => setDropdownOpen(false)}>
                    <div className="dropdown-user-header">
                      <strong>{user?.firstName} {user?.lastName}</strong>
                      <span>{user?.email}</span>
                    </div>
                    <hr />
                    {user?.roles?.some(r => r === 'ROLE_ADMIN' || r === 'ADMIN') ? (
                      <Link to="/admin" className="dropdown-item admin-link-item">
                        <Icon name="shield" /> Admin Dashboard
                      </Link>
                    ) : (
                      <>
                        <Link to="/profile" className="dropdown-item">
                          <Icon name="user" /> My Profile & Fees
                        </Link>
                      </>
                    )}
                    <hr />
                    <button onClick={handleLogout} className="dropdown-item text-danger">
                      <Icon name="logout" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons-group">
                <Link to="/login" className="btn btn-primary-nav">
                  Sign In
                </Link>
              </div>
            )}
          </div>

          <button
            className="nav-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>

        <nav className={`nav-mobile ${open ? "open" : ""}`} aria-label="Mobile">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === "/"} onClick={() => setOpen(false)}>
              {link.label}
            </NavLink>
          ))}
          <div className="mobile-auth-divider" />
          {isAuthenticated ? (
            <>
              {user?.roles?.some(r => r === 'ROLE_ADMIN' || r === 'ADMIN') ? (
                <NavLink to="/admin" onClick={() => setOpen(false)} className="mobile-admin-link">
                  ⚡ Admin Dashboard
                </NavLink>
              ) : (
                <NavLink to="/profile" onClick={() => setOpen(false)}>
                  My Profile ({user?.firstName})
                </NavLink>
              )}
              <button onClick={handleLogout} className="mobile-logout-btn">
                Sign Out
              </button>
            </>
          ) : (
            <div className="mobile-auth-buttons">
              <Link to="/login" className="btn btn-primary-nav btn-block" onClick={() => setOpen(false)}>
                Sign In
              </Link>
            </div>
          )}
        </nav>
      </header>
    </>
  );
}
