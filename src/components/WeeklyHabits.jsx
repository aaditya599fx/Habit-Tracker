import { useState, useEffect } from 'react'
import './WeeklyHabits.css'

function WeeklyHabits({ habits, onSaveHabits }) {
  const [weeklyHabits, setWeeklyHabits] = useState([])
  const [newHabit, setNewHabit] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    const filtered = habits.filter(habit => habit.frequency === 'weekly')
    setWeeklyHabits(filtered)
  }, [habits])

  const addHabit = () => {
    if (!newHabit.trim()) return
    
    const habit = {
      id: Date.now(),
      name: newHabit.trim(),
      frequency: 'weekly',
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

  const getWeekStart = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day
    return new Date(d.setDate(diff))
  }

  const isCompletedThisWeek = (habit) => {
    const weekStart = getWeekStart(new Date())
    return habit.completedDates && habit.completedDates.some(date => 
      new Date(date) >= weekStart
    )
  }

  const getWeeklyProgress = (habit) => {
    if (!habit.completedDates) return 0
    const weeksSinceCreated = Math.ceil((new Date() - new Date(habit.createdAt)) / (1000 * 60 * 60 * 24 * 7))
    const completedWeeks = new Set()
    
    habit.completedDates.forEach(date => {
      const weekStart = getWeekStart(new Date(date))
      completedWeeks.add(weekStart.toDateString())
    })
    
    return Math.round((completedWeeks.size / weeksSinceCreated) * 100)
  }

  const getWeeklyStats = () => {
    const completed = weeklyHabits.filter(isCompletedThisWeek).length
    const total = weeklyHabits.length
    const percentage = total ? Math.round((completed / total) * 100) : 0
    
    return { completed, total, percentage }
  }

  const stats = getWeeklyStats()

  return (
    <div className="weekly-habits-container">
      <div className="habits-header">
        <h1>Weekly Habits</h1>
        <button 
          className="add-habit-btn"
          onClick={() => setShowAddForm(true)}
        >
          + Add Habit
        </button>
      </div>

      <div className="weekly-summary">
        <div className="summary-card">
          <h3>This Week's Progress</h3>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${stats.percentage}%` }}
            ></div>
          </div>
          <p>{stats.completed} of {stats.total} weekly habits completed</p>
          <span className="percentage">{stats.percentage}%</span>
        </div>
      </div>

      {showAddForm && (
        <div className="add-form-overlay">
          <div className="add-form">
            <h3>Add New Weekly Habit</h3>
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
        {weeklyHabits.length === 0 ? (
          <div className="empty-state">
            <p>No weekly habits yet. Add your first weekly habit to get started!</p>
          </div>
        ) : (
          weeklyHabits.map(habit => (
            <div key={habit.id} className={`habit-card ${isCompletedThisWeek(habit) ? 'completed' : ''}`}>
              <div className="habit-info">
                <h4>{habit.name}</h4>
                <div className="habit-stats">
                  <span className="stat">Progress: {getWeeklyProgress(habit)}%</span>
                  <span className="stat">Completed: {habit.completedDates?.length || 0} times</span>
                </div>
              </div>
              
              <div className="habit-actions">
                <button
                  className={`complete-btn ${isCompletedThisWeek(habit) ? 'completed' : ''}`}
                  onClick={() => toggleHabit(habit.id)}
                >
                  {isCompletedThisWeek(habit) ? '✓' : '○'}
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

export default WeeklyHabits