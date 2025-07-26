import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  RotateCcw, 
  Check, 
  X, 
  Plus, 
  Brain,
  Star,
  ArrowLeft,
  ArrowRight,
  Shuffle
} from "lucide-react";
import gsap from "gsap";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  lastReviewed: string;
  correctCount: number;
  totalAttempts: number;
  aiGenerated: boolean;
  isStarred: boolean;
}

interface FlashcardsSectionProps {
  onSectionChange: (section: string) => void;
}

export const FlashcardsSection = ({ onSectionChange }: FlashcardsSectionProps) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    {
      id: "1",
      front: "What is the fundamental principle of quantum mechanics?",
      back: "Wave-particle duality: particles exhibit both wave and particle characteristics depending on the experimental setup.",
      category: "Physics",
      difficulty: "hard",
      lastReviewed: "2024-01-15",
      correctCount: 8,
      totalAttempts: 12,
      aiGenerated: true,
      isStarred: true
    },
    {
      id: "2",
      front: "Define machine learning",
      back: "A subset of AI that enables computers to learn and improve from experience without being explicitly programmed.",
      category: "Computer Science",
      difficulty: "medium",
      lastReviewed: "2024-01-14",
      correctCount: 15,
      totalAttempts: 18,
      aiGenerated: false,
      isStarred: false
    },
    {
      id: "3",
      front: "What is the derivative of sin(x)?",
      back: "cos(x)",
      category: "Mathematics",
      difficulty: "easy",
      lastReviewed: "2024-01-13",
      correctCount: 22,
      totalAttempts: 25,
      aiGenerated: true,
      isStarred: true
    }
  ]);

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyMode, setStudyMode] = useState<"browse" | "study">("browse");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });

  const cardRef = useRef<HTMLDivElement>(null);

  const categories = Array.from(new Set(flashcards.map(card => card.category)));
  const filteredCards = selectedCategory === "all" 
    ? flashcards 
    : flashcards.filter(card => card.category === selectedCategory);

  const currentCard = filteredCards[currentCardIndex];

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (cardRef.current) {
        gsap.fromTo(cardRef.current, 
          { rotationY: 0, scale: 1 },
          { 
            rotationY: isFlipped ? 180 : 0, 
            duration: 0.6, 
            ease: "power2.inOut",
            transformStyle: "preserve-3d"
          }
        );
      }
    });

    return () => ctx.revert();
  }, [isFlipped]);

  const flipCard = () => {
    setIsFlipped(!isFlipped);
    setShowAnswer(!showAnswer);
  };

  const nextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % filteredCards.length);
    setIsFlipped(false);
    setShowAnswer(false);
  };

  const prevCard = () => {
    setCurrentCardIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
    setIsFlipped(false);
    setShowAnswer(false);
  };

  const markAnswer = (correct: boolean) => {
    setSessionStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));

    // Update card statistics
    setFlashcards(prev => prev.map(card => 
      card.id === currentCard?.id 
        ? {
            ...card,
            correctCount: card.correctCount + (correct ? 1 : 0),
            totalAttempts: card.totalAttempts + 1,
            lastReviewed: new Date().toISOString().split("T")[0]
          }
        : card
    ));

    setTimeout(() => {
      nextCard();
    }, 500);
  };

  const shuffleCards = () => {
    const shuffled = [...filteredCards].sort(() => Math.random() - 0.5);
    setFlashcards(prev => {
      const newCards = [...prev];
      shuffled.forEach((shuffledCard, index) => {
        const originalIndex = newCards.findIndex(card => card.id === shuffledCard.id);
        if (originalIndex !== -1) {
          [newCards[originalIndex], newCards[index]] = [newCards[index], newCards[originalIndex]];
        }
      });
      return newCards;
    });
    setCurrentCardIndex(0);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "cosmic-green";
      case "medium": return "cosmic-orange";
      case "hard": return "cosmic-pink";
      default: return "cosmic-purple";
    }
  };

  if (studyMode === "browse") {
    return (
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-cosmic-purple" />
            <h1 className="text-3xl font-bold gradient-text">Flashcards</h1>
          </div>
          <Button 
            variant="cosmic" 
            onClick={() => setStudyMode("study")}
            className="px-6"
          >
            Start Study Session
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-4 glass text-center">
            <div className="text-2xl font-bold text-cosmic-purple mb-1">
              {flashcards.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Cards</div>
          </Card>
          
          <Card className="p-4 glass text-center">
            <div className="text-2xl font-bold text-cosmic-green mb-1">
              {Math.round(
                flashcards.reduce((acc, card) => 
                  acc + (card.totalAttempts > 0 ? card.correctCount / card.totalAttempts : 0), 0
                ) / flashcards.length * 100
              )}%
            </div>
            <div className="text-sm text-muted-foreground">Average Accuracy</div>
          </Card>
          
          <Card className="p-4 glass text-center">
            <div className="text-2xl font-bold text-cosmic-blue mb-1">
              {categories.length}
            </div>
            <div className="text-sm text-muted-foreground">Categories</div>
          </Card>
          
          <Card className="p-4 glass text-center">
            <div className="text-2xl font-bold text-cosmic-orange mb-1">
              {flashcards.filter(card => card.isStarred).length}
            </div>
            <div className="text-sm text-muted-foreground">Starred</div>
          </Card>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="glass border border-cosmic-purple/30 rounded-md px-3 py-2 bg-background text-foreground"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <Button variant="outline" onClick={shuffleCards}>
            <Shuffle className="h-4 w-4 mr-2" />
            Shuffle
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((card, index) => (
            <Card 
              key={card.id}
              className="p-4 glass hover:scale-105 transition-all duration-300 cursor-pointer cosmic-hover"
              onClick={() => {
                setCurrentCardIndex(index);
                setStudyMode("study");
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <Badge 
                  variant="secondary" 
                  className={`bg-${getDifficultyColor(card.difficulty)}/20 text-${getDifficultyColor(card.difficulty)}`}
                >
                  {card.difficulty}
                </Badge>
                <div className="flex items-center gap-1">
                  {card.aiGenerated && <Brain className="h-4 w-4 text-cosmic-purple" />}
                  {card.isStarred && <Star className="h-4 w-4 text-cosmic-orange fill-cosmic-orange" />}
                </div>
              </div>
              
              <h3 className="font-semibold mb-2 line-clamp-2">{card.front}</h3>
              <p className="text-sm text-muted-foreground mb-3">{card.category}</p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {card.totalAttempts > 0 
                    ? `${Math.round(card.correctCount / card.totalAttempts * 100)}% accuracy` 
                    : "Not attempted"
                  }
                </span>
                <span>Last: {card.lastReviewed}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center p-8 relative">
      {/* Header */}
      <div className="absolute top-8 left-8 right-8 flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => setStudyMode("browse")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Browse
        </Button>
        
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{currentCardIndex + 1}</div>
            <div className="text-xs text-muted-foreground">of {filteredCards.length}</div>
          </div>
          
          <Progress value={(currentCardIndex + 1) / filteredCards.length * 100} className="w-32" />
          
          <div className="text-center">
            <div className="text-lg font-semibold text-cosmic-green">
              {sessionStats.total > 0 ? Math.round(sessionStats.correct / sessionStats.total * 100) : 0}%
            </div>
            <div className="text-xs text-muted-foreground">
              {sessionStats.correct}/{sessionStats.total}
            </div>
          </div>
        </div>
      </div>

      {/* Main Flashcard */}
      {currentCard && (
        <div className="w-full max-w-2xl">
          <div 
            ref={cardRef}
            className="relative h-96 cursor-pointer"
            onClick={flipCard}
            style={{ perspective: "1000px" }}
          >
            <Card className={`
              absolute inset-0 p-8 flex flex-col justify-center items-center text-center
              glass cosmic-glow transition-all duration-300 hover:scale-105
              ${isFlipped ? 'opacity-0' : 'opacity-100'}
            `}>
              <div className="flex items-center gap-2 mb-6">
                <Badge 
                  variant="secondary" 
                  className={`bg-${getDifficultyColor(currentCard.difficulty)}/20 text-${getDifficultyColor(currentCard.difficulty)}`}
                >
                  {currentCard.difficulty}
                </Badge>
                <Badge variant="outline">{currentCard.category}</Badge>
                {currentCard.aiGenerated && <Brain className="h-4 w-4 text-cosmic-purple" />}
                {currentCard.isStarred && <Star className="h-4 w-4 text-cosmic-orange fill-cosmic-orange" />}
              </div>
              
              <h2 className="text-2xl font-semibold mb-4 leading-relaxed">
                {currentCard.front}
              </h2>
              
              <p className="text-muted-foreground">Click to reveal answer</p>
            </Card>

            <Card className={`
              absolute inset-0 p-8 flex flex-col justify-center items-center text-center
              glass neon-glow transition-all duration-300
              ${isFlipped ? 'opacity-100' : 'opacity-0'}
            `}>
              <div className="mb-6">
                <Badge variant="secondary" className="bg-cosmic-blue/20 text-cosmic-blue">
                  Answer
                </Badge>
              </div>
              
              <p className="text-xl leading-relaxed mb-8">
                {currentCard.back}
              </p>
              
              <div className="flex gap-4">
                <Button 
                  variant="destructive" 
                  onClick={(e) => { e.stopPropagation(); markAnswer(false); }}
                  className="px-8"
                >
                  <X className="h-4 w-4 mr-2" />
                  Incorrect
                </Button>
                <Button 
                  variant="default" 
                  onClick={(e) => { e.stopPropagation(); markAnswer(true); }}
                  className="px-8 bg-cosmic-green hover:bg-cosmic-green/90"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Correct
                </Button>
              </div>
            </Card>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button variant="outline" onClick={prevCard} disabled={filteredCards.length <= 1}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" onClick={flipCard}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Flip Card
            </Button>
            
            <Button variant="outline" onClick={nextCard} disabled={filteredCards.length <= 1}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Card Stats */}
          <div className="text-center mt-6 text-sm text-muted-foreground">
            Accuracy: {currentCard.totalAttempts > 0 
              ? `${Math.round(currentCard.correctCount / currentCard.totalAttempts * 100)}% (${currentCard.correctCount}/${currentCard.totalAttempts})`
              : "Not attempted yet"
            }
          </div>
        </div>
      )}
    </div>
  );
};