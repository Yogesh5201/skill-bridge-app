import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import Sidebar from './Sidebar'; // Import the new Sidebar

function Dashboard({ user }) {
  const [matches, setMatches] = useState([]);
  const [connections, setConnections] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filters State
  const [filterGender, setFilterGender] = useState("All");
  const [filterMinMatch, setFilterMinMatch] = useState(0);

  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchRes, connRes] = await Promise.all([
          API.get(`/match/${user._id}`),
          API.get(`/connect/${user._id}`)
        ]);

        const allMatches = [
          ...matchRes.data.perfectMatches.map(m => ({ ...m, type: 'perfect', score: 95 })),
          ...matchRes.data.potentialMatches.map(m => ({ ...m, type: 'potential', score: 75 }))
        ];
        setMatches(allMatches);
        setConnections(connRes.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, [user._id, refresh]);

  // Actions
  const handleConnect = async (recipientId) => {
    await API.post('/connect/request', { requesterId: user._id, recipientId });
    setRefresh(p => !p);
  };
  
  const handleAccept = async (connectionId) => {
    await API.put('/connect/accept', { connectionId });
    setRefresh(p => !p);
  };

  const getActionState = (partnerId) => {
    const conn = connections.find(c => c.requester._id === partnerId || c.recipient._id === partnerId);
    if (!conn) return { type: 'none' };
    if (conn.status === 'pending') return conn.requester._id === user._id ? { type: 'sent' } : { type: 'needs_accept', id: conn._id };
    if (conn.status === 'accepted') return { type: 'connected', id: conn._id, partnerName: conn.requester._id === user._id ? conn.recipient.username : conn.requester.username };
    return { type: 'none' };
  };

  // --- FILTER LOGIC ---
  const filteredMatches = matches.filter(m => {
    const matchesSearch = m.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = filterGender === "All" || (m.gender || 'Other') === filterGender;
    const matchesScore = m.score >= filterMinMatch;
    
    return matchesSearch && matchesGender && matchesScore;
  });

  return (
    <div className="app-layout">
      <Sidebar user={user} />

      <main className="main-content">
        <div className="header-row">
          <div className="page-title">
            <h2>Find a Partner</h2>
            <p>Connect with people to swap skills.</p>
          </div>
          
          {/* FILTER CONTROLS */}
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            
            {/* Gender Filter */}
            <select 
              className="search-input" 
              style={{width: '120px'}}
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

            {/* Match % Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <label style={{fontSize: '0.85rem', fontWeight: '600', color: '#6b7280'}}>Min Match: {filterMinMatch}%</label>
              <input 
                type="range" min="0" max="100" step="5" 
                value={filterMinMatch} onChange={(e) => setFilterMinMatch(Number(e.target.value))}
              />
            </div>

            <div className="search-container">
              <span style={{position:'absolute', left:'12px', top:'10px'}}>🔍</span>
              <input 
                type="text" className="search-input" placeholder="Search..." 
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid-container">
          {filteredMatches.length === 0 ? <p>No matches found with these filters.</p> : 
          filteredMatches.map(match => {
            const status = getActionState(match._id);
            return (
              <div key={match._id} className="card">
                <div className="card-header">
                  <div className="user-info">
                    <img src={`https://ui-avatars.com/api/?name=${match.username}&background=random`} className="avatar" alt=""/>
                    <div>
                      <div style={{fontWeight:'700', fontSize:'1.1rem'}}>{match.username}</div>
                      <div style={{fontSize:'0.85rem', color:'#6b7280'}}>{match.role || 'Member'} • {match.gender || 'Other'}</div>
                    </div>
                  </div>
                  {match.score > 80 && <span className="match-score">{match.score}% Match</span>}
                </div>

                <div className="tags-section">
                  <div className="tags-label">Teaches</div>
                  <div className="tags-row">{match.skillsOffered.map(s => <span key={s} className="tag teach">{s}</span>)}</div>
                </div>

                <div style={{ marginTop: 'auto' }}>
                  {status.type === 'none' && <button className="btn btn-primary" onClick={() => handleConnect(match._id)}>Connect Request</button>}
                  {status.type === 'sent' && <button className="btn" disabled>Request Sent</button>}
                  {status.type === 'needs_accept' && <button className="btn btn-primary" onClick={() => handleAccept(status.id)}>Accept Request</button>}
                  {status.type === 'connected' && (
                     <Link to="/chat" state={{ partnerName: status.partnerName, connectionId: status.id }} style={{textDecoration:'none'}}>
                        <button className="btn btn-outline">Message</button>
                     </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;