import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import EventDetails from './pages/EventDetails';
import BookingPage from './pages/BookingPage';
import Team from './pages/Team';
import Contact from './pages/Contact';
import DeleteAccount from './pages/DeleteAccount';
import SplashScreen from './components/SplashScreen';
import { EventProvider } from './context/EventContext';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Splash screen duration
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <EventProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/event/:id" element={<EventDetails />} />
            <Route path="/book/:id" element={<BookingPage />} />
            <Route path="/team" element={<Team />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/delete-account" element={<DeleteAccount />} />
          </Routes>
        </div>
      </Router>
    </EventProvider>
  );
}

export default App;
