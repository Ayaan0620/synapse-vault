
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Target,
  BookOpen,
  Timer,
  AlertTriangle,
  Plus,
  Upload,
  Download,
  BarChart3,
  Brain,
  Zap,
  Trophy,
  Flame,
  Star,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  subject: string;
  topic: string;
  year: number;
}

interface ExamResult {
  questionId: string;
  selectedAnswer: number | null;
  isCorrect: boolean;
  timeTaken: number;
  confidence?: number;
}

interface PYQSectionProps {
  onSectionChange: (section: string) => void;
}

export const PYQSection = ({ onSectionChange }: PYQSectionProps) => {
  // Sample questions - user will add their own
  const [questions] = useState<Question[]>([
    {
      id: "1",
      question: "What is the time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
      correctAnswer: 1,
      explanation: "Binary search divides the search space in half with each iteration, resulting in O(log n) time complexity.",
      difficulty: "medium",
      subject: "Computer Science",
      topic: "Algorithms",
      year: 2023
    },
    {
      id: "2", 
      question: "Which data structure uses LIFO principle?",
      options: ["Queue", "Stack", "Array", "Linked List"],
      correctAnswer: 1,
      explanation: "Stack follows Last In First Out (LIFO) principle where the last element added is the first to be removed.",
      difficulty: "easy",
      subject: "Computer Science", 
      topic: "Data Structures",
      year: 2022
    },
    {
      id: "3",
      question: "What is the maximum number of nodes in a binary tree of height h?",
      options: ["2^h", "2^h - 1", "2^(h+1) - 1", "2^(h-1)"],
      correctAnswer: 2,
      explanation: "A complete binary tree of height h has at most 2^(h+1) - 1 nodes, where the root is at height 0.",
      difficulty: "hard",
      subject: "Computer Science",
      topic: "Trees",
      year: 2021
    }
  ]);

  // States
  const [currentMode, setCurrentMode] = useState<"practice" | "exam" | "trainer" | "menu">("menu");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [isExamMode, setIsExamMode] = useState(false);
  const [examTimeLimit, setExamTimeLimit] = useState(60); // minutes
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [wrongQuestions, setWrongQuestions] = useState<Question[]>([]);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [examDeadline, setExamDeadline] = useState<Date | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const visibilityRef = useRef<boolean>(true);

  // Tab visibility detection for exam mode
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isExamMode && document.hidden && visibilityRef.current) {
        toast.error("⚠️ Exam terminated due to tab switch!");
        endExam();
        visibilityRef.current = false;
      }
    };

    if (isExamMode) {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }
    
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isExamMode]);

  // Timer management
  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isTimerRunning) {
      endExam();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isTimerRunning, timeRemaining]);

  // Countdown timer
  useEffect(() => {
    if (examDeadline) {
      countdownRef.current = setInterval(() => {
        const now = new Date().getTime();
        const distance = examDeadline.getTime() - now;

        if (distance > 0) {
          setCountdown({
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000)
          });
        } else {
          setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      }, 1000);
    }

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [examDeadline]);

  const startExam = () => {
    setIsExamMode(true);
    setCurrentMode("exam");
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setExamResults([]);
    setTimeRemaining(examTimeLimit * 60);
    setIsTimerRunning(true);
    setShowResults(false);
    setQuestionStartTime(Date.now());
    visibilityRef.current = true;
    toast.success("🚀 Exam started! Focus mode activated.", {
      description: "Tab switching will terminate the exam"
    });
  };

  const endExam = () => {
    setIsExamMode(false);
    setIsTimerRunning(false);
    calculateResults();
    setShowResults(true);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const calculateResults = () => {
    const results: ExamResult[] = questions.map(question => {
      const isCorrect = selectedAnswers[question.id] === question.correctAnswer;
      return {
        questionId: question.id,
        selectedAnswer: selectedAnswers[question.id] ?? null,
        isCorrect,
        timeTaken: 30, // Could implement per-question timing
        confidence: Math.floor(Math.random() * 5) + 1
      };
    });
    
    setExamResults(results);
    
    const wrong = questions.filter(q => 
      selectedAnswers[q.id] !== q.correctAnswer || selectedAnswers[q.id] === undefined
    );
    setWrongQuestions(wrong);

    // Calculate streak
    const correct = results.filter(r => r.isCorrect).length;
    const percentage = (correct / results.length) * 100;
    
    if (percentage >= 80) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionStartTime(Date.now());
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handleAnswerSelect = (questionId: string, answer: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    if (currentMode === "practice") {
      // Show instant feedback in practice mode
      const question = questions.find(q => q.id === questionId);
      if (question) {
        if (answer === question.correctAnswer) {
          setStreak(prev => prev + 1);
          setBestStreak(prev => Math.max(prev, streak + 1));
          toast.success("✅ Correct!", {
            description: "Great job! Keep it up!"
          });
        } else {
          setStreak(0);
          toast.error("❌ Incorrect", {
            description: question.explanation
          });
        }
      }
    }
  };

  const startTrainer = () => {
    if (wrongQuestions.length === 0) {
      toast.warning("🎯 No wrong questions to practice!");
      return;
    }
    setCurrentMode("trainer");
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
    toast.success("🔥 Training mode activated!");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestions = currentMode === "trainer" ? wrongQuestions : questions;
  const currentQuestion = currentQuestions[currentQuestionIndex];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-500";
      case "medium": return "text-yellow-500";
      case "hard": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return <Star className="w-4 h-4" />;
      case "medium": return <Zap className="w-4 h-4" />;
      case "hard": return <Flame className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  if (currentMode === "menu") {
    return (
      <div className="min-h-screen bg-gradient-cosmic p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header with enhanced styling */}
          <div className="text-center space-y-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 blur-3xl -z-10" />
            <h1 className="text-6xl font-bold gradient-text animate-fade-in">
              PYQ Practice Hub
            </h1>
            <p className="text-xl text-muted-foreground animate-fade-in" style={{animationDelay: '0.2s'}}>
              Master previous year questions with AI-powered analysis
            </p>
            
            {/* Stats Bar */}
            <div className="flex justify-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{questions.length}</div>
                <div className="text-sm text-muted-foreground">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">{streak}</div>
                <div className="text-sm text-muted-foreground">Current Streak</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{bestStreak}</div>
                <div className="text-sm text-muted-foreground">Best Streak</div>
              </div>
            </div>
          </div>

          {/* Countdown Timer */}
          {examDeadline && (
            <Card className="glass-card border-accent/30 overflow-hidden animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent">
                  <Timer className="w-5 h-5" />
                  Exam Countdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-center">
                  {[
                    { value: countdown.days, label: 'Days' },
                    { value: countdown.hours, label: 'Hours' },
                    { value: countdown.minutes, label: 'Minutes' },
                    { value: countdown.seconds, label: 'Seconds' }
                  ].map((item, index) => (
                    <div key={item.label} className="space-y-1 animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                      <div className="text-4xl font-bold text-primary bg-primary/10 rounded-lg p-4 border border-primary/20">
                        {item.value.toString().padStart(2, '0')}
                      </div>
                      <div className="text-sm text-muted-foreground">{item.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mode Selection Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="glass-card border-primary/30 cursor-pointer hover:border-primary/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl group animate-scale-in"
                  onClick={() => setCurrentMode("practice")}
                  style={{animationDelay: '0.1s'}}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-primary">
                  <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <div>Practice Mode</div>
                    <div className="text-sm font-normal text-muted-foreground">Learn with instant feedback</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Practice questions with immediate explanations and build your understanding.
                  </p>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-primary border-primary/30">
                      {questions.length} Questions
                    </Badge>
                    <div className="text-2xl">📚</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-accent/30 cursor-pointer hover:border-accent/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl group animate-scale-in"
                  style={{animationDelay: '0.2s'}}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-accent">
                  <div className="p-3 bg-accent/10 rounded-full group-hover:bg-accent/20 transition-colors">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <div>Exam Mode</div>
                    <div className="text-sm font-normal text-muted-foreground">Simulated exam environment</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Full exam simulation with anti-cheat protection and detailed analysis.
                  </p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={examTimeLimit}
                      onChange={(e) => setExamTimeLimit(Number(e.target.value))}
                      className="w-20"
                      min="1"
                      max="180"
                    />
                    <span className="text-sm">minutes</span>
                  </div>
                  <Button onClick={startExam} className="w-full" variant="cosmic">
                    <Play className="w-4 h-4 mr-2" />
                    Start Exam
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-secondary/30 cursor-pointer hover:border-secondary/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl group animate-scale-in"
                  style={{animationDelay: '0.3s'}}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-secondary">
                  <div className="p-3 bg-secondary/10 rounded-full group-hover:bg-secondary/20 transition-colors">
                    <RotateCcw className="w-6 h-6" />
                  </div>
                  <div>
                    <div>Trainer Mode</div>
                    <div className="text-sm font-normal text-muted-foreground">Focus on weak areas</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Practice only the questions you got wrong to strengthen weak points.
                  </p>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-secondary border-secondary/30">
                      {wrongQuestions.length} Questions
                    </Badge>
                    <div className="text-2xl">🎯</div>
                  </div>
                  <Button onClick={startTrainer} className="w-full" disabled={wrongQuestions.length === 0}>
                    <Brain className="w-4 h-4 mr-2" />
                    Start Training
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="glass-card border-primary/20 animate-fade-in" style={{animationDelay: '0.4s'}}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Exam Settings</h4>
                  <div className="flex gap-4 items-end">
                    <Input
                      type="datetime-local"
                      onChange={(e) => setExamDeadline(new Date(e.target.value))}
                      className="flex-1"
                      placeholder="Set deadline"
                    />
                    <Button onClick={() => setExamDeadline(null)} variant="outline" size="sm">
                      Clear
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Question Management</h4>
                  <div className="flex gap-2">
                    <Dialog open={isAddingQuestion} onOpenChange={setIsAddingQuestion}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Questions
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Add New Question</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea placeholder="Enter your question..." rows={3} />
                          <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Option A" />
                            <Input placeholder="Option B" />
                            <Input placeholder="Option C" />
                            <Input placeholder="Option D" />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <Input placeholder="Correct Answer (A/B/C/D)" />
                            <Input placeholder="Subject" />
                            <Input placeholder="Year" type="number" />
                          </div>
                          <Textarea placeholder="Explanation..." rows={2} />
                          <Button className="w-full" variant="cosmic">
                            Add Question
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main Question Interface
  return (
    <div className="min-h-screen bg-gradient-cosmic p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Button
            onClick={() => setCurrentMode("menu")}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to Menu
          </Button>
          
          {isExamMode && (
            <Card className="glass-card border-destructive/30 px-4 py-2">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">EXAM MODE ACTIVE</span>
              </div>
            </Card>
          )}
        </div>

        {currentQuestion && (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Question Panel */}
            <div className="lg:col-span-3">
              <Card className="glass-card border-primary/30 animate-scale-in">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {currentQuestionIndex + 1} / {currentQuestions.length}
                        </Badge>
                        {isExamMode && (
                          <div className="text-right">
                            <div className="text-3xl font-bold text-accent animate-pulse">
                              {formatTime(timeRemaining)}
                            </div>
                            <div className="text-sm text-muted-foreground">Time Remaining</div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-primary border-primary/30">
                          {currentQuestion.subject}
                        </Badge>
                        <Badge variant="outline" className="text-accent border-accent/30">
                          {currentQuestion.topic}
                        </Badge>
                        <Badge variant="outline" className="text-secondary border-secondary/30">
                          {currentQuestion.year}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`${getDifficultyColor(currentQuestion.difficulty)} border-current flex items-center gap-1`}
                        >
                          {getDifficultyIcon(currentQuestion.difficulty)}
                          {currentQuestion.difficulty}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="text-lg font-medium leading-relaxed animate-fade-in">
                    {currentQuestion.question}
                  </div>
                  
                  <RadioGroup
                    value={selectedAnswers[currentQuestion.id]?.toString()}
                    onValueChange={(value) => handleAnswerSelect(currentQuestion.id, parseInt(value))}
                    className="space-y-3"
                  >
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="group">
                        <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 animate-fade-in" 
                             style={{animationDelay: `${index * 0.1}s`}}>
                          <RadioGroupItem 
                            value={index.toString()} 
                            id={`option-${index}`} 
                            className="group-hover:border-primary transition-colors"
                          />
                          <Label 
                            htmlFor={`option-${index}`} 
                            className="cursor-pointer flex-1 text-base group-hover:text-primary transition-colors"
                          >
                            <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                            {option}
                          </Label>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>

                  <div className="flex justify-between items-center pt-4">
                    <Button
                      onClick={previousQuestion}
                      disabled={currentQuestionIndex === 0}
                      variant="outline"
                      className="hover:scale-105 transition-transform"
                    >
                      Previous
                    </Button>
                    
                    <div className="flex gap-2">
                      {currentQuestionIndex < currentQuestions.length - 1 ? (
                        <Button
                          onClick={nextQuestion}
                          variant="cosmic"
                          className="hover:scale-105 transition-transform"
                        >
                          Next Question
                        </Button>
                      ) : (
                        <Button 
                          onClick={endExam} 
                          variant="cosmic"
                          className="hover:scale-105 transition-transform"
                        >
                          {isExamMode ? (
                            <>
                              <Trophy className="w-4 h-4 mr-2" />
                              Submit Exam
                            </>
                          ) : (
                            "Finish Practice"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Panel */}
            <div className="space-y-4">
              <Card className="glass-card animate-scale-in" style={{animationDelay: '0.1s'}}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Progress 
                    value={(currentQuestionIndex + 1) / currentQuestions.length * 100} 
                    className="h-3"
                  />
                  <div className="text-sm text-muted-foreground">
                    Question {currentQuestionIndex + 1} of {currentQuestions.length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round((currentQuestionIndex + 1) / currentQuestions.length * 100)}% Complete
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card animate-scale-in" style={{animationDelay: '0.2s'}}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Flame className="w-4 h-4 text-accent" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Current Streak</span>
                    <Badge variant="outline" className="text-accent border-accent/30">
                      {streak}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Best Streak</span>
                    <Badge variant="outline" className="text-secondary border-secondary/30">
                      {bestStreak}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {isExamMode && (
                <Card className="glass-card border-destructive/30 animate-scale-in" style={{animationDelay: '0.3s'}}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                      <AlertTriangle className="w-4 h-4" />
                      Exam Rules
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground space-y-2">
                      <p>• Do not switch tabs</p>
                      <p>• Do not refresh the page</p>
                      <p>• Timer cannot be paused</p>
                      <p>• Auto-submit at time limit</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {showResults && (
          <Card className="glass-card border-primary/30 animate-scale-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Exam Results
                {showConfetti && <div className="animate-pulse">🎉</div>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Score Overview */}
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center space-y-2">
                    <div className="text-4xl font-bold text-green-500 animate-fade-in">
                      {examResults.filter(r => r.isCorrect).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Correct</div>
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="text-4xl font-bold text-red-500 animate-fade-in">
                      {examResults.filter(r => !r.isCorrect).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Wrong</div>
                    <XCircle className="w-8 h-8 text-red-500 mx-auto" />
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="text-4xl font-bold text-primary animate-fade-in">
                      {Math.round((examResults.filter(r => r.isCorrect).length / examResults.length) * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Score</div>
                    <BarChart3 className="w-8 h-8 text-primary mx-auto" />
                  </div>
                  
                  <div className="text-center space-y-2">
                    <div className="text-4xl font-bold text-accent animate-fade-in">
                      {Math.round(examResults.reduce((acc, r) => acc + r.timeTaken, 0) / examResults.length)}s
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Time</div>
                    <Timer className="w-8 h-8 text-accent mx-auto" />
                  </div>
                </div>

                <Separator />

                {/* Detailed Analysis */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Question Analysis
                  </h3>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {examResults.map((result, index) => {
                      const question = questions.find(q => q.id === result.questionId);
                      if (!question) return null;

                      return (
                        <div key={result.questionId} 
                             className={`border rounded-lg p-4 space-y-3 transition-all duration-300 hover:shadow-lg animate-fade-in ${
                               result.isCorrect 
                                 ? 'border-green-200 bg-green-50/50' 
                                 : 'border-red-200 bg-red-50/50'
                             }`}
                             style={{animationDelay: `${index * 0.1}s`}}>
                          
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${
                              result.isCorrect ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              {result.isCorrect ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-600" />
                              )}
                            </div>
                            
                            <div className="flex-1 space-y-2">
                              <p className="font-medium">{question.question}</p>
                              
                              <div className="space-y-1">
                                <p className="text-sm">
                                  <span className="text-muted-foreground">Your answer:</span>{" "}
                                  <span className={`font-medium ${result.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                    {result.selectedAnswer !== null 
                                      ? `${String.fromCharCode(65 + result.selectedAnswer)}. ${question.options[result.selectedAnswer]}` 
                                      : "Not answered"}
                                  </span>
                                </p>
                                
                                {!result.isCorrect && (
                                  <p className="text-sm">
                                    <span className="text-muted-foreground">Correct answer:</span>{" "}
                                    <span className="text-green-600 font-medium">
                                      {String.fromCharCode(65 + question.correctAnswer)}. {question.options[question.correctAnswer]}
                                    </span>
                                  </p>
                                )}
                              </div>

                              {!result.isCorrect && (
                                <div className="mt-3 p-3 bg-blue-50/50 border border-blue-200 rounded-lg">
                                  <p className="text-sm font-medium text-blue-800 mb-1">
                                    💡 Explanation:
                                  </p>
                                  <p className="text-sm text-blue-700">{question.explanation}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button 
                    onClick={() => {
                      setShowResults(false);
                      setCurrentMode("menu");
                    }} 
                    variant="outline"
                    className="hover:scale-105 transition-transform"
                  >
                    Back to Menu
                  </Button>
                  
                  <Button 
                    onClick={startTrainer} 
                    disabled={wrongQuestions.length === 0}
                    variant="cosmic"
                    className="hover:scale-105 transition-transform"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Practice Wrong Questions ({wrongQuestions.length})
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
