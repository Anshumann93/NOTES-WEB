import React, { useState, useRef, useEffect } from 'react';
import { useNotes } from '../context/NotesContext';
import { STARTER_NOTES } from '../data/starterData';

export default function MindmapViewer() {
  const { activeNoteForViewer, showToast } = useNotes();
  
  // Default to active note's mindmapData or the starter architecture mindmap
  const initialMindmap = activeNoteForViewer?.mindmapData || STARTER_NOTES[0].mindmapData;
  const [mindmapData, setMindmapData] = useState(initialMindmap);
  
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

  const traverse = (node, parent = null) => {
    nodes.push({ node, parent });
    if (parent) {
      lines.push({ from: parent, to: node });
    }
    if (node.children && node.expanded !== false) {
      node.children.forEach(child => traverse(child, node));
    }
  };
  traverse(mindmapData);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Studio Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>
            🧠 Interactive Mindmap Studio
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Visual hierarchy generated from: <strong>{activeNoteForViewer?.title || 'System Architecture Talk'}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="btn-secondary" onClick={() => zoom(0.15)} title="Zoom In">🔍 +</button>
          <button className="btn-secondary" onClick={() => zoom(-0.15)} title="Zoom Out">🔍 -</button>
          <button className="btn-secondary" onClick={resetView} title="Reset View">🎯 Center</button>
          <button className="btn-primary" onClick={handleAddSubnode}>+ Add Subnode</button>
        </div>
      </div>

      {/* SVG & Node Canvas Container */}
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
    </div>
  );
}
