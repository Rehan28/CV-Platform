import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../theme/ThemeContext";
import { setLanguage } from "../../i18n";
import "./AppLayout.css";

export function AppLayout() {
  const { t, i18n } = useTranslation();
  const { user, hasRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <Link to="/" className="brand">
            <span className="brand-mark">CV</span>
            <span className="brand-word">Platform</span>
          </Link>

          <nav className="main-nav">
            <NavLink to="/" end>
              {t("nav.home")}
            </NavLink>
            <NavLink to="/positions">{t("nav.positions")}</NavLink>
            {hasRole("recruiter") && <NavLink to="/attributes">{t("nav.attributes")}</NavLink>}
            {user && <NavLink to="/profile">{t("nav.profile")}</NavLink>}
          </nav>

          <form className="header-search" onSubmit={submitSearch}>
            <input
              type="search"
              placeholder={t("nav.search_placeholder") ?? ""}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>

          <div className="header-controls">
            <button className="icon-btn" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
              {theme === "light" ? "☾" : "☀"}
            </button>
            <select
              className="lang-select"
              value={i18n.language}
              onChange={(e) => setLanguage(e.target.value as "en" | "es")}
              aria-label="Language"
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
            </select>
            {user ? (
              <>
                <span className="user-chip">{user.email}</span>
                <button className="text-btn" onClick={() => logout()}>
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <Link className="text-btn" to="/login">
                  {t("nav.login")}
                </Link>
                <Link className="btn-primary-small" to="/register">
                  {t("nav.register")}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
