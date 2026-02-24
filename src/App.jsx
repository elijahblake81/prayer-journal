// src/App.jsx
import { Routes, Route, NavLink } from 'react-router-dom'
import './App.css'
import AddPrayer from './pages/AddPrayer'
import PrayerList from './pages/PrayerList'
import Reflection from './pages/Reflection'
import Reminders from './pages/Reminders'
import ReminderChecker from './components/ReminderChecker'
import SyncTest from './pages/SyncTest'

import { useAuth } from './lib/AuthProvider'   //adding for google auth  

export default function App() {
  return (
    <div className="app">
      <ReminderChecker />
      <header className="header">
        <h1 className="logo">Prayer Journal</h1>
        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Prayers</NavLink>
          <NavLink to="/add" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Add Prayer</NavLink>
          <NavLink to="/reflection" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Reflection</NavLink>
          <NavLink to="/reminders" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Reminders</NavLink>
          <NavLink to="/sync-test" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Sync Test</NavLink>
        </nav>


      {/* AUTH AREA (top-right) */}
      <div className="auth-area">
        {(() => {
          const { user, ready, signIn, signOut } = useAuth();
        
          if (!ready) return <span style={{ opacity: 0.7 }}>Loading…</span>;
        
          return user ? (
            <>
              <span className="user-name">{user.displayName || user.email}</span>
              <button onClick={signOut} className="btn btn-outline">Sign out</button>
            </>
          ) : (
            <button onClick={signIn} className="btn btn-primary">Sign in with Google</button>
          );
        })()}
      </div>



      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<PrayerList />} />
          <Route path="/add" element={<AddPrayer />} />
          <Route path="/reflection" element={<Reflection />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/sync-test" element={<SyncTest />} />
        </Routes>
      </main>
    </div>
  )
}
