import React from 'react';

const MetricCard = ({ title, value, icon, change, changeType, colorClass = "blue" }) => {
  return (
    <div className={`metric-card border-accent-${colorClass}`}>
      <div className="metric-card-header">
        <span className="metric-title">{title}</span>
        <div className={`metric-icon text-accent-${colorClass}`}>
          {icon}
        </div>
      </div>
      <div className="metric-card-body">
        <h3 className="metric-value">{value}</h3>
      </div>
      {change && (
        <div className="metric-card-footer">
          <span className={`metric-change ${changeType}`}>
            {change}
          </span>
          <span className="metric-change-label"> vs last month</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
