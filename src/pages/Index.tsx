import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { HomeSection } from "@/components/HomeSection";
import { NotesSection } from "@/components/NotesSection";
import { SolarSystemSection } from "@/components/SolarSystemSection";
import { FlashcardsSection } from "@/components/FlashcardsSection";
import { FormulasSection } from "@/components/FormulasSection";
import { PYQSection } from "@/components/PYQSection";
import { DoubtsClearingSection } from "@/components/DoubtsClearingSection";
import { StudyPlannerSection } from "@/components/StudyPlannerSection";
import { GameifiedLearningSection } from "@/components/GameifiedLearningSection";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const [activeSection, setActiveSection] = useState("home");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case "home":
        return <HomeSection onSectionChange={setActiveSection} />;
      case "notes":
        return <NotesSection onSectionChange={setActiveSection} />;
      case "solar":
        return <SolarSystemSection onSectionChange={setActiveSection} />;
      case "flashcards":
        return <FlashcardsSection onSectionChange={setActiveSection} />;
      case "formulas":
        return <FormulasSection onSectionChange={setActiveSection} />;
      case "pyqs":
        return <PYQSection onSectionChange={setActiveSection} />;
      case "doubts":
        return <DoubtsClearingSection onSectionChange={setActiveSection} />;
      default:
        return <HomeSection onSectionChange={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
      <main className="md:ml-64 min-h-screen">
        {renderSection()}
      </main>
    </div>
  );
};

export default Index;
