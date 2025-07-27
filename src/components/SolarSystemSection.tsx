import { useState, useCallback, useRef, useEffect } from "react";
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
  NodeProps,
  Handle,
  Position,
} from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit3, Save, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface NoteNodeData {
  label: string;
  content: string;
  category: string;
  tags: string[];
}

interface SolarSystemSectionProps {
  onSectionChange: (section: string) => void;
}

// Custom Node Component
const ObsidianNode = ({ data, selected }: any) => {
  return (
    <div className={`px-4 py-2 shadow-md rounded-md bg-background border-2 transition-all ${
      selected ? 'border-primary shadow-lg scale-105' : 'border-muted'
    }`}>
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
      <Handle type="target" position={Position.Left} className="w-2 h-2" />
      <Handle type="source" position={Position.Right} className="w-2 h-2" />
      
      <div className="text-center">
        <div className="font-semibold text-sm">{data?.label}</div>
        <div className="text-xs text-muted-foreground mt-1">
          {data?.category}
        </div>
      </div>
    </div>
  );
};

export const SolarSystemSection = ({ onSectionChange }: SolarSystemSectionProps) => {
  const initialNodes: Node<NoteNodeData>[] = [
    {
      id: "1",
      type: "obsidian",
      position: { x: 250, y: 250 },
      data: { label: "Machine Learning", content: "Introduction to ML concepts...", category: "AI", tags: ["algorithms", "data"] },
    },
    {
      id: "2", 
      type: "obsidian",
      position: { x: 100, y: 100 },
      data: { label: "Neural Networks", content: "Deep learning fundamentals...", category: "AI", tags: ["deep learning", "neurons"] },
    },
    {
      id: "3",
      type: "obsidian", 
      position: { x: 400, y: 150 },
      data: { label: "Data Structures", content: "Arrays, trees, graphs...", category: "CS", tags: ["algorithms", "programming"] },
    },
  ];

  const initialEdges: Edge[] = [
    { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: 'hsl(var(--accent))' } },
    { id: "e1-3", source: "1", target: "3", animated: true, style: { stroke: 'hsl(var(--primary))' } },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newNodeForm, setNewNodeForm] = useState({
    label: "",
    content: "",
    category: "General",
    tags: ""
  });

  const nodeTypes = { obsidian: ObsidianNode };

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    setSelectedNode(node);
  }, []);

  const createNode = () => {
    if (!newNodeForm.label.trim()) return;
    
    const newNode: Node<NoteNodeData> = {
      id: Date.now().toString(),
      type: "obsidian",
      position: { x: Math.random() * 300 + 200, y: Math.random() * 200 + 150 },
      data: {
        label: newNodeForm.label,
        content: newNodeForm.content,
        category: newNodeForm.category,
        tags: newNodeForm.tags.split(",").map(t => t.trim()).filter(Boolean)
      }
    };

    setNodes((nds) => [...nds, newNode]);
    setNewNodeForm({ label: "", content: "", category: "General", tags: "" });
    setIsCreating(false);
    toast.success("Node created successfully!");
  };

  const updateNode = () => {
    if (!selectedNode || !newNodeForm.label.trim()) return;

    setNodes((nds) => nds.map(node => 
      node.id === selectedNode.id 
        ? {
            ...node,
            data: {
              label: newNodeForm.label,
              content: newNodeForm.content,
              category: newNodeForm.category,
              tags: newNodeForm.tags.split(",").map(t => t.trim()).filter(Boolean)
            }
          }
        : node
    ));
    
    setIsEditing(false);
    setSelectedNode(null);
    toast.success("Node updated successfully!");
  };

  const deleteNode = () => {
    if (!selectedNode) return;
    
    setNodes((nds) => nds.filter(n => n.id !== selectedNode.id));
    setEdges((eds) => eds.filter(e => e.source !== selectedNode.id && e.target !== selectedNode.id));
    setSelectedNode(null);
    toast.success("Node deleted successfully!");
  };

  const startEdit = () => {
    if (!selectedNode) return;
    setNewNodeForm({
      label: selectedNode.data.label,
      content: selectedNode.data.content,
      category: selectedNode.data.category,
      tags: selectedNode.data.tags.join(", ")
    });
    setIsEditing(true);
  };

  const filteredNodes = nodes.filter(node => 
    node.data.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.data.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-cosmic p-6">
      <div className="max-w-7xl mx-auto h-[calc(100vh-3rem)] flex gap-6">
        {/* Sidebar */}
        <div className="w-80 glass-card border-primary/30 p-4 space-y-4 overflow-y-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold gradient-text">Knowledge Graph</h1>
            <p className="text-muted-foreground text-sm">Obsidian-style connections</p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setIsCreating(true);
                setIsEditing(false);
                setSelectedNode(null);
                setNewNodeForm({ label: "", content: "", category: "General", tags: "" });
              }}
              className="flex-1"
              variant="cosmic"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Node
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="glass-card p-3 text-center">
              <div className="text-lg font-bold text-primary">{nodes.length}</div>
              <div className="text-xs text-muted-foreground">Nodes</div>
            </div>
            <div className="glass-card p-3 text-center">
              <div className="text-lg font-bold text-accent">{edges.length}</div>
              <div className="text-xs text-muted-foreground">Connections</div>
            </div>
          </div>

          {/* Create/Edit Form */}
          {(isCreating || isEditing) && (
            <Card className="glass-card border-primary/30">
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  {isEditing ? "Edit Node" : "Create Node"}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setIsCreating(false);
                      setIsEditing(false);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Node title..."
                  value={newNodeForm.label}
                  onChange={(e) => setNewNodeForm({ ...newNodeForm, label: e.target.value })}
                />
                <select
                  value={newNodeForm.category}
                  onChange={(e) => setNewNodeForm({ ...newNodeForm, category: e.target.value })}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  <option value="General">General</option>
                  <option value="AI">AI</option>
                  <option value="CS">Computer Science</option>
                  <option value="Math">Mathematics</option>
                </select>
                <Input
                  placeholder="Tags (comma-separated)..."
                  value={newNodeForm.tags}
                  onChange={(e) => setNewNodeForm({ ...newNodeForm, tags: e.target.value })}
                />
                <Textarea
                  placeholder="Node content..."
                  value={newNodeForm.content}
                  onChange={(e) => setNewNodeForm({ ...newNodeForm, content: e.target.value })}
                  className="h-24"
                />
                <Button
                  onClick={isEditing ? updateNode : createNode}
                  className="w-full"
                  variant="cosmic"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? "Update" : "Create"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Selected Node Info */}
          {selectedNode && !isEditing && (
            <Card className="glass-card border-primary/30">
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  {selectedNode.data.label}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedNode(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {selectedNode.data.content}
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedNode.data.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button onClick={startEdit} size="sm" className="flex-1">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button onClick={deleteNode} size="sm" variant="destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Graph Canvas */}
        <div className="flex-1 glass-card border-primary/30 rounded-lg overflow-hidden">
          <ReactFlow
            nodes={filteredNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-background"
          >
            <Background color="hsl(var(--muted))" gap={20} size={1} />
            <Controls />
            <MiniMap
              nodeColor={(node: any) => {
                switch (node.data?.category) {
                  case 'AI': return 'hsl(var(--primary))';
                  case 'CS': return 'hsl(var(--accent))';
                  case 'Math': return 'hsl(var(--secondary))';
                  default: return 'hsl(var(--muted-foreground))';
                }
              }}
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};