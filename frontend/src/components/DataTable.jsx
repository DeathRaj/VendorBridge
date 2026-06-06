import React, { useState, useContext } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AppContext } from '../context/AppContext';

const DataTable = ({ headers, data, renderRow, keys, actions, searchKeys }) => {
  const { globalSearch } = useContext(AppContext);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredData = data.filter(item => {
    const term = (globalSearch || searchTerm || '').toLowerCase();
    if (!term) return true;
    if (searchKeys && searchKeys.length > 0) {
      return searchKeys.some(key => 
        String(item[key] || '').toLowerCase().includes(term)
      );
    }
    return Object.values(item).some(val => 
      String(val).toLowerCase().includes(term)
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return sortOrder === 'asc' 
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  return (
    <div className="table-container">
      <div className="table-actions-header">
        <input 
          type="text" 
          placeholder="Filter records..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          className="table-search-input"
        />
        {actions && <div className="table-header-custom-actions">{actions}</div>}
      </div>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th 
                  key={i} 
                  onClick={() => keys && keys[i] && handleSort(keys[i])}
                  style={{ cursor: keys && keys[i] ? 'pointer' : 'default' }}
                >
                  <div className="table-th-content">
                    <span>{h}</span>
                    {keys && keys[i] && sortField === keys[i] && (
                      sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.length > 0 ? (
              sortedData.map((item, idx) => (
                renderRow ? renderRow(item, idx) : (
                  <tr key={idx}>
                    {keys && keys.map((k, j) => (
                      <td key={j}>{String(item[k] || '')}</td>
                    ))}
                  </tr>
                )
              ))
            ) : (
              <tr>
                <td colSpan={headers.length} className="text-center py-4 text-muted">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
