console.log('Background Working');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CANCEL_OUTGOING_REQUESTS') {
    console.log('Background received request to cancel outgoing requests');

    chrome.tabs.create(
      { url: 'https://www.facebook.com/friends/requests' },
      (tab) => {
        const tabId = tab?.id;
        if (!tabId) {
          console.error('Could not create tab');
          sendResponse({ success: false, error: 'Could not create tab' });
          return;
        }

        chrome.tabs.onUpdated.addListener(function listener(
          updatedTabId,
          info
        ) {
          if (updatedTabId === tabId && info.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(listener);

            // Wait 3s then send message to content script
            setTimeout(() => {
              console.log('Sending message to content script in new tab...');
              chrome.tabs.sendMessage(
                tabId,
                {
                  type: 'CANCEL_OUTGOING_REQUESTS',
                },
                (response) => {
                  if (chrome.runtime.lastError) {
                    console.error(
                      'Failed to send message to content script:',
                      chrome.runtime.lastError
                    );
                    sendResponse({
                      success: false,
                      error: 'Failed to communicate with content script',
                    });
                  } else {
                    console.log('Message sent successfully to content script');
                    sendResponse({ success: true });
                  }
                }
              );
            }, 3000);
          }
        });
      }
    );

    return true; // Keep the message channel open for async response
  }

  if (message.type === 'EXTRACT_GROUP_MEMBERS') {
    console.log('Background received request to extract group members');

    // Get the currently active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];

      if (!currentTab?.url?.includes('facebook.com/groups/')) {
        sendResponse({
          success: false,
          error: 'Please navigate to a Facebook group page first',
        });
        return;
      }

      // Send message to content script in current tab
      chrome.tabs.sendMessage(
        currentTab.id!,
        {
          type: 'EXTRACT_GROUP_MEMBERS',
          downloadCSV: message.downloadCSV || false,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error(
              'Failed to send message to content script:',
              chrome.runtime.lastError
            );
            sendResponse({
              success: false,
              error: 'Failed to communicate with content script',
            });
          } else {
            console.log('Group member extraction completed');
            sendResponse(response);
          }
        }
      );
    });

    return true; // Keep the message channel open for async response
  }
});
