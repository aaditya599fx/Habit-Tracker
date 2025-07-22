import { useState, useEffect } from 'react'
import './DailyHabits.css'

function DailyHabits({ habits, onSaveHabits }) {
  const [dailyHabits, setDailyHabits] = useState([])
  const [newHabit, setNewHabit] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    const filtered = habits.filter(habit => habit.frequency === 'daily')
    setDailyHabits(filtered)
  }, [habits])

  const addHabit = () => {
    if (!newHabit.trim()) return
    
    const habit = {
      id: Date.now(),
      name: newHabit.trim(),
      frequency: 'daily',
      completedDates: [],
      createdAt: new Date().toISOString()
    }
    
    const updatedHabits = [...habits, habit]
    onSaveHabits(updatedHabits)
    setNewHabit('')
    setShowAddForm(false)
  }

  const toggleHabit = (habitId) => {
    const today = new Date().toDateString()
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const completedDates = habit.completedDates || []
        const isCompleted = completedDates.includes(today)
        
        if (isCompleted) {
          return {
            ...habit,
            completedDates: completedDates.filter(date => date !== today)
          }
        } else {
          return {
            ...habit,
            completedDates: [...completedDates, today]
          }
        }
      }
      return habit
    })
    
    onSaveHabits(updatedHabits)
  }

  const deleteHabit = (habitId) => {
    const updatedHabits = habits.filter(habit => habit.id !== habitId)
    onSaveHabits(updatedHabits)
  }

  const getHabitProgress = (habit) => {
    if (!habit.completedDates) return 0
    const daysSinceCreated = Math.floor((new Date() - new Date(habit.createdAt)) / (1000 * 60 * 60 * 24)) + 1
    return Math.round((habit.completedDates.length / daysSinceCreated) * 100)
  }

  const isCompletedToday = (habit) => {
    const today = new Date().toDateString()
    return habit.completedDates && habit.completedDates.includes(today)
  }

  const getStreak = (habit) => {
    if (!habit.completedDates || habit.completedDates.length === 0) return 0
    
    const today = new Date()
    let streak = 0
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      const dateString = checkDate.toDateString()
      
      if (habit.completedDates.includes(dateString)) {
        streak = i + 1
      } else if (i === 0) {
        break
      }
    }
    
    return streak
  }

  const getTodayStats = () => {
    const completed = dailyHabits.filter(isCompletedToday).length
    const total = dailyHabits.length
    const percentage = total ? Math.round((completed / total) * 100) : 0
    
    return { completed, total, percentage }
  }

  const stats = getTodayStats()

  return (
    <div className="daily-habits-container">
      <div className="habits-header">
        <h1>Daily Habits</h1>
        <button 
          className="add-habit-btn"
          onClick={() => setShowAddForm(true)}
        >
          + Add Habit
        </button>
      </div>

      <div className="daily-summary">
        <div className="summary-card">
          <h3>Today's Progress</h3>
          <div className="progress-circle">
            <div className="circle-progress" style={{ '--progress': stats.percentage }}>
              <span className="progress-text">{stats.percentage}%</span>
            </div>
          </div>
          <p>{stats.completed} of {stats.total} habits completed</p>
        </div>
      </div>

      {showAddForm && (
        <div className="add-form-overlay">
          <div className="add-form">
            <h3>Add New Daily Habit</h3>
            <input
              type="text"
              placeholder="Enter habit name..."
              value={newHabit}
              onChange={(e) => setNewHabit(e.target.value)}
              className="habit-input"
              autoFocus
            />
            <div className="form-buttons">
              <button onClick={addHabit} className="save-btn">Save</button>
              <button onClick={() => {
                setShowAddForm(false)
                setNewHabit('')
              }} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="habits-list">
        {dailyHabits.length === 0 ? (
          <div className="empty-state">
            <p>No daily habits yet. Add your first habit to get started!</p>
          </div>
        ) : (
          dailyHabits.map(habit => (
            <div key={habit.id} className={`habit-card ${isCompletedToday(habit) ? 'completed' : ''}`}>
              <div className="habit-info">
                <h4>{habit.name}</h4>
                <div className="habit-stats">
                  <span className="stat">Progress: {getHabitProgress(habit)}%</span>
                  <span className="stat">Streak: {getStreak(habit)} days</span>
                </div>
              </div>
              
              <div className="habit-actions">
                <button
                  className={`complete-btn ${isCompletedToday(habit) ? 'completed' : ''}`}
                  onClick={() => toggleHabit(habit.id)}
                >
                  {isCompletedToday(habit) ? '✓' : '○'}
                </button>
                <button
                  className="delete-btn"
                  onClick={() => deleteHabit(habit.id)}
                >
                  ×
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default DailyHabits