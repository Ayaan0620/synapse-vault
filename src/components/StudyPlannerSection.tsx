import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { 
  Calendar as CalendarIcon,
  BookOpen,
  Target,
  Clock,
  TrendingUp,
  Brain,
  Zap,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Trophy
} from "lucide-react";
import { toast } from "sonner";

interface StudySession {
  id: string;
  subject: string;
  topic: string;
  duration: number; // in minutes
  completed: boolean;
  scheduledDate: Date;
  actualDuration?: number;
  notes?: string;
  difficulty: "easy" | "medium" | "hard";
  priority: "low" | "medium" | "high";
}

interface StudyGoal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  progress: number;
  sessions: string[]; // session IDs
  completed: boolean;
}

interface StudyPlannerSectionProps {
  onSectionChange: (section: string) => void;
}

export const StudyPlannerSection = ({ onSectionChange }: StudyPlannerSectionProps) => {
  const [currentView, setCurrentView] = useState<"dashboard" | "calendar" | "sessions" | "goals">("dashboard");
  const [sessions, setSessions] = useState<StudySession[]>([
    {
      id: "1",
      subject: "Mathematics",
      topic: "Calculus - Derivatives",
      duration: 60,
      completed: false,
      scheduledDate: new Date(),
      difficulty: "medium",
      priority: "high"
    },
    {
      id: "2",
      subject: "Physics",
      topic: "Quantum Mechanics",
      duration: 90,
      completed: true,
      scheduledDate: new Date(Date.now() - 86400000),
      actualDuration: 85,
      notes: "Covered wave-particle duality concepts",
      difficulty: "hard",
      priority: "medium"
    }
  ]);

  const [goals, setGoals] = useState<StudyGoal[]>([
    {
      id: "1",
      title: "Master Calculus",
      description: "Complete all calculus topics for exam preparation",
      targetDate: new Date(Date.now() + 30 * 86400000),
      progress: 35,
      sessions: ["1"],
      completed: false
    }
  ]);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [weeklyHours, setWeeklyHours] = useState(0);
  const [studyStreak, setStudyStreak] = useState(5);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && currentSessionId) {
      interval = setInterval(() => {
        setSessionTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, currentSessionId]);

  // Calculate weekly hours
  useEffect(() => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    
    const completedThisWeek = sessions.filter(session => 
      session.completed && 
      session.scheduledDate >= weekStart &&
      session.actualDuration
    );
    
    const totalMinutes = completedThisWeek.reduce((acc, session) => 
      acc + (session.actualDuration || 0), 0
    );
    
    setWeeklyHours(Math.round((totalMinutes / 60) * 10) / 10);
  }, [sessions]);

  const startSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setIsTimerRunning(true);
    setSessionTimer(0);
    toast.success("📚 Study session started!", {
      description: "Focus mode activated. Good luck!"
    });
  };

  const endSession = () => {
    if (currentSessionId) {
      const sessionMinutes = Math.round(sessionTimer / 60);
      setSessions(prev => prev.map(session => 
        session.id === currentSessionId 
          ? { 
              ...session, 
              completed: true, 
              actualDuration: sessionMinutes,
              notes: session.notes || `Studied for ${sessionMinutes} minutes`
            }
          : session
      ));
      
      setIsTimerRunning(false);
      setCurrentSessionId(null);
      setSessionTimer(0);
      
      toast.success("🎉 Session completed!", {
        description: `Great job! You studied for ${sessionMinutes} minutes.`
      });
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-500 border-green-500";
      case "medium": return "text-yellow-500 border-yellow-500";
      case "hard": return "text-red-500 border-red-500";
      default: return "text-gray-500 border-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "text-blue-500 border-blue-500";
      case "medium": return "text-yellow-500 border-yellow-500";
      case "high": return "text-red-500 border-red-500";
      default: return "text-gray-500 border-gray-500";
    }
  };

  const todaySessions = sessions.filter(session => {
    const today = new Date();
    const sessionDate = new Date(session.scheduledDate);
    return sessionDate.toDateString() === today.toDateString();
  });

  const upcomingSessions = sessions.filter(session => {
    const today = new Date();
    const sessionDate = new Date(session.scheduledDate);
    return sessionDate > today && !session.completed;
  }).slice(0, 5);

  if (currentView === "dashboard") {
    return (
      <div className="min-h-screen bg-gradient-cosmic p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold gradient-text animate-fade-in">
              Study Planner
            </h1>
            <p className="text-xl text-muted-foreground animate-fade-in" style={{animationDelay: '0.2s'}}>
              Organize your study sessions and track your progress
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-center gap-4 animate-fade-in" style={{animationDelay: '0.3s'}}>
            {[
              { key: "dashboard", label: "Dashboard", icon: TrendingUp },
              { key: "calendar", label: "Calendar", icon: CalendarIcon },
              { key: "sessions", label: "Sessions", icon: BookOpen },
              { key: "goals", label: "Goals", icon: Target }
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={currentView === key ? "cosmic" : "outline"}
                onClick={() => setCurrentView(key as any)}
                className="px-6"
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </Button>
            ))}
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="glass cosmic-glow animate-scale-in">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-cosmic-blue mb-2">{weeklyHours}h</div>
                <div className="text-sm text-muted-foreground">This Week</div>
                <Clock className="h-8 w-8 mx-auto mt-2 text-cosmic-blue" />
              </CardContent>
            </Card>

            <Card className="glass cosmic-glow animate-scale-in" style={{animationDelay: '0.1s'}}>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-cosmic-orange mb-2">{studyStreak}</div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
                <Zap className="h-8 w-8 mx-auto mt-2 text-cosmic-orange" />
              </CardContent>
            </Card>

            <Card className="glass cosmic-glow animate-scale-in" style={{animationDelay: '0.2s'}}>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-cosmic-green mb-2">
                  {sessions.filter(s => s.completed).length}
                </div>
                <div className="text-sm text-muted-foreground">Completed Sessions</div>
                <CheckCircle className="h-8 w-8 mx-auto mt-2 text-cosmic-green" />
              </CardContent>
            </Card>

            <Card className="glass cosmic-glow animate-scale-in" style={{animationDelay: '0.3s'}}>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-cosmic-purple mb-2">
                  {goals.filter(g => !g.completed).length}
                </div>
                <div className="text-sm text-muted-foreground">Active Goals</div>
                <Trophy className="h-8 w-8 mx-auto mt-2 text-cosmic-purple" />
              </CardContent>
            </Card>
          </div>

          {/* Active Session Timer */}
          {isTimerRunning && currentSessionId && (
            <Card className="glass border-cosmic-orange/50 animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-cosmic-orange/20 rounded-full">
                      <Play className="h-6 w-6 text-cosmic-orange" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Session in Progress</h3>
                      <p className="text-muted-foreground">
                        {sessions.find(s => s.id === currentSessionId)?.topic}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-cosmic-orange">
                      {formatTime(sessionTimer)}
                    </div>
                    <Button onClick={endSession} className="mt-2" variant="outline">
                      <Pause className="h-4 w-4 mr-2" />
                      End Session
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Today's Sessions */}
          <Card className="glass animate-fade-in" style={{animationDelay: '0.4s'}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Today's Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todaySessions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No sessions scheduled for today
                </p>
              ) : (
                <div className="space-y-4">
                  {todaySessions.map((session, index) => (
                    <div 
                      key={session.id}
                      className="p-4 border rounded-lg hover:bg-accent/50 transition-all duration-300 animate-fade-in"
                      style={{animationDelay: `${index * 0.1}s`}}
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{session.topic}</h4>
                            <Badge variant="outline" className={getDifficultyColor(session.difficulty)}>
                              {session.difficulty}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(session.priority)}>
                              {session.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{session.subject}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {session.duration} min
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {session.completed ? (
                            <Badge variant="secondary" className="text-cosmic-green border-cosmic-green">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          ) : (
                            <Button 
                              onClick={() => startSession(session.id)}
                              disabled={isTimerRunning}
                              size="sm"
                              variant="cosmic"
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Start
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Sessions */}
          <Card className="glass animate-fade-in" style={{animationDelay: '0.5s'}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Upcoming Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingSessions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No upcoming sessions scheduled
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingSessions.map((session, index) => (
                    <div 
                      key={session.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-all duration-300 animate-fade-in"
                      style={{animationDelay: `${index * 0.1}s`}}
                    >
                      <div>
                        <h5 className="font-medium">{session.topic}</h5>
                        <p className="text-sm text-muted-foreground">
                          {session.scheduledDate.toLocaleDateString()} • {session.duration} min
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getDifficultyColor(session.difficulty)}>
                          {session.difficulty}
                        </Badge>
                        <Badge variant="outline" className={getPriorityColor(session.priority)}>
                          {session.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Goals Progress */}
          <Card className="glass animate-fade-in" style={{animationDelay: '0.6s'}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Study Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {goals.filter(g => !g.completed).map((goal, index) => (
                  <div key={goal.id} className="space-y-3 animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{goal.title}</h4>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Target: {goal.targetDate.toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-cosmic-purple border-cosmic-purple">
                        {goal.progress}%
                      </Badge>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Other views can be implemented similarly...
  return (
    <div className="min-h-screen bg-gradient-cosmic p-6">
      <div className="max-w-6xl mx-auto">
        <Button onClick={() => setCurrentView("dashboard")} className="mb-6">
          ← Back to Dashboard
        </Button>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">
            {currentView === "calendar" && "Calendar View"}
            {currentView === "sessions" && "Session Management"}
            {currentView === "goals" && "Goal Tracking"}
          </h2>
          <p className="text-muted-foreground">
            This view is coming soon! Switch back to dashboard for now.
          </p>
        </div>
      </div>
    </div>
  );
};
