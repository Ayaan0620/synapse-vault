import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { HomeSection } from "@/components/HomeSection";
import { NotesSection } from "@/components/NotesSection";
import { SolarSystemSection } from "@/components/SolarSystemSection";
import { FlashcardsSection } from "@/components/FlashcardsSection";
import { FormulasSection } from "@/components/FormulasSection";

const Index = () => {
  const [activeSection, setActiveSection] = useState("home");

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
