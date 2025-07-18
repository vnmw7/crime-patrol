import React, { useState } from "react";
import { Link } from "react-router-dom";

// --- ICONS ---

const DownloadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="2"
    stroke="currentColor"
    className="w-5 h-5 mr-2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
    />
  </svg>
);

const DownloadArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={3}
    stroke="currentColor"
    className="w-3 h-3 ml-2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
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

// --- MAIN PAGE COMPONENT ---

export default function Index() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    "FEATURES",
    "ABOUT",
    "SERVICES",
    "COMMUNITY",
    "REPORTS",
    "SUPPORT",
  ];

  return (
    <div className="min-h-screen w-full font-sans bg-white text-gray-800 flex flex-col">
      {/* --- HEADER --- */}
      <header className="relative z-20 w-full bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="font-extrabold text-3xl text-blue-600">C</span>
            <span className="font-semibold text-2xl tracking-tight text-gray-800">
              rimePatrol
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                Log in
              </Link>
              <a
                href="/apk/crime-patrol-v0.2.0.apk"
                download
                className="bg-lime-400 hover:bg-lime-500 text-black text-sm font-bold py-2.5 px-5 rounded-md flex items-center transition-colors duration-200"
              >
                <span>DOWNLOAD</span>
                <DownloadArrowIcon />
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-800"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-lg">
            <nav className="px-6 py-4 space-y-4">
              {navItems.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="block text-base font-medium text-gray-600 hover:text-blue-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <Link
                  to="/login"
                  className="block text-base font-medium text-gray-600 hover:text-blue-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <a
                  href="/apk/crime-patrol-v0.2.0.apk"
                  download
                  className="block w-full text-center bg-lime-400 text-black font-bold py-3 px-5 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  DOWNLOAD
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* --- HERO SECTION --- */}
      <main className="relative flex-grow flex flex-col items-center justify-center text-center bg-[#F7F9FB]">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 z-0 opacity-40"
          style={{
            backgroundColor: "#ffffff",
            opacity: 0.5,
            background:
              "radial-gradient(circle, transparent 20%, #ffffff 20%, #ffffff 80%, transparent 80%, transparent), radial-gradient(circle, transparent 20%, #ffffff 20%, #ffffff 80%, transparent 80%, transparent) 100px 100px, linear-gradient(#8ab2cc 8px, transparent 8px) 0 -4px, linear-gradient(90deg, #8ab2cc 8px, #ffffff 8px) -4px 0",
            backgroundSize:
              "200px 200px, 200px 200px, 100px 100px, 100px 100px",
          }}
        ></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-24 sm:py-32">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium text-gray-900 leading-tight tracking-tight">
            Community Safety
            <br />
            Excellence
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-base md:text-lg text-gray-600 leading-relaxed">
            Integrating real-time reporting, cutting-edge technology, and
            community engagement, our advanced safety platform connects citizens
            with authorities and empowers communities to stay informed and
            protected at scale.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10">
            <a
              href="/apk/crime-patrol-v0.2.0.apk"
              download
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-lg text-base font-semibold transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-lg"
            >
              <DownloadIcon />
              Download Mobile App
            </a>
            <Link
              to="/dashboard"
              className="w-full sm:w-auto border-2 border-gray-300 hover:border-gray-400 bg-white text-blue-600 hover:text-blue-700 px-8 py-3.5 rounded-lg text-base font-semibold transition-all duration-300 flex items-center justify-center"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="relative z-10 w-full px-6 lg:px-8 py-12 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center mb-4">
                <span className="font-extrabold text-3xl text-blue-600">C</span>
                <span className="font-semibold text-2xl tracking-tight text-gray-800">
                  rimePatrol
                </span>
              </Link>
              <p className="text-gray-600 max-w-md">
                Empowering communities to stay safe and informed through
                technology and collaboration.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#features"
                    className="text-gray-600 hover:text-blue-600"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="text-gray-600 hover:text-blue-600"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    className="text-gray-600 hover:text-blue-600"
                  >
                    Services
                  </a>
                </li>
                <li>
                  <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-blue-600"
                  >
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/privacy"
                    className="text-gray-600 hover:text-blue-600"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-gray-600 hover:text-blue-600"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="text-gray-600 hover:text-blue-600"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 mt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} CrimePatrol. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
