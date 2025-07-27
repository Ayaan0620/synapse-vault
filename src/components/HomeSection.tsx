import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Brain, 
  Zap, 
  Calculator, 
  BookOpen,
  Sparkles,
  TrendingUp,
  Clock
} from "lucide-react";
import gsap from "gsap";

interface HomeSectionProps {
  onSectionChange: (section: string) => void;
}

export const HomeSection = ({ onSectionChange }: HomeSectionProps) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero animation
      gsap.fromTo(heroRef.current?.children || [], 
        { 
          opacity: 0, 
          y: 50 
        },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1, 
          stagger: 0.2,
          ease: "power3.out"
        }
      );

      // Cards animation
      gsap.fromTo(cardsRef.current?.children || [], 
        { 
          opacity: 0, 
          y: 30,
          scale: 0.9
        },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.8, 
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.5
        }
      );

      // Floating animation for sparkles
      gsap.to(".floating-icon", {
        y: -10,
        duration: 2,
        ease: "power2.inOut",
        repeat: -1,
        yoyo: true,
        stagger: 0.3
      });
    });

    return () => ctx.revert();
  }, []);

  const features = [
    {
      id: "notes",
      title: "Smart Notes",
      description: "AI-powered note creation with intelligent connections",
      icon: BookOpen,
      color: "cosmic-purple",
      stats: "24 notes"
    },
    {
      id: "solar",
      title: "Knowledge Graph",
      description: "Visualize connections in a beautiful solar system",
      icon: Brain,
      color: "cosmic-blue",
      stats: "12 clusters"
    },
    {
      id: "flashcards",
      title: "Flashcards",
      description: "Interactive learning with spaced repetition",
      icon: Zap,
      color: "cosmic-pink",
      stats: "156 cards"
    },
    {
      id: "formulas",
      title: "Formula Sheets",
      description: "Quick reference for mathematical formulas",
      icon: Calculator,
      color: "cosmic-green",
      stats: "8 sheets"
    }
  ];

  return (
    <div className="min-h-screen p-8">
      {/* Hero Section */}
      <div ref={heroRef} className="text-center mb-16">
        <div className="relative">
          <Sparkles className="floating-icon absolute -top-8 left-1/4 h-6 w-6 text-cosmic-purple opacity-60" />
          <Sparkles className="floating-icon absolute -top-4 right-1/3 h-4 w-4 text-cosmic-blue opacity-40" />
          <Sparkles className="floating-icon absolute top-2 left-1/3 h-5 w-5 text-cosmic-pink opacity-50" />
          
          <h1 className="text-6xl md:text-8xl font-bold mb-6">
            <span className="gradient-text">Skibidi</span>
            <br />
            <span className="text-foreground">Notes</span>
          </h1>
        </div>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Transform your learning experience with AI-powered notes, 
          interactive visualizations, and intelligent study tools.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="cosmic" 
            size="lg" 
            onClick={() => onSectionChange("notes")}
            className="text-lg px-8"
          >
            Start Taking Notes
          </Button>
          <Button 
            variant="glass" 
            size="lg"
            onClick={() => onSectionChange("solar")}
            className="text-lg px-8"
          >
            Explore Knowledge Graph
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <Card className="p-6 glass text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-cosmic-green" />
            <span className="text-2xl font-bold">127%</span>
          </div>
          <p className="text-sm text-muted-foreground">Learning Progress</p>
        </Card>
        
        <Card className="p-6 glass text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="h-5 w-5 text-cosmic-purple" />
            <span className="text-2xl font-bold">42</span>
          </div>
          <p className="text-sm text-muted-foreground">Knowledge Nodes</p>
        </Card>
        
        <Card className="p-6 glass text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-cosmic-blue" />
            <span className="text-2xl font-bold">18h</span>
          </div>
          <p className="text-sm text-muted-foreground">Study Time</p>
        </Card>
      </div>

      {/* Feature Cards */}
      <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card 
              key={feature.id}
              className="p-6 glass hover:scale-105 transition-all duration-300 cursor-pointer group cosmic-hover"
              onClick={() => onSectionChange(feature.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className={`h-8 w-8 text-${feature.color}`} />
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                  {feature.stats}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold mb-2 group-hover:gradient-text transition-all">
                {feature.title}
              </h3>
              
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { action: "Created new note", item: "Quantum Physics Basics", time: "2 minutes ago", color: "cosmic-purple" },
            { action: "Completed flashcard set", item: "Mathematics - Calculus", time: "1 hour ago", color: "cosmic-pink" },
            { action: "Updated formula sheet", item: "Physics Constants", time: "3 hours ago", color: "cosmic-green" },
            { action: "Connected notes", item: "Quantum → Wave Functions", time: "5 hours ago", color: "cosmic-blue" },
          ].map((activity, index) => (
            <Card key={index} className="p-4 glass flex items-center gap-4">
              <div className={`w-2 h-2 rounded-full bg-${activity.color}`}></div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">{activity.action}</span>
                  <span className="text-muted-foreground"> - {activity.item}</span>
                </p>
              </div>
              <span className="text-xs text-muted-foreground">{activity.time}</span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};