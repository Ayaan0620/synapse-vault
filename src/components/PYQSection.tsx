import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
  AlertTriangle
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
    }
  ]);

  // States
  const [currentMode, setCurrentMode] = useState<"practice" | "exam" | "trainer">("practice");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [isExamMode, setIsExamMode] = useState(false);
  const [examTimeLimit, setExamTimeLimit] = useState(60); // minutes
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [wrongQuestions, setWrongQuestions] = useState<Question[]>([]);
  const [trainerMode, setTrainerMode] = useState<"unlimited" | "timed">("unlimited");
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [examDeadline, setExamDeadline] = useState<Date | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const visibilityRef = useRef<boolean>(true);

  // Tab visibility detection for exam mode
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isExamMode && document.hidden && visibilityRef.current) {
        toast.error("Exam terminated due to tab switch!");
        endExam();
        visibilityRef.current = false;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
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
    visibilityRef.current = true;
    toast.success("Exam started! Do not switch tabs.");
  };

  const endExam = () => {
    setIsExamMode(false);
    setIsTimerRunning(false);
    calculateResults();
    setShowResults(true);
  };

  const calculateResults = () => {
    const results: ExamResult[] = questions.map(question => ({
      questionId: question.id,
      selectedAnswer: selectedAnswers[question.id] ?? null,
      isCorrect: selectedAnswers[question.id] === question.correctAnswer,
      timeTaken: 0 // Could implement per-question timing
    }));
    
    setExamResults(results);
    
    const wrong = questions.filter(q => 
      selectedAnswers[q.id] !== q.correctAnswer || selectedAnswers[q.id] === undefined
    );
    setWrongQuestions(wrong);
  };

  const startTrainer = () => {
    if (wrongQuestions.length === 0) {
      toast.warning("No wrong questions to practice!");
      return;
    }
    setCurrentMode("trainer");
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowResults(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestions = currentMode === "trainer" ? wrongQuestions : questions;
  const currentQuestion = currentQuestions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-cosmic p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold gradient-text">Previous Year Questions</h1>
          <p className="text-muted-foreground">Practice with exam environment and AI-powered analysis</p>
        </div>

        {/* Countdown Timer */}
        {examDeadline && (
          <Card className="glass-card border-accent/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent">
                <Timer className="w-5 h-5" />
                Exam Countdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary">{countdown.days}</div>
                  <div className="text-sm text-muted-foreground">Days</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary">{countdown.hours}</div>
                  <div className="text-sm text-muted-foreground">Hours</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary">{countdown.minutes}</div>
                  <div className="text-sm text-muted-foreground">Minutes</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary">{countdown.seconds}</div>
                  <div className="text-sm text-muted-foreground">Seconds</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mode Selection */}
        {!isExamMode && !showResults && (
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="glass-card border-primary/30 cursor-pointer hover:border-primary/60 transition-all"
                  onClick={() => setCurrentMode("practice")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <BookOpen className="w-5 h-5" />
                  Practice Mode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Practice questions with instant feedback</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-accent/30 cursor-pointer hover:border-accent/60 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent">
                  <Target className="w-5 h-5" />
                  Exam Mode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Simulated exam environment</p>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={examTimeLimit}
                      onChange={(e) => setExamTimeLimit(Number(e.target.value))}
                      className="w-20"
                      min="1"
                    />
                    <span className="text-sm">minutes</span>
                  </div>
                  <Button onClick={startExam} className="w-full" variant="cosmic">
                    Start Exam
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-secondary/30 cursor-pointer hover:border-secondary/60 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-secondary">
                  <RotateCcw className="w-5 h-5" />
                  Trainer Mode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Practice wrong questions</p>
                  <p className="text-xs text-muted-foreground">
                    {wrongQuestions.length} questions available
                  </p>
                  <Button onClick={startTrainer} className="w-full" disabled={wrongQuestions.length === 0}>
                    Start Training
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Set Deadline */}
        {!isExamMode && (
          <Card className="glass-card border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Set Exam Deadline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-end">
                <Input
                  type="datetime-local"
                  onChange={(e) => setExamDeadline(new Date(e.target.value))}
                  className="max-w-sm"
                />
                <Button onClick={() => setExamDeadline(null)} variant="outline">
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exam Interface */}
        {(currentMode !== "practice" || isExamMode) && !showResults && currentQuestion && (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Question Panel */}
            <div className="lg:col-span-3">
              <Card className="glass-card border-primary/30">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">
                        Question {currentQuestionIndex + 1} of {currentQuestions.length}
                      </CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{currentQuestion.subject}</Badge>
                        <Badge variant="outline">{currentQuestion.topic}</Badge>
                        <Badge variant={
                          currentQuestion.difficulty === "easy" ? "secondary" :
                          currentQuestion.difficulty === "medium" ? "default" : "destructive"
                        }>
                          {currentQuestion.difficulty}
                        </Badge>
                      </div>
                    </div>
                    {isExamMode && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-accent">
                          {formatTime(timeRemaining)}
                        </div>
                        <div className="text-sm text-muted-foreground">Time Remaining</div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <p className="text-lg">{currentQuestion.question}</p>
                    
                    <RadioGroup
                      value={selectedAnswers[currentQuestion.id]?.toString()}
                      onValueChange={(value) => 
                        setSelectedAnswers(prev => ({
                          ...prev,
                          [currentQuestion.id]: parseInt(value)
                        }))
                      }
                    >
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                          <Label htmlFor={`option-${index}`} className="cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>

                    <div className="flex gap-4">
                      <Button
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        variant="outline"
                      >
                        Previous
                      </Button>
                      
                      {currentQuestionIndex < currentQuestions.length - 1 ? (
                        <Button
                          onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                          variant="cosmic"
                        >
                          Next
                        </Button>
                      ) : (
                        <Button onClick={endExam} variant="cosmic">
                          {isExamMode ? "Submit Exam" : "Finish"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Panel */}
            <div className="space-y-4">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-sm">Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress 
                    value={(currentQuestionIndex + 1) / currentQuestions.length * 100} 
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    {currentQuestionIndex + 1} / {currentQuestions.length}
                  </p>
                </CardContent>
              </Card>

              {isExamMode && (
                <Card className="glass-card border-destructive/30">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                      <AlertTriangle className="w-4 h-4" />
                      Exam Mode Active
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      Do not switch tabs or the exam will be terminated automatically.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {showResults && (
          <Card className="glass-card border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Exam Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500">
                      {examResults.filter(r => r.isCorrect).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Correct</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-500">
                      {examResults.filter(r => !r.isCorrect).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Wrong</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {Math.round((examResults.filter(r => r.isCorrect).length / examResults.length) * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Score</div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Question Analysis</h3>
                  {examResults.map((result, index) => {
                    const question = questions.find(q => q.id === result.questionId);
                    if (!question) return null;

                    return (
                      <div key={result.questionId} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          {result.isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500 mt-1" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{question.question}</p>
                            <div className="mt-2 space-y-1">
                              <p className="text-sm">
                                <span className="text-muted-foreground">Your answer:</span>{" "}
                                <span className={result.isCorrect ? "text-green-500" : "text-red-500"}>
                                  {result.selectedAnswer !== null ? question.options[result.selectedAnswer] : "Not answered"}
                                </span>
                              </p>
                              {!result.isCorrect && (
                                <p className="text-sm">
                                  <span className="text-muted-foreground">Correct answer:</span>{" "}
                                  <span className="text-green-500">{question.options[question.correctAnswer]}</span>
                                </p>
                              )}
                            </div>
                            {!result.isCorrect && (
                              <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                                <p className="text-sm font-medium text-primary">Explanation:</p>
                                <p className="text-sm text-muted-foreground mt-1">{question.explanation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-4">
                  <Button onClick={() => setShowResults(false)} variant="outline">
                    Back to Menu
                  </Button>
                  <Button onClick={startTrainer} disabled={wrongQuestions.length === 0}>
                    Practice Wrong Questions
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