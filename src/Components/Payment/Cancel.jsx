import React from 'react';
import './success.css';

export const Cancel = () => {
  return (
    <div className="cancel-container">
      <h1>Payment Cancelled</h1>
      <p>Oops! Looks like your payment was cancelled.</p>
    </div>
  );
};
