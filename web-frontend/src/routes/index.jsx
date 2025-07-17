import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Icons
const DownloadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="w-5 h-5"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
    />
  </svg>
);

const ShieldIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="w-8 h-8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
    />
  </svg>
);

const ReportIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="w-8 h-8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0-1.125.504-1.125 1.125V11.25a9 9 0 00-9-9z"
    />
  </svg>
);

const CommunityIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="w-8 h-8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
    />
  </svg>
);

const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
    />
  </svg>
);

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="w-6 h-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export default function Index() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen w-full bg-white bg-gray-900 text-gray-900 text-white font-sans transition-colors duration-300">
      {/* Header */}
      <header
        className={`w-full px-4 sm:px-6 lg:px-10 py-4 fixed top-0 left-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 bg-gray-900/90 backdrop-blur-md border-b border-gray-200 border-gray-700/60 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link
            to="/"
            className="text-2xl font-bold text-primary-600 text-primary-400 hover:text-primary-700 hover:text-primary-300 transition-colors duration-300"
          >
            CrimePatrol
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex gap-8 items-center">
            <a
              href="#features"
              className="text-gray-600 text-gray-300 hover:text-gray-900 hover:text-white transition-colors duration-300"
            >
              Features
            </a>
            <a
              href="#about"
              className="text-gray-600 text-gray-300 hover:text-gray-900 hover:text-white transition-colors duration-300"
            >
              About
            </a>
            <a
              href="#download"
              className="text-gray-600 text-gray-300 hover:text-gray-900 hover:text-white transition-colors duration-300"
            >
              Download
            </a>
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/login"
                className="text-gray-600 text-gray-300 hover:text-gray-900 hover:text-white transition-colors duration-300 px-3 py-2"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="bg-primary-600 text-white hover:bg-primary-700 px-5 py-2 rounded-lg font-medium transition-colors duration-300 shadow-lg hover:shadow-xl"
              >
                Sign up
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 text-gray-300 hover:text-gray-900 hover:text-white transition-colors duration-300"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white bg-gray-900 border-b border-gray-200 border-gray-700 shadow-lg">
            <nav className="px-4 py-4 space-y-4">
              <a
                href="#features"
                className="block text-gray-600 text-gray-300 hover:text-gray-900 hover:text-white transition-colors duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#about"
                className="block text-gray-600 text-gray-300 hover:text-gray-900 hover:text-white transition-colors duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </a>
              <a
                href="#download"
                className="block text-gray-600 text-gray-300 hover:text-gray-900 hover:text-white transition-colors duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Download
              </a>
              <div className="pt-4 border-t border-gray-200 border-gray-700 space-y-3">
                <Link
                  to="/login"
                  className="block text-gray-600 text-gray-300 hover:text-gray-900 hover:text-white transition-colors duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="block bg-primary-600 text-white hover:bg-primary-700 px-5 py-2 rounded-lg font-medium transition-colors duration-300 text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <main className="w-full min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-10 pt-24 pb-12 text-center">
        <div className="max-w-5xl mx-auto animate-fade-in">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-6 leading-tight">
            Keep your community <br className="hidden sm:block" />
            <span className="text-primary-600 text-primary-400 animate-bounce-gentle">
              safe and informed
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 text-gray-300 max-w-3xl mx-auto mb-10 font-light animate-slide-up">
            Report incidents, track activity, and stay connected with
            authorities through our community-driven platform.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up">
            <a
              href="/apk/crime-patrol-v0.2.0.apk"
              download="crime-patrol-v0.2.0.apk"
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <DownloadIcon />
              Download App
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-4 sm:px-6 lg:px-10 py-12 bg-white bg-gray-900 border-t border-gray-200 border-gray-700">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <Link
                to="/"
                className="text-2xl font-bold text-primary-600 text-primary-400 mb-4 block"
              >
                CrimePatrol
              </Link>
              <p className="text-gray-600 text-gray-300 max-w-md">
                Empowering communities to stay safe and informed through
                technology and collaboration.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-white mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#features"
                    className="text-gray-600 text-gray-300 hover:text-primary-600 hover:text-primary-400 transition-colors duration-300"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="text-gray-600 text-gray-300 hover:text-primary-600 hover:text-primary-400 transition-colors duration-300"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#download"
                    className="text-gray-600 text-gray-300 hover:text-primary-600 hover:text-primary-400 transition-colors duration-300"
                  >
                    Download
                  </a>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className="text-gray-600 text-gray-300 hover:text-primary-600 hover:text-primary-400 transition-colors duration-300"
                  >
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-white mb-4">
                Legal
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/privacy"
                    className="text-gray-600 text-gray-300 hover:text-primary-600 hover:text-primary-400 transition-colors duration-300"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-gray-600 text-gray-300 hover:text-primary-600 hover:text-primary-400 transition-colors duration-300"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-gray-600 text-gray-300 hover:text-primary-600 hover:text-primary-400 transition-colors duration-300"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 border-gray-700 text-center">
            <p className="text-gray-500 text-gray-400 text-sm">
              © {new Date().getFullYear()} CrimePatrol. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
