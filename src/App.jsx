// src/App.jsx
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import './App.css'
import AddPrayer from './pages/AddPrayer'
import PrayerList from './pages/PrayerList'
import Reflection from './pages/Reflection'
//import Reminders from './pages/Reminders'
import ReminderChecker from './components/ReminderChecker'
import EditPrayer from './pages/EditPrayer'
import PublicFeed from './pages/PublicFeed'
import { useAuth } from './lib/AuthProvider'   // for google auth

export default function App() {
  // ✅ Call the hook at the top level (not inside a function in JSX)
  const { user, ready, signIn, signOut } = useAuth()

  return (
    
<div className="app">
  <ReminderChecker />

      <header className="header">
        <div className="header-inner">
          <h1 className="logo">Prayer Journal</h1>

          <nav className="nav" aria-label="Main">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Prayers</NavLink>
            
            <NavLink to="/reflection" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Reflection</NavLink>
            
            <NavLink to="/public" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Public</NavLink>
          </nav>


      {/* AUTH AREA (top-right) */}
      <div className="auth-area">
        {!ready ? (
          <span className="user-name">Loading…</span>
        ) : user ? (
          <>
            <span className="user-name">{user.displayName || user.email}</span>
            <button onClick={signOut} className="btn btn-outline">Sign out</button>
          </>
        ) : (
          <button onClick={signIn} className="btn btn-primary">Sign in with Google</button>
        )}
      </div>
    </div>
  </header>



      <main className="main">
        <Routes>
          <Route path="/" element={<PrayerList />} />
          <Route path="/add" element={<AddPrayer />} />
          <Route path="/reflection" element={<Reflection />} />
          <Route path="/prayers/:id/edit" element={<EditPrayer />} />
          <Route path="/public" element={<PublicFeed />} />

          {/* Redirect old /reminders to home */}
          <Route path="/reminders" element={<Navigate to="/" replace />} />

          {/* Catch-all for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}