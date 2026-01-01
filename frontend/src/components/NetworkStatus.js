import React, { useState, useEffect } from 'react';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowToast(true);
      // Hide toast after 3 seconds
      setTimeout(() => setShowToast(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowToast(true);
      // Keep offline toast visible until back online
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Hide toast when coming back online
  useEffect(() => {
    if (isOnline && showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, showToast]);

  if (!showToast) return null;

  return (
    <div className={`toast ${isOnline ? 'toast-success' : 'toast-error'}`}>
      {isOnline ? '🔗 Back Online' : '📶 No Internet Connection'}
    </div>
  );
};

export default NetworkStatus;