import React, { useState, useEffect } from 'react';

const ToastMessage = ({ message = '' }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [remainingTime, setRemainingTime] = useState(10); // Initial remaining time in seconds

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime((prevTime) => prevTime - 1); // Decrease remaining time every second
    }, 1000);

    // Clear the interval and hide the toast when time is up
    if (remainingTime === 0) {
      clearInterval(interval);
      setIsVisible(false);
    }

    // Cleanup function to clear interval when component unmounts
    return () => clearInterval(interval);
  }, [remainingTime]);

  return (
    <div>
      {isVisible && (
        <div className="bg-green-600 text-white px-4 py-2 rounded">
          We also recommend uninstalling the current app version and installing the latest version of the eAlpha4 mobile app from the
          <a
            href="https://play.google.com/store/apps/details?id=com.ealpha.tsp.edu&hl=en&gl=US"
            style={{ color: 'white', textDecoration: 'underline', marginLeft: '5px' }}
            target="_blank"
            rel="noopener noreferrer"
          >
            Android
          </a>
          {' '}
          and
          {' '}
          <a
            href="https://apps.apple.com/us/app/ealpha4/id6451000301"
            style={{ color: 'white', textDecoration: 'underline' }}
            target="_blank"
            rel="noopener noreferrer"
          >
            iOS Stores
          </a>
          .
          (
          {' '}
          {remainingTime}
          {' '}
          seconds)
        </div>
      )}
    </div>
  );
};

export default ToastMessage;
