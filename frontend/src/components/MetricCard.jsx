import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const MetricCard = ({ title, value, icon: Icon, trend, trendValue, color, sparklineData }) => {
  const isPositive = trend === 'up';
  
  return (
    <div style={{ padding: '1.25rem' }} className="glass-panel hover-lift">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>{title}</p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>{value}</h3>
        </div>
        <div style={{ background: `${color}20`, padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
          <Icon size={20} color={color} />
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: isPositive ? 'var(--accent-green)' : 'var(--accent-red)', fontSize: '0.875rem', fontWeight: 500 }}>
          {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          <span>{trendValue}%</span>
          <span style={{ color: 'var(--text-dark)', marginLeft: '0.25rem' }}>vs last week</span>
        </div>
        
        {sparklineData && (
          <div style={{ width: '60px', height: '30px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
