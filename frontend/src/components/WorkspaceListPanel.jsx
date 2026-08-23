import { useMemo, useState } from 'react';

export default function WorkspaceListPanel({ workspaces, selectedWorkspaceId, onSelect }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWorkspaces = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return workspaces;
    return workspaces.filter((ws) => ws.name.toLowerCase().includes(query));
  }, [workspaces, searchQuery]);

  return (
    <div className="workspace-list-panel">
      <div className="search-box">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search workspaces..."
        />
      </div>

      <div className="workspace-list">
        {filteredWorkspaces.length === 0 ? (
          <div className="no-workspaces">No workspaces found</div>
        ) : (
          filteredWorkspaces.map((workspace) => (
            <button
              type="button"
              key={workspace._id}
              className={`workspace-item ${selectedWorkspaceId === workspace._id ? 'active' : ''}`}
              onClick={() => onSelect(workspace._id)}
            >
              <span className="workspace-icon">📚</span>
              <span className="workspace-name">{workspace.name}</span>
              <span className="workspace-depth">{workspace.depthLevel}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}