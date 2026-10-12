import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotel } from '../../services/HotelContext';
import { useAdminData } from './AdminContext';
import { FaDollarSign, FaCalendarCheck, FaUsers } from 'react-icons/fa';
import { AdminLoadingState } from './AdminLoadingState';
import './Dashboard.css';

const Dashboard = () => {
  const { currentHotel } = useHotel();
  const { bookings, rooms, initialLoading, assignRoom } = useAdminData();
  const navigate = useNavigate();

  if (initialLoading) {
    return (
      <div className="dashboard-view">
        <header className="admin-top-panel">
          <div className="panel-title">
            <h1>Dashboard Overview</h1>
            <p>Welcome back, <strong>{currentHotel?.name || 'Hotel'} Manager</strong> — initializing management system</p>
          </div>
        </header>
        <AdminLoadingState 
          message="Preparing Executive Dashboard..." 
          subtext="Fetching live reservations, room allocations and revenue overview" 
        />
      </div>
    );
  }

  const activeBookings = Array.isArray(bookings) ? bookings.filter(b => b.status !== 'Cancelled' && b.status !== 'Completed') : [];
  const roomsOccupied = activeBookings.reduce((sum, b) => sum + (b.numRooms || 1), 0);

  const stats = [
    { 
      label: "Total Revenue", 
      value: `$${bookings.reduce((sum, b) => sum + parseInt(String(b.total).replace('$', '') || 0), 0).toLocaleString()}`, 
      icon: <FaDollarSign />, 
      trend: "+12.5%", 
      color: "#b55132" // terracotta
    },
    { 
      label: "Total Rooms", 
      value: rooms.length.toString(), 
      icon: <FaCalendarCheck />, 
      trend: "Physical", 
      color: "#2c2825" // espresso
    },
    { 
      label: "Available Today", 
      value: Math.max(0, rooms.length - roomsOccupied).toString(), 
      icon: <FaUsers />, 
      trend: "Real-time", 
      color: "#d4a373" // warm accent
    },
  ];

  const handleRoomAssignment = (id, newRoomNo) => {
    assignRoom(id, newRoomNo);
  };

  return (
    <div className="dashboard-view">
      <header className="admin-top-panel">
        <div className="panel-title">
          <h1>Dashboard Overview</h1>
          <p>Welcome back, <strong>{currentHotel?.name || 'Hotel'} Manager</strong> — here is your hotel's status today</p>
        </div>
      </header>

        <section className="stats-grid">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className="stat-card-v2"
              style={{ '--accent-color': stat.color }}
            >
              <div className="stat-info-v2">
                <span className="stat-label-v2">{stat.label}</span>
                <h2 className="stat-value-v2">{stat.value}</h2>
                {stat.label === "Total Revenue" ? (
                  <span className="stat-trend-v2" style={{ color: '#10b981' }}>
                    {stat.trend} from last month
                  </span>
                ) : (
                  <span className="stat-trend-v2" style={{ color: '#7a7068' }}>
                    {stat.trend} metrics
                  </span>
                )}
              </div>
              <div className="stat-icon-v2" style={{ backgroundColor: stat.color + '15', color: stat.color }}>
                {stat.icon}
              </div>
            </div>
          ))}
        </section>

      <section className="recent-activity-v2">
        <div className="card-header-v2">
          <h3>Recent Bookings</h3>
          <button className="btn-link-v2" onClick={() => navigate('/admin/bookings')}>View All</button>
        </div>
        <div className="admin-table-v2-container">
          <table className="admin-table-v2">
            <thead>
              <tr>
                <th>Guest & ID</th>
                <th>Room Type</th>
                <th>Qty</th>
                <th>Room Selection</th>
                <th>Check-in</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {!Array.isArray(bookings) || bookings.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-light)' }}>
                    No recent bookings for {currentHotel?.name || 'this hotel'}.
                  </td>
                </tr>
              ) : (
                bookings.slice(0, 5).map(bk => (
                  <tr key={bk.id}>
                    <td>
                      <div className="guest-info-v2">
                        <span className="guest-name">{bk.guest}</span>
                        <span className="booking-id-mini">#BK-{bk.id.substring(0, 5).toUpperCase()}</span>
                      </div>
                    </td>
                    <td>
                      <div className="room-type-info-v2" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {bk.details && bk.details.length > 0 ? (
                          bk.details.map((item, idx) => (
                            <span key={idx} className="breakdown-badge-v2">
                              {item.quantity}x {item.name}
                            </span>
                          ))
                        ) : (
                          <span className="breakdown-badge-v2">
                            {bk.roomName || bk.type || 'Premium Room'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--primary)' }}>{bk.numRooms || 1}</strong>
                    </td>
                    <td>
                      <div className="assignment-cell-v2">
                        <input 
                          type="text" 
                          className="room-assign-input-v2"
                          value={bk.roomNo || ''} 
                          placeholder="Assign Room"
                          onChange={(e) => handleRoomAssignment(bk.id, e.target.value)}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="stay-dates-v2" style={{ border: 'none', background: 'transparent', padding: 0 }}>
                        <span>{bk.checkIn}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill-v2 ${bk.status.toLowerCase().replace(' ', '')}`}>
                        {bk.status}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--primary)', fontSize: '15px' }}>
                        {String(bk.total).startsWith('$') ? bk.total : `$${bk.total}`}
                      </strong>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
