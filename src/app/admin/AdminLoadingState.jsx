import React from 'react';
import './AdminLoadingState.css';

/**
 * Standard Admin Loading State Component
 * Can be rendered as:
 * 1. Default centered view loader
 * 2. Table row loader via <AdminTableLoader colSpan={n} />
 * 3. Stats card skeleton loader via <AdminStatsSkeleton />
 */
export const AdminLoadingState = ({ 
  message = "Fetching property details...", 
  subtext = "Connecting to Cozy Inn management system",
  compact = false 
}) => {
  return (
    <div className={`admin-loader-container ${compact ? 'is-compact' : ''}`}>
      <div className="admin-spinner-ring">
        <div className="spinner-arc"></div>
        <div className="spinner-center-dot"></div>
      </div>
      <div className="admin-loader-text-group">
        <span className="admin-loader-message">{message}</span>
        {subtext && <span className="admin-loader-subtext">{subtext}</span>}
      </div>
    </div>
  );
};

export const AdminTableLoader = ({ 
  colSpan = 7, 
  message = "Loading records...", 
  subtext = "Syncing with property database" 
}) => {
  return (
    <tr className="admin-table-loading-row">
      <td colSpan={colSpan}>
        <div className="admin-table-loader-wrap">
          <div className="admin-spinner-ring mini">
            <div className="spinner-arc"></div>
            <div className="spinner-center-dot"></div>
          </div>
          <div className="admin-loader-text-group">
            <span className="admin-loader-message">{message}</span>
            {subtext && <span className="admin-loader-subtext">{subtext}</span>}
          </div>
        </div>
      </td>
    </tr>
  );
};

export const AdminStatsSkeleton = ({ count = 3 }) => {
  return (
    <div className="admin-stats-skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="admin-stat-skeleton-card">
          <div className="skeleton-content">
            <div className="skeleton-shimmer skeleton-label"></div>
            <div className="skeleton-shimmer skeleton-value"></div>
            <div className="skeleton-shimmer skeleton-trend"></div>
          </div>
          <div className="skeleton-shimmer skeleton-icon"></div>
        </div>
      ))}
    </div>
  );
};

export default AdminLoadingState;
