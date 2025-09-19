import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import EventDetails from './pages/EventDetails';
import BookingPage from './pages/BookingPage';
import Team from './pages/Team';
import Contact from './pages/Contact';
import DeleteAccount from './pages/DeleteAccount';
import { EventProvider } from './context/EventContext';
import TicketSelection from './pages/TicketSelection';
import { AuthProvider } from './context/AuthContext';
import AuthModal from './components/AuthModal';
import ScrollToTop from './components/ScrollToTop';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

function App() {
  return (
    <AuthProvider>
      <EventProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/event/:id" element={<EventDetails />} />
              <Route path="/tickets/:id" element={<TicketSelection />} />
              <Route path="/book/:id" element={<BookingPage />} />
              <Route path="/booking/confirmation" element={<BookingConfirmationPage />} />
              <Route path="/team" element={<Team />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/delete-account" element={<DeleteAccount />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
            </Routes>
            <AuthModal />
          </div>
        </Router>
      </EventProvider>
    </AuthProvider>
  );
}

export default App;

