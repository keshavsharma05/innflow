import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  getBookings, 
  getRooms, 
  updateBooking, 
  createBooking as apiCreateBooking, 
  deleteBooking as apiDeleteBooking,
  saveRoom as apiSaveRoom,
  deleteRoom as apiDeleteRoom,
  invalidateAdminCache
} from '../../services/api';

const AdminDataContext = createContext(null);

export const AdminDataProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch both bookings and rooms together
  const fetchAllAdminData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
      if (invalidateAdminCache) invalidateAdminCache();
    } else {
      // Only set initialLoading on the very first load
      setInitialLoading(true);
    }
    setError(null);

    try {
      const [bookingsData, roomsData] = await Promise.all([
        getBookings(isRefresh),
        getRooms(isRefresh)
      ]);

      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setRooms(Array.isArray(roomsData) ? roomsData : []);
    } catch (err) {
      console.error('[AdminDataProvider] Failed to load data:', err);
      setError('Failed to fetch property details.');
    } finally {
      setInitialLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch on admin portal mount (happens ONCE when entering /admin)
  useEffect(() => {
    fetchAllAdminData(false);
  }, [fetchAllAdminData]);

  // Actions that update state immediately & synchronize all admin tabs
  const assignRoom = async (bookingId, roomNo) => {
    // Optimistic UI update
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, roomNo } : b));
    try {
      await updateBooking(bookingId, { roomNo });
    } catch (err) {
      console.error('[AdminContext] Failed to assign room:', err);
      fetchAllAdminData(true);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    // Optimistic UI update
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    try {
      await updateBooking(bookingId, { status: newStatus });
    } catch (err) {
      console.error('[AdminContext] Failed to update status:', err);
      fetchAllAdminData(true);
    }
  };

  const createBooking = async (bookingPayload) => {
    const res = await apiCreateBooking(bookingPayload);
    if (res.success) {
      // Re-sync bookings
      const updated = await getBookings(true);
      setBookings(Array.isArray(updated) ? updated : []);
      return { success: true };
    }
    return res;
  };

  const removeBooking = async (bookingId) => {
    setBookings(prev => prev.filter(b => b.id !== bookingId));
    try {
      await apiDeleteBooking(bookingId);
    } catch (err) {
      console.error('[AdminContext] Failed to delete booking:', err);
      fetchAllAdminData(true);
    }
  };

  const saveRoom = async (roomData) => {
    const res = await apiSaveRoom(roomData);
    // Refresh rooms list in cache
    const updated = await getRooms(true);
    setRooms(Array.isArray(updated) ? updated : []);
    return res;
  };

  const removeRoom = async (roomId) => {
    setRooms(prev => prev.filter(r => r.id !== roomId && r._id !== roomId));
    try {
      await apiDeleteRoom(roomId);
    } catch (err) {
      console.error('[AdminContext] Failed to delete room:', err);
      fetchAllAdminData(true);
    }
  };

  const refreshAll = () => fetchAllAdminData(true);

  return (
    <AdminDataContext.Provider value={{
      bookings,
      rooms,
      initialLoading,
      isRefreshing,
      error,
      refreshAll,
      assignRoom,
      updateBookingStatus,
      createBooking,
      removeBooking,
      saveRoom,
      removeRoom
    }}>
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
};
