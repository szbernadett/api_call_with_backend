import React, { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";

export default function AuthContainer({ onLogin }) {
  const [showLogin, setShowLogin] = useState(true);
  
  return showLogin ? (
    <Login 
      onLogin={onLogin} 
      switchToSignup={() => setShowLogin(false)} 
    />
  ) : (
    <Signup 
      switchToLogin={() => setShowLogin(true)} 
    />
  );
}