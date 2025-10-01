import React from "react";

const KPICard = ({ title, value, icon }) => (
  <div className="kpi-card">
    {icon && <span className="kpi-icon">{icon}</span>}
    <div className="kpi-title">{title}</div>
    <div className="kpi-value">{value}</div>
  </div>
);

export default KPICard;
