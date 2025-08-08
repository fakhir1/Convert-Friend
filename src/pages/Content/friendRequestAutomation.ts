export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitUntilResume(): Promise<void> {
  return new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      chrome.storage.local.get('isPaused', (data: { isPaused?: boolean }) => {
        if (!data.isPaused) {
          clearInterval(interval);
          resolve();
        } else {
          console.log('Paused... Waiting to resume.');
        }
      });
    }, 1000);
  });
}

export async function waitForAddFriendButtons(
  timeout: number = 15000
): Promise<Element[]> {
  const interval = 500;
  const maxTries = timeout / interval;
  let tries = 0;
  return new Promise<Element[]>((resolve) => {
    const check = setInterval(() => {
      const buttons = Array.from(
        document.querySelectorAll('div[role="button"], span')
      ).filter((el) => el.textContent?.toLowerCase().includes('add friend'));

      if (buttons.length > 0 || tries >= maxTries) {
        clearInterval(check);
        resolve(buttons);
      }

      tries++;
    }, interval);
  });
}

export async function sendFriendRequests(
  keywords: string[],
  maxRequests: number,
  delayTime: number
): Promise<void> {
  let sentCount = 0;
  const processedUsers = new Set<string>();
  let batchNumber = 0;
  (window as any).mountProgressPopup && (window as any).mountProgressPopup();
  (window as any).updateFriendProgress &&
    (window as any).updateFriendProgress({
      status: 'Is sending friend request',
      sent: 0,
      limit: maxRequests,
      scanning: true,
      totalMembers: 0,
      paused: false,
    });

  while (sentCount < maxRequests && !(window as any).__stopFriendAutomation) {
    batchNumber++;
    // 1. Get currently visible Add Friend buttons
    const addFriendButtons = await waitForAddFriendButtons();
    let newButtons = addFriendButtons.filter((btn) => {
      let card: HTMLElement | null = btn as HTMLElement;
      for (let j = 0; j < 6; j++) {
        card = card?.parentElement as HTMLElement | null;
        if (!card) break;
      }
      if (!card) return false;
      const userIdentifier = card.innerText.trim();
      return !processedUsers.has(userIdentifier);
    });

    if (newButtons.length === 0) {
      // Try to scroll and load more
      await scrollToLoadMore(batchNumber);
      // Wait for new batch
      const foundNew = await waitForNewBatch(processedUsers);
      if (!foundNew) {
        // No new users loaded after several attempts
        break;
      }
      continue;
    }

    for (let i = 0; i < newButtons.length; i++) {
      if ((window as any).__stopFriendAutomation) break;
      if (maxRequests && sentCount >= maxRequests) {
        (window as any).updateFriendProgress &&
          (window as any).updateFriendProgress({
            status: `Reached max requests limit: ${maxRequests}. Stopping.`,
            sent: sentCount,
            scanning: false,
          });
        break;
      }

      await new Promise<void>((checkPauseResolve) => {
        chrome.storage.local.get(
          'isPaused',
          async (data: { isPaused?: boolean }) => {
            if (data.isPaused) {
              await waitUntilResume();
            }
            checkPauseResolve();
          }
        );
      });

      const btn = newButtons[i] as HTMLElement;
      let card: HTMLElement | null = btn;
      for (let j = 0; j < 6; j++) {
        card = card?.parentElement as HTMLElement | null;
        if (!card) break;
      }
      if (!card) continue;
      const userIdentifier = card.innerText.trim();
      if (processedUsers.has(userIdentifier)) continue;

      // Gather all possible text fields for matching (role, work, location, etc.)
      const allTextNodes = [
        ...Array.from(card.querySelectorAll('span')),
        ...Array.from(card.querySelectorAll('div')),
      ];
      const match = allTextNodes.find((el) => {
        const text = el.innerText?.toLowerCase().trim();
        if (!text) return false;
        return keywords.some((keyword) => {
          const words = keyword.toLowerCase().split(/\s+/);
          return words.some((word) => word && text.includes(word));
        });
      });
      if (match) {
        (window as any).updateFriendProgress &&
          (window as any).updateFriendProgress({
            status: `Keyword match "${match.innerText}" → Preparing to send request.`,
            sent: sentCount,
          });
        btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        await delay(1000);
        try {
          if (btn.offsetParent !== null) {
            btn.click();
            sentCount++;
            processedUsers.add(userIdentifier);
            (window as any).updateFriendProgress &&
              (window as any).updateFriendProgress({
                status: `Friend request sent to: ${match.innerText}. Total sent: ${sentCount}`,
                sent: sentCount,
              });
          } else {
            (window as any).updateFriendProgress &&
              (window as any).updateFriendProgress({
                status: `Button not visible → Skipped.`,
                sent: sentCount,
              });
          }
        } catch (e) {
          (window as any).updateFriendProgress &&
            (window as any).updateFriendProgress({
              status: `Click failed → ${e}`,
              sent: sentCount,
            });
        }
        await delay(delayTime * 1000);
      } else {
        (window as any).updateFriendProgress &&
          (window as any).updateFriendProgress({
            status: `No keyword match → Skipping.`,
            sent: sentCount,
          });
        processedUsers.add(userIdentifier);
      }
    }
    // After processing batch, scroll to load more
    await scrollToLoadMore(batchNumber);
    // Wait for new batch
    await waitForNewBatch(processedUsers);
  }
  (window as any).updateFriendProgress &&
    (window as any).updateFriendProgress({
      status: `Automation finished. Total requests sent: ${sentCount}`,
      sent: sentCount,
      scanning: false,
    });
  const popup = document.getElementById('friend-progress-popup');
  if (popup) popup.remove();
  chrome.storage.local.set({ isRunning: false });
}

// Helper: Scroll to load more members
async function scrollToLoadMore(batchNumber: number) {
  // Try to scroll the main window or a specific container
  // You may need to adjust the selector for your site
  window.scrollBy({ top: 600 + batchNumber * 100, behavior: 'smooth' });
  await delay(1500); // Wait for new content to load
}

// Helper: Wait for new Add Friend buttons not in processedUsers
async function waitForNewBatch(processedUsers: Set<string>, timeout = 8000): Promise<boolean> {
  const interval = 800;
  const maxTries = Math.ceil(timeout / interval);
  let tries = 0;
  return new Promise((resolve) => {
    const check = setInterval(() => {
      const buttons = Array.from(
        document.querySelectorAll('div[role="button"], span')
      );
      let foundNew = false;
      for (const btn of buttons) {
        let card: HTMLElement | null = btn as HTMLElement;
        for (let j = 0; j < 6; j++) {
          card = card?.parentElement as HTMLElement | null;
          if (!card) break;
        }
        if (!card) continue;
        const userIdentifier = card.innerText.trim();
        if (!processedUsers.has(userIdentifier)) {
          foundNew = true;
          break;
        }
      }
      if (foundNew || tries >= maxTries) {
        clearInterval(check);
        resolve(foundNew);
      }
      tries++;
    }, interval);
  });
}
