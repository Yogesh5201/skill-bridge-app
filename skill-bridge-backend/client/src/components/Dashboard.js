import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import Sidebar from './Sidebar';

function Dashboard({ user }) {
  const [matches, setMatches] = useState([]);
  const [connections, setConnections] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState("All");
  const [filterMinMatch, setFilterMinMatch] = useState(0);
  const [refresh, setRefresh] = useState(false);

  // --- 1. FETCH DATA (Runs on load + every 5 seconds) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, connRes] = await Promise.all([
          API.get('/users'),
          API.get(`/connect/${user._id}`).catch(() => ({ data: [] }))
        ]);

        // Filter out yourself
        const others = usersRes.data.filter(u => u._id !== user._id);
        
        // Format users
        const formattedMatches = others.map(u => ({
          ...u,
          skillsOffered: u.skillsOffered || u.skills || [],
          skillsWanted: u.skillsWanted || u.interests || [],
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

    // Auto-refresh every 5 seconds so you see new requests!
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);

  }, [user._id, refresh]);

  // --- ACTIONS ---
  const handleConnect = async (recipientId) => {
    try {
      await API.post('/connect/request', { requesterId: user._id, recipientId });
      setRefresh(p => !p); // Trigger immediate reload
    } catch (err) {
      alert(err.response?.data?.message || "Could not send request");
    }
  };
  
  const handleAccept = async (connectionId) => {
    try {
      await API.put('/connect/accept', { connectionId });
      setRefresh(p => !p);
    } catch (err) { console.error(err); }
  };

  // --- THE FIX: ROBUST ID CHECKER ---
  const getId = (field) => {
    if (!field) return "";
    return typeof field === 'object' ? field._id : field;
  };

  const getActionState = (partnerId) => {
    if (!connections.length) return { type: 'none' };
    
    // STRICT STRING COMPARISON (Fixes the "Nothing Changed" bug)
    const conn = connections.find(c => 
      String(getId(c.requester)) === String(partnerId) || 
      String(getId(c.recipient)) === String(partnerId)
    );

    if (!conn) return { type: 'none' };
    
    const myId = String(user._id);
    const isRequester = String(getId(conn.requester)) === myId;

    if (conn.status === 'pending') {
      return isRequester ? { type: 'sent' } : { type: 'needs_accept', id: conn._id };
    }
    if (conn.status === 'accepted') {
      const partnerObj = isRequester ? conn.recipient : conn.requester;
      // Handle case where partner might be populated or just an ID
      const pName = partnerObj && partnerObj.username ? partnerObj.username : "Partner";
      
      return { 
        type: 'connected', 
        id: conn._id, 
        partnerName: pName
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
          {/* Filters... */}
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select className="search-input" style={{width: '130px'}} value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <label style={{fontSize: '0.85rem', fontWeight: '600', color: '#6b7280'}}>Min Match: {filterMinMatch}%</label>
              <input type="range" min="0" max="100" step="5" value={filterMinMatch} onChange={(e) => setFilterMinMatch(Number(e.target.value))} />
            </div>
            <div className="search-container">
              <span style={{position:'absolute', left:'12px', top:'10px'}}>🔍</span>
              <input type="text" className="search-input" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
                      <img src={`https://ui-avatars.com/api/?name=${match.username}&background=random`} className="avatar" alt=""/>
                      <div>
                        <div style={{fontWeight:'700', fontSize:'1.1rem'}}>{match.username}</div>
                        <div style={{fontSize:'0.85rem', color:'#6b7280'}}>{match.role || 'Member'} • {match.gender}</div>
                      </div>
                    </div>
                    {match.score > 80 && <span className="match-score">{match.score}% Match</span>}
                  </div>
                  
                  <div className="tags-section">
                    <div className="tags-label" style={{color: '#4f46e5'}}>Teaches</div>
                    <div className="tags-row">
                      {(match.skillsOffered.length > 0 ? match.skillsOffered : ['None']).map((s, i) => <span key={i} className="tag teach">{s}</span>)}
                    </div>
                  </div>
                  
                  <div className="tags-section" style={{marginTop: '10px'}}>
                    <div className="tags-label" style={{color: '#db2777'}}>Wants To Learn</div>
                    <div className="tags-row">
                      {(match.skillsWanted.length > 0 ? match.skillsWanted : ['None']).map((s, i) => <span key={i} className="tag want">{s}</span>)}
                    </div>
                  </div>

                  {/* BUTTONS LOGIC */}
                  <div style={{ marginTop: 'auto', paddingTop: '15px' }}>
                    {status.type === 'none' && (
                      <button className="btn btn-primary" style={{width:'100%'}} onClick={() => handleConnect(match._id)}>Connect Request</button>
                    )}
                    
                    {/* BUTTON STATE: SENT */}
                    {status.type === 'sent' && (
                      <button className="btn" style={{width:'100%', background:'#d1fae5', color:'#065f46', border: '1px solid #10b981', cursor: 'default'}} disabled>
                        ✓ Request Sent
                      </button>
                    )}
                    
                    {/* BUTTON STATE: ACCEPT */}
                    {status.type === 'needs_accept' && (
                      <button className="btn btn-primary" style={{width:'100%', background: '#4f46e5'}} onClick={() => handleAccept(status.id)}>
                        📩 Accept Request
                      </button>
                    )}
                    
                    {/* BUTTON STATE: MESSAGE */}
                    {status.type === 'connected' && (
                      <Link to="/chat" state={{ partnerName: status.partnerName, connectionId: status.id }} style={{textDecoration:'none'}}>
                         <button className="btn btn-outline" style={{width:'100%'}}>💬 Message</button>
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