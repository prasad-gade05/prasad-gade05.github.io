import React, { useState, useEffect } from 'react';
import './CurrentTime.css';

const CurrentTime = () => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Time: 12-hour format with AM/PM
  const timeString = dateTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  // Format Date: Month Full, Day Numeric
  const dateString = dateTime.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="current-time-container">
      <span className="time-text">{timeString}</span>
      <span className="date-text">{dateString}</span>
    </div>
  );
};

export default CurrentTime;
