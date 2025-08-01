import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Plus, 
  Edit3, 
  Save, 
  X, 
  Search,
  BookOpen,
  Brain,
  Network
} from "lucide-react";
import { toast } from "sonner";

interface NoteNodeData extends Record<string, unknown> {
  title: string;
  content: string;
  tags: string[];
}

interface SolarSystemSectionProps {
  onSectionChange: (section: string) => void;
}

// Custom Note Node Component
const NoteNode = ({ data, id }: { data: NoteNodeData; id: string }) => {
  return (
    <div className="glass px-4 py-3 min-w-[200px] max-w-[250px] rounded-lg border-primary/30 hover:border-primary/60 transition-all duration-300 hover:scale-105">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-primary border-2 border-background" />
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-primary border-2 border-background" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-primary border-2 border-background" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-primary border-2 border-background" />
      
      <div className="space-y-2">
        <h3 className="font-semibold text-foreground text-sm line-clamp-2">
          {String(data.title)}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-3">
          {String(data.content)}
        </p>
        <div className="flex flex-wrap gap-1">
          {Array.isArray(data.tags) && data.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
              {String(tag)}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

const nodeTypes = {
  noteNode: NoteNode,
};

const initialNodes: Node<NoteNodeData>[] = [
  {
    id: '1',
    type: 'noteNode',
    position: { x: 250, y: 100 },
    data: { title: 'Physics Notes', content: 'Quantum mechanics and wave functions', tags: ['physics', 'quantum'] },
  },
  {
    id: '2',
    type: 'noteNode',
    position: { x: 100, y: 300 },
    data: { title: 'Mathematics', content: 'Calculus and differential equations', tags: ['math', 'calculus'] },
  },
  {
    id: '3',
    type: 'noteNode',
    position: { x: 400, y: 300 },
    data: { title: 'Chemistry', content: 'Organic chemistry reactions', tags: ['chemistry', 'organic'] },
  },
];

const initialEdges: Edge[] = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2', 
    type: 'smoothstep',
    animated: true,
    style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
    label: 'related'
  },
  { 
    id: 'e1-3', 
    source: '1', 
    target: '3', 
    type: 'smoothstep',
    style: { stroke: 'hsl(var(--accent))', strokeWidth: 2 },
    label: 'connected'
  },
];

export const SolarSystemSection = ({ onSectionChange }: SolarSystemSectionProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNode, setSelectedNode] = useState<Node<NoteNodeData> | null>(null);
  const [editingNode, setEditingNode] = useState<Node<NoteNodeData> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newNode, setNewNode] = useState({ title: '', content: '', tags: '' });
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = () => {
    const newNodeData: Node<NoteNodeData> = {
      id: `${Date.now()}`,
      type: 'noteNode',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        title: newNode.title,
        content: newNode.content,
        tags: newNode.tags.split(',').map(tag => tag.trim()),
      },
    };

    setNodes((nds) => [...nds, newNodeData as Node]);
    setNewNode({ title: '', content: '', tags: '' });
    setIsCreating(false);
    toast.success("Note added to knowledge graph!");
  };

  const updateNode = () => {
    if (!editingNode) return;
    
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === editingNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              title: newNode.title,
              content: newNode.content,
              tags: newNode.tags.split(',').map(tag => tag.trim()),
            },
          } as Node;
        }
        return node;
      })
    );
    
    setEditingNode(null);
    setNewNode({ title: '', content: '', tags: '' });
    toast.success("Note updated!");
  };

  const filteredNodes = nodes.filter((node) => {
    const nodeData = node.data as Record<string, unknown>;
    const title = String(nodeData.title || '');
    const content = String(nodeData.content || '');
    const tags = Array.isArray(nodeData.tags) ? nodeData.tags : [];
    
    return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           content.toLowerCase().includes(searchTerm.toLowerCase()) ||
           tags.some((tag: unknown) => String(tag).toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="min-h-screen bg-gradient-cosmic p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold gradient-text">Knowledge Graph</h1>
          <p className="text-muted-foreground">Visualize and connect your learning concepts</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="flex gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button variant="cosmic" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Note
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Note</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Note title..."
                    value={newNode.title}
                    onChange={(e) => setNewNode({ ...newNode, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Note content..."
                    value={newNode.content}
                    onChange={(e) => setNewNode({ ...newNode, content: e.target.value })}
                    rows={4}
                  />
                  <Input
                    placeholder="Tags (comma separated)..."
                    value={newNode.tags}
                    onChange={(e) => setNewNode({ ...newNode, tags: e.target.value })}
                  />
                  <Button onClick={addNode} className="w-full" variant="cosmic">
                    Create Note
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Network className="w-3 h-3" />
              {nodes.length} Notes
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Brain className="w-3 h-3" />
              {edges.length} Connections
            </Badge>
          </div>
        </div>

        {/* Knowledge Graph */}
        <Card className="glass-card border-primary/30 h-[600px]">
          <CardContent className="p-0 h-full">
            <div className="w-full h-full" ref={reactFlowWrapper}>
              <ReactFlow
                nodes={searchTerm ? filteredNodes : nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                className="cosmic-flow"
                style={{ background: 'transparent' }}
              >
                <Background color="hsl(var(--primary) / 0.1)" />
                <MiniMap 
                  nodeColor="hsl(var(--primary))"
                  className="glass border border-primary/20"
                />
                <Controls className="glass border border-primary/20" />
              </ReactFlow>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="glass-card border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Total Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{nodes.length}</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-accent/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Network className="w-4 h-4 text-accent" />
                Connections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{edges.length}</div>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-secondary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Brain className="w-4 h-4 text-secondary" />
                Graph Density
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">
                {nodes.length > 1 ? Math.round((edges.length / (nodes.length * (nodes.length - 1) / 2)) * 100) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
