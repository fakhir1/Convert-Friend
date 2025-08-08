/**
 * Facebook Group Members Content Script Handler
 * Handles the extraction of group member data with engagement metrics
 */

import {
  getGroupMembersEnhanced as getGroupMembers,
  getGroupIdFromUrl,
  GroupData,
  GroupMember,
} from '../../services/facebookGroupAPIEnhanced';

/**
 * Handles group member extraction requests
 */
export async function handleGroupMemberExtraction(): Promise<GroupData | null> {
  try {
    console.log('Starting group member extraction...');

    // Verify we're on a Facebook group page
    if (!window.location.href.includes('facebook.com/groups/')) {
      throw new Error('Not on a Facebook group page');
    }

    // Show progress popup
    showProgressPopup('Extracting group members...', 0);

    // Get basic group data and members
    const groupData = await getGroupMembers();
    if (!groupData) {
      throw new Error('Failed to extract group data');
    }

    updateProgressPopup('Analyzing member engagement...', 30);

    // Enhanced extraction already includes engagement data
    updateProgressPopup('Processing engagement data...', 70);

    // Members already have engagement data from enhanced extraction
    const membersWithRealEngagement = groupData.members;

    // Sort members by engagement score
    membersWithRealEngagement.sort(
      (a: GroupMember, b: GroupMember) => b.engagementScore - a.engagementScore
    );

    updateProgressPopup('Finalizing data...', 90);

    const finalGroupData: GroupData = {
      ...groupData,
      members: membersWithRealEngagement,
    };

    hideProgressPopup();

    console.log('Group member extraction completed:', finalGroupData);
    return finalGroupData;
  } catch (error) {
    console.error('Error in group member extraction:', error);
    hideProgressPopup();
    showErrorPopup(`Error: ${error}`);
    return null;
  }
}

/**
 * Calculate engagement score based on likes, comments, and shares
 */
function calculateEngagementScore(
  likes: number,
  comments: number,
  shares: number
): number {
  // Weighted scoring: comments worth more than likes, shares worth most
  return likes * 1 + comments * 3 + shares * 5;
}

/**
 * Show progress popup
 */
function showProgressPopup(message: string, progress: number): void {
  let popup = document.getElementById('group-extraction-popup');

  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'group-extraction-popup';
    popup.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 350px;
      background: #fff;
      border: 2px solid #1877f2;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    document.body.appendChild(popup);
  }

  popup.innerHTML = `
    <div style="display: flex; align-items: center; margin-bottom: 15px;">
      <img src="chrome-extension://${chrome.runtime.id}/icon-34.png" 
           style="width: 24px; height: 24px; margin-right: 10px;" />
      <strong style="color: #1877f2;">Friend Convert - Group Analysis</strong>
    </div>
    <div style="margin-bottom: 10px; color: #333;">${message}</div>
    <div style="background: #f0f2f5; border-radius: 4px; height: 8px; overflow: hidden;">
      <div style="background: #1877f2; height: 100%; width: ${progress}%; transition: width 0.3s ease;"></div>
    </div>
    <div style="text-align: right; margin-top: 8px; font-size: 12px; color: #666;">${progress}%</div>
  `;
}

/**
 * Update progress popup
 */
function updateProgressPopup(message: string, progress: number): void {
  const popup = document.getElementById('group-extraction-popup');
  if (popup) {
    popup.querySelector('div:nth-child(2)')!.textContent = message;
    const progressBar = popup.querySelector(
      'div:nth-child(3) div'
    ) as HTMLElement;
    const progressText = popup.querySelector('div:nth-child(4)') as HTMLElement;

    if (progressBar) progressBar.style.width = `${progress}%`;
    if (progressText) progressText.textContent = `${progress}%`;
  }
}

/**
 * Hide progress popup
 */
function hideProgressPopup(): void {
  const popup = document.getElementById('group-extraction-popup');
  if (popup) {
    setTimeout(() => popup.remove(), 1000);
  }
}

/**
 * Show error popup
 */
function showErrorPopup(message: string): void {
  const popup = document.createElement('div');
  popup.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 350px;
    background: #fff;
    border: 2px solid #e74c3c;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  popup.innerHTML = `
    <div style="display: flex; align-items: center; margin-bottom: 15px;">
      <div style="color: #e74c3c; font-size: 18px; margin-right: 10px;">⚠️</div>
      <strong style="color: #e74c3c;">Error</strong>
    </div>
    <div style="color: #333; margin-bottom: 15px;">${message}</div>
    <button onclick="this.parentElement.remove()" 
            style="background: #e74c3c; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
      Close
    </button>
  `;

  document.body.appendChild(popup);

  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (popup.parentElement) popup.remove();
  }, 10000);
}

/**
 * Export group data to CSV format
 */
export function exportGroupDataToCSV(groupData: GroupData): string {
  const headers = [
    'Name',
    'Profile URL',
    'Member Since',
    'Total Likes',
    'Total Comments',
    'Total Shares',
    'Engagement Score',
  ];

  const rows = groupData.members.map((member: GroupMember) => [
    `"${member.name}"`,
    `"${member.profileUrl}"`,
    `"${member.memberSince || 'N/A'}"`,
    member.totalLikes.toString(),
    member.totalComments.toString(),
    member.totalShares.toString(),
    member.engagementScore.toString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row: string[]) => row.join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Download group data as CSV file
 */
export function downloadGroupDataAsCSV(groupData: GroupData): void {
  const csvContent = exportGroupDataToCSV(groupData);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `${groupData.groupName.replace(/[^a-z0-9]/gi, '_')}_members.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
