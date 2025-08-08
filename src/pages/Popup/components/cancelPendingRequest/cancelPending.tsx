import React, { useState } from 'react';
import './cancelPending.css';

// Extend the Window interface to include cancelPendingRequests
declare global {
  interface Window {
    cancelPendingRequests?: () => Promise<void>;
  }
}

function CancelPending() {
  const [loadingPending, setLoadingPending] = useState(false);
  const [loadingOutgoing, setLoadingOutgoing] = useState(false);

  const handleCancel = async () => {
    setLoadingPending(true);
    console.log('Starting cancel pending requests...');

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (typeof tab?.id !== 'number') {
        throw new Error('Could not find active tab.');
      }

      // Refresh the tab
      await chrome.tabs.reload(tab.id);

      // Wait for the tab to finish loading, then send the message
      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === tab.id && info.status === 'complete') {
          chrome.tabs.sendMessage(tab.id!, {
            type: 'CANCEL_PENDING_REQUESTS',
          });
          chrome.tabs.onUpdated.removeListener(listener);
          setLoadingPending(false);
        }
      });
    } catch (e) {
      alert('An error occurred: ' + e);
      setLoadingPending(false);
    }
  };

  const handleCancelOutgoing = async () => {
    setLoadingOutgoing(true);

    try {
      console.log('Sending message to background script...');
      const response = await chrome.runtime.sendMessage({
        type: 'CANCEL_OUTGOING_REQUESTS',
      });

      if (response?.success) {
        console.log('Outgoing requests cancellation started successfully');
      } else {
        console.error('Failed to start cancellation:', response?.error);
        alert('❌ Failed to start cancellation process. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('❌ Failed to communicate with extension. Please try again.');
    } finally {
      setLoadingOutgoing(false);
    }
  };

  return (
    <div className="cancel-pending-container">
      <h2 className="cancel-pending-title">Cancel Pending Requests</h2>
      <button
        className="cancel-pending-start-btn"
        onClick={handleCancel}
        disabled={loadingPending || loadingOutgoing}
      >
        {loadingPending ? 'Cancelling...' : 'Cancel Pending'}
      </button>
      <hr style={{ margin: '24px 0', width: '100%' }} />
      <h3 style={{ color: '#ff9800', marginBottom: 10 }}>
        Cancel Outgoing Friend Requests
      </h3>
      <button
        className="cancel-pending-start-btn"
        style={{ background: '#ff9800', marginBottom: 10 }}
        onClick={handleCancelOutgoing}
        disabled={loadingPending || loadingOutgoing}
      >
        {loadingOutgoing ? 'Processing...' : 'Cancel Outgoing Requests'}
      </button>
    </div>
  );
}

export default CancelPending;
