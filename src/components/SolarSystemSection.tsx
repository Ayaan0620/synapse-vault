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
  Panel
} from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Search, 
  Zap, 
  Plus,
  BookOpen,
  Star,
  Sparkles
} from "lucide-react";
import gsap from "gsap";
import "@xyflow/react/dist/style.css";

interface SolarSystemSectionProps {
  onSectionChange: (section: string) => void;
}

interface NoteNode extends Node {
  data: {
    label: string;
    content: string;
    tags: string[];
    isStarred: boolean;
    aiGenerated: boolean;
    connections: number;
  };
}

const nodeTypes = {
  note: ({ data, selected }: { data: any; selected: boolean }) => (
    <div className={`
      px-4 py-3 rounded-lg border-2 transition-all duration-300
      ${selected ? 'border-cosmic-purple shadow-lg cosmic-glow' : 'border-cosmic-purple/30'}
      ${data.aiGenerated ? 'bg-gradient-cosmic' : 'glass'}
      hover:scale-105 cursor-pointer
    `}>
      <div className="flex items-center gap-2 mb-2">
        {data.aiGenerated && <Brain className="h-4 w-4 text-cosmic-purple" />}
        {data.isStarred && <Star className="h-4 w-4 text-cosmic-orange fill-cosmic-orange" />}
        <h3 className="font-semibold text-sm text-foreground">{data.label}</h3>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
        {data.content}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {data.tags.slice(0, 2).map((tag: string) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          {data.connections} connections
        </span>
      </div>
    </div>
  )
};

export const SolarSystemSection = ({ onSectionChange }: SolarSystemSectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNode, setSelectedNode] = useState<NoteNode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const initialNodes: NoteNode[] = [
    {
      id: "1",
      type: "note",
      position: { x: 400, y: 200 },
      data: {
        label: "Quantum Mechanics",
        content: "Fundamental theory describing matter and energy at atomic scales...",
        tags: ["physics", "quantum", "theory"],
        isStarred: true,
        aiGenerated: true,
        connections: 3
      }
    },
    {
      id: "2",
      type: "note",
      position: { x: 200, y: 100 },
      data: {
        label: "Wave Functions",
        content: "Mathematical description of quantum states...",
        tags: ["physics", "quantum", "math"],
        isStarred: false,
        aiGenerated: false,
        connections: 2
      }
    },
    {
      id: "3",
      type: "note",
      position: { x: 600, y: 150 },
      data: {
        label: "Uncertainty Principle",
        content: "Heisenberg's fundamental limit on measurement precision...",
        tags: ["physics", "quantum", "heisenberg"],
        isStarred: true,
        aiGenerated: true,
        connections: 2
      }
    },
    {
      id: "4",
      type: "note",
      position: { x: 300, y: 350 },
      data: {
        label: "Schrödinger Equation",
        content: "Time-dependent and independent forms...",
        tags: ["physics", "quantum", "equations"],
        isStarred: false,
        aiGenerated: false,
        connections: 4
      }
    },
    {
      id: "5",
      type: "note",
      position: { x: 100, y: 300 },
      data: {
        label: "Machine Learning",
        content: "Algorithms that learn from data patterns...",
        tags: ["ai", "ml", "algorithms"],
        isStarred: true,
        aiGenerated: true,
        connections: 1
      }
    }
  ];

  const initialEdges: Edge[] = [
    {
      id: "e1-2",
      source: "1",
      target: "2",
      type: "smoothstep",
      animated: true,
      style: { stroke: "hsl(var(--cosmic-purple))", strokeWidth: 2 }
    },
    {
      id: "e1-3",
      source: "1",
      target: "3",
      type: "smoothstep",
      animated: true,
      style: { stroke: "hsl(var(--cosmic-blue))", strokeWidth: 2 }
    },
    {
      id: "e1-4",
      source: "1",
      target: "4",
      type: "smoothstep",
      animated: true,
      style: { stroke: "hsl(var(--cosmic-pink))", strokeWidth: 2 }
    },
    {
      id: "e2-4",
      source: "2",
      target: "4",
      type: "smoothstep",
      style: { stroke: "hsl(var(--cosmic-green))", strokeWidth: 2 }
    },
    {
      id: "e3-4",
      source: "3",
      target: "4",
      type: "smoothstep",
      style: { stroke: "hsl(var(--cosmic-orange))", strokeWidth: 2 }
    }
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node as NoteNode);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate the graph container
      gsap.fromTo(containerRef.current, 
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 1, ease: "power3.out" }
      );
    });

    return () => ctx.revert();
  }, []);

  const filteredNodes = nodes.filter(node => 
    node.data.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.data.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addRandomNode = () => {
    const topics = [
      "Neural Networks", "Thermodynamics", "Linear Algebra", 
      "Data Structures", "Organic Chemistry", "Electromagnetic Theory"
    ];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    
    const newNode: NoteNode = {
      id: Date.now().toString(),
      type: "note",
      position: { 
        x: Math.random() * 400 + 200, 
        y: Math.random() * 300 + 100 
      },
      data: {
        label: randomTopic,
        content: `AI-generated content about ${randomTopic}...`,
        tags: ["ai-generated", "new"],
        isStarred: false,
        aiGenerated: true,
        connections: 0
      }
    };
    
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="h-screen flex">
      {/* Control Panel */}
      <div className="w-80 glass border-r border-cosmic-purple/20 p-4">
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
              onClick={addRandomNode}
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

        {selectedNode && (
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
              <Button variant="outline" size="sm" className="flex-1">
                <BookOpen className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="cosmic" size="sm" className="flex-1">
                <Zap className="h-4 w-4 mr-2" />
                Connect
              </Button>
            </div>
          </Card>
        )}

        <div className="mt-6">
          <h3 className="font-semibold mb-3">Legend</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-cosmic-purple" />
              <span>AI Generated</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-cosmic-orange" />
              <span>Starred Notes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-cosmic-purple"></div>
              <span>Strong Connection</span>
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
          className="cosmic-flow"
        >
          <Background 
            color="hsl(var(--cosmic-purple) / 0.3)" 
            gap={20} 
            size={1}
            style={{ backgroundColor: 'transparent' }}
          />
          <Controls 
            className="glass border border-cosmic-purple/20"
            showInteractive={false}
          />
          <MiniMap 
            className="glass border border-cosmic-purple/20"
            nodeColor="hsl(var(--cosmic-purple))"
            maskColor="hsl(var(--background) / 0.8)"
          />
          
          <Panel position="top-right" className="m-4">
            <Card className="p-3 glass">
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-cosmic-purple" />
                <span>Interactive Knowledge Map</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Drag nodes to reorganize • Click to select • Connect related ideas
              </p>
            </Card>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};