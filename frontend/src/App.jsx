import { useEffect, useState } from "react"
import { BrowserRouter as Router } from "react-router-dom"
import AppRoutes from "./Routes"

const SplashScreen = ({ waitingTime }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
    {/* Enhanced loading spinner */}
    <div className="relative mb-12">
      <div className="w-24 h-24 border-4 border-slate-200 rounded-full"></div>
      <div className="absolute top-0 left-0 w-24 h-24 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <div
        className="absolute top-2 left-2 w-20 h-20 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin"
        style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
      ></div>
      {/* Pulsing center dot */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
    </div>

    {/* Main content */}
    <div className="text-center max-w-2xl mx-auto px-6">
      <h1 className="text-4xl font-light text-slate-900 mb-6 tracking-tight">Initializing Server</h1>

      <div className="space-y-4 mb-12">
        <p className="text-lg text-slate-600 leading-relaxed">
          First launch may require additional initialization time.
        </p>
        <p className="text-sm text-slate-500 font-medium">Estimated initialization time: 3-4 minutes</p>
        <p className="text-slate-500 italic">Thank you for your patience. Great things take time.</p>
        {waitingTime > 0 && (
          <p className="text-sm text-blue-600 font-medium">
            Time elapsed: {Math.floor(waitingTime / 60)} minutes {waitingTime % 60} seconds
          </p>
        )}
      </div>

      {/* Manual download section */}
      <div className="border-t border-slate-200 pt-8">
        <p className="text-slate-700 mb-6 text-lg">
          While we prepare your environment, please review our documentation.
        </p>
        <a
          href="/manual.pdf"
          download
          className="inline-flex items-center px-8 py-3 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Download Manual
        </a>
      </div>
    </div>
  </div>
)

const App = () => {
  const [backendReady, setBackendReady] = useState(false)
  const [minTimeElapsed, setMinTimeElapsed] = useState(false)
  const [backendPort, setBackendPort] = useState(5001)
  const [waitingTime, setWaitingTime] = useState(0)

  useEffect(() => {
    let isMounted = true
    const checkBackend = async () => {
      try {
        console.log(`Checking backend health on port ${backendPort}...`);
        const res = await fetch(`http://127.0.0.1:${backendPort}/health`);
        if (res.ok && isMounted) {
          const data = await res.json();
          console.log('Backend health check response:', data);
          
          // Update the backend port if it's different
          const newPort = parseInt(data.port);
          if (newPort && newPort !== backendPort) {
            console.log(`Updating backend port from ${backendPort} to ${newPort}`);
            setBackendPort(newPort);
          }
          setBackendReady(true);
          
          // Set the backend URL in the window object
          const backendUrl = `http://127.0.0.1:${newPort || backendPort}`;
          console.log(`Setting backend URL to: ${backendUrl}`);
          window.BACKEND_URL = backendUrl;
        } else if (isMounted) {
          console.log('Backend health check failed, retrying...');
          setTimeout(checkBackend, 2000);
        }
      } catch (error) {
        console.error('Error checking backend health:', error);
        if (isMounted) setTimeout(checkBackend, 2000);
      }
    };
    checkBackend();
    return () => {
      isMounted = false;
    };
  }, [backendPort]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true)
    }, 2000) // 2 seconds minimum

    return () => clearTimeout(timer)
  }, [])

  // Update waiting time
  useEffect(() => {
    if (!backendReady) {
      const timer = setInterval(() => {
        setWaitingTime(prev => prev + 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [backendReady])

  // Show splash screen until both conditions are met
  if (!backendReady || !minTimeElapsed) return <SplashScreen waitingTime={waitingTime} />

  return (
    <Router>
      <AppRoutes />
    </Router>
  )
}

export default App
