import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { motion } from "framer-motion";
import { LogOut, User } from "lucide-react";
import "./Account.css";

export default function Account() {
  const { user, logout, showAuth } = useAuth();

  if (!user) {
    return (
      <div className="container account-page">
        <motion.div
          className="glass account-empty"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>Moj nalog</h1>
          <p>Nisi prijavljen. Prijavi se ili napravi nalog.</p>
          <div className="row">
            <button className="btn-primary" onClick={() => showAuth("login")}>
              Prijavi se
            </button>
            <button
              className="btn-secondary"
              onClick={() => showAuth("register")}
            >
              Registruj se
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container account-page">
      <motion.div
        className="glass account-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="userline">
          <div className="avatar">
            <User size={22} />
          </div>
          <div>
            <h1>Zdravo, {user.name}</h1>
            <p className="muted">{user.email}</p>
          </div>
        </div>
        <div className="row">
          <button className="btn-danger" onClick={logout}>
            <LogOut size={18} />
            <span>Odjavi se</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
