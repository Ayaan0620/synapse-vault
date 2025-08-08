import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator, 
  Search, 
  Star, 
  Copy, 
  Download,
  Plus,
  BookOpen,
  Zap
} from "lucide-react";
import gsap from "gsap";

interface Formula {
  id: string;
  name: string;
  formula: string;
  description: string;
  category: string;
  subject: string;
  difficulty: "basic" | "intermediate" | "advanced";
  variables: { symbol: string; meaning: string; unit?: string }[];
  examples?: string[];
  isStarred: boolean;
  lastUsed: string;
}

interface FormulasSectionProps {
  onSectionChange: (section: string) => void;
}

export const FormulasSection = ({ onSectionChange }: FormulasSectionProps) => {
  const [formulas, setFormulas] = useState<Formula[]>([
    {
      id: "1",
      name: "Quadratic Formula",
      formula: "x = (-b ± √(b² - 4ac)) / 2a",
      description: "Solves quadratic equations of the form ax² + bx + c = 0",
      category: "Algebra",
      subject: "Mathematics",
      difficulty: "intermediate",
      variables: [
        { symbol: "x", meaning: "Unknown variable" },
        { symbol: "a", meaning: "Coefficient of x²" },
        { symbol: "b", meaning: "Coefficient of x" },
        { symbol: "c", meaning: "Constant term" }
      ],
      examples: ["x² - 5x + 6 = 0", "2x² + 3x - 2 = 0"],
      isStarred: true,
      lastUsed: "2024-01-15"
    },
    {
      id: "2",
      name: "Newton's Second Law",
      formula: "F = ma",
      description: "The net force on an object is equal to its mass times acceleration",
      category: "Mechanics",
      subject: "Physics",
      difficulty: "basic",
      variables: [
        { symbol: "F", meaning: "Force", unit: "N (Newtons)" },
        { symbol: "m", meaning: "Mass", unit: "kg" },
        { symbol: "a", meaning: "Acceleration", unit: "m/s²" }
      ],
      examples: ["F = 10kg × 2m/s² = 20N"],
      isStarred: true,
      lastUsed: "2024-01-14"
    },
    {
      id: "3",
      name: "Schrödinger Equation",
      formula: "iℏ ∂ψ/∂t = Ĥψ",
      description: "Time-dependent equation describing quantum mechanical systems",
      category: "Quantum Mechanics",
      subject: "Physics",
      difficulty: "advanced",
      variables: [
        { symbol: "ψ", meaning: "Wave function" },
        { symbol: "ℏ", meaning: "Reduced Planck constant", unit: "J·s" },
        { symbol: "t", meaning: "Time", unit: "s" },
        { symbol: "Ĥ", meaning: "Hamiltonian operator", unit: "J" }
      ],
      isStarred: false,
      lastUsed: "2024-01-13"
    },
    {
      id: "4",
      name: "Compound Interest",
      formula: "A = P(1 + r/n)^(nt)",
      description: "Calculates the amount of money accumulated after n years",
      category: "Finance",
      subject: "Mathematics",
      difficulty: "intermediate",
      variables: [
        { symbol: "A", meaning: "Final amount" },
        { symbol: "P", meaning: "Principal amount" },
        { symbol: "r", meaning: "Annual interest rate" },
        { symbol: "n", meaning: "Number of times interest compounds per year" },
        { symbol: "t", meaning: "Time in years" }
      ],
      examples: ["$1000 at 5% for 10 years = $1628.89"],
      isStarred: false,
      lastUsed: "2024-01-12"
    },
    {
      id: "5",
      name: "Ideal Gas Law",
      formula: "PV = nRT",
      description: "Relates pressure, volume, temperature, and amount of gas",
      category: "Thermodynamics",
      subject: "Chemistry",
      difficulty: "intermediate",
      variables: [
        { symbol: "P", meaning: "Pressure", unit: "Pa" },
        { symbol: "V", meaning: "Volume", unit: "m³" },
        { symbol: "n", meaning: "Amount of substance", unit: "mol" },
        { symbol: "R", meaning: "Gas constant", unit: "8.314 J/(mol·K)" },
        { symbol: "T", meaning: "Temperature", unit: "K" }
      ],
      isStarred: true,
      lastUsed: "2024-01-11"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newFormula, setNewFormula] = useState({
    name: "",
    formula: "",
    description: "",
    category: "",
    subject: "",
    difficulty: "basic" as const,
  });

  const formulasRef = useRef<HTMLDivElement>(null);
  const subjects = Array.from(new Set(formulas.map(f => f.subject)));
  const categories = Array.from(new Set(formulas.map(f => f.category)));

  const filteredFormulas = formulas.filter(formula => {
    const matchesSearch = formula.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formula.formula.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formula.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === "all" || formula.subject === selectedSubject;
    const matchesDifficulty = selectedDifficulty === "all" || formula.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(formulasRef.current?.children || [], 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }
      );
    });

    return () => ctx.revert();
  }, [filteredFormulas]);

  const toggleStar = (formulaId: string) => {
    setFormulas(formulas.map(formula => 
      formula.id === formulaId ? { ...formula, isStarred: !formula.isStarred } : formula
    ));
  };

  const copyFormula = (formula: string) => {
    navigator.clipboard.writeText(formula);
    // You could add a toast here
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "basic": return "cosmic-green";
      case "intermediate": return "cosmic-orange";
      case "advanced": return "cosmic-pink";
      default: return "cosmic-purple";
    }
  };

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case "Mathematics": return "cosmic-purple";
      case "Physics": return "cosmic-blue";
      case "Chemistry": return "cosmic-green";
      default: return "cosmic-orange";
    }
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-80 glass border-r border-cosmic-purple/20 p-4">
        <div className="flex items-center gap-2 mb-6">
          <Calculator className="h-6 w-6 text-cosmic-purple" />
          <h2 className="text-xl font-bold gradient-text">Formula Sheets</h2>
        </div>

        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search formulas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass"
            />
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full glass border border-cosmic-purple/30 rounded-md px-3 py-2 bg-background text-foreground"
          >
            <option value="all">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full glass border border-cosmic-purple/30 rounded-md px-3 py-2 bg-background text-foreground"
          >
            <option value="all">All Difficulties</option>
            <option value="basic">Basic</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="p-3 glass text-center">
            <div className="text-lg font-bold text-cosmic-purple">{formulas.length}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </Card>
          <Card className="p-3 glass text-center">
            <div className="text-lg font-bold text-cosmic-orange">{formulas.filter(f => f.isStarred).length}</div>
            <div className="text-xs text-muted-foreground">Starred</div>
          </Card>
        </div>

        <Button variant="cosmic" size="sm" className="w-full mb-4" onClick={() => setIsAdding(v => !v)}>
          <Plus className="h-4 w-4 mr-2" /> {isAdding ? 'Cancel' : 'Add Formula'}
        </Button>

        {isAdding && (
          <div className="space-y-2 mb-4">
            <Input placeholder="Name" value={newFormula.name} onChange={(e) => setNewFormula({ ...newFormula, name: e.target.value })} />
            <Input placeholder="Formula" value={newFormula.formula} onChange={(e) => setNewFormula({ ...newFormula, formula: e.target.value })} />
            <Input placeholder="Description" value={newFormula.description} onChange={(e) => setNewFormula({ ...newFormula, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Subject" value={newFormula.subject} onChange={(e) => setNewFormula({ ...newFormula, subject: e.target.value })} />
              <Input placeholder="Category" value={newFormula.category} onChange={(e) => setNewFormula({ ...newFormula, category: e.target.value })} />
            </div>
            <select
              value={newFormula.difficulty}
              onChange={(e) => setNewFormula({ ...newFormula, difficulty: e.target.value as any })}
              className="w-full glass border border-cosmic-purple/30 rounded-md px-3 py-2 bg-background text-foreground"
            >
              <option value="basic">Basic</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <Button
              variant="neon"
              size="sm"
              onClick={() => {
                if (!newFormula.name || !newFormula.formula) return;
                const f: Formula = {
                  id: Date.now().toString(),
                  name: newFormula.name,
                  formula: newFormula.formula,
                  description: newFormula.description,
                  category: newFormula.category || 'General',
                  subject: newFormula.subject || 'General',
                  difficulty: newFormula.difficulty,
                  variables: [],
                  examples: [],
                  isStarred: false,
                  lastUsed: new Date().toISOString().split('T')[0],
                };
                setFormulas([f, ...formulas]);
                setIsAdding(false);
                setNewFormula({ name: '', formula: '', description: '', category: '', subject: '', difficulty: 'basic' });
                setSelectedFormula(f);
              }}
            >
              Save Formula
            </Button>
          </div>
        )}


        <div ref={formulasRef} className="space-y-2 overflow-y-auto max-h-96">
          {filteredFormulas.map((formula) => (
            <Card 
              key={formula.id}
              className={`p-3 cursor-pointer transition-all duration-200 cosmic-hover ${
                selectedFormula?.id === formula.id ? 'border-cosmic-purple cosmic-glow' : 'glass hover:border-cosmic-purple/50'
              }`}
              onClick={() => setSelectedFormula(formula)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm line-clamp-1">{formula.name}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStar(formula.id);
                  }}
                >
                  <Star className={`h-3 w-3 ${formula.isStarred ? 'fill-cosmic-orange text-cosmic-orange' : ''}`} />
                </Button>
              </div>
              
              <code className="text-xs font-mono bg-secondary/50 px-2 py-1 rounded block mb-2 line-clamp-1">
                {formula.formula}
              </code>
              
              <div className="flex items-center gap-1 justify-between">
                <Badge 
                  variant="secondary" 
                  className={`text-xs bg-${getDifficultyColor(formula.difficulty)}/20 text-${getDifficultyColor(formula.difficulty)}`}
                >
                  {formula.difficulty}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`text-xs border-${getSubjectColor(formula.subject)}/30`}
                >
                  {formula.subject}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 glass">
        {selectedFormula ? (
          <div className="p-8 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold">{selectedFormula.name}</h1>
                <Badge 
                  variant="secondary" 
                  className={`bg-${getDifficultyColor(selectedFormula.difficulty)}/20 text-${getDifficultyColor(selectedFormula.difficulty)}`}
                >
                  {selectedFormula.difficulty}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`border-${getSubjectColor(selectedFormula.subject)}/30`}
                >
                  {selectedFormula.subject} • {selectedFormula.category}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyFormula(selectedFormula.formula)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button variant="cosmic" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleStar(selectedFormula.id)}
                >
                  <Star className={`h-4 w-4 ${selectedFormula.isStarred ? 'fill-cosmic-orange text-cosmic-orange' : ''}`} />
                </Button>
              </div>
            </div>

            <Tabs defaultValue="formula" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="formula">Formula</TabsTrigger>
                <TabsTrigger value="variables">Variables</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
              </TabsList>

              <TabsContent value="formula" className="space-y-6">
                <Card className="p-8 glass text-center">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold mb-2">Formula</h2>
                  </div>
                  <div className="text-4xl font-mono font-bold cosmic-glow p-6 rounded-lg bg-secondary/20 mb-6">
                    {selectedFormula.formula}
                  </div>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {selectedFormula.description}
                  </p>
                </Card>
              </TabsContent>

              <TabsContent value="variables" className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Variable Definitions</h2>
                <div className="grid gap-4">
                  {selectedFormula.variables.map((variable, index) => (
                    <Card key={index} className="p-4 glass">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-cosmic-purple/20 flex items-center justify-center">
                          <span className="text-xl font-mono font-bold text-cosmic-purple">
                            {variable.symbol}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{variable.meaning}</h3>
                          {variable.unit && (
                            <p className="text-sm text-muted-foreground">
                              Unit: {variable.unit}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="examples" className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Examples</h2>
                {selectedFormula.examples ? (
                  <div className="space-y-4">
                    {selectedFormula.examples.map((example, index) => (
                      <Card key={index} className="p-6 glass">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="secondary">Example {index + 1}</Badge>
                        </div>
                        <code className="text-lg font-mono bg-secondary/30 px-4 py-3 rounded-lg block">
                          {example}
                        </code>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 glass text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No examples available for this formula.</p>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-8 pt-6 border-t border-cosmic-purple/20">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Last used: {selectedFormula.lastUsed}</span>
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onSectionChange("notes")}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Create Note
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onSectionChange("flashcards")}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Make Flashcard
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Select a formula to view</h3>
              <p className="text-muted-foreground">
                Choose a formula from the sidebar to see details, variables, and examples
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};