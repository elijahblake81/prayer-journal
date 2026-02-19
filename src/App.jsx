import { Routes, Route, NavLink } from 'react-router-dom'
import './App.css'
import AddPrayer from './pages/AddPrayer'
import PrayerList from './pages/PrayerList'
import Reflection from './pages/Reflection'
import Reminders from './pages/Reminders'
import ReminderChecker from './components/ReminderChecker'

export default function App() {
  return (
    <div className="app">
      <ReminderChecker />
      <header className="header">
        <h1 className="logo">Prayer Journal</h1>
        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Prayers
          </NavLink>
          <NavLink to="/add" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Add Prayer
          </NavLink>
          <NavLink to="/reflection" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Reflection
          </NavLink>
          <NavLink to="/reminders" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Reminders
          </NavLink>
        </nav>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<PrayerList />} />
          <Route path="/add" element={<AddPrayer />} />
          <Route path="/reflection" element={<Reflection />} />
          <Route path="/reminders" element={<Reminders />} />
        </Routes>
      </main>
    </div>
  )
}
