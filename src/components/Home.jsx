import { useState, useEffect } from 'react'
import './Home.css'

function Home({ user, habits }) {
  const [stats, setStats] = useState({
    totalHabits: 0,
    dailyProgress: 0,
    weeklyProgress: 0,
    monthlyProgress: 0,
    streak: 0
  })

  useEffect(() => {
    if (habits.length > 0) {
      const today = new Date().toDateString()
      const dailyHabits = habits.filter(h => h.frequency === 'daily')
      const weeklyHabits = habits.filter(h => h.frequency === 'weekly')
      const monthlyHabits = habits.filter(h => h.frequency === 'monthly')
      
      const completedDaily = dailyHabits.filter(h => 
        h.completedDates && h.completedDates.includes(today)
      ).length
      
      const completedWeekly = weeklyHabits.filter(h => {
        const weekStart = getWeekStart(new Date())
        return h.completedDates && h.completedDates.some(date => 
          new Date(date) >= weekStart
        )
      }).length
      
      const completedMonthly = monthlyHabits.filter(h => {
        const monthStart = new Date()
        monthStart.setDate(1)
        return h.completedDates && h.completedDates.some(date => 
          new Date(date) >= monthStart
        )
      }).length
      
      setStats({
        totalHabits: habits.length,
        dailyProgress: dailyHabits.length ? Math.round((completedDaily / dailyHabits.length) * 100) : 0,
        weeklyProgress: weeklyHabits.length ? Math.round((completedWeekly / weeklyHabits.length) * 100) : 0,
        monthlyProgress: monthlyHabits.length ? Math.round((completedMonthly / monthlyHabits.length) * 100) : 0,
        streak: calculateStreak(habits)
      })
    }
  }, [habits])

  const getWeekStart = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day
    return new Date(d.setDate(diff))
  }

  const calculateStreak = (habits) => {
    if (!habits.length) return 0
    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      const dateString = checkDate.toDateString()
      
      const dailyHabits = habits.filter(h => h.frequency === 'daily')
      const completedOnDay = dailyHabits.filter(h => 
        h.completedDates && h.completedDates.includes(dateString)
      ).length
      
      if (completedOnDay > 0) {
        streak = i + 1
      } else if (i === 0) {
        break
      }
    }
    
    return streak
  }

  return (
    <div className="home-container">
      <div className="welcome-section">
        <h1 className="welcome-title">Welcome back, {user.username}!</h1>
        <p className="welcome-subtitle">Keep building those positive habits</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Habits</h3>
          <div className="stat-number">{stats.totalHabits}</div>
        </div>
        
        <div className="stat-card">
          <h3>Current Streak</h3>
          <div className="stat-number">{stats.streak} days</div>
        </div>
        
        <div className="stat-card">
          <h3>Daily Progress</h3>
          <div className="stat-number">{stats.dailyProgress}%</div>
        </div>
        
        <div className="stat-card">
          <h3>Weekly Progress</h3>
          <div className="stat-number">{stats.weeklyProgress}%</div>
        </div>
      </div>

      <div className="summary-section">
        <div className="summary-card">
          <h3>📅 Daily Habits</h3>
          <p>Track your daily routines and build consistency. View progress bars and completion rates.</p>
          <div className="progress-bar">
            <div 
              className="progress-fill daily" 
              style={{ width: `${stats.dailyProgress}%` }}
            ></div>
          </div>
        </div>

        <div className="summary-card">
          <h3>📊 Weekly Habits</h3>
          <p>Monitor weekly goals and patterns. Perfect for habits that don't need daily attention.</p>
          <div className="progress-bar">
            <div 
              className="progress-fill weekly" 
              style={{ width: `${stats.weeklyProgress}%` }}
            ></div>
          </div>
        </div>

        <div className="summary-card">
          <h3>📈 Monthly Habits</h3>
          <p>Track long-term objectives and monthly achievements. Great for bigger goals.</p>
          <div className="progress-bar">
            <div 
              className="progress-fill monthly" 
              style={{ width: `${stats.monthlyProgress}%` }}
            ></div>
          </div>
        </div>

        <div className="summary-card">
          <h3>📈 Graphs & Analytics</h3>
          <p>Visualize your progress over time with detailed charts and insights.</p>
          <div className="chart-preview">
            <div className="mini-chart">
              <div className="chart-bar" style={{ height: '60%' }}></div>
              <div className="chart-bar" style={{ height: '80%' }}></div>
              <div className="chart-bar" style={{ height: '40%' }}></div>
              <div className="chart-bar" style={{ height: '90%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home