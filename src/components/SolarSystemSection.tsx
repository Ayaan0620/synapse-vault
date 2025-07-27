import { useEffect, useRef, useState, useCallback } from "react";
import { 
  ReactFlow, 
  Node, 
  Edge, 
  useNodesState, 
  useEdgesState, 
  addEdge, 
  Connection,
  Background,
  Controls,
  MiniMap,
  Panel,
  NodeProps,
  Handle,
  Position,
  ReactFlowProvider
} from "@xyflow/react";
// --- NEW: KaTeX imports ---
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css'; // Don't forget to import the CSS

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Brain, 
  Search, 
  Zap, 
  Plus,
  BookOpen,
  Sparkles,
  Edit3,
  Save,
  X,
  Link2,
  Sun,
  Moon,
  Trash2,
  ArrowLeft
} from "lucide-react";
import gsap from "gsap";
import "@xyflow/react/dist/style.css";

// --- INTERFACES & TYPES (Unchanged) ---
interface SolarSystemSectionProps {
  onSectionChange: (section: string) => void;
}

interface NoteNodeData extends Record<string, unknown> {
  id: string;
  label: string;
  content: string;
  tags: string[];
  isStarred: boolean;
  aiGenerated: boolean;
  connections: number;
  category: string;
  size: 'small' | 'medium' | 'large';
  parentTopic?: string;
}

type NoteNode = Node<NoteNodeData>;

// --- NEW: LATEX/CONTENT RENDERER COMPONENT ---
// This component takes a string and renders it, parsing for LaTeX delimiters.
const ContentRenderer = ({ content }: { content: string }) => {
  // Regex to find $...$ (inline) and $$...$$ (block) expressions
  const regex = /(\$\$(.*?)\$\$|\$(.*?)\$)/g;
  const parts = content.split(regex).filter(Boolean); // Split and remove empty strings

  return (
    <div className="text-sm prose dark:prose-invert prose-p:my-2 prose-h3:mt-4 prose-h3:mb-2">
      {parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          // Block Math: $$...$$
          const math = part.substring(2, part.length - 2);
          return (
            <div key={index} className="my-4 text-base">
              <BlockMath math={math} />
            </div>
          );
        }
        if (part.startsWith('$') && part.endsWith('$')) {
          // Inline Math: $...$
          const math = part.substring(1, part.length - 1);
          return <InlineMath key={index} math={math} />;
        }
        // Regular text
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
};


// --- NEW: NOTE INSPECTOR MODAL COMPONENT ---
const NoteInspectorModal = ({ node, onClose }: { node: NoteNode; onClose: () => void }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-2xl max-h-[80vh] p-6 glass flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the card
      >
        <div className="flex items-start justify-between mb-4 flex-shrink-0">
          <h2 className="text-2xl font-bold gradient-text">{node.data.label}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-5 w-5"/></Button>
        </div>
        <div className="flex flex-wrap gap-2 mb-4 flex-shrink-0">
          {node.data.tags.map((tag) => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>
        <div className="overflow-y-auto pr-4 -mr-4 text-foreground/90">
          <ContentRenderer content={node.data.content} />
        </div>
      </Card>
    </div>
  );
};


// --- CUSTOM NODE COMPONENT (Unchanged from previous version) ---
const ObsidianNode = ({ data, selected }: NodeProps<NoteNodeData>) => {
  const categoryColorMap: Record<string, string> = { Physics: 'blue', AI: 'green', Mathematics: 'orange', General: 'purple' };
  const colorName = categoryColorMap[data.category] || 'purple';
  const mainColor = `hsl(var(--cosmic-${colorName}))`;
  const nodeStyle = { backgroundColor: `hsl(var(--cosmic-${colorName}) / 0.15)`, color: mainColor, borderColor: `hsl(var(--cosmic-${colorName}) / 0.4)`, minWidth: 90, maxWidth: 180, };
  const selectedStyle = { borderColor: mainColor, transform: 'scale(1.1)', boxShadow: `0 0 12px 2px hsl(var(--cosmic-${colorName}) / 0.5)`, };

  return (
    <div className="relative group">
      <Handle type="target" position={Position.Top} className="opacity-0 group-hover:opacity-100 transition-opacity !w-2 !h-2" style={{ background: mainColor }}/>
      <Handle type="source" position={Position.Bottom} className="opacity-0 group-hover:opacity-100 transition-opacity !w-2 !h-2" style={{ background: mainColor }}/>
      <Handle type="target" position={Position.Left} className="opacity-0 group-hover:opacity-100 transition-opacity !w-2 !h-2" style={{ background: mainColor }}/>
      <Handle type="source" position={Position.Right} className="opacity-0 group-hover:opacity-100 transition-opacity !w-2 !h-2" style={{ background: mainColor }}/>
      <div style={{ ...nodeStyle, ...(selected ? selectedStyle : {}) }} className="px-4 py-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center text-center shadow-md hover:shadow-lg hover:scale-105 cursor-pointer">
        <span className="font-semibold text-sm tracking-wide">{data.label}</span>
      </div>
    </div>
  );
};

const nodeTypes = { obsidian: ObsidianNode };

// --- GRAPH CANVAS COMPONENT ---
const GraphCanvas = ({
  nodes, edges, onNodesChange, onEdgesChange, onConnect, onNodeClick, onEdgeClick, isDarkMode, onNodeDoubleClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(containerRef.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 1, ease: "power3.out" });
  }, []);

  return (
    <div ref={containerRef} className="flex-1 bg-background text-foreground">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        // --- NEW: Add double-click handler ---
        onNodeDoubleClick={onNodeDoubleClick}
        onPaneClick={() => { onNodeClick(null, null); onEdgeClick(null, null); }}
        nodeTypes={nodeTypes}
        fitView
        className="obsidian-flow"
        connectionLineType="smoothstep"
        defaultEdgeOptions={{ type: 'smoothstep' }}
      >
        <Background color={isDarkMode ? "hsl(var(--cosmic-purple) / 0.2)" : "rgba(99, 102, 241, 0.2)"} gap={30} size={1} variant={"dots"} />
        <Controls className="glass" showInteractive={false} />
        <MiniMap className="glass" nodeColor={(node) => {
            const categoryColorMap: Record<string, string> = { Physics: 'blue', AI: 'green', Mathematics: 'orange', General: 'purple' };
            const colorName = categoryColorMap[node.data.category] || 'purple';
            return `hsl(var(--cosmic-${colorName}))`;
        }} maskColor={isDarkMode ? "hsl(var(--background) / 0.8)" : "rgba(255, 255, 255, 0.8)"} style={{ backgroundColor: isDarkMode ? 'hsl(var(--background) / 0.5)' : 'rgba(255, 255, 255, 0.5)' }} />
        <Panel position="top-right" className="m-4">
          <Card className="p-3 glass">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-cosmic-purple" />
              <span>Obsidian-style Knowledge Graph</span>
            </div>
            {/* --- NEW: Updated UI hint --- */}
            <p className="text-xs text-muted-foreground mt-1">Drag • Connect • Double-click to view</p>
          </Card>
        </Panel>
      </ReactFlow>
    </div>
  );
};


// --- MAIN COMPONENT ---
export const SolarSystemSection = ({ onSectionChange }: SolarSystemSectionProps) => {
  // --- NEW: State for the inspector modal ---
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNode, setSelectedNode] = useState<NoteNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [isCreatingNode, setIsCreatingNode] = useState(false);
  const [isEditingNode, setIsEditingNode] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionSource, setConnectionSource] = useState<string | null>(null);
  const [availableTargets, setAvailableTargets] = useState<NoteNode[]>([]);
  const [connectionLabel, setConnectionLabel] = useState("related to");
  const [editedEdgeLabel, setEditedEdgeLabel] = useState("");
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [isTopicView, setIsTopicView] = useState(false);
  const [mainViewNodes, setMainViewNodes] = useState<NoteNode[]>([]);
  const [mainViewEdges, setMainViewEdges] = useState<Edge[]>([]);

  const [newNodeData, setNewNodeData] = useState({
    label: "", content: "", tags: "", category: "General"
  });

  // Data
  const initialNodes: NoteNode[] = [
      { id: "1", type: "obsidian", position: { x: 400, y: 200 }, data: { id: "1", label: "Quantum Mechanics", content: "Fundamental theory describing matter and energy at atomic and subatomic scales. It explains the behavior of particles at the quantum level.", tags: ["physics", "quantum", "theory"], isStarred: true, aiGenerated: true, connections: 3, category: "Physics", size: "large" }},
      { id: "2", type: "obsidian", position: { x: 150, y: 100 }, data: { id: "2", label: "Wave Functions", content: "Mathematical description of quantum states. A wave function, denoted by $\\Psi$, provides information about the probability amplitude of a particle's position and momentum.", tags: ["physics", "quantum", "math"], isStarred: false, aiGenerated: false, connections: 2, category: "Physics", size: "medium" }},
      { id: "3", type: "obsidian", position: { x: 650, y: 150 }, data: { id: "3", label: "Uncertainty Principle", content: "Heisenberg's fundamental limit on the precision with which certain pairs of physical properties of a particle, such as position $x$ and momentum $p$, can be known.", tags: ["physics", "quantum", "heisenberg"], isStarred: true, aiGenerated: true, connections: 2, category: "Physics", size: "medium" }},
      // --- MODIFIED: Added LaTeX example ---
      { id: "4", type: "obsidian", position: { x: 300, y: 350 }, data: { id: "4", label: "Schrödinger Equation", content: "A key equation in quantum mechanics that describes how a quantum system evolves over time. The time-dependent equation is: \n\n$$i\\hbar\\frac{\\partial}{\\partial t}\\Psi(\\mathbf{r},t) = \\hat{H}\\Psi(\\mathbf{r},t)$$\n\nIt connects the system's energy to its wave-like behavior.", tags: ["physics", "quantum", "equations"], isStarred: false, aiGenerated: false, connections: 4, category: "Physics", size: "large" }},
      { id: "5", type: "obsidian", position: { x: 100, y: 350 }, data: { id: "5", label: "Machine Learning", content: "A field of artificial intelligence that uses statistical techniques to give computer systems the ability to 'learn' from data, without being explicitly programmed.", tags: ["ai", "ml", "algorithms"], isStarred: true, aiGenerated: true, connections: 1, category: "AI", size: "medium" }},
      { id: "6", type: "obsidian", position: { x: 550, y: 350 }, data: { id: "6", label: "Linear Algebra", content: "A branch of mathematics that is a crucial foundation for both quantum mechanics and machine learning. It deals with vector spaces, matrices, and linear mappings. A common operation is matrix multiplication, like $Ax=b$.", tags: ["math", "linear", "vectors"], isStarred: false, aiGenerated: false, connections: 3, category: "Mathematics", size: "medium" }}
  ];

  // ... (rest of initialEdges, categoryColorMap, topicExpansions are the same)
  const initialEdges: Edge[] = [ { id: "e1-2", source: "1", target: "2", label: "describes", style: { strokeDasharray: "5,5" }}, { id: "e1-3", source: "1", target: "3", label: "includes" }, { id: "e1-4", source: "1", target: "4", label: "governed by", style: { strokeWidth: 3 }}, { id: "e2-4", source: "2", target: "4", label: "solution to" }, { id: "e4-6", source: "4", target: "6", label: "uses" }, { id: "e5-6", source: "5", target: "6", label: "requires" } ];
  const categoryColorMap: Record<string, string> = { Physics: 'blue', AI: 'green', Mathematics: 'orange', General: 'purple' };
  const topicExpansions: Record<string, NoteNode[]> = { "Quantum Mechanics": [ { id: "qm-1", type: "obsidian", position: { x: 200, y: 100 }, data: { id: "qm-1", label: "Quantum Entanglement", content: "Particles become correlated and remain connected...", tags: ["quantum", "entanglement"], isStarred: false, aiGenerated: true, connections: 2, category: "Physics", size: "medium", parentTopic: "Quantum Mechanics" }}, { id: "qm-2", type: "obsidian", position: { x: 400, y: 100 }, data: { id: "qm-2", label: "Superposition", content: "Quantum systems exist in multiple states...", tags: ["quantum", "superposition"], isStarred: true, aiGenerated: false, connections: 3, category: "Physics", size: "medium", parentTopic: "Quantum Mechanics" }}, ], "Machine Learning": [ { id: "ml-1", type: "obsidian", position: { x: 150, y: 100 }, data: { id: "ml-1", label: "Neural Networks", content: "Systems inspired by biological neural networks...", tags: ["ai", "neural-networks"], isStarred: true, aiGenerated: false, connections: 4, category: "AI", size: "large", parentTopic: "Machine Learning" }}, ] };
  // ...

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Effects and handlers remain largely the same, with minor additions
  // ... (useEffect for initial edges, useEffect for dark mode)
  useEffect(() => { setMainViewNodes(initialNodes); const nodeCategoryMap = new Map(initialNodes.map(node => [node.id, node.data.category])); const coloredInitialEdges = initialEdges.map(edge => { const sourceCategory = nodeCategoryMap.get(edge.source!); const colorName = sourceCategory ? (categoryColorMap[sourceCategory] || 'purple') : 'purple'; const strokeColor = `hsl(var(--cosmic-${colorName}))`; return { ...edge, style: { ...edge.style, stroke: strokeColor, strokeWidth: 2 } }; }); setEdges(coloredInitialEdges); setMainViewEdges(coloredInitialEdges); }, []); // eslint-disable-line
  useEffect(() => { const textColor = 'hsl(var(--foreground))'; setEdges((eds) => eds.map(e => ({ ...e, labelStyle: { ...e.labelStyle, fill: textColor, fontWeight: 500 } }))); }, [isDarkMode, setEdges]);
  const createEdge = useCallback((sourceId: string, targetId: string, label: string) => { const sourceNode = nodes.find(n => n.id === sourceId); const category = sourceNode?.data.category || 'General'; const colorName = categoryColorMap[category] || 'purple'; const strokeColor = `hsl(var(--cosmic-${colorName}))`; const newEdge: Edge = { id: `e${sourceId}-${targetId}-${Date.now()}`, source: sourceId, target: targetId, type: 'smoothstep', label: label || "related", style: { stroke: strokeColor, strokeWidth: 2 } }; setEdges((eds) => addEdge(newEdge, eds)); }, [nodes, setEdges]); // eslint-disable-line
  // ...

  // Handlers
  const onConnect = useCallback((params: Connection) => {
    if (!params.source || !params.target) return;
    const label = window.prompt("Enter connection label:");
    if (label === null) return; // User cancelled
    createEdge(params.source, params.target, label);
  }, [createEdge]);

  // --- MODIFIED: onNodeClick now closes the inspector ---
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node | null) => {
    setSelectedNode(node as NoteNode);
    setSelectedEdge(null);
    setIsConnecting(false);
    // If user clicks on the pane (node is null), also close the inspector
    if (!node) {
        setIsInspectorOpen(false);
    }
  }, []);

  // --- NEW: Double-click handler to open the inspector ---
  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node as NoteNode); // Ensure the node is selected
    setIsInspectorOpen(true); // Open the modal
  }, []);

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
    setIsInspectorOpen(false); // Close inspector if an edge is selected
  }, []);

  // ... (createNode, updateNode, updateEdgeLabel, etc. are the same)
  const createNode = () => { if (newNodeData.label.trim()) { const newNodeId = Date.now().toString(); const newNode: NoteNode = { id: newNodeId, type: "obsidian", position: { x: Math.random() * 300 + 200, y: Math.random() * 200 + 150 }, data: { id: newNodeId, label: newNodeData.label, content: newNodeData.content, tags: newNodeData.tags.split(",").map(tag => tag.trim()).filter(Boolean), isStarred: false, aiGenerated: false, connections: 0, category: newNodeData.category, size: 'medium', parentTopic: isTopicView ? currentTopic : undefined }}; setNodes((nds) => [...nds, newNode]); setNewNodeData({ label: "", content: "", tags: "", category: "General" }); setIsCreatingNode(false); }};
  const updateNode = () => { if (selectedNode && newNodeData.label.trim()) { setNodes((nds) => nds.map(node => node.id === selectedNode.id ? { ...node, data: { ...node.data, label: newNodeData.label, content: newNodeData.content, tags: newNodeData.tags.split(",").map(tag => tag.trim()).filter(Boolean), category: newNodeData.category } } : node)); setIsEditingNode(false); setSelectedNode(null); }};
  const updateEdgeLabel = () => { if (!selectedEdge) return; setEdges((eds) => eds.map((e) => e.id === selectedEdge.id ? { ...e, label: editedEdgeLabel } : e)); setSelectedEdge(null); };
  const deleteSelectedNode = () => { if (selectedNode) { setNodes((nds) => nds.filter(n => n.id !== selectedNode.id)); setEdges((eds) => eds.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id)); setSelectedNode(null); }};
  const deleteSelectedEdge = () => { if (selectedEdge) { setEdges((eds) => eds.filter(e => e.id !== selectedEdge.id)); setSelectedEdge(null); }};
  const expandTopic = (topicLabel: string) => { if (topicExpansions[topicLabel]) { setMainViewNodes(nodes); setMainViewEdges(edges); setCurrentTopic(topicLabel); setIsTopicView(true); setNodes(topicExpansions[topicLabel]); setEdges([]); setSelectedNode(null); }};
  const returnToMainView = () => { setIsTopicView(false); setCurrentTopic(null); setNodes(mainViewNodes); setEdges(mainViewEdges); setSelectedNode(null); };
  const startConnecting = () => { if (!selectedNode) return; setIsConnecting(true); setConnectionSource(selectedNode.id); setAvailableTargets(nodes.filter(n => n.id !== selectedNode.id)); };
  const createConnectionFromPicker = (targetId: string) => { if (connectionSource) { createEdge(connectionSource, targetId, connectionLabel); setIsConnecting(false); setConnectionSource(null); }};
  const filteredNodes = nodes.filter(node => node.data.label.toLowerCase().includes(searchTerm.toLowerCase()) || node.data.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())));
  // ...

  return (
    <ReactFlowProvider>
      <div className={`h-screen flex font-sans ${isDarkMode ? 'dark' : 'light'}`}>
        {/* --- NEW: Render the inspector modal when active --- */}
        {isInspectorOpen && selectedNode && (
          <NoteInspectorModal node={selectedNode} onClose={() => setIsInspectorOpen(false)} />
        )}

        {/* Control Panel (Largely unchanged, but the content in the selectedNode card is now more of a preview) */}
        <div className="w-80 glass border-r border-cosmic-purple/20 p-4 flex flex-col overflow-y-auto">
            {/* ... (panel header, search, buttons, etc.) ... */}
            <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><Brain className="h-6 w-6 text-cosmic-purple" /><h2 className="text-xl font-bold gradient-text">Knowledge Graph</h2></div><Button variant="ghost" size="icon" onClick={() => setIsDarkMode(!isDarkMode)}>{isDarkMode ? <Sun className="h-5 w-5"/> : <Moon className="h-5 w-5"/>}</Button></div>
            {isTopicView && (<Button variant="outline" size="sm" onClick={returnToMainView} className="w-full mb-4"><ArrowLeft className="h-4 w-4 mr-2" />Back to Main Graph</Button>)}
            <div className="space-y-4 mb-4"><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search nodes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 glass"/></div><div className="flex gap-2"><Button variant="cosmic" size="sm" onClick={() => {setIsCreatingNode(true); setSelectedNode(null);}} className="flex-1"><Plus className="h-4 w-4 mr-2" />Add Node</Button><Button variant="neon" size="icon" onClick={() => onSectionChange("notes")}><BookOpen className="h-4 w-4" /></Button></div></div>
            <div className="grid grid-cols-2 gap-4 mb-4"><Card className="p-3 glass text-center"><div className="text-lg font-bold text-cosmic-purple">{nodes.length}</div><div className="text-xs text-muted-foreground">Nodes</div></Card><Card className="p-3 glass text-center"><div className="text-lg font-bold text-cosmic-blue">{edges.length}</div><div className="text-xs text-muted-foreground">Connections</div></Card></div>
            
            <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-4">
            {/* ... (UI for creating, editing, connecting is the same) ... */}
            {(isCreatingNode || isEditingNode) && ( <Card className="p-4 glass"><div className="flex items-center justify-between mb-4"><h3 className="font-semibold">{isEditingNode ? "Edit Node" : "Create Node"}</h3><Button variant="ghost" size="icon" onClick={() => { setIsCreatingNode(false); setIsEditingNode(false); }}><X className="h-4 w-4" /></Button></div><div className="space-y-3"><Input placeholder="Node title..." value={newNodeData.label} onChange={(e) => setNewNodeData({ ...newNodeData, label: e.target.value })} className="glass"/><select value={newNodeData.category} onChange={(e) => setNewNodeData({ ...newNodeData, category: e.target.value })} className="w-full glass border border-cosmic-purple/30 rounded-md px-3 py-2 bg-background text-foreground"><option>General</option><option>Physics</option><option>AI</option><option>Mathematics</option></select><Input placeholder="Tags (comma-separated)..." value={newNodeData.tags} onChange={(e) => setNewNodeData({ ...newNodeData, tags: e.target.value.toString() })} className="glass"/><Textarea placeholder="Node content (use $...$ for inline and $$...$$ for block formulas)..." value={newNodeData.content} onChange={(e) => setNewNodeData({ ...newNodeData, content: e.target.value })} className="glass h-24"/><Button variant="cosmic" onClick={isEditingNode ? updateNode : createNode} className="w-full"><Save className="h-4 w-4 mr-2" />{isEditingNode ? "Update" : "Create"}</Button></div></Card> )}
            {isConnecting && ( <Card className="p-4 glass"><div className="flex items-center justify-between mb-4"><h3 className="font-semibold">Connect to Node</h3><Button variant="ghost" size="icon" onClick={() => setIsConnecting(false)}><X className="h-4 w-4" /></Button></div><div className="space-y-3 mb-4"><Input placeholder="Connection label..." value={connectionLabel} onChange={(e) => setConnectionLabel(e.target.value)} className="glass"/></div><div className="space-y-2 max-h-48 overflow-y-auto">{availableTargets.map((node) => (<Button key={node.id} variant="outline" size="sm" className="w-full justify-start" onClick={() => createConnectionFromPicker(node.id)}>{node.data.label}</Button>))}</div></Card> )}
            {selectedNode && !isEditingNode && !isConnecting && ( <Card className="p-4 glass"><div className="flex items-center justify-between mb-3"><h3 className="font-semibold">{selectedNode.data.label}</h3><Button variant="ghost" size="icon" onClick={() => setSelectedNode(null)}><X className="h-4 w-4" /></Button></div><p className="text-sm text-muted-foreground mb-3 line-clamp-3">{selectedNode.data.content}</p><p className="text-xs text-muted-foreground/80 mb-3">(Double-click node to see full content)</p><div className="flex flex-wrap gap-1 mb-3">{selectedNode.data.tags.map((tag) => (<Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>))}</div><div className="space-y-2">{topicExpansions[selectedNode.data.label] && !isTopicView && (<Button variant="neon" size="sm" onClick={() => expandTopic(selectedNode.data.label)} className="w-full"><Zap className="h-4 w-4 mr-2" />Explore Topic</Button>)}<div className="flex gap-2"><Button variant="cosmic" size="sm" className="flex-1" onClick={startConnecting}><Link2 className="h-4 w-4 mr-2" />Connect</Button><Button variant="outline" size="sm" onClick={() => { setIsEditingNode(true); setNewNodeData({...selectedNode.data, tags: selectedNode.data.tags.join(', ') }); }} className="flex-1"><Edit3 className="h-4 w-4 mr-2" />Edit</Button></div><Button variant="destructive" size="sm" onClick={deleteSelectedNode} className="w-full"><Trash2 className="h-4 w-4 mr-2" />Delete</Button></div></Card> )}
            {selectedEdge && ( <Card className="p-4 glass"><div className="flex items-center justify-between mb-4"><h3 className="font-semibold">Edit Connection</h3><Button variant="ghost" size="icon" onClick={() => setSelectedEdge(null)}><X className="h-4 w-4" /></Button></div><div className="space-y-3"><Input placeholder="Connection label..." value={editedEdgeLabel} onChange={(e) => setEditedEdgeLabel(e.target.value)} className="glass" /><div className="flex gap-2"><Button variant="cosmic" size="sm" className="flex-1" onClick={updateEdgeLabel}><Save className="h-4 w-4 mr-2" />Update</Button><Button variant="destructive" size="icon" onClick={deleteSelectedEdge}><Trash2 className="h-4 w-4" /></Button></div></div></Card> )}
            </div>
        </div>

        {/* Graph Canvas */}
        <GraphCanvas 
          nodes={filteredNodes} 
          edges={edges} 
          onNodesChange={onNodesChange} 
          onEdgesChange={onEdgesChange} 
          onConnect={onConnect} 
          onNodeClick={onNodeClick} 
          onEdgeClick={onEdgeClick} 
          isDarkMode={isDarkMode}
          onNodeDoubleClick={onNodeDoubleClick}
        />
      </div>
    </ReactFlowProvider>
  );
};