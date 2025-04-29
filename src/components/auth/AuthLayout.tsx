import React from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="sticky top-0 z-50 p-4 pt-3 md:pt-6 bg-blue-50/95 backdrop-blur-sm">
        <div className="container mx-auto">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-apple-dark">(Brand)</span>
          </Link>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="p-4 text-center text-gray-500 text-sm">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} (Brand). All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
