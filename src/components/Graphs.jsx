import { useState, useEffect } from 'react'
import './Graphs.css'

function Graphs({ habits }) {
  const [selectedPeriod, setSelectedPeriod] = useState('daily')
  const [topHabits, setTopHabits] = useState([])

  useEffect(() => {
    calculateTopHabits()
  }, [habits])

  const calculateTopHabits = () => {
    const habitsWithConsistency = habits.map(habit => {
      if (!habit.completedDates || habit.completedDates.length === 0) {
        return { ...habit, consistency: 0 }
      }

      const daysSinceCreated = Math.floor((new Date() - new Date(habit.createdAt)) / (1000 * 60 * 60 * 24)) + 1
      const consistency = (habit.completedDates.length / daysSinceCreated) * 100

      return {
        ...habit,
        consistency: Math.round(consistency)
      }
    })

    const sorted = habitsWithConsistency.sort((a, b) => b.consistency - a.consistency)
    setTopHabits(sorted.slice(0, 10))
  }

  const getDailyProgressData = () => {
    const today = new Date()
    const data = []
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const dateString = date.toDateString()
      
      const dailyHabits = habits.filter(h => h.frequency === 'daily')
      const completed = dailyHabits.filter(h => 
        h.completedDates && h.completedDates.includes(dateString)
      ).length
      
      const percentage = dailyHabits.length ? Math.round((completed / dailyHabits.length) * 100) : 0
      
      data.push({
        date: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        fullDate: date.toLocaleDateString('en-US', { 
          weekday: 'short',
          month: 'short', 
          day: 'numeric' 
        }),
        percentage,
        completed,
        total: dailyHabits.length
      })
    }
    
    return data
  }

  const getWeeklyProgressData = () => {
    const today = new Date()
    const data = []
    
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - (i * 7) - today.getDay() + 1) // Start from Monday
      weekStart.setHours(0, 0, 0, 0)
      
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)
      
      const weeklyHabits = habits.filter(h => h.frequency === 'weekly')
      const completed = weeklyHabits.filter(h => {
        return h.completedDates && h.completedDates.some(date => {
          const completedDate = new Date(date)
          return completedDate >= weekStart && completedDate <= weekEnd
        })
      }).length
      
      const percentage = weeklyHabits.length ? Math.round((completed / weeklyHabits.length) * 100) : 0
      
      data.push({
        date: `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        fullDate: `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
        percentage,
        completed,
        total: weeklyHabits.length
      })
    }
    
    return data
  }

  const getMonthlyProgressData = () => {
    const today = new Date()
    const data = []
    
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
      
      const monthlyHabits = habits.filter(h => h.frequency === 'monthly')
      const completed = monthlyHabits.filter(h => {
        return h.completedDates && h.completedDates.some(date => {
          const completedDate = new Date(date)
          return completedDate >= monthStart && completedDate <= monthEnd
        })
      }).length
      
      const percentage = monthlyHabits.length ? Math.round((completed / monthlyHabits.length) * 100) : 0
      
      data.push({
        date: monthDate.toLocaleDateString('en-US', { 
          month: 'short',
          year: '2-digit'
        }),
        fullDate: monthDate.toLocaleDateString('en-US', { 
          month: 'long', 
          year: 'numeric' 
        }),
        percentage,
        completed,
        total: monthlyHabits.length
      })
    }
    
    return data
  }

  const getWeekStart = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
    return new Date(d.setDate(diff))
  }

//   const calculateStreak = (habits) => {

//   }

  const getCurrentData = () => {
    switch (selectedPeriod) {
      case 'daily':
        return getDailyProgressData()
      case 'weekly':
        return getWeeklyProgressData()
      case 'monthly':
        return getMonthlyProgressData()
      default:
        return getDailyProgressData()
    }
  }

  const progressData = getCurrentData()

  const getOverallStats = () => {
    const totalHabits = habits.length
    const totalCompletions = habits.reduce((sum, habit) => 
      sum + (habit.completedDates?.length || 0), 0
    )
    const averageConsistency = topHabits.length ? 
      Math.round(topHabits.reduce((sum, habit) => sum + habit.consistency, 0) / topHabits.length) : 0
    
    const dailyHabits = habits.filter(h => h.frequency === 'daily').length
    const weeklyHabits = habits.filter(h => h.frequency === 'weekly').length
    const monthlyHabits = habits.filter(h => h.frequency === 'monthly').length
    
    return { 
      totalHabits, 
      totalCompletions, 
      averageConsistency,
      dailyHabits,
      weeklyHabits,
      monthlyHabits
    }
  }

  const stats = getOverallStats()

  const getPeriodTitle = () => {
    switch (selectedPeriod) {
      case 'daily':
        return 'Daily Habit Completion Percentage (Last 30 Days)'
      case 'weekly':
        return 'Weekly Habit Completion Percentage (Last 12 Weeks)'
      case 'monthly':
        return 'Monthly Habit Completion Percentage (Last 12 Months)'
      default:
        return 'Habit Completion Percentage'
    }
  }

  const getPeriodStats = () => {
    const today = new Date()
    
    switch (selectedPeriod) {
      case 'daily': {
        const todayString = today.toDateString()
        const dailyHabits = habits.filter(h => h.frequency === 'daily')
        const completedToday = dailyHabits.filter(h => 
          h.completedDates && h.completedDates.includes(todayString)
        ).length
        const todayPercentage = dailyHabits.length ? Math.round((completedToday / dailyHabits.length) * 100) : 0
        
        return {
          current: `${completedToday}/${dailyHabits.length}`,
          percentage: todayPercentage,
          label: 'Today'
        }
      }
      case 'weekly': {
        const weekStart = getWeekStart(new Date(today))
        
        const weeklyHabits = habits.filter(h => h.frequency === 'weekly')
        const completedThisWeek = weeklyHabits.filter(h => {
          return h.completedDates && h.completedDates.some(date => 
            new Date(date) >= weekStart
          )
        }).length
        const weekPercentage = weeklyHabits.length ? Math.round((completedThisWeek / weeklyHabits.length) * 100) : 0
        
        return {
          current: `${completedThisWeek}/${weeklyHabits.length}`,
          percentage: weekPercentage,
          label: 'This Week'
        }
      }
      case 'monthly': {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
        
        const monthlyHabits = habits.filter(h => h.frequency === 'monthly')
        const completedThisMonth = monthlyHabits.filter(h => {
          return h.completedDates && h.completedDates.some(date => 
            new Date(date) >= monthStart
          )
        }).length
        const monthPercentage = monthlyHabits.length ? Math.round((completedThisMonth / monthlyHabits.length) * 100) : 0
        
        return {
          current: `${completedThisMonth}/${monthlyHabits.length}`,
          percentage: monthPercentage,
          label: 'This Month'
        }
      }
      default:
        return { current: '0/0', percentage: 0, label: 'Current' }
    }
  }

  const periodStats = getPeriodStats()

  const getYAxisLabels = () => {
    return ['0%', '25%', '50%', '75%', '100%']
  }

  const getAverageCompletion = () => {
    if (progressData.length === 0) return 0
    return Math.round(progressData.reduce((sum, item) => sum + item.percentage, 0) / progressData.length)
  }

  const getBestDay = () => {
    if (progressData.length === 0) return { date: 'N/A', percentage: 0 }
    return progressData.reduce((best, current) => 
      current.percentage > best.percentage ? current : best
    )
  }

  const getWorstDay = () => {
    if (progressData.length === 0) return { date: 'N/A', percentage: 0 }
    return progressData.reduce((worst, current) => 
      current.percentage < worst.percentage ? current : worst
    )
  }

  return (
    <div className="graphs-container">
      <div className="graphs-header">
        <h1>Progress Analytics & Insights</h1>
        <div className="period-selector">
          <button 
            className={selectedPeriod === 'daily' ? 'active' : ''}
            onClick={() => setSelectedPeriod('daily')}
          >
            Daily View
          </button>
          <button 
            className={selectedPeriod === 'weekly' ? 'active' : ''}
            onClick={() => setSelectedPeriod('weekly')}
          >
            Weekly View
          </button>
          <button 
            className={selectedPeriod === 'monthly' ? 'active' : ''}
            onClick={() => setSelectedPeriod('monthly')}
          >
            Monthly View
          </button>
        </div>
      </div>

      <div className="stats-overview">
        <div className="overview-card">
          <h3>Total Habits</h3>
          <div className="overview-number">{stats.totalHabits}</div>
          <div className="overview-subtitle">Active habits</div>
        </div>
        <div className="overview-card">
          <h3>Daily Habits</h3>
          <div className="overview-number">{stats.dailyHabits}</div>
          <div className="overview-subtitle">Every day</div>
        </div>
        <div className="overview-card">
          <h3>Weekly Habits</h3>
          <div className="overview-number">{stats.weeklyHabits}</div>
          <div className="overview-subtitle">Every week</div>
        </div>
        <div className="overview-card">
          <h3>Monthly Habits</h3>
          <div className="overview-number">{stats.monthlyHabits}</div>
          <div className="overview-subtitle">Every month</div>
        </div>
        <div className="overview-card highlight">
          <h3>{periodStats.label}</h3>
          <div className="overview-number">{periodStats.current}</div>
          <div className="overview-subtitle">{periodStats.percentage}% Complete</div>
        </div>
        <div className="overview-card">
          <h3>Average Consistency</h3>
          <div className="overview-number">{stats.averageConsistency}%</div>
          <div className="overview-subtitle">Overall performance</div>
        </div>
      </div>

      <div className="main-chart-section">
        <div className="chart-card full-width">
          <div className="chart-header">
            <h3>{getPeriodTitle()}</h3>
            <div className="chart-stats">
              <span className="chart-stat">
                <strong>Average:</strong> {getAverageCompletion()}%
              </span>
              <span className="chart-stat">
                <strong>Best:</strong> {getBestDay().percentage}% ({getBestDay().date})
              </span>
              <span className="chart-stat">
                <strong>Lowest:</strong> {getWorstDay().percentage}% ({getWorstDay().date})
              </span>
            </div>
          </div>
          
          <div className="chart-container">
            <div className="y-axis">
              <div className="y-axis-labels">
                {getYAxisLabels().reverse().map((label, index) => (
                  <div key={index} className="y-axis-label">{label}</div>
                ))}
              </div>
            </div>
            
            <div className="chart-area">
              <div className="chart-grid">
                {[100, 75, 50, 25, 0].map((value, index) => (
                  <div key={index} className="grid-line" style={{ bottom: `${value}%` }}></div>
                ))}
              </div>
              
              <div className="chart">
                {progressData.map((item, index) => (
                  <div key={index} className="chart-column">
                    <div 
                      className="chart-bar"
                      style={{ 
                        height: `${item.percentage}%`,
                        minHeight: item.percentage > 0 ? '2px' : '1px'
                      }}
                    >
                      <div className="chart-tooltip">
                        <div className="tooltip-header">{item.fullDate}</div>
                        <div className="tooltip-content">
                          <div>Completed: {item.completed}/{item.total} habits</div>
                          <div className="tooltip-percentage">{item.percentage}% completion</div>
                        </div>
                      </div>
                    </div>
                    <div className="chart-label">{item.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="x-axis-title">
            {selectedPeriod === 'daily' && 'Dates (Last 30 Days)'}
            {selectedPeriod === 'weekly' && 'Weeks (Last 12 Weeks)'}
            {selectedPeriod === 'monthly' && 'Months (Last 12 Months)'}
          </div>
        </div>
      </div>

      <div className="secondary-sections">
        <div className="chart-card">
          <h3>🏆 Top 10 Most Consistent Habits</h3>
          <div className="leaderboard">
            {topHabits.length === 0 ? (
              <div className="empty-leaderboard">
                <p>No habits to display yet. Start tracking some habits!</p>
              </div>
            ) : (
              topHabits.map((habit, index) => (
                <div key={habit.id} className="leaderboard-item">
                  <div className={`rank rank-${index < 3 ? index + 1 : 'other'}`}>
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && `#${index + 1}`}
                  </div>
                  <div className="habit-details">
                    <div className="habit-name">{habit.name}</div>
                    <div className="habit-frequency">{habit.frequency} habit</div>
                  </div>
                  <div className="consistency-bar">
                    <div 
                      className="consistency-fill"
                      style={{ width: `${habit.consistency}%` }}
                    ></div>
                  </div>
                  <div className="consistency-score">{habit.consistency}%</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="chart-card">
          <h3>📊 Habit Distribution & Breakdown</h3>
          <div className="frequency-chart">
            {['daily', 'weekly', 'monthly'].map(frequency => {
              const count = habits.filter(h => h.frequency === frequency).length
              const percentage = habits.length ? (count / habits.length) * 100 : 0
              
              return (
                <div key={frequency} className="frequency-item">
                  <div className="frequency-header">
                    <div className="frequency-label">
                      {frequency === 'daily' && '📅 Daily Habits'}
                      {frequency === 'weekly' && '📊 Weekly Habits'}
                      {frequency === 'monthly' && '📈 Monthly Habits'}
                    </div>
                    <div className="frequency-count">{count} habits</div>
                  </div>
                  <div className="frequency-bar">
                    <div 
                      className={`frequency-fill ${frequency}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="frequency-percentage">{Math.round(percentage)}% of total</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="insights-section">
        <div className="chart-card">
          <h3>💡 Performance Insights & Analysis</h3>
          <div className="insights-grid">
            <div className="insight-item success">
              <div className="insight-icon">📈</div>
              <div className="insight-content">
                <h4>Best Performance</h4>
                <p>
                  Your highest completion rate was <strong>{getBestDay().percentage}%</strong> on {getBestDay().fullDate || getBestDay().date}. 
                  {getBestDay().percentage >= 80 ? ' Excellent work!' : ' Keep building on this success!'}
                </p>
              </div>
            </div>
            
            <div className="insight-item info">
              <div className="insight-icon">🎯</div>
              <div className="insight-content">
                <h4>Average Performance</h4>
                <p>
                  Your average completion rate is <strong>{getAverageCompletion()}%</strong>.
                  {getAverageCompletion() >= 70 ? ' You\'re doing great!' : 
                   getAverageCompletion() >= 50 ? ' Good progress, keep it up!' :
                   ' There\'s room for improvement - you can do it!'}
                </p>
              </div>
            </div>
            
            <div className="insight-item warning">
              <div className="insight-icon">🔥</div>
              <div className="insight-content">
                <h4>Consistency Score</h4>
                <p>
                  Overall consistency: <strong>{stats.averageConsistency}%</strong>.
                  {stats.averageConsistency >= 80 ? ' Outstanding consistency!' : 
                   stats.averageConsistency >= 60 ? ' Good consistency, keep building!' :
                   stats.averageConsistency >= 40 ? ' Focus on daily consistency' :
                   ' Start small and build momentum'}
                </p>
              </div>
            </div>

            <div className="insight-item trend">
              <div className="insight-icon">📊</div>
              <div className="insight-content">
                <h4>Habit Distribution</h4>
                <p>
                  You have <strong>{stats.dailyHabits} daily</strong>, <strong>{stats.weeklyHabits} weekly</strong>, 
                  and <strong>{stats.monthlyHabits} monthly</strong> habits. 
                  {stats.dailyHabits > stats.weeklyHabits + stats.monthlyHabits ? 
                    ' Great focus on daily consistency!' : 
                    ' Consider adding more daily habits for better momentum.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {progressData.length > 0 && (
        <div className="detailed-analysis">
          <div className="chart-card">
            <h3>📋 Detailed {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Analysis</h3>
            <div className="analysis-grid">
              <div className="analysis-item">
                <h4>Completion Trend</h4>
                <p>
                  {(() => {
                    const firstHalf = progressData.slice(0, Math.floor(progressData.length / 2))
                    const secondHalf = progressData.slice(Math.floor(progressData.length / 2))
                    const firstAvg = firstHalf.reduce((sum, item) => sum + item.percentage, 0) / firstHalf.length
                    const secondAvg = secondHalf.reduce((sum, item) => sum + item.percentage, 0) / secondHalf.length
                    
                    if (secondAvg > firstAvg + 5) {
                      return `📈 Improving trend! Your completion rate has increased by ${Math.round(secondAvg - firstAvg)}% in recent ${selectedPeriod} periods.`
                    } else if (firstAvg > secondAvg + 5) {
                      return `📉 Declining trend. Your completion rate has decreased by ${Math.round(firstAvg - secondAvg)}% recently. Time to refocus!`
                    } else {
                      return `➡️ Stable performance. Your completion rate has remained consistent around ${Math.round((firstAvg + secondAvg) / 2)}%.`
                    }
                  })()}
                </p>
              </div>
              
              <div className="analysis-item">
                <h4>Performance Range</h4>
                <p>
                  Your completion rates range from <strong>{getWorstDay().percentage}%</strong> to <strong>{getBestDay().percentage}%</strong>, 
                  showing a variation of <strong>{getBestDay().percentage - getWorstDay().percentage}%</strong>.
                  {getBestDay().percentage - getWorstDay().percentage < 20 ? 
                    ' Very consistent performance!' : 
                    ' Work on reducing variability for better consistency.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Graphs