import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { 
  BookOpen, 
  Brain, 
  Zap, 
  Calculator, 
  Home,
  Menu,
  X,
  FileText,
  Network,
  Layers,
  MessageCircle,
  Calendar,
  Trophy,
  LogOut,
  User
} from "lucide-react";

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const Navigation = ({ activeSection, onSectionChange }: NavigationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "notes", label: "Notes", icon: FileText },
    { id: "solar", label: "Knowledge Graph", icon: Network },
    { id: "flashcards", label: "Flashcards", icon: Layers },
    { id: "formulas", label: "Formulas", icon: Calculator },
    { id: "pyqs", label: "PYQs & Exams", icon: BookOpen },
    { id: "doubts", label: "AI Doubts", icon: MessageCircle },
    { id: "planner", label: "Study Planner", icon: Calendar },
    { id: "arena", label: "Learning Arena", icon: Trophy },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Mobile Menu Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50 glass"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>

      {/* Navigation */}
      <nav className={cn(
        "fixed left-0 top-0 h-full w-64 glass border-r border-cosmic-purple/20 z-40 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold gradient-text">
              Cosmic Notes
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Your knowledge universe
            </p>
          </div>

          <div className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "cosmic" : "ghost"}
                  className={cn(
                    "w-full justify-start cosmic-hover",
                    activeSection === item.id && "animate-pulse-glow"
                  )}
                  onClick={() => {
                    onSectionChange(item.id);
                    setIsOpen(false);
                  }}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          <div className="mt-8 space-y-4">
            {/* User Profile Card */}
            <div className="p-4 glass rounded-lg border border-cosmic-purple/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-gradient-cosmic flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Student
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={signOut}
              >
                <LogOut className="mr-2 h-3 w-3" />
                Sign Out
              </Button>
            </div>

            {/* Theme and Storage */}
            <div className="p-4 glass rounded-lg border border-cosmic-purple/20">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
              <div className="text-xs text-muted-foreground mb-2">
                Storage Status
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 bg-secondary rounded-full flex-1">
                  <div className="h-full bg-gradient-cosmic rounded-full w-3/4"></div>
                </div>
                <span className="text-xs">75%</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};