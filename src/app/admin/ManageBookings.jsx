import React, { useState, useEffect } from 'react';
import { useHotel } from '../../services/HotelContext';
import AdminSidebar from './AdminSidebar';
import { getBookings, createBooking, deleteBooking, getRooms, updateBooking } from '../../services/api';
import { FaCheck, FaPlus, FaTimes, FaSearch, FaEllipsisV } from 'react-icons/fa';
import { RiSearchLine, RiCustomerService2Line, RiCalendarCheckLine, RiInformationLine, RiArrowRightSLine } from 'react-icons/ri';
import { AdminTableLoader } from './AdminLoadingState';
import './ManageBookings.css';

const ManageBookings = () => {
  const { hotelId, currentHotel } = useHotel();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  // OLD CODE
  // const [showAssignModal, setShowAssignModal] = useState(false);
  // NEW CODE
  // showAssignModal removed
  const [showAssignModal, setShowAssignModal] = useState(false); // keeping variable just in case, but unused
  const [activeBooking, setActiveBooking] = useState(null);

  useEffect(() => {
    if (hotelId) {
      fetchBookings();
    }
  }, [hotelId]);

  const fetchBookings = () => {
    setLoading(true);
    getBookings().then(data => {
      setBookings(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this booking?')) {
      deleteBooking(id).then(fetchBookings);
    }
  };

  // OLD CODE
  /*
  const handleAssignSave = (bookingId, roomNumbers) => {
    const roomStr = Array.isArray(roomNumbers) ? roomNumbers.join(', ') : roomNumbers;
    updateBooking(bookingId, { roomNo: roomStr }).then(() => {
      fetchBookings();
      setShowAssignModal(false);
    });
  };
  */

  const todayStr = new Date().toISOString().split('T')[0];

  const handleStatusUpdate = (id, newStatus) => {
    updateBooking(id, { status: newStatus }).then(() => {
      fetchBookings();
    });
  };

  const renderSmartAction = (bk) => {
    /* OLD CODE
    const isNeedsAssignment = !bk.roomNo || 
      (typeof bk.roomNo === 'string' ? bk.roomNo.trim() === '' : bk.roomNo.length === 0);

    if (isNeedsAssignment) {
      return (
        <button className="smart-action-btn assign-now" onClick={() => { setActiveBooking(bk); setShowAssignModal(true); }}>
          Assign Room
        </button>
      );
    }
    */

    switch (bk.status) {
      case 'Pending':
      case 'Booked':
        return (
          <button className="smart-action-btn confirm-now" onClick={() => handleStatusUpdate(bk.id, 'Confirmed')}>
            Confirm Stay
          </button>
        );
      case 'Confirmed':
        if (bk.checkIn === todayStr) {
          return (
            <button className="smart-action-btn checkin-now" onClick={() => handleStatusUpdate(bk.id, 'Checked In')}>
              Check In
            </button>
          );
        }
        return <span className="action-status-label">Awaiting Arrival</span>;
      case 'Checked In':
        return (
          <button className="smart-action-btn checkout-now" onClick={() => handleStatusUpdate(bk.id, 'Checked Out')}>
             Check Out
          </button>
        );
      case 'Checked Out':
      case 'Completed':
        return <span className="action-status-label success">Stay Completed</span>;
      case 'Cancelled':
        return <button className="smart-action-btn reactivate-now" onClick={() => handleStatusUpdate(bk.id, 'Pending')}>Re-activate</button>;
      default:
        return null;
    }
  };
  // OLD CODE
  /*
  const isPendingAssignment = (b) => {
    if (['Completed', 'Cancelled', 'Checked Out'].includes(b?.status)) return false;
    const rNo = String(b?.roomNo || '').trim().toLowerCase();
    return !rNo || rNo.includes('pending') || rNo === 'null' || rNo === '-';
  };
  */

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.guest?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      b.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.roomNo?.toString().includes(searchTerm); // leaving roomNo search as fallback

    if (!matchesSearch) return false;

    if (filter === 'All') return true;
    // OLD CODE: if (filter === 'Needs Assignment') return isPendingAssignment(b);
    if (filter === 'InHouse') return b.status === 'Checked In';
    if (filter === 'Completed') return b.status === 'Completed' || b.status === 'Checked Out';
    return true;
  });

  const [showForm, setShowForm] = useState(false);
  const [newBooking, setNewBooking] = useState({
    guest: '',
    type: '',
    roomNo: '',
    checkIn: '',
    checkOut: '',
    status: 'Booked',
    total: '',
    guests: 1,
    details: []
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    const details = [{ 
      id: Math.random().toString(36).substr(2, 9), 
      name: newBooking.type, 
      quantity: 1, 
      price: Number(newBooking.total) 
    }];
    
    const res = await createBooking({ 
      ...newBooking, 
      details,
      numRooms: 1
    });
    if (res.success) {
      fetchBookings();
      setShowForm(false);
      setNewBooking({ guest: '', type: '', roomNo: '', checkIn: '', checkOut: '', status: 'Booked', total: '', guests: 1, details: [] });
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="manage-bookings-view">
      <header className="admin-top-panel">
          <div className="panel-title">
            <h1>Reservations Dashboard</h1>
            <p>Manage and monitor stays at {currentHotel?.name}</p>
          </div>
          <div className="panel-actions">
            <div className="admin-search-wrap">
              <RiSearchLine />
              <input 
                type="text" 
                placeholder="Search guest or booking ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="add-booking-btn-v2" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : <><FaPlus /> Manual Booking</>}
            </button>
          </div>
        </header>
 
        <section className="admin-stats-overview">
          <div className="admin-filter-pills">
            {/* OLD CODE: ['All', 'Needs Assignment', 'InHouse', 'Completed'].map */}
            {['All', 'InHouse', 'Completed'].map(tab => (
              <button 
                key={tab} 
                className={`filter-pill ${filter === tab ? 'active' : ''}`}
                onClick={() => setFilter(tab)}
              >
                {tab === 'InHouse' ? 'Current In-House' : 
                 tab === 'Completed' ? 'Checkout/Completed' : 'All Bookings'}
                <span className="pill-count">
                  {bookings.filter(b => {
                    if (tab === 'All') return true;
                    // if (tab === 'Needs Assignment') return isPendingAssignment(b);
                    if (tab === 'InHouse') return b.status === 'Checked In';
                    if (tab === 'Completed') return b.status === 'Completed' || b.status === 'Checked Out';
                    return true;
                  }).length}
                </span>
              </button>
            ))}
          </div>
        </section>

        {showForm && (
          <form className="admin-form-section" onSubmit={handleCreate}>
            <div className="form-grid">
              <input type="text" placeholder="Guest Name" required value={newBooking.guest} onChange={e => setNewBooking({...newBooking, guest: e.target.value})} />
              <select required value={newBooking.type} onChange={e => setNewBooking({...newBooking, type: e.target.value})}>
                <option value="">Select Category</option>
                {currentHotel?.rooms?.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
              </select>
              <input type="date" required value={newBooking.checkIn} onChange={e => setNewBooking({...newBooking, checkIn: e.target.value})} />
              <input type="date" required value={newBooking.checkOut} onChange={e => setNewBooking({...newBooking, checkOut: e.target.value})} />
              <input type="number" placeholder="Guests" required min="1" value={newBooking.guests} onChange={e => setNewBooking({...newBooking, guests: Number(e.target.value)})} />
              <input type="number" placeholder="Total Bill ($)" required value={newBooking.total} onChange={e => setNewBooking({...newBooking, total: e.target.value})} />
            </div>
            <button type="submit" className="btn-submit">Save Booking</button>
          </form>
        )}

        <section className="admin-table-v2-container">
          <table className="admin-table-v2">
            <thead>
              <tr>
                <th>Guest & ID</th>
                <th>Categories</th>
                <th>Qty</th>
                <th>Room Selection</th>
                <th>Stay Dates</th>
                <th>Status</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <AdminTableLoader 
                  colSpan={8} 
                  message="Fetching reservations..." 
                  subtext="Loading guest details, room allocations & stay dates" 
                />
              ) : filteredBookings.length === 0 ? (
                <tr><td colSpan="8" style={{textAlign: 'center', padding: '60px', color: '#a0aec0'}}>No reservations found matching your criteria.</td></tr>
              ) : (
                filteredBookings.map(bk => (
                  <tr key={bk.id}>
                    <td>
                      <div className="guest-info-v2">
                        <span className="guest-name">{bk.guest}</span>
                        <span className="booking-id-mini">#{bk.id}</span>
                      </div>
                    </td>
                    <td>
                      <div className="room-type-info-v2">
                        {bk.details && bk.details.length > 0 ? bk.details.map((item, idx) => (
                          <span key={idx} className="breakdown-badge-v2">
                            {item.quantity}x {item.name}
                          </span>
                        )) : (
                          <span className="breakdown-badge-v2">{bk.roomName || bk.type}</span>
                        )}
                      </div>
                    </td>
                    <td><strong style={{color: '#4a5568'}}>{bk.numRooms || 1}</strong></td>
                    <td>
                      <div className="assignment-cell-v2">
                        {/* OLD CODE
                        {bk.roomNo ? (
                          <>
                            <div className="room-numbers-row">
                              {String(bk.roomNo).split(', ').filter(r => r).map(rn => (
                                <span key={rn} className="room-tag-v2">{rn}</span>
                              ))}
                            </div>
                            <button className="btn-edit-rooms-v2" onClick={() => { setActiveBooking(bk); setShowAssignModal(true); }}>
                              Change Rooms
                            </button>
                          </>
                        ) : (
                          <button className="assign-needed-v2" onClick={() => { setActiveBooking(bk); setShowAssignModal(true); }}>
                            Assign Room
                          </button>
                        )}
                        */}
                        {/* NEW CODE: Display direct room/number if available, otherwise fallback */}
                        <div className="room-numbers-row">
                          <span className="room-tag-v2">{bk.roomNo || bk.roomId || 'Unknown'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="stay-dates-v2">
                        <p style={{margin:0, fontWeight: 700, fontSize: '13px'}}>{bk.checkIn}</p>
                        <RiArrowRightSLine style={{fontSize: '10px', color: '#cbd5e0'}}/>
                        <p style={{margin:0, fontWeight: 700, fontSize: '13px'}}>{bk.checkOut}</p>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill-v2 ${bk.status.toLowerCase().replace(' ', '')}`}>
                        {bk.status}
                      </span>
                    </td>
                    <td><strong style={{fontSize: '16px', color: '#1a202c'}}>${bk.total}</strong></td>
                    <td>
                      <div className="action-cell-v2">
                        {renderSmartAction(bk)}
                        <button className="btn-delete-v2" onClick={() => handleDelete(bk.id)} title="Delete Record">
                          <FaTimes />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

      {/* OLD CODE
      {showAssignModal && activeBooking && (
        <RoomAssignmentModal 
          booking={activeBooking} 
          allBookings={bookings}
          hotelId={hotelId}
          onClose={() => setShowAssignModal(false)} 
          onSave={handleAssignSave}
        />
      )}
      */}
    </div>
  );
};

// OLD CODE
// const RoomAssignmentModal = ({ booking, allBookings, hotelId, onClose, onSave }) => {
//   const [inventory, setInventory] = useState([]);
//   
//   useEffect(() => {
//     if (hotelId) {
//       getRooms().then(setInventory);
//     }
//   }, [hotelId]);
// 
//   const isOverlapping = (startA, endA, startB, endB) => {
//     const a1 = new Date(startA);
//     const a2 = new Date(endA);
//     const b1 = new Date(startB);
//     const b2 = new Date(endB);
//     return a1 < b2 && b1 < a2;
//   };
// 
//   const takenRooms = allBookings
//     .filter(b => {
//       const activeStatuses = ['Pending', 'Booked', 'Confirmed', 'Checked In'];
//       return b.id !== booking.id && activeStatuses.includes(b.status) && b.roomNo;
//     })
//     .filter(b => isOverlapping(booking.checkIn, booking.checkOut, b.checkIn, b.checkOut))
//     .flatMap(b => {
//       if (!b.roomNo || b.roomNo === 'undefined') return [];
//       return String(b.roomNo).split(/,\s*/).map(r => r.trim()).filter(r => r && r !== 'undefined');
//     });
// 
//   const categoryRequirements = [];
//   if (booking.details && booking.details.length > 0) {
//     booking.details.forEach(item => {
//       categoryRequirements.push({ name: item.name, qty: item.quantity });
//     });
//   } else {
//     const name = booking.type?.replace(/\d+x /g, '').split(',')[0].trim();
//     categoryRequirements.push({ name: name, qty: booking.numRooms || 1 });
//   }
// 
//   const [assigned, setAssigned] = useState(() => {
//     if (!booking.roomNo || booking.roomNo === 'undefined') return [];
//     return String(booking.roomNo).split(/,\s*/).map(r => r.trim()).filter(r => r && r !== 'undefined');
//   });
// 
//   const handleRoomToggle = (roomNo, category) => {
//     if (!roomNo) return;
//     if (assigned.includes(roomNo)) {
//       setAssigned(assigned.filter(r => r !== roomNo));
//     } else {
//       const currentAssignedForCat = assigned.filter(rNo => {
//         const roomInfo = inventory.find(ri => ri.roomNumber === rNo);
//         return roomInfo && roomInfo.name === category;
//       });
//       const limit = categoryRequirements.find(c => c.name === category)?.qty || 0;
//       if (currentAssignedForCat.length < limit) {
//         setAssigned([...assigned, roomNo]);
//       }
//     }
//   };
// 
//   const totalRoomsNeeded = categoryRequirements.reduce((sum, c) => sum + (c.qty || 0), 0);
//   const isSelectionDone = assigned.length === totalRoomsNeeded;
// 
//   return (
//     <div className="assign-modal-v2-overlay">
//       <div className="assign-modal-v2">
//         <header className="modal-v2-header">
//           <h2>Room Assignment</h2>
//           <button className="btn-delete-v2" onClick={onClose}><FaTimes /></button>
//         </header>
//         
//         <div className="modal-v2-body">
//           <div className="modal-v2-sidebar">
//             <p style={{margin: 0, fontSize: '14px', color: '#718096'}}>Assign rooms for <strong>{booking.guest}</strong></p>
//             <p style={{margin: '5px 0 0', fontWeight: 700, color: '#1a202c'}}>{booking.checkIn} — {booking.checkOut}</p>
//             <div style={{marginTop: '15px', color: '#1a202c', fontWeight: 800}}>
//               {assigned.length} / {totalRoomsNeeded} Rooms Assigned
//             </div>
//           </div>
//           
//           <div className="v2-assignment-sections">
//             {categoryRequirements.map((catReq, idx) => {
//               const catRooms = inventory.filter(r => r.name === catReq.name && r.roomNumber);
//               const selectedCount = assigned.filter(rNo => inventory.find(ri => ri.roomNumber === rNo)?.name === catReq.name).length;
//               
//               return (
//                 <div key={idx} className="v2-cat-section" style={{marginBottom: '30px'}}>
//                   <h4 style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
//                     <span>{catReq.name}</span>
//                     <span style={{fontSize: '13px', color: selectedCount === catReq.qty ? '#38a169' : '#e53e3e'}}>
//                       {selectedCount} / {catReq.qty} Selected
//                     </span>
//                   </h4>
//                   <div className="v2-cat-grid">
//                     {catRooms.map(r => {
//                       const isSelected = assigned.includes(r.roomNumber);
//                       const isTaken = takenRooms.includes(r.roomNumber);
//                       
//                       return (
//                         <button 
//                           key={r.roomNumber}
//                           className={`v2-room-card ${isSelected ? 'selected' : ''} ${isTaken ? 'occupied' : ''}`}
//                           onClick={() => !isTaken && handleRoomToggle(r.roomNumber, catReq.name)}
//                           disabled={isTaken || (!isSelected && selectedCount >= catReq.qty)}
//                         >
//                           <span className="r-no">{r.roomNumber}</span>
//                           <span className="r-status">{isSelected ? 'Selected' : isTaken ? 'Occupied' : 'Available'}</span>
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )
//             })}
//           </div>
//         </div>
// 
//         <footer className="modal-v2-footer">
//           <button className="btn-secondary" onClick={onClose}>Cancel</button>
//           <button 
//             className="btn-v2-confirm" 
//             onClick={() => isSelectionDone && onSave(booking.id, assigned)}
//             disabled={!isSelectionDone}
//           >
//             Confirm & Assign
//           </button>
//         </footer>
//       </div>
//     </div>
//   );
// };

export default ManageBookings;

