import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Brain,
  Sparkles,
  Tag,
  BookOpen
} from "lucide-react";
import gsap from "gsap";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  isStarred: boolean;
  aiGenerated: boolean;
}

interface NotesSectionProps {
  onSectionChange: (section: string) => void;
}

export const NotesSection = ({ onSectionChange }: NotesSectionProps) => {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: "1",
      title: "Quantum Mechanics Fundamentals",
      content: "Quantum mechanics is a fundamental theory in physics that describes the behavior of matter and energy at atomic and subatomic scales...",
      tags: ["physics", "quantum", "theory"],
      createdAt: "2024-01-15",
      isStarred: true,
      aiGenerated: true
    },
    {
      id: "2",
      title: "Machine Learning Algorithms",
      content: "Overview of supervised, unsupervised, and reinforcement learning approaches...",
      tags: ["ai", "ml", "algorithms"],
      createdAt: "2024-01-14",
      isStarred: false,
      aiGenerated: false
    },
    {
      id: "3",
      title: "Calculus Integration Techniques",
      content: "Various methods for solving integrals including substitution, integration by parts...",
      tags: ["math", "calculus", "integration"],
      createdAt: "2024-01-13",
      isStarred: true,
      aiGenerated: true
    }
  ]);

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "", tags: "" });

  const notesRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(notesRef.current?.children || [], 
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.1 }
      );
    });

    return () => ctx.revert();
  }, [notes]);

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const createNote = () => {
    if (newNote.title.trim() && newNote.content.trim()) {
      const note: Note = {
        id: Date.now().toString(),
        title: newNote.title,
        content: newNote.content,
        tags: newNote.tags.split(",").map(tag => tag.trim()).filter(Boolean),
        createdAt: new Date().toISOString().split("T")[0],
        isStarred: false,
        aiGenerated: false
      };
      setNotes([note, ...notes]);
      setNewNote({ title: "", content: "", tags: "" });
      setIsCreating(false);
      setSelectedNote(note);
    }
  };

  const toggleStar = (noteId: string) => {
    setNotes(notes.map(note => 
      note.id === noteId ? { ...note, isStarred: !note.isStarred } : note
    ));
  };

  const generateAINote = () => {
    // Simulate AI generation
    const aiTopics = [
      "Neural Networks Deep Dive",
      "Thermodynamics Laws",
      "Organic Chemistry Reactions",
      "Data Structures & Algorithms",
      "Electromagnetic Theory"
    ];
    
    const randomTopic = aiTopics[Math.floor(Math.random() * aiTopics.length)];
    const aiNote: Note = {
      id: Date.now().toString(),
      title: randomTopic,
      content: `This is an AI-generated note about ${randomTopic}. The content includes comprehensive explanations, examples, and key concepts that are essential for understanding this topic...`,
      tags: ["ai-generated", "study", "comprehensive"],
      createdAt: new Date().toISOString().split("T")[0],
      isStarred: false,
      aiGenerated: true
    };
    
    setNotes([aiNote, ...notes]);
    setSelectedNote(aiNote);
  };

  return (
    <div className="flex h-screen">
      {/* Notes List */}
      <div className="w-1/3 border-r border-cosmic-purple/20 glass">
        <div className="p-4 border-b border-cosmic-purple/20">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-cosmic-purple" />
            <h2 className="text-xl font-bold">Notes</h2>
          </div>
          
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass"
              />
            </div>
            <Button variant="ghost" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="cosmic" 
              size="sm" 
              onClick={() => setIsCreating(true)}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
            <Button 
              variant="neon" 
              size="sm"
              onClick={generateAINote}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI Generate
            </Button>
          </div>
        </div>

        <div ref={notesRef} className="overflow-y-auto h-full p-4 space-y-3">
          {filteredNotes.map((note) => (
            <Card 
              key={note.id}
              className={`p-4 cursor-pointer transition-all duration-200 cosmic-hover ${
                selectedNote?.id === note.id ? 'border-cosmic-purple cosmic-glow' : 'glass hover:border-cosmic-purple/50'
              }`}
              onClick={() => setSelectedNote(note)}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm line-clamp-1">{note.title}</h3>
                <div className="flex items-center gap-1">
                  {note.aiGenerated && (
                    <Brain className="h-4 w-4 text-cosmic-purple" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStar(note.id);
                    }}
                  >
                    <Star className={`h-3 w-3 ${note.isStarred ? 'fill-cosmic-orange text-cosmic-orange' : ''}`} />
                  </Button>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                {note.content}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex gap-1 flex-wrap">
                  {note.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {note.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{note.tags.length - 2}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {note.createdAt}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Note Editor */}
      <div className="flex-1 flex flex-col">
        {isCreating ? (
          <div className="h-full p-6 glass">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Create New Note</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button variant="cosmic" onClick={createNote}>
                  Save Note
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <Input
                placeholder="Note title..."
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                className="text-lg font-semibold glass"
              />
              
              <Input
                placeholder="Tags (comma separated)..."
                value={newNote.tags}
                onChange={(e) => setNewNote({ ...newNote, tags: e.target.value })}
                className="glass"
              />
              
              <Textarea
                placeholder="Start writing your note..."
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                className="min-h-96 glass"
              />
            </div>
          </div>
        ) : selectedNote ? (
          <div ref={editorRef} className="h-full p-6 glass">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{selectedNote.title}</h1>
                {selectedNote.aiGenerated && (
                  <Badge variant="secondary" className="bg-cosmic-purple/20 text-cosmic-purple">
                    <Brain className="h-3 w-3 mr-1" />
                    AI Generated
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="neon" 
                  size="sm"
                  onClick={() => onSectionChange("solar")}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  View in Graph
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleStar(selectedNote.id)}
                >
                  <Star className={`h-4 w-4 ${selectedNote.isStarred ? 'fill-cosmic-orange text-cosmic-orange' : ''}`} />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Created {selectedNote.createdAt}
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                {selectedNote.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {selectedNote.content}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center glass">
            <div className="text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Select a note to view</h3>
              <p className="text-muted-foreground">
                Choose a note from the sidebar or create a new one
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};