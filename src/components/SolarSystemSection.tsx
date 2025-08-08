// src/components/SolarSystemSection.tsx

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Plus, Trash2, Link2, X } from "lucide-react";
import ForceGraph2D, { NodeObject, LinkObject } from "react-force-graph-2d";
import { toast } from "sonner";
import QuillEditor from "./RichEditor";
import { useTheme } from "next-themes"; // <-- 1. IMPORT THE THEME HOOK

// --- INTERFACES ---
interface NoteData { id: number; title: string; content: string; }
type GraphNode = NoteData & NodeObject & { x?: number; y?: number; id: number };

// --- INITIAL DATA ---
const initialNotes: NoteData[] = [
  { id: 1, title: 'Welcome!', content: '<p>Click a node to edit it in the sidebar!</p>' },
  { id: 2, title: 'Math Formulas', content: '<p>You can now add math using the [fx] button: <span class="ql-formula" data-value="e=mc^2"></span></p>' },
  { id: 3, title: 'Theming', content: '<p>This app now supports light and dark modes!</p>' },
];
const initialConnections = [{ source: 1, target: 2 }, { source: 1, target: 3 }];

// --- THE MAIN COMPONENT ---
export const SolarSystemSection = ({ onSectionChange }: { onSectionChange?: (section: string) => void }) => {
  const fgRef = useRef<any>();
  const [nodes, setNodes] = useState<NoteData[]>(initialNotes);
  const [connections, setConnections] = useState(initialConnections);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [linkSource, setLinkSource] = useState<number | null>(null);
  const [currentNode, setCurrentNode] = useState<NoteData | null>(null);
  const [formData, setFormData] = useState({ title: '', content: '' });

  const { theme } = useTheme(); // <-- 2. USE THE HOOK TO GET THE CURRENT THEME

  // --- THEME-AWARE COLOR STATE FOR THE CANVAS ---
  const [themeColors, setThemeColors] = useState({
    node: '#000000', text: '#000000', link: '#000000',
    nodeHighlight: '#000000', particle: '#000000',
  });

  // FIXED: This effect now re-runs whenever the `theme` changes
  useEffect(() => {
    // We need a slight delay to ensure the CSS variables have been updated by the browser
    const timer = setTimeout(() => {
        const computedStyle = getComputedStyle(document.documentElement);
        setThemeColors({
            node: `hsl(${computedStyle.getPropertyValue('--primary')})`,
            nodeHighlight: `hsl(${computedStyle.getPropertyValue('--accent')})`,
            text: `hsl(${computedStyle.getPropertyValue('--foreground')})`,
            link: `hsla(${computedStyle.getPropertyValue('--foreground')}, 0.2)`,
            particle: `hsl(${computedStyle.getPropertyValue('--foreground')})`
        });
    }, 50); // 50ms delay is usually enough

    return () => clearTimeout(timer); // Cleanup the timer
  }, [theme]); // <-- 3. ADD `theme` AS A DEPENDENCY

  useEffect(() => { fgRef.current?.d3ReheatSimulation(); }, [nodes, connections]);
  const graphData = useMemo(() => ({ nodes, links: connections }), [nodes, connections]);

  const handleNodeClick = useCallback((node: GraphNode) => {
    if (isLinking) {
      if (!linkSource) { setLinkSource(Number(node.id)); toast.info(`Selected "${node.title}".`); }
      else {
        if (linkSource !== node.id && !connections.some(c => (c.source === linkSource && c.target === node.id) || (c.source === node.id && c.target === linkSource))) {
            setConnections(prev => [...prev, { source: linkSource, target: Number(node.id) }]);
            toast.success("Nodes linked!");
        }
        setIsLinking(false); setLinkSource(null);
      }
    } else {
      setCurrentNode({ id: Number(node.id), title: node.title, content: node.content });
      setFormData({ title: node.title, content: node.content });
      setIsSheetOpen(true);
    }
  }, [isLinking, linkSource, connections]);

  const handleAddClick = () => {
    setIsLinking(false); setCurrentNode(null);
    setFormData({ title: '', content: '<p><br></p>' });
    setIsSheetOpen(true);
  };

  const handleSave = () => {
    if (!formData.title.trim()) return toast.error("Title is required.");
    if (currentNode) {
      const nodeToUpdate = nodes.find(n => n.id === currentNode.id);
      if (nodeToUpdate) {
        nodeToUpdate.title = formData.title;
        nodeToUpdate.content = formData.content;
        setNodes([...nodes]);
        toast.success("Note updated.");
      }
    } else {
      const newId = Date.now();
      setNodes(prev => [...prev, { id: newId, ...formData }]);
      toast.success("Note added!");
    }
    setIsSheetOpen(false);
  };

  const handleDelete = () => {
    if (!currentNode) return;
    setConnections(connections.filter(c => c.source !== currentNode.id && c.target !== currentNode.id));
    setNodes(nodes.filter(n => n.id !== currentNode.id));
    toast.info("Note deleted.");
    setIsSheetOpen(false);
  };

  const toggleLinking = () => {
    setLinkSource(null); setIsLinking(!isLinking);
    toast.dismiss(); if (!isLinking) toast.info("Link Mode Activated.");
  };

  const renderNode = useCallback((node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.title, fontSize = 12 / globalScale, r = 6;
    ctx.beginPath(); ctx.arc(node.x!, node.y!, r, 0, 2 * Math.PI, false);
    ctx.fillStyle = (isLinking && linkSource === node.id) ? themeColors.nodeHighlight : themeColors.node;
    ctx.shadowColor = (isLinking && linkSource === node.id) ? themeColors.nodeHighlight : themeColors.node;
    ctx.shadowBlur = (isLinking && linkSource === node.id) ? 20 : 10;
    ctx.fill(); ctx.shadowBlur = 0;
    ctx.font = `${fontSize}px Sans-Serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = themeColors.text;
    ctx.fillText(label, node.x!, node.y! + r + 10);
  }, [isLinking, linkSource, themeColors]);

  return (
    <div className="w-screen h-screen bg-background text-foreground relative">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button onClick={handleAddClick}><Plus className="w-4 h-4 mr-2" /> Add Note</Button>
        <Button onClick={toggleLinking} variant={isLinking ? "secondary" : "outline"} className={isLinking ? "ring-2 ring-accent" : ""}>
          {isLinking ? <X className="w-4 h-4 mr-2" /> : <Link2 className="w-4 h-4 mr-2" />}
          {isLinking ? "Cancel" : "Link Notes"}
        </Button>
      </div>

      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeCanvasObject={renderNode}
        onNodeClick={node => handleNodeClick(node as GraphNode)}
        linkColor={() => themeColors.link}
        linkWidth={1}
        linkDirectionalParticles={1}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleColor={() => themeColors.particle}
      />
      
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="bg-background border-l border-border sm:max-w-2xl w-full flex flex-col">
          <SheetHeader>
            <SheetTitle>
              <Input placeholder="Note Title" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} className="bg-transparent border-none text-2xl font-bold focus-visible:ring-0 p-0" />
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex-grow my-4 overflow-y-auto">
             <QuillEditor
                value={formData.content}
                onChange={(newContent) => setFormData(prev => ({...prev, content: newContent}))}
            />
          </div>

          <SheetFooter className="pt-4 border-t border-border">
            <div className="flex justify-between w-full">
              {currentNode && (<Button variant="destructive" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-2" /> Delete</Button>)}
              <div className="flex-grow"></div>
              <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
                  <Button onClick={handleSave}>Save</Button>
              </div>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
};