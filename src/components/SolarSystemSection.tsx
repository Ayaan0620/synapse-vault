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
  Position
} from "@xyflow/react";
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
  Star,
  Sparkles,
  Edit3,
  Save,
  X,
  Link2
} from "lucide-react";
import gsap from "gsap";
import "@xyflow/react/dist/style.css";

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
}

interface NoteNode extends Node<NoteNodeData> {
  data: NoteNodeData;
}

// Custom Node Component (Obsidian-style)
const ObsidianNode = ({ data, selected }: NodeProps) => {
  const nodeSize = {
    small: 'w-32 h-20',
    medium: 'w-40 h-24', 
    large: 'w-48 h-28'
  };

  const textSize = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  return (
    <div className={`
      ${nodeSize[(data as NoteNodeData).size]} relative group
      ${selected ? 'z-10' : 'z-0'}
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'hsl(var(--cosmic-purple))' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'hsl(var(--cosmic-purple))' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'hsl(var(--cosmic-purple))' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'hsl(var(--cosmic-purple))' }}
      />
      
      <div className={`
        w-full h-full rounded-xl border-2 transition-all duration-300 cursor-pointer
        ${selected 
          ? 'border-cosmic-purple shadow-2xl cosmic-glow scale-110' 
          : 'border-cosmic-purple/40 hover:border-cosmic-purple/80 hover:scale-105'
        }
        ${(data as NoteNodeData).aiGenerated 
          ? 'bg-gradient-to-br from-cosmic-purple/20 to-cosmic-blue/20' 
          : 'glass'
        }
        hover:shadow-xl
      `}>
        <div className="p-3 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-1 flex-wrap">
              {(data as NoteNodeData).aiGenerated && (
                <Brain className="h-3 w-3 text-cosmic-purple flex-shrink-0" />
              )}
              {(data as NoteNodeData).isStarred && (
                <Star className="h-3 w-3 text-cosmic-orange fill-cosmic-orange flex-shrink-0" />
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {(data as NoteNodeData).connections}
            </div>
          </div>
          
          {/* Title */}
          <h3 className={`font-semibold ${textSize[(data as NoteNodeData).size]} line-clamp-2 mb-1 text-foreground`}>
            {(data as NoteNodeData).label}
          </h3>
          
          {/* Content Preview */}
          <p className={`text-muted-foreground ${textSize[(data as NoteNodeData).size]} line-clamp-2 mb-2 flex-1`}>
            {(data as NoteNodeData).content}
          </p>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {(data as NoteNodeData).tags.slice(0, 2).map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-xs px-1 py-0 h-4"
              >
                {tag}
              </Badge>
            ))}
            {(data as NoteNodeData).tags.length > 2 && (
              <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                +{(data as NoteNodeData).tags.length - 2}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const nodeTypes = {
  obsidian: ObsidianNode
};

export const SolarSystemSection = ({ onSectionChange }: SolarSystemSectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNode, setSelectedNode] = useState<NoteNode | null>(null);
  const [isCreatingNode, setIsCreatingNode] = useState(false);
  const [isEditingNode, setIsEditingNode] = useState(false);
  const [newNodeData, setNewNodeData] = useState({
    label: "",
    content: "",
    tags: "",
    category: "General"
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const initialNodes: NoteNode[] = [
    {
      id: "1",
      type: "obsidian",
      position: { x: 400, y: 200 },
      data: {
        id: "1",
        label: "Quantum Mechanics",
        content: "Fundamental theory describing matter and energy at atomic and subatomic scales. Wave-particle duality is central to understanding quantum behavior.",
        tags: ["physics", "quantum", "theory"],
        isStarred: true,
        aiGenerated: true,
        connections: 3,
        category: "Physics",
        size: "large"
      }
    },
    {
      id: "2",
      type: "obsidian",
      position: { x: 150, y: 100 },
      data: {
        id: "2",
        label: "Wave Functions",
        content: "Mathematical description of quantum states using complex-valued probability amplitudes.",
        tags: ["physics", "quantum", "math"],
        isStarred: false,
        aiGenerated: false,
        connections: 2,
        category: "Physics",
        size: "medium"
      }
    },
    {
      id: "3",
      type: "obsidian",
      position: { x: 650, y: 150 },
      data: {
        id: "3",
        label: "Uncertainty Principle",
        content: "Heisenberg's fundamental limit on simultaneous measurement precision of complementary variables.",
        tags: ["physics", "quantum", "heisenberg"],
        isStarred: true,
        aiGenerated: true,
        connections: 2,
        category: "Physics",
        size: "medium"
      }
    },
    {
      id: "4",
      type: "obsidian",
      position: { x: 300, y: 350 },
      data: {
        id: "4",
        label: "Schrödinger Equation",
        content: "Time-dependent and independent forms describing evolution of quantum systems.",
        tags: ["physics", "quantum", "equations"],
        isStarred: false,
        aiGenerated: false,
        connections: 4,
        category: "Physics",
        size: "large"
      }
    },
    {
      id: "5",
      type: "obsidian",
      position: { x: 100, y: 350 },
      data: {
        id: "5",
        label: "Machine Learning",
        content: "Algorithms that learn patterns from data without explicit programming.",
        tags: ["ai", "ml", "algorithms"],
        isStarred: true,
        aiGenerated: true,
        connections: 1,
        category: "AI",
        size: "medium"
      }
    },
    {
      id: "6",
      type: "obsidian",
      position: { x: 550, y: 350 },
      data: {
        id: "6",
        label: "Linear Algebra",
        content: "Mathematical foundation for quantum mechanics and machine learning.",
        tags: ["math", "linear", "vectors"],
        isStarred: false,
        aiGenerated: false,
        connections: 3,
        category: "Mathematics",
        size: "medium"
      }
    }
  ];

  const initialEdges: Edge[] = [
    {
      id: "e1-2",
      source: "1",
      target: "2",
      type: "smoothstep",
      animated: false,
      style: { 
        stroke: "hsl(var(--cosmic-purple))", 
        strokeWidth: 2,
        strokeDasharray: "5,5"
      },
      label: "describes",
      labelStyle: { fill: 'hsl(var(--foreground))', fontSize: 12 }
    },
    {
      id: "e1-3",
      source: "1",
      target: "3",
      type: "smoothstep",
      animated: false,
      style: { 
        stroke: "hsl(var(--cosmic-blue))", 
        strokeWidth: 2 
      },
      label: "includes",
      labelStyle: { fill: 'hsl(var(--foreground))', fontSize: 12 }
    },
    {
      id: "e1-4",
      source: "1",
      target: "4",
      type: "smoothstep",
      animated: false,
      style: { 
        stroke: "hsl(var(--cosmic-pink))", 
        strokeWidth: 3 
      },
      label: "governed by",
      labelStyle: { fill: 'hsl(var(--foreground))', fontSize: 12 }
    },
    {
      id: "e2-4",
      source: "2",
      target: "4",
      type: "smoothstep",
      style: { 
        stroke: "hsl(var(--cosmic-green))", 
        strokeWidth: 2 
      },
      label: "solution to",
      labelStyle: { fill: 'hsl(var(--foreground))', fontSize: 12 }
    },
    {
      id: "e4-6",
      source: "4",
      target: "6",
      type: "smoothstep",
      style: { 
        stroke: "hsl(var(--cosmic-orange))", 
        strokeWidth: 2 
      },
      label: "uses",
      labelStyle: { fill: 'hsl(var(--foreground))', fontSize: 12 }
    },
    {
      id: "e5-6",
      source: "5",
      target: "6",
      type: "smoothstep",
      style: { 
        stroke: "hsl(var(--cosmic-blue))", 
        strokeWidth: 2 
      },
      label: "requires",
      labelStyle: { fill: 'hsl(var(--foreground))', fontSize: 12 }
    }
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        type: 'smoothstep',
        style: { 
          stroke: "hsl(var(--cosmic-purple))", 
          strokeWidth: 2 
        },
        label: "connected",
        labelStyle: { fill: 'hsl(var(--foreground))', fontSize: 12 }
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node as NoteNode);
    setIsEditingNode(false);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 1, ease: "power3.out" }
      );
    });

    return () => ctx.revert();
  }, []);

  const filteredNodes = nodes.filter(node => 
    node.data.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.data.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const createNode = () => {
    if (newNodeData.label.trim() && newNodeData.content.trim()) {
      const newNode: NoteNode = {
        id: Date.now().toString(),
        type: "obsidian",
        position: { 
          x: Math.random() * 300 + 200, 
          y: Math.random() * 200 + 150 
        },
        data: {
          id: Date.now().toString(),
          label: newNodeData.label,
          content: newNodeData.content,
          tags: newNodeData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
          isStarred: false,
          aiGenerated: false,
          connections: 0,
          category: newNodeData.category,
          size: 'medium'
        }
      };
      
      setNodes((nds) => [...nds, newNode]);
      setNewNodeData({ label: "", content: "", tags: "", category: "General" });
      setIsCreatingNode(false);
    }
  };

  const updateNode = () => {
    if (selectedNode && newNodeData.label.trim() && newNodeData.content.trim()) {
      setNodes((nds) => nds.map(node => 
        node.id === selectedNode.id 
          ? {
              ...node,
              data: {
                ...node.data,
                label: newNodeData.label,
                content: newNodeData.content,
                tags: newNodeData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
                category: newNodeData.category
              }
            }
          : node
      ));
      setIsEditingNode(false);
      setSelectedNode(null);
    }
  };

  const startEditing = (node: NoteNode) => {
    setNewNodeData({
      label: node.data.label,
      content: node.data.content,
      tags: node.data.tags.join(", "),
      category: node.data.category
    });
    setIsEditingNode(true);
  };

  return (
    <div className="h-screen flex">
      {/* Control Panel */}
      <div className="w-80 glass border-r border-cosmic-purple/20 p-4 overflow-y-auto">
        <div className="flex items-center gap-2 mb-6">
          <Brain className="h-6 w-6 text-cosmic-purple" />
          <h2 className="text-xl font-bold gradient-text">Knowledge Graph</h2>
        </div>

        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              variant="cosmic" 
              size="sm" 
              onClick={() => setIsCreatingNode(true)}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Node
            </Button>
            <Button 
              variant="neon" 
              size="sm"
              onClick={() => onSectionChange("notes")}
            >
              <BookOpen className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-3 glass text-center">
            <div className="text-lg font-bold text-cosmic-purple">{nodes.length}</div>
            <div className="text-xs text-muted-foreground">Nodes</div>
          </Card>
          <Card className="p-3 glass text-center">
            <div className="text-lg font-bold text-cosmic-blue">{edges.length}</div>
            <div className="text-xs text-muted-foreground">Connections</div>
          </Card>
        </div>

        {/* Create/Edit Node Form */}
        {(isCreatingNode || isEditingNode) && (
          <Card className="p-4 glass mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                {isEditingNode ? "Edit Node" : "Create Node"}
              </h3>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setIsCreatingNode(false);
                  setIsEditingNode(false);
                  setNewNodeData({ label: "", content: "", tags: "", category: "General" });
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <Input
                placeholder="Node title..."
                value={newNodeData.label}
                onChange={(e) => setNewNodeData({ ...newNodeData, label: e.target.value })}
                className="glass"
              />
              
              <select
                value={newNodeData.category}
                onChange={(e) => setNewNodeData({ ...newNodeData, category: e.target.value })}
                className="w-full glass border border-cosmic-purple/30 rounded-md px-3 py-2 bg-background text-foreground"
              >
                <option value="General">General</option>
                <option value="Physics">Physics</option>
                <option value="Mathematics">Mathematics</option>
                <option value="AI">AI</option>
                <option value="Chemistry">Chemistry</option>
              </select>
              
              <Input
                placeholder="Tags (comma separated)..."
                value={newNodeData.tags}
                onChange={(e) => setNewNodeData({ ...newNodeData, tags: e.target.value })}
                className="glass"
              />
              
              <Textarea
                placeholder="Node content..."
                value={newNodeData.content}
                onChange={(e) => setNewNodeData({ ...newNodeData, content: e.target.value })}
                className="glass h-24"
              />
              
              <Button 
                variant="cosmic" 
                onClick={isEditingNode ? updateNode : createNode}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {isEditingNode ? "Update" : "Create"}
              </Button>
            </div>
          </Card>
        )}

        {/* Selected Node Details */}
        {selectedNode && !isEditingNode && !isCreatingNode && (
          <Card className="p-4 glass">
            <div className="flex items-center gap-2 mb-3">
              {selectedNode.data.aiGenerated && <Brain className="h-4 w-4 text-cosmic-purple" />}
              {selectedNode.data.isStarred && <Star className="h-4 w-4 text-cosmic-orange fill-cosmic-orange" />}
              <h3 className="font-semibold">{selectedNode.data.label}</h3>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3">
              {selectedNode.data.content}
            </p>
            
            <div className="flex flex-wrap gap-1 mb-3">
              {selectedNode.data.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => startEditing(selectedNode)}
                className="flex-1"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="cosmic" size="sm" className="flex-1">
                <Link2 className="h-4 w-4 mr-2" />
                Connect
              </Button>
            </div>
          </Card>
        )}

        <div className="mt-6">
          <h3 className="font-semibold mb-3">Graph Controls</h3>
          <div className="space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-cosmic-purple"></div>
              <span>Drag nodes to reposition</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-cosmic-blue"></div>
              <span>Click nodes to select</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-cosmic-pink"></div>
              <span>Drag from handles to connect</span>
            </div>
          </div>
        </div>
      </div>

      {/* React Flow Graph */}
      <div ref={containerRef} className="flex-1 glass">
        <ReactFlow
          nodes={filteredNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-left"
          className="obsidian-flow"
          connectionLineStyle={{ stroke: 'hsl(var(--cosmic-purple))', strokeWidth: 2 }}
          defaultEdgeOptions={{
            style: { strokeWidth: 2, stroke: 'hsl(var(--cosmic-purple))' },
            type: 'smoothstep',
          }}
        >
          <Background 
            color="hsl(var(--cosmic-purple) / 0.2)" 
            gap={30} 
            size={1}
            style={{ backgroundColor: 'transparent' }}
            variant={undefined}
          />
          <Controls 
            className="glass border border-cosmic-purple/20"
            showInteractive={false}
          />
          <MiniMap 
            className="glass border border-cosmic-purple/20"
            nodeColor="hsl(var(--cosmic-purple))"
            maskColor="hsl(var(--background) / 0.8)"
            style={{ backgroundColor: 'hsl(var(--background) / 0.5)' }}
          />
          
          <Panel position="top-right" className="m-4">
            <Card className="p-3 glass">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-cosmic-purple" />
                <span>Obsidian-style Knowledge Graph</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Drag • Connect • Edit • Explore relationships
              </p>
            </Card>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};