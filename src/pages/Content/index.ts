import './progressPopup';

console.log('Content Working');

import { sendFriendRequests } from './friendRequestAutomation';
import {
  cancelPendingRequests,
  cancelOutgoingRequests,
} from './cancelPendingRequests';
import {
  handleGroupMemberExtraction,
  downloadGroupDataAsCSV,
} from './groupMemberExtraction';

// Import debug utilities (makes them available in console)
import '../../services/debugGroupAPI';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Content script received message:', message);

  if (message.type === 'START_FRIEND_REQUESTS') {
    sendFriendRequests(
      message.keywords,
      message.maxRequests,
      message.delayTime
    );
  }
  if (message.type === 'CANCEL_PENDING_REQUESTS') {
    console.log('Executing cancel pending requests...');
    cancelPendingRequests();
  }
  if (message.type === 'CANCEL_OUTGOING_REQUESTS') {
    console.log('Executing cancel outgoing requests...');
    cancelOutgoingRequests()
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error('Error in cancelOutgoingRequests:', error);
        sendResponse({ success: false, error: String(error) });
      });
    return true; // Keep message channel open for async response
  }
  if (message.type === 'EXTRACT_GROUP_MEMBERS') {
    console.log('Executing group member extraction...');
    handleGroupMemberExtraction()
      .then((groupData) => {
        if (groupData) {
          sendResponse({ success: true, data: groupData });

          // Optionally auto-download CSV
          if (message.downloadCSV) {
            downloadGroupDataAsCSV(groupData);
          }
        } else {
          sendResponse({
            success: false,
            error: 'Failed to extract group data',
          });
        }
      })
      .catch((error) => {
        console.error('Error in group member extraction:', error);
        sendResponse({ success: false, error: String(error) });
      });
    return true; // Keep message channel open for async response
  }
  if (message.type === 'DOWNLOAD_GROUP_CSV') {
    console.log('Downloading group data as CSV...');
    try {
      downloadGroupDataAsCSV(message.data);
      sendResponse({ success: true });
    } catch (error) {
      console.error('Error downloading CSV:', error);
      sendResponse({ success: false, error: String(error) });
    }
  }
  if (message.type === 'PAUSE_FRIEND_REQUESTS') {
    chrome.storage.local.set({ isPaused: true });
    if ((window as any).updateFriendProgress)
      (window as any).updateFriendProgress({ paused: true, status: 'Paused' });
  }
  if (message.type === 'RESUME_FRIEND_REQUESTS') {
    chrome.storage.local.set({ isPaused: false });
    if ((window as any).updateFriendProgress)
      (window as any).updateFriendProgress({
        paused: false,
        status: 'Running',
      });
  }
  if (message.type === 'STOP_FRIEND_REQUESTS') {
    (window as any).__stopFriendAutomation = true;
    const popup = document.getElementById('friend-progress-popup');
    if (popup) popup.remove();

    // Remove the FCE friend convert model div
    const fcePopup = document.getElementById('FCE_friend_convert_model');
    if (fcePopup) fcePopup.remove();
  }
});

(window as any).sendFriendRequests = sendFriendRequests;
(window as any).cancelPendingRequests = cancelPendingRequests;
(window as any).cancelOutgoingRequests = cancelOutgoingRequests;

console.log('Scripts loaded. Ready to call from popup React buttons.');
