import React, { useState } from 'react';
import './groupExtraction.css';

interface GroupExtractionProps {
  onClose: () => void;
}

const GroupExtraction: React.FC<GroupExtractionProps> = ({ onClose }) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleExtractMembers = async (downloadCSV: boolean = false) => {
    setIsExtracting(true);
    setError('');
    setExtractionResult(null);

    try {
      const response = (await new Promise((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'EXTRACT_GROUP_MEMBERS',
            downloadCSV: downloadCSV,
          },
          resolve
        );
      })) as any;

      if (response?.success) {
        setExtractionResult(response.data);
        if (downloadCSV) {
          // CSV download is handled automatically by content script
        }
      } else {
        setError(response?.error || 'Failed to extract group members');
      }
    } catch (err) {
      setError('An error occurred during extraction');
      console.error('Group extraction error:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDownloadCSV = () => {
    if (extractionResult) {
      // Send message to content script to download CSV
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id!, {
          type: 'DOWNLOAD_GROUP_CSV',
          data: extractionResult,
        });
      });
    }
  };

  return (
    <div className="group-extraction-container">
      <div className="group-extraction-header">
        <h3>📊 Group Member Analysis</h3>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="group-extraction-content">
        <div className="description">
          <p>
            Extract group members and analyze their engagement metrics including
            likes, comments, and shares.
          </p>
          <p>
            <strong>Note:</strong> Make sure you're on a Facebook group page
            before starting.
          </p>
        </div>

        {error && (
          <div className="error-message">
            <span>⚠️ {error}</span>
          </div>
        )}

        {extractionResult && (
          <div className="extraction-result">
            <h4>✅ Extraction Complete!</h4>
            <div className="result-stats">
              <div className="stat-item">
                <span className="stat-label">Group:</span>
                <span className="stat-value">{extractionResult.groupName}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Members Found:</span>
                <span className="stat-value">
                  {extractionResult.members.length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Group Members:</span>
                <span className="stat-value">
                  {extractionResult.memberCount}
                </span>
              </div>
            </div>

            <div className="top-members">
              <h5>🏆 Top Engaged Members</h5>
              {extractionResult.members
                .slice(0, 5)
                .map((member: any, index: number) => (
                  <div key={index} className="member-item">
                    <span className="member-rank">#{index + 1}</span>
                    <span className="member-name">{member.name}</span>
                    <span className="member-score">
                      Score: {member.engagementScore}
                      <small>
                        {' '}
                        ({member.totalLikes}L, {member.totalComments}C,{' '}
                        {member.totalShares}S)
                      </small>
                    </span>
                  </div>
                ))}
            </div>

            <button className="download-csv-btn" onClick={handleDownloadCSV}>
              💾 Download Full Report (CSV)
            </button>
          </div>
        )}

        <div className="action-buttons">
          <button
            className={`extract-btn ${isExtracting ? 'extracting' : ''}`}
            onClick={() => handleExtractMembers(false)}
            disabled={isExtracting}
          >
            {isExtracting ? (
              <>
                <span className="spinner"></span>
                Extracting...
              </>
            ) : (
              <>🔍 Analyze Members</>
            )}
          </button>

          <button
            className={`extract-csv-btn ${isExtracting ? 'extracting' : ''}`}
            onClick={() => handleExtractMembers(true)}
            disabled={isExtracting}
          >
            {isExtracting ? (
              <>
                <span className="spinner"></span>
                Extracting...
              </>
            ) : (
              <>📋 Analyze & Download CSV</>
            )}
          </button>
        </div>

        <div className="extraction-info">
          <h5>📋 What data will be extracted:</h5>
          <ul>
            <li>Member names and profile links</li>
            <li>Total likes received on group posts</li>
            <li>Total comments made in the group</li>
            <li>Total shares of group content</li>
            <li>Overall engagement score</li>
            <li>Join date (when available)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GroupExtraction;
