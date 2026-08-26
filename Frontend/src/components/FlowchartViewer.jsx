import React, { useState } from 'react';
import { useNotes } from '../context/NotesContext';
import { STARTER_NOTES } from '../data/starterData';

export default function FlowchartViewer() {
  const { activeNoteForViewer, showToast } = useNotes();

  const initialFlow = activeNoteForViewer?.flowchartData || STARTER_NOTES[0].flowchartData;
  const [flowchartData, setFlowchartData] = useState(initialFlow);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [isSimulating, setIsSimulating] = useState(false);

  const runSimulation = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    showToast('Starting Workflow Simulation...', 'info');

    const steps = [0, 1, 2, 4, 5];
    for (let idx of steps) {
      setActiveStepIndex(idx);
      const node = flowchartData.nodes[idx];
      showToast(`▶ ${node.step}: ${node.title}`, 'info');
      await new Promise(r => setTimeout(r, 1100));
    }

    showToast('✨ Flow execution completed successfully!', 'success');
    setIsSimulating(false);
  };

  const resetSimulation = () => {
    setActiveStepIndex(-1);
    showToast('Simulation reset', 'info');
  };

  const addStep = () => {
    const title = prompt('Enter Step Title:', 'Security Verification');
    if (!title || !title.trim()) return;

    const lastNode = flowchartData.nodes[flowchartData.nodes.length - 1];
    const newNode = {
      id: `fn-${Date.now()}`,
      step: `Step ${flowchartData.nodes.length + 1}`,
      title: title.trim(),
      type: 'process',
      x: (lastNode ? lastNode.x : 80) + 40,
      y: (lastNode ? lastNode.y : 80) + 140,
      desc: 'Custom process step'
    };

    setFlowchartData(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      connections: [...prev.connections, { from: lastNode.id, to: newNode.id, label: 'Next' }]
    }));
    showToast(`Added ${newNode.step}`, 'success');
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800 }}>
            🔀 Workflow Flowchart Studio
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Interactive process flow: <strong>{flowchartData.title}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn-primary"
            onClick={runSimulation}
            disabled={isSimulating}
            style={{ opacity: isSimulating ? 0.7 : 1 }}
          >
            ▶ Run Flow Simulation
          </button>
          <button className="btn-secondary" onClick={resetSimulation}>↺ Reset</button>
          <button className="btn-secondary" onClick={addStep}>+ Add Step</button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div
        style={{
          width: '100%',
          height: '560px',
          background: 'var(--canvas-bg)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          position: 'relative',
          overflow: 'auto',
          boxShadow: 'var(--shadow-md)',
          backgroundImage: 'radial-gradient(var(--grid-dot-color) 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
          padding: '40px',
          animation: 'descentFadeIn 0.4s ease forwards'
        }}
      >
        {/* SVG Connectors Layer */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '1200px',
            height: '600px',
            pointerEvents: 'none'
          }}
        >
          <defs>
            <marker id="flow-arrow-head" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="var(--brand-primary, #6366f1)" />
            </marker>
          </defs>

          {flowchartData.connections.map((conn, idx) => {
            const fromNode = flowchartData.nodes.find(n => n.id === conn.from);
            const toNode = flowchartData.nodes.find(n => n.id === conn.to);
            if (!fromNode || !toNode) return null;

            const fX = fromNode.x + 160;
            const fY = fromNode.y + 35;
            const tX = toNode.x;
            const tY = toNode.y + 35;

            const midX = fX + (tX - fX) / 2;
            const d = `M ${fX} ${fY} C ${midX} ${fY}, ${midX} ${tY}, ${tX} ${tY}`;

            return (
              <g key={idx}>
                <path
                  d={d}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2.2"
                  strokeDasharray="6, 4"
                  markerEnd="url(#flow-arrow-head)"
                  style={{ animation: 'flowDash 1.2s linear infinite' }}
                />
                {conn.label && (
                  <text
                    x={(fX + tX) / 2}
                    y={(fY + tY) / 2 - 8}
                    fill="var(--text-muted)"
                    fontSize="11"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    {conn.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Flowchart Nodes */}
        {flowchartData.nodes.map((node, idx) => {
          const isActive = activeStepIndex === idx;

          let typeStyles = {
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--border-medium)',
            background: 'var(--canvas-node-bg)'
          };

          if (node.type === 'terminal') {
            typeStyles.borderRadius = 'var(--radius-full)';
            typeStyles.borderColor = '#6366f1';
          } else if (node.type === 'decision') {
            typeStyles.borderColor = '#f59e0b';
            typeStyles.background = 'rgba(245, 158, 11, 0.12)';
          } else if (node.type === 'success') {
            typeStyles.borderColor = '#10b981';
            typeStyles.background = 'rgba(16, 185, 129, 0.12)';
          }

          return (
            <div
              key={node.id}
              onClick={() => {
                setActiveStepIndex(idx);
                showToast(`${node.step}: ${node.title}`, 'info');
              }}
              style={{
                position: 'absolute',
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: '180px',
                padding: '12px 16px',
                color: 'var(--canvas-node-text)',
                boxShadow: isActive ? '0 0 24px rgba(99, 102, 241, 0.6)' : 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                cursor: 'pointer',
                userSelect: 'none',
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                transition: 'all var(--transition-fast)',
                zIndex: isActive ? 10 : 2,
                ...typeStyles
              }}
            >
              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase' }}>
                {node.step}
              </span>
              <strong style={{ fontSize: '0.9rem', lineHeight: 1.3 }}>{node.title}</strong>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>{node.desc}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
