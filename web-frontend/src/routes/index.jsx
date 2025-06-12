import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="min-h-screen w-full bg-gray-900 text-white">
      {/* Header - edge to edge */}
      <header className="w-full px-10 py-4 bg-gray-800 flex justify-between items-center border-b border-gray-700">
        <h1 className="text-3xl font-extrabold text-blue-500">Crime Patrol</h1>
        <nav className="flex gap-6 items-center">
          <a href="#features" className="text-white hover:text-blue-400">
            Features
          </a>
          <a href="#about" className="text-white hover:text-blue-400">
            About
          </a>{" "}
          <a href="#download" className="text-white hover:text-blue-400">
            Download
          </a>
          <Link to="/login" className="text-white hover:text-blue-400">
            Log in
          </Link>
          <Link
            to="/signup"
            className="bg-white text-gray-800 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Sign up
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="w-full min-h-[calc(100vh-80px)] flex items-center justify-center px-10">
        <div className="text-center w-full">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
            Keep your community <br />
            <span className="text-blue-500">safe and informed</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-5xl mx-auto mb-10">
            Report incidents, track activity, and stay connected with
            authorities through our community-driven platform.
          </p>{" "}
          <div className="flex justify-center gap-4 flex-wrap">
            <a
              href="/apk/crime-patrol-v0.2.0.apk"
              download="crime-patrol-v0.2.0.apk"
              className="bg-white text-gray-800 px-6 py-3 rounded-md text-lg hover:bg-gray-100"
            >
              Download App
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
