import { useState, useEffect } from 'react'
import './MonthlyHabits.css'

function MonthlyHabits({ habits, onSaveHabits }) {
  const [monthlyHabits, setMonthlyHabits] = useState([])
  const [newHabit, setNewHabit] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    const filtered = habits.filter(habit => habit.frequency === 'monthly')
    setMonthlyHabits(filtered)
  }, [habits])

  const addHabit = () => {
    if (!newHabit.trim()) return
    
    const habit = {
      id: Date.now(),
      name: newHabit.trim(),
      frequency: 'monthly',
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

  const getMonthStart = (date) => {
    const d = new Date(date)
    return new Date(d.getFullYear(), d.getMonth(), 1)
  }

  const isCompletedThisMonth = (habit) => {
    const monthStart = getMonthStart(new Date())
    return habit.completedDates && habit.completedDates.some(date => 
      new Date(date) >= monthStart
    )
  }

  const getMonthlyProgress = (habit) => {
    if (!habit.completedDates) return 0
    const monthsSinceCreated = Math.ceil((new Date() - new Date(habit.createdAt)) / (1000 * 60 * 60 * 24 * 30))
    const completedMonths = new Set()
    
    habit.completedDates.forEach(date => {
      const monthStart = getMonthStart(new Date(date))
      completedMonths.add(monthStart.toDateString())
    })
    
    return Math.round((completedMonths.size / monthsSinceCreated) * 100)
  }

  const getMonthlyStats = () => {
    const completed = monthlyHabits.filter(isCompletedThisMonth).length
    const total = monthlyHabits.length
    const percentage = total ? Math.round((completed / total) * 100) : 0
    
    return { completed, total, percentage }
  }

  const getCurrentMonthName = () => {
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const stats = getMonthlyStats()

  return (
    <div className="monthly-habits-container">
      <div className="habits-header">
        <h1>Monthly Habits</h1>
        <button 
          className="add-habit-btn"
          onClick={() => setShowAddForm(true)}
        >
          + Add Habit
        </button>
      </div>

      <div className="monthly-summary">
        <div className="summary-card">
          <h3>{getCurrentMonthName()} Progress</h3>
          <div className="monthly-progress">
            <div className="progress-ring">
              <svg width="140" height="140">
                <circle
                  cx="70"
                  cy="70"
                  r="60"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                />
                <circle
                  cx="70"
                  cy="70"
                  r="60"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="12"
                  strokeDasharray={377}
                  strokeDashoffset={377 - (377 * stats.percentage / 100)}
                  strokeLinecap="round"
                  transform="rotate(-90 70 70)"
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              </svg>
              <div className="progress-text">
                <span className="progress-number">{stats.percentage}%</span>
              </div>
            </div>
          </div>
          <p>{stats.completed} of {stats.total} monthly habits completed</p>
        </div>
      </div>

      {showAddForm && (
        <div className="add-form-overlay">
          <div className="add-form">
            <h3>Add New Monthly Habit</h3>
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
        {monthlyHabits.length === 0 ? (
          <div className="empty-state">
            <p>No monthly habits yet. Add your first monthly habit to get started!</p>
          </div>
        ) : (
          monthlyHabits.map(habit => (
            <div key={habit.id} className={`habit-card ${isCompletedThisMonth(habit) ? 'completed' : ''}`}>
              <div className="habit-info">
                <h4>{habit.name}</h4>
                <div className="habit-stats">
                  <span className="stat">Progress: {getMonthlyProgress(habit)}%</span>
                  <span className="stat">Completed: {habit.completedDates?.length || 0} times</span>
                </div>
              </div>
              
              <div className="habit-actions">
                <button
                  className={`complete-btn ${isCompletedThisMonth(habit) ? 'completed' : ''}`}
                  onClick={() => toggleHabit(habit.id)}
                >
                  {isCompletedThisMonth(habit) ? '✓' : '○'}
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

export default MonthlyHabits