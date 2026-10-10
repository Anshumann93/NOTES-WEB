import React, { useState, useRef, useEffect } from 'react';
import { useNotes } from '../context/NotesContext';

export default function MindmapViewer() {
  const { activeNoteForViewer, showToast } = useNotes();

  const normalizeMindmap = (data) => {
    if (!data) return null;
    if (!Array.isArray(data.nodes)) return data.id ? data : null;

    const nodes = data.nodes.map((node, index) => ({
      ...node,
      id: String(node.id ?? index),
      title: node.title || node.label || node.name || `Concept ${index + 1}`,
      children: []
    }));
    if (!nodes.length) return null;
    const byId = new Map(nodes.map(node => [node.id, node]));
    const childIds = new Set();
    (data.edges || data.connections || []).forEach(edge => {
      const parent = byId.get(String(edge.source ?? edge.from));
      const child = byId.get(String(edge.target ?? edge.to));
      if (parent && child && parent !== child && !parent.children.includes(child)) {
        parent.children.push(child);
        childIds.add(child.id);
      }
    });
    const roots = nodes.filter(node => !childIds.has(node.id));
    const root = roots[0] || nodes[0];
    if (!root) return null;
    roots.slice(1).forEach(node => root.children.push(node));
    root.graphEdges = (data.edges || data.connections || []).map(edge => ({
      source: String(edge.source ?? edge.from),
      target: String(edge.target ?? edge.to)
    }));

    const layoutVisited = new Set();
    let leafIndex = 0;
    const place = (node, depth = 0) => {
      if (layoutVisited.has(node.id)) return node.y ?? 60;
      layoutVisited.add(node.id);
      if (node.children.length === 0) {
        node.x = node.x ?? 80 + depth * 220;
        node.y = node.y ?? 60 + leafIndex++ * 90;
        return node.y;
      }
      const childYs = node.children.map(child => place(child, depth + 1));
      node.x = node.x ?? 60 + depth * 220;
      node.y = node.y ?? (childYs[0] + childYs[childYs.length - 1]) / 2;
      return node.y;
    };
    place(root);
    root.expanded = root.expanded ?? true;
    return root;
  };

  const [mindmapData, setMindmapData] = useState(() => {
    const raw = activeNoteForViewer?.mindmapData || activeNoteForViewer?.mindMap || null;
    return normalizeMindmap(raw);
  });
  useEffect(() => {
    const raw = activeNoteForViewer?.mindmapData || activeNoteForViewer?.mindMap || null;
    setMindmapData(normalizeMindmap(raw));
    setSelectedNode(null);
  }, [activeNoteForViewer]);
  
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 60, y: 40 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState(null);

  const containerRef = useRef(null);

  const handleMouseDown = (e) => {
    if (e.target.closest('.mm-node')) return;
    setIsPanning(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
  };

  const handleMouseUp = () => setIsPanning(false);

  const zoom = (delta) => {
    setScale(prev => Math.min(Math.max(0.4, prev + delta), 2.2));
  };

  const resetView = () => {
    setScale(1);
    setPan({ x: 60, y: 40 });
  };

  const toggleNodeExpand = (nodeId) => {
    const toggleRecursive = (node) => {
      if (node.id === nodeId) {
        return { ...node, expanded: !node.expanded };
      }
      if (node.children) {
        return { ...node, children: node.children.map(toggleRecursive) };
      }
      return node;
    };
    setMindmapData(prev => toggleRecursive(prev));
  };

  const handleAddSubnode = () => {
    const title = prompt('Enter subnode title:', 'Key Concept');
    if (!title || !title.trim()) return;

    const parentId = selectedNode ? selectedNode.id : mindmapData.id;
    const addRecursive = (node) => {
      if (node.id === parentId) {
        const children = node.children || [];
        const newNode = {
          id: `node-${Date.now()}`,
          title: title.trim(),
          color: node.color || 'cyan',
          x: node.x + (node === mindmapData ? 220 : 180),
          y: node.y + (children.length * 60) - 20,
          expanded: true,
          children: []
        };
        return { ...node, expanded: true, children: [...children, newNode] };
      }
      if (node.children) {
        return { ...node, children: node.children.map(addRecursive) };
      }
      return node;
    };

    setMindmapData(prev => addRecursive(prev));
    showToast(`Added subnode "${title}"!`, 'success');
  };

  // Collect all nodes and connection lines for rendering
  const nodes = [];
  const lines = [];

  const visitedNodes = new Set();
  const traverse = (node, parent = null) => {
    if (!node || visitedNodes.has(node.id)) return;
    visitedNodes.add(node.id);
    nodes.push({ node, parent });
    if (parent) {
      lines.push({ from: parent, to: node });
    }
    if (node.children && node.expanded !== false) {
      node.children.forEach(child => traverse(child, node));
    }
  };
  if (mindmapData) traverse(mindmapData);
  if (mindmapData?.graphEdges?.length) {
    const visibleById = new Map(nodes.map(({ node }) => [node.id, node]));
    lines.splice(0, lines.length, ...mindmapData.graphEdges
      .map(edge => ({ from: visibleById.get(edge.source), to: visibleById.get(edge.target) }))
      .filter(link => link.from && link.to));
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Studio Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>
            🧠 Interactive Mindmap Studio
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Visual hierarchy generated from: <strong>{activeNoteForViewer?.title || 'Select a note with a mindmap'}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn-secondary" onClick={() => zoom(0.15)} title="Zoom In">🔍 +</button>
          <button className="btn-secondary" onClick={() => zoom(-0.15)} title="Zoom Out">🔍 -</button>
          <button className="btn-secondary" onClick={resetView} title="Reset View">🎯 Center</button>
          <button className="btn-primary" onClick={handleAddSubnode}>+ Add Subnode</button>
        </div>
      </div>

      {!mindmapData ? <div style={{ padding: 32, color: 'var(--text-secondary)' }}>Open a generated note with mindmap data from Notes to visualize its concepts.</div> : null}

      {/* SVG & Node Canvas Container */}
      {mindmapData && <>
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          width: '100%',
          height: '620px',
          background: 'var(--canvas-bg)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          position: 'relative',
          overflow: 'hidden',
          cursor: isPanning ? 'grabbing' : 'grab',
          boxShadow: 'var(--shadow-md)',
          backgroundImage: 'radial-gradient(var(--grid-dot-color) 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
          animation: 'descentFadeIn 0.4s ease forwards'
        }}
      >
        {/* Connection Curves SVG Layer */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        >
          {lines.map((link, idx) => {
            const pX = link.from.x * scale + pan.x + (link.from === mindmapData ? 120 : 80);
            const pY = link.from.y * scale + pan.y + 20;
            const cX = link.to.x * scale + pan.x;
            const cY = link.to.y * scale + pan.y + 20;

            const dx = cX - pX;
            const cp1X = pX + dx * 0.5;
            const cp1Y = pY;
            const cp2X = pX + dx * 0.5;
            const cp2Y = cY;

            return (
              <path
                key={idx}
                d={`M ${pX} ${pY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${cX} ${cY}`}
                fill="none"
                stroke={link.to.color ? `var(--brand-${link.to.color}, #6366f1)` : '#6366f1'}
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.85"
              />
            );
          })}
        </svg>

        {/* Nodes Layer */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: '0 0'
          }}
        >
          {nodes.map(({ node }) => {
            const isRoot = node === mindmapData;
            const isSelected = selectedNode?.id === node.id;

            return (
              <div
                key={node.id}
                className="mm-node"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNode(node);
                }}
                style={{
                  position: 'absolute',
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  background: isRoot 
                    ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' 
                    : 'var(--canvas-node-bg)',
                  color: isRoot ? '#ffffff' : 'var(--canvas-node-text)',
                  border: isSelected 
                    ? '2px solid #38bdf8' 
                    : (isRoot ? 'none' : `2px solid var(--border-medium)`),
                  borderRadius: isRoot ? 'var(--radius-lg)' : 'var(--radius-md)',
                  padding: isRoot ? '14px 22px' : '10px 16px',
                  boxShadow: isRoot ? '0 8px 24px rgba(99, 102, 241, 0.4)' : 'var(--shadow-md)',
                  fontWeight: 600,
                  fontSize: isRoot ? '1.05rem' : '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                  zIndex: isSelected ? 10 : 2
                }}
              >
                <span>{node.title}</span>

                {node.children && node.children.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNodeExpand(node.id);
                    }}
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--brand-primary)',
                      color: '#ffffff',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem',
                      cursor: 'pointer',
                      marginLeft: '4px'
                    }}
                  >
                    {node.expanded !== false ? '−' : '+'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      </>}
    </div>
  );
}
