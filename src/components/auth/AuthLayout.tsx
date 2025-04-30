import React from "react";
import { Link } from "react-router-dom";
import { BRAND_NAME } from "@/lib/constants";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="sticky top-0 z-50 p-4 pt-3 md:pt-6 bg-blue-50/95 backdrop-blur-sm">
        <div className="container mx-auto">
          <Link to="/" className="flex items-center mb-8">
            <span className="text-xl font-bold text-apple-dark">{BRAND_NAME}</span>
          </Link>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="mt-auto py-4 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
