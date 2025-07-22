import { useState, useEffect } from 'react'
import Home from './Home'
import DailyHabits from './DailyHabits'
import WeeklyHabits from './WeeklyHabits'
import MonthlyHabits from './MonthlyHabits'
import Graphs from './Graphs'
import './Dashboard.css'

function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('home')
  const [habits, setHabits] = useState([])

  useEffect(() => {
    const storedHabits = localStorage.getItem('userHabits')
    if (storedHabits) {
      setHabits(JSON.parse(storedHabits))
    }
  }, [])

  const saveHabits = (newHabits) => {
    setHabits(newHabits)
    localStorage.setItem('userHabits', JSON.stringify(newHabits))
  }

  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'daily', label: 'Daily Habits' },
    { id: 'weekly', label: 'Weekly Habits' },
    { id: 'monthly', label: 'Monthly Habits' },
    { id: 'graphs', label: 'Graphs' }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home user={user} habits={habits} />
      case 'daily':
        return <DailyHabits habits={habits} onSaveHabits={saveHabits} />
      case 'weekly':
        return <WeeklyHabits habits={habits} onSaveHabits={saveHabits} />
      case 'monthly':
        return <MonthlyHabits habits={habits} onSaveHabits={saveHabits} />
      case 'graphs':
        return <Graphs habits={habits} />
      default:
        return <Home user={user} habits={habits} />
    }
  }

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="nav-brand">
          <h2>Habit Tracker</h2>
        </div>
        
        <div className="nav-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="nav-user">
          <span className="username">Hello, {user.username}</span>
          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </nav>
      
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  )
}

export default Dashboard