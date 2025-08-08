import { mountCancelPendingPopup, updateCancelPendingPopup, removeCancelPendingPopup } from './cancelPendingProgressPopup';

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function cancelPendingRequests(): Promise<void> {
  let cancelCount = 0;
  mountCancelPendingPopup();

  while (true) {
    await delay(5000);
    const cancelButtons = Array.from(
      document.querySelectorAll('div[role="button"], span')
    ).filter((el) => el.textContent?.toLowerCase().includes('cancel request'));

    if (cancelButtons.length === 0) {
      console.log('No more Cancel Request buttons found.');
      break;
    }

    const btn = cancelButtons[0] as HTMLElement;
    btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await delay(1000);

    try {
      if (btn.offsetParent !== null) {
        btn.click();
        cancelCount++;
        updateCancelPendingPopup(cancelCount);
        console.log(`Request canceled! Total canceled: ${cancelCount}`);
      } else {
        console.warn(`Button not visible → Skipped.`);
      }
    } catch (e) {
      console.error(`Click failed →`, e);
    }

    await delay(1500);
  }

  console.log('Cancel pending finished. Total canceled:', cancelCount);
  removeCancelPendingPopup();
  // alert(`Cancel pending finished. Total canceled: ${cancelCount}`);
}

export async function cancelOutgoingRequests(): Promise<void> {
  console.log('Starting to cancel outgoing requests...');
  await delay(3000); // Let Facebook settle

  const sentReqBtn = Array.from(
    document.querySelectorAll('div[role="button"]')
  ).find(function (div) {
    const text = div.textContent || '';
    return text.toLowerCase().includes('view sent requests');
  });

  if (!sentReqBtn) {
    console.log("'View sent requests' button not found.");
    return;
  }

  sentReqBtn.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
  (sentReqBtn as HTMLElement).click();
  console.log("✅ Clicked 'View sent requests'");

  await delay(3000);

  // Scroll the sent requests container to the bottom to load all requests
  const dynamicSelector =
    'xb57i2i x1q594ok x5lxg6s x78zum5 xdt5ytf x6ikm8r x1ja2u2z x1pq812k x1rohswg xfk6m8 x1yqm8si xjx87ck xx8ngbg xwo3gff x1n2onr6 x1oyok0e x1odjw0f x1e4zzel x1tbbn4q x1y1aw1k xyri2b xwib8y2 x1c1uobl';
  const dynamicScrollDiv = document.querySelector(
    `.${dynamicSelector.split(' ').join('.')}`
  );

  if (dynamicScrollDiv) {
    console.log('Scrolling to load all requests...');
    const scrollElement = dynamicScrollDiv as HTMLElement;

    // Keep scrolling until we can't scroll anymore
    let previousScrollTop = -1;
    while (true) {
      const currentScrollTop = scrollElement.scrollTop;

      // If scroll position hasn't changed, we've reached the bottom
      if (currentScrollTop === previousScrollTop) {
        console.log('Reached the bottom of the scroll container');
        break;
      }

      previousScrollTop = currentScrollTop;

      // Scroll down by a reasonable amount
      scrollElement.scrollTo({
        top: scrollElement.scrollTop + 1000,
        behavior: 'smooth',
      });

      await delay(2000); // Wait for content to load
    }
  }

  const cancelBtns = Array.from(
    document.querySelectorAll('div[aria-label="Cancel request"]')
  );
  if (!cancelBtns.length) {
    console.warn('No cancel buttons found.');
    return;
  }

  for (let i = 0; i < cancelBtns.length; i++) {
    (cancelBtns[i] as HTMLElement).scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
    (cancelBtns[i] as HTMLElement).click();
    console.log(`❌ Cancelled request #${i + 1}`);
    await delay(1500);
  }

  console.log(`✅ Done. Cancelled ${cancelBtns.length} requests.`);
}

// Helper to wait for an element to appear
async function waitForElement(selector: string, timeout = 10000): Promise<Element | null> {
  const interval = 200;
  const maxTries = Math.ceil(timeout / interval);
  let tries = 0;
  return new Promise((resolve) => {
    const check = () => {
      const el = document.querySelector(selector);
      if (el) return resolve(el);
      tries++;
      if (tries * interval >= timeout) return resolve(null);
      setTimeout(check, interval);
    };
    check();
  });
}
