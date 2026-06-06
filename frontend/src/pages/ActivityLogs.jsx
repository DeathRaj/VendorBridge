import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import DataTable from '../components/DataTable';
import { Activity } from 'lucide-react';

const ActivityLogs = () => {
  const { activityLogs } = useContext(AppContext);

  const headers = ['Timestamp', 'User', 'Action Done', 'Remarks'];
  const keys = ['timestamp', 'user', 'action', 'remarks'];

  const renderRow = (log) => (
    <tr key={log.id}>
      <td className="text-muted text-sm" style={{ width: '180px' }}>{log.timestamp}</td>
      <td className="font-medium">{log.user}</td>
      <td className="font-semibold text-accent-blue" style={{ width: '180px' }}>{log.action}</td>
      <td className="text-muted">{log.remarks}</td>
    </tr>
  );

  return (
    <div className="page-content">
      {activityLogs.length > 0 ? (
        <DataTable 
          headers={headers}
          data={activityLogs}
          keys={keys}
          renderRow={renderRow}
        />
      ) : (
        <div className="empty-state py-5 card">
          <Activity size={48} className="text-muted mb-3" />
          <h3>No Activity Logged</h3>
          <p className="text-muted">Activity logs are updated automatically as actions are performed in the ERP.</p>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
