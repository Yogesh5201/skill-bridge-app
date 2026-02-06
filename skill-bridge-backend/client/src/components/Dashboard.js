import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import Sidebar from './Sidebar';

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
        // 1. Fetch Users (Reliable endpoint)
        // 2. Fetch Connections (If connection logic exists)
        const [usersRes, connRes] = await Promise.all([
          API.get('/users'),
          API.get(`/connect/${user._id}`).catch(() => ({ data: [] })) // Fallback if connect route missing
        ]);

        // Filter out current user
        const others = usersRes.data.filter(u => u._id !== user._id);

        // Format them to match your design expectations
        const formattedMatches = others.map(u => ({
          ...u,
          // Handle both old and new field names
          skillsOffered: u.skillsOffered || u.skills || [],
          skillsWanted: u.skillsWanted || u.interests || [],
          // Add a mock score for visual flair (or calculate real logic here)
          score: Math.floor(Math.random() * (98 - 60 + 1) + 60), 
          gender: u.gender || 'Other'
        }));

        setMatches(formattedMatches);
        setConnections(connRes.data || []);

      } catch (err) { 
        console.error("Dashboard Load Error:", err); 
      }
    };
    fetchData();
  }, [user._id, refresh]);

  // Actions
  const handleConnect = async (recipientId) => {
    try {
      await API.post('/connect/request', { requesterId: user._id, recipientId });
      alert("Request Sent!");
      setRefresh(p => !p);
    } catch (err) {
      alert("Could not send request.");
    }
  };
  
  const handleAccept = async (connectionId) => {
    try {
      await API.put('/connect/accept', { connectionId });
      setRefresh(p => !p);
    } catch (err) {
      console.error(err);
    }
  };

  const getActionState = (partnerId) => {
    if (!connections.length) return { type: 'none' };
    
    const conn = connections.find(c => 
      (c.requester?._id === partnerId || c.requester === partnerId) || 
      (c.recipient?._id === partnerId || c.recipient === partnerId)
    );

    if (!conn) return { type: 'none' };
    
    const isRequester = (conn.requester._id || conn.requester) === user._id;

    if (conn.status === 'pending') {
      return isRequester ? { type: 'sent' } : { type: 'needs_accept', id: conn._id };
    }
    if (conn.status === 'accepted') {
      return { 
        type: 'connected', 
        id: conn._id, 
        partnerName: isRequester ? (conn.recipient.username || "Partner") : (conn.requester.username || "Partner") 
      };
    }
    return { type: 'none' };
  };

  // --- FILTER LOGIC ---
  const filteredMatches = matches.filter(m => {
    const matchesSearch = (m.username || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = filterGender === "All" || (m.gender === filterGender);
    const matchesScore = m.score >= filterMinMatch;
    
    return matchesSearch && matchesGender && matchesScore;
  });

  return (
    <div className="app-layout">
      <Sidebar user={user} />

      <main className="main-content">
        <div className="header-row">
          <div className="page-title">
            <h2>Find a Partner 🚀</h2>
            <p>Connect with people to swap skills.</p>
          </div>
          
          {/* FILTER CONTROLS */}
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            
            {/* Gender Filter */}
            <select 
              className="search-input" 
              style={{width: '130px'}}
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
                type="text" className="search-input" placeholder="Search users..." 
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="grid-container">
          {filteredMatches.length === 0 ? (
            <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666'}}>
              <h3>No matches found 🧐</h3>
              <p>Try adjusting your filters or search term.</p>
            </div>
          ) : (
            filteredMatches.map(match => {
              const status = getActionState(match._id);
              return (
                <div key={match._id} className="card">
                  <div className="card-header">
                    <div className="user-info">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${match.username}&background=random`} 
                        className="avatar" 
                        alt=""
                      />
                      <div>
                        <div style={{fontWeight:'700', fontSize:'1.1rem'}}>{match.username}</div>
                        <div style={{fontSize:'0.85rem', color:'#6b7280'}}>
                          {match.role || 'Member'} • {match.gender}
                        </div>
                      </div>
                    </div>
                    {match.score > 80 && <span className="match-score">{match.score}% Match</span>}
                  </div>

                  <div className="tags-section">
                    <div className="tags-label" style={{color: '#4f46e5'}}>Teaches</div>
                    <div className="tags-row">
                      {match.skillsOffered.length > 0 ? (
                        match.skillsOffered.map((s, i) => <span key={i} className="tag teach">{s}</span>)
                      ) : (
                        <span style={{fontSize:'0.8rem', color:'#999'}}>No skills listed</span>
                      )}
                    </div>
                  </div>

                  {/* Added "Wants To Learn" for completeness */}
                  <div className="tags-section" style={{marginTop: '10px'}}>
                    <div className="tags-label" style={{color: '#db2777'}}>Wants To Learn</div>
                    <div className="tags-row">
                      {match.skillsWanted.length > 0 ? (
                        match.skillsWanted.map((s, i) => <span key={i} className="tag want">{s}</span>)
                      ) : (
                        <span style={{fontSize:'0.8rem', color:'#999'}}>No interests listed</span>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '15px' }}>
                    {status.type === 'none' && (
                      <button className="btn btn-primary" style={{width:'100%'}} onClick={() => handleConnect(match._id)}>
                        Connect Request
                      </button>
                    )}
                    {status.type === 'sent' && (
                      <button className="btn" style={{width:'100%', background:'#e5e7eb', color:'#666'}} disabled>
                        Request Sent
                      </button>
                    )}
                    {status.type === 'needs_accept' && (
                      <button className="btn btn-primary" style={{width:'100%'}} onClick={() => handleAccept(status.id)}>
                        Accept Request
                      </button>
                    )}
                    {status.type === 'connected' && (
                      <Link to="/chat" state={{ partnerName: status.partnerName, connectionId: status.id }} style={{textDecoration:'none'}}>
                         <button className="btn btn-outline" style={{width:'100%'}}>Message</button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;