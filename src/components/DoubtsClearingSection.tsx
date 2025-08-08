import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Book,
  FileText,
  Image as ImageIcon,
  Mic,
  MicOff
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  type: "user" | "ai";
  timestamp: Date;
  attachments?: { type: "image" | "document"; url: string; name: string }[];
}

interface DoubtsClearingSectionProps {
  onSectionChange: (section: string) => void;
}

export const DoubtsClearingSection = ({ onSectionChange }: DoubtsClearingSectionProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI study assistant. I can help you understand concepts, solve problems, and clarify doubts across various subjects. What would you like to learn about today?",
      type: "ai",
      timestamp: new Date()
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("general");
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognition = useRef<any>(null);

  const subjects = [
    "general", "mathematics", "physics", "chemistry", "biology", 
    "computer-science", "english", "history", "geography"
  ];

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognition.current.onerror = () => {
        setIsListening(false);
        toast.error("Speech recognition error. Please try again.");
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simple AI response simulation based on keywords
    const message = userMessage.toLowerCase();
    
    if (message.includes("math") || message.includes("equation") || message.includes("calculate")) {
      return "I'd be happy to help with your math problem! Could you share the specific equation or concept you're working with? I can break it down step by step and explain the methodology.";
    } else if (message.includes("physics") || message.includes("force") || message.includes("energy")) {
      return "Physics can be challenging but fascinating! Let me help you understand this concept. Could you provide more details about the specific topic or problem you're dealing with? I can explain the principles and provide examples.";
    } else if (message.includes("chemistry") || message.includes("reaction") || message.includes("molecule")) {
      return "Chemistry involves understanding how matter behaves at the molecular level. What specific chemistry concept would you like me to explain? I can help with reactions, bonding, or any other chemistry topic.";
    } else if (message.includes("biology") || message.includes("cell") || message.includes("organism")) {
      return "Biology is the study of life and living organisms. I can help explain biological processes, systems, and concepts. What specific area of biology are you studying?";
    } else if (message.includes("programming") || message.includes("code") || message.includes("algorithm")) {
      return "Programming concepts can be tricky at first, but they become clearer with practice. What programming language or concept are you working with? I can provide explanations and examples.";
    } else {
      return `That's an interesting question about ${selectedSubject}! I understand you're asking about "${userMessage}". Let me provide a comprehensive explanation:

Based on your question, here are the key points to consider:

1. **Core Concept**: The fundamental principle behind this topic involves understanding the relationship between different variables and factors.

2. **Practical Application**: This concept is commonly used in real-world scenarios and can be applied to solve various problems.

3. **Common Mistakes**: Students often confuse this with similar concepts, so it's important to understand the distinctions.

Would you like me to elaborate on any specific aspect or provide some practice problems to help solidify your understanding?`;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      type: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const aiResponse = await generateAIResponse(inputMessage);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        type: "ai",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast.error("Failed to get AI response. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startListening = () => {
    if (recognition.current) {
      setIsListening(true);
      recognition.current.start();
    } else {
      toast.error("Speech recognition not supported in this browser.");
    }
  };

  const stopListening = () => {
    if (recognition.current) {
      recognition.current.stop();
      setIsListening(false);
    }
  };

  const quickPrompts = [
    "Explain this concept step by step",
    "Give me practice problems",
    "What are the key formulas?",
    "Show me real-world applications",
    "Compare with similar concepts",
    "What are common mistakes?"
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold gradient-text">AI Doubts Clearing</h1>
          <p className="text-muted-foreground">Get instant, personalized explanations for any concept</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="glass-card border-primary/30 h-[700px] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  AI Study Assistant
                  <Badge variant="outline" className="ml-auto">
                    {selectedSubject.replace("-", " ").toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`flex gap-3 max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : ""}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.type === "user" 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-accent text-accent-foreground"
                          }`}>
                            {message.type === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                          </div>
                          
                          <div className={`rounded-lg p-3 ${
                            message.type === "user"
                              ? "bg-primary text-primary-foreground ml-auto"
                              : "bg-muted text-foreground"
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {message.attachments.map((attachment, index) => (
                                  <div key={index} className="flex items-center gap-2 text-xs">
                                    {attachment.type === "image" ? (
                                      <ImageIcon className="w-3 h-3" />
                                    ) : (
                                      <FileText className="w-3 h-3" />
                                    )}
                                    <span>{attachment.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Ask any question or describe the concept you need help with..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="min-h-[60px] resize-none"
                      disabled={isTyping}
                    />
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={isListening ? stopListening : startListening}
                        variant="outline"
                        size="icon"
                        className={isListening ? "text-red-500" : ""}
                      >
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </Button>
                      <Button
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() || isTyping}
                        size="icon"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subject Selection */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-sm">Subject</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {subjects.map((subject) => (
                    <Button
                      key={subject}
                      variant={selectedSubject === subject ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSubject(subject)}
                      className="text-xs"
                    >
                      {subject.replace("-", " ")}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Prompts */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Quick Prompts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {quickPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full text-left justify-start text-xs"
                      onClick={() => setInputMessage(prompt)}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Study Tips */}
            <Card className="glass-card border-accent/30">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 text-accent">
                  <Book className="w-4 h-4" />
                  Study Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-xs text-muted-foreground">
                  <p>💡 Be specific with your questions for better answers</p>
                  <p>📝 Include context about what you already know</p>
                  <p>🔍 Ask for examples and practice problems</p>
                  <p>🎯 Break complex topics into smaller parts</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// Type declarations for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}