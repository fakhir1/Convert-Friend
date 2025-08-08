/**
 * Debug utilities for Facebook Group API
 * Use these functions in the browser console to test and debug the group extraction
 */

// Add debug functions to window for console access
declare global {
  interface Window {
    debugGroupAPI: {
      testExtraction: () => Promise<void>;
      logPageStructure: () => void;
      testMemberSelectors: () => void;
      extractBasicMembers: () => any[];
    };
  }
}

/**
 * Test the group member extraction with detailed logging
 */
async function testGroupExtraction(): Promise<void> {
  console.log('=== DEBUG: Starting group extraction test ===');

  try {
    // Test group ID extraction
    const currentUrl = window.location.href;
    console.log('Current URL:', currentUrl);

    const groupIdPatterns = [
      /facebook\.com\/groups\/(\d+)/,
      /facebook\.com\/groups\/([^\/\?]+)/,
      /groups\/(\d+)/,
      /groups\/([^\/\?]+)/,
    ];

    let groupId = null;
    for (const pattern of groupIdPatterns) {
      const match = currentUrl.match(pattern);
      if (match) {
        groupId = match[1];
        console.log(`Found group ID: ${groupId} using pattern: ${pattern}`);
        break;
      }
    }

    if (!groupId) {
      console.log('❌ No group ID found');
      return;
    }

    // Test group info extraction
    console.log('=== Testing group info extraction ===');
    const groupNameSelectors = [
      'h1[data-testid="group-name"]',
      'h1[dir="auto"]',
      '.x1heor9g.x1qlqyl8.x1pd3egz.x1a2a7pz h1',
      '[data-testid="group-name"]',
    ];

    let groupName = '';
    for (const selector of groupNameSelectors) {
      try {
        const element = document.querySelector(selector);
        if (element?.textContent?.trim()) {
          groupName = element.textContent.trim();
          console.log(
            `✅ Found group name: "${groupName}" using selector: ${selector}`
          );
          break;
        }
      } catch (error) {
        console.log(`❌ Selector failed: ${selector}`, error);
      }
    }

    if (!groupName) {
      console.log('❌ No group name found');
    }

    // Test member element detection
    console.log('=== Testing member element detection ===');
    testMemberSelectors();
  } catch (error) {
    console.error('Debug test failed:', error);
  }
}

/**
 * Log the page structure for debugging
 */
function logPageStructure(): void {
  console.log('=== PAGE STRUCTURE DEBUG ===');
  console.log('Page title:', document.title);
  console.log('URL:', window.location.href);

  // Look for elements with member-related data attributes
  const memberElements = document.querySelectorAll(
    '[data-testid*="member"], [data-pagelet*="member"], [class*="member"]'
  );
  console.log(
    `Found ${memberElements.length} elements with member-related attributes`
  );

  // Look for profile images
  const profileImages = document.querySelectorAll(
    'img[data-imgperflogname="profileCoverPhoto"], img[alt*="profile"]'
  );
  console.log(`Found ${profileImages.length} profile images`);

  // Look for links that might be profiles
  const profileLinks = document.querySelectorAll(
    'a[href*="/profile.php"], a[href*="/people/"], a[href*="/user/"]'
  );
  console.log(`Found ${profileLinks.length} profile links`);

  // Look for list items that might contain members
  const listItems = document.querySelectorAll('[role="listitem"]');
  console.log(`Found ${listItems.length} list items`);

  console.log('=== SAMPLE ELEMENTS ===');
  if (profileImages.length > 0) {
    console.log('Sample profile image parent:', profileImages[0].parentElement);
  }
  if (profileLinks.length > 0) {
    console.log('Sample profile link parent:', profileLinks[0].parentElement);
  }
}

/**
 * Test different member selectors
 */
function testMemberSelectors(): void {
  const selectors = [
    '[data-testid="group-member-summary"]',
    '[role="listitem"]',
    '.x1n2onr6.x1ja2u2z',
    '[data-testid="group_member_summary"]',
    '.x1yztbdb',
    'div[data-pagelet*="member"]',
  ];

  console.log('=== Testing member selectors ===');
  for (const selector of selectors) {
    try {
      const elements = document.querySelectorAll(selector);
      console.log(`Selector "${selector}": ${elements.length} elements`);

      if (elements.length > 0 && elements.length < 50) {
        // Show first element structure
        console.log(`Sample element for "${selector}":`, elements[0]);
      }
    } catch (error) {
      console.log(`❌ Selector "${selector}" failed:`, error);
    }
  }
}

/**
 * Extract basic member data using simple approach
 */
function extractBasicMembers(): any[] {
  console.log('=== Extracting basic members ===');

  const members: any[] = [];

  // Try to find any profile links
  const profileLinks = document.querySelectorAll(
    'a[href*="/profile.php"], a[href*="/people/"], a[href*="/user/"]'
  );

  console.log(`Found ${profileLinks.length} profile links`);

  for (let i = 0; i < Math.min(profileLinks.length, 10); i++) {
    const link = profileLinks[i] as HTMLElement;
    const href = link.getAttribute('href') || '';

    // Try to get name from link text or nearby elements
    let name = link.textContent?.trim() || '';

    if (!name || name.length < 2) {
      // Look for name in parent elements
      const parent = link.closest('div, li, article');
      if (parent) {
        const strongElements = parent.querySelectorAll(
          'strong, span[dir="auto"]'
        );
        for (let j = 0; j < strongElements.length; j++) {
          const text = strongElements[j].textContent?.trim();
          if (text && text.length > 1 && text.length < 100) {
            name = text;
            break;
          }
        }
      }
    }

    if (name && name.length > 1) {
      const member = {
        name,
        profileUrl: href.startsWith('/') ? `https://facebook.com${href}` : href,
        profilePicture: '',
        totalLikes: Math.floor(Math.random() * 50),
        totalComments: Math.floor(Math.random() * 25),
        totalShares: Math.floor(Math.random() * 10),
        engagementScore: 0,
      };

      member.engagementScore =
        member.totalLikes * 1 +
        member.totalComments * 3 +
        member.totalShares * 5;

      members.push(member);
      console.log(`Extracted member: ${member.name}`);
    }
  }

  console.log(`Total extracted: ${members.length} members`);
  return members;
}

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
  window.debugGroupAPI = {
    testExtraction: testGroupExtraction,
    logPageStructure: logPageStructure,
    testMemberSelectors: testMemberSelectors,
    extractBasicMembers: extractBasicMembers,
  };

  console.log('🔧 Debug functions available at window.debugGroupAPI');
  console.log('Try: window.debugGroupAPI.testExtraction()');
}

export {
  testGroupExtraction,
  logPageStructure,
  testMemberSelectors,
  extractBasicMembers,
};
