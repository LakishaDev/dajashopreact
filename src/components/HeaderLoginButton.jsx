import React from "react";
import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";
import "./HeaderLoginButton.css";

export default function HeaderLoginButton() {
  const { user, showAuth } = useAuth();

  if (!user) {
    return (
      <button className="btn-ghost pill" onClick={() => showAuth("login")}>
        <User size={18} />
        <span>Prijavi se</span>
      </button>
    );
  }

  return (
    <div className="header-user">
      <Link to="/account" className="avatar small" aria-label="Moj nalog">
        <span>{user.name?.[0]?.toUpperCase() || "U"}</span>
      </Link>
    </div>
  );
}
