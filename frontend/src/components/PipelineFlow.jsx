import React from 'react';
import { GitCommit, Search, PlayCircle, Box, Cloud, Activity, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

const PipelineFlow = ({ currentStep, steps }) => {
  const defaultSteps = [
    { id: 'push', label: 'Code Push', icon: GitCommit },
    { id: 'analysis', label: 'Code Analysis', icon: Search },
    { id: 'cicd', label: 'CI/CD', icon: PlayCircle },
    { id: 'build', label: 'Docker Build', icon: Box },
    { id: 'deploy', label: 'K8s Deploy', icon: Cloud },
    { id: 'monitor', label: 'Monitoring', icon: Activity },
  ];

  const displaySteps = steps || defaultSteps;

  const getStepStatus = (index) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'pending';
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }} className="glass-panel">
      {/* Background connecting line */}
      <div style={{ position: 'absolute', top: '50%', left: '4rem', right: '4rem', height: '2px', background: 'var(--bg-input)', zIndex: 0, transform: 'translateY(-50%)' }}></div>
      
      {/* Active progress line */}
      <div style={{ 
        position: 'absolute', top: '50%', left: '4rem', height: '2px', 
        background: 'var(--accent-blue)', zIndex: 1, 
        width: `calc(${(currentStep / (displaySteps.length - 1)) * 100}% - 4rem)`,
        transition: 'width 0.5s ease',
        transform: 'translateY(-50%)',
        boxShadow: '0 0 10px var(--accent-blue)'
      }}></div>

      {displaySteps.map((step, index) => {
        const status = getStepStatus(index);
        const Icon = step.icon;
        
        let bgColor = 'var(--bg-input)';
        let borderColor = 'var(--border-light)';
        let color = 'var(--text-muted)';
        let glowClass = '';

        if (status === 'completed') {
          bgColor = 'rgba(16, 185, 129, 0.1)';
          borderColor = 'var(--accent-green)';
          color = 'var(--accent-green)';
          glowClass = 'glow-green';
        } else if (status === 'active') {
          bgColor = 'rgba(59, 130, 246, 0.1)';
          borderColor = 'var(--accent-blue)';
          color = 'var(--accent-blue)';
          glowClass = 'glow-blue';
        }

        return (
          <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', zIndex: 2 }}>
            <motion.div 
              whileHover={{ scale: 1.1 }}
              style={{ 
                width: '50px', height: '50px', borderRadius: '50%', 
                background: bgColor, border: `2px solid ${borderColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: color,
                position: 'relative'
              }}
              className={glowClass}
            >
              {status === 'completed' ? <Check size={24} /> : <Icon size={24} />}
              
              {status === 'active' && (
                <motion.div 
                  animate={{ scale: [1, 1.5], opacity: [0.5, 0] }} 
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{ position: 'absolute', inset: -2, borderRadius: '50%', border: '2px solid var(--accent-blue)' }} 
                />
              )}
            </motion.div>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: status === 'pending' ? 'var(--text-muted)' : 'var(--text-main)' }}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default PipelineFlow;
