"use client"
import {
  Clock,
  Dumbbell,
  CheckCircle,
  XCircle,
  User,
  Weight,
  Ruler,
  TrendingUp,
  Award,
  Target,
  Zap,
} from "lucide-react"
import "./dashboard.css"

// Mock data for the dashboard
const userName = "Alex"
const userBatch = {
  name: "Batch A",
  schedule: "Mon, Wed, Fri",
}

const weeklyClasses = [
  {
    id: 1,
    day: "Monday",
    time: "7:00 PM",
    topic: "Full Body Workout",
    status: "completed",
    isToday: false,
    instructor: "Sarah Johnson",
  },
  {
    id: 2,
    day: "Wednesday",
    time: "7:00 PM",
    topic: "Cardio & Endurance",
    status: "upcoming",
    isToday: true,
    instructor: "Mike Chen",
  },
  {
    id: 3,
    day: "Friday",
    time: "7:00 PM",
    topic: "Strength Training",
    status: "upcoming",
    isToday: false,
    instructor: "Emma Davis",
  },
]

const healthStats = {
  weight: "72kg",
  height: "175cm",
  bmi: "23.5",
  bodyFat: "15%",
}

const weeklyProgress = {
  classesCompleted: 2,
  totalClasses: 3,
  caloriesBurned: 850,
  workoutMinutes: 120,
}

// Helper to calculate next class countdown
const calculateNextClassCountdown = () => {
  const now = new Date()
  const today = now.getDay()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  const nextClass = weeklyClasses.find((cls) => {
    const classDayMap = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    }
    const classDay = classDayMap[cls.day]
    const [classHour, classMinute] = cls.time.split(" ")[0].split(":").map(Number)
    const isPM = cls.time.includes("PM")
    const adjustedClassHour = isPM && classHour !== 12 ? classHour + 12 : classHour === 12 && !isPM ? 0 : classHour

    if (classDay === today && cls.status === "upcoming") {
      if (adjustedClassHour > currentHour) return true
      if (adjustedClassHour === currentHour && classMinute > currentMinute) return true
    }
    if (classDay > today && cls.status === "upcoming") return true
    if (classDay < today && cls.status === "upcoming") return true
    return false
  })

  if (nextClass && nextClass.isToday) {
    const [classHour, classMinute] = nextClass.time.split(" ")[0].split(":").map(Number)
    const isPM = nextClass.time.includes("PM")
    const adjustedClassHour = isPM && classHour !== 12 ? classHour + 12 : classHour === 12 && !isPM ? 0 : classHour

    const nextClassTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), adjustedClassHour, classMinute)
    const diffMs = nextClassTime.getTime() - now.getTime()

    if (diffMs > 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      return `${diffHours}h ${diffMinutes}m`
    }
  }
  return "No upcoming classes today"
}

export default function Dashboard() {
  const nextClassCountdownText = calculateNextClassCountdown()
  const progressPercentage = (weeklyProgress.classesCompleted / weeklyProgress.totalClasses) * 100

  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        {/* Header Section */}
        <header className="dashboard-header">
          <div className="welcome-section">
            <h1 className="dashboard-title">Welcome back, {userName}! 👋</h1>
            <p className="dashboard-subtitle">Ready to crush your fitness goals today?</p>
          </div>
          <div className="header-stats">
            <div className="stat-pill">
              <Zap className="stat-icon" size={16} />
              <span>Streak: 5 days</span>
            </div>
            <div className="stat-pill">
              <Award className="stat-icon" size={16} />
              <span>Level 3</span>
            </div>
          </div>
        </header>

        {/* Top Cards Grid */}
        <div className="top-cards-grid">
          {/* Next Class Card */}
          <div className="dashboard-card next-class-card">
            <div className="card-header">
              <div className="card-title-section">
                <h3 className="card-title">Next Class</h3>
                <div className="live-indicator">
                  <div className="pulse-dot"></div>
                  <span>Today</span>
                </div>
              </div>
            </div>
            <div className="card-content">
              <div className="next-class-info">
                <div className="class-time">
                  <Clock className="icon" size={20} />
                  <span className="time-text">{nextClassCountdownText}</span>
                </div>
                <div className="class-details">
                  <h4>Cardio & Endurance</h4>
                  <p>with Mike Chen</p>
                </div>
              </div>
              <button className="join-class-btn">
                <span>Join Class</span>
                <div className="btn-arrow">→</div>
              </button>
            </div>
          </div>

          {/* Weekly Progress Card */}
          <div className="dashboard-card progress-card">
            <div className="card-header">
              <h3 className="card-title">Weekly Progress</h3>
              <div className="progress-percentage">{Math.round(progressPercentage)}%</div>
            </div>
            <div className="card-content">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
              </div>
              <div className="progress-stats">
                <div className="progress-stat">
                  <span className="stat-number">{weeklyProgress.classesCompleted}</span>
                  <span className="stat-label">Classes Done</span>
                </div>
                <div className="progress-stat">
                  <span className="stat-number">{weeklyProgress.caloriesBurned}</span>
                  <span className="stat-label">Calories</span>
                </div>
                <div className="progress-stat">
                  <span className="stat-number">{weeklyProgress.workoutMinutes}</span>
                  <span className="stat-label">Minutes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Batch Info Card */}
          <div className="dashboard-card batch-card">
            <div className="card-header">
              <h3 className="card-title">Your Batch</h3>
            </div>
            <div className="card-content">
              <div className="batch-info">
                <div className="batch-name">{userBatch.name}</div>
                <div className="batch-schedule">{userBatch.schedule}</div>
              </div>
              <button className="change-batch-btn">Change Batch</button>
            </div>
          </div>
        </div>

        {/* Weekly Schedule Section */}
        <section className="schedule-section">
          <div className="section-header">
            <h2 className="section-title">This Week's Classes</h2>
            <div className="section-subtitle">Your personalized workout schedule</div>
          </div>

          <div className="classes-grid">
            {weeklyClasses.map((cls) => (
              <div key={cls.id} className={`class-card ${cls.status} ${cls.isToday ? "today" : ""}`}>
                <div className="class-card-header">
                  <div className="class-day">{cls.day}</div>
                  <div className={`class-status-badge ${cls.status}`}>
                    {cls.status === "completed" && <CheckCircle size={16} />}
                    {cls.status === "missed" && <XCircle size={16} />}
                    {cls.status === "upcoming" && <Clock size={16} />}
                    <span>{cls.status}</span>
                  </div>
                </div>

                <div className="class-card-content">
                  <h4 className="class-topic">{cls.topic}</h4>
                  <div className="class-meta">
                    <div className="class-time">
                      <Clock size={14} />
                      <span>{cls.time}</span>
                    </div>
                    <div className="class-instructor">
                      <User size={14} />
                      <span>{cls.instructor}</span>
                    </div>
                  </div>
                </div>

                {cls.isToday && cls.status === "upcoming" && (
                  <div className="class-card-action">
                    <button className="join-btn">Join Now</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Health Stats Section */}
        <section className="health-section">
          <div className="section-header">
            <h2 className="section-title">Health Overview</h2>
            <div className="section-subtitle">Track your physical progress</div>
          </div>

          <div className="health-grid">
            <div className="health-card">
              <div className="health-icon weight">
                <Weight size={24} />
              </div>
              <div className="health-info">
                <div className="health-value">{healthStats.weight}</div>
                <div className="health-label">Weight</div>
                <div className="health-trend">
                  <TrendingUp size={12} />
                  <span>-2kg this month</span>
                </div>
              </div>
            </div>

            <div className="health-card">
              <div className="health-icon height">
                <Ruler size={24} />
              </div>
              <div className="health-info">
                <div className="health-value">{healthStats.height}</div>
                <div className="health-label">Height</div>
              </div>
            </div>

            <div className="health-card">
              <div className="health-icon bmi">
                <Target size={24} />
              </div>
              <div className="health-info">
                <div className="health-value">{healthStats.bmi}</div>
                <div className="health-label">BMI</div>
                <div className="health-status normal">Normal</div>
              </div>
            </div>

            <div className="health-card">
              <div className="health-icon body-fat">
                <Dumbbell size={24} />
              </div>
              <div className="health-info">
                <div className="health-value">{healthStats.bodyFat}</div>
                <div className="health-label">Body Fat</div>
                <div className="health-trend">
                  <TrendingUp size={12} />
                  <span>-1% this month</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-action">
            <button className="profile-btn">
              <User size={20} />
              <span>View Full Profile</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
