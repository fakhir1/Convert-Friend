import React, { useState } from 'react';
import './friendsImpression.css';
import { FaThumbsUp, FaCommentAlt, FaShareAlt } from 'react-icons/fa';
import { BiLike } from 'react-icons/bi';
import { MdOutlineComment } from 'react-icons/md';
import { FiShare2 } from 'react-icons/fi';

const mockData = [
  { name: 'Elizabeth Quiver Adams', like: 0, comment: 0, share: 0 },
  { name: 'Jonathan Downing', like: 0, comment: 0, share: 0 },
  { name: 'Ian Grealish', like: 0, comment: 0, share: 0 },
  { name: 'Ezekiel Hammitt', like: 0, comment: 0, share: 0 },
  { name: 'Gisela Pitcher', like: 0, comment: 0, share: 0 },
  { name: 'Effie Devito', like: 0, comment: 0, share: 0 },
  { name: 'Veronica Burroughs', like: 0, comment: 0, share: 0 },
  { name: 'Vinnie Stoughton', like: 0, comment: 0, share: 0 },
  { name: 'Elizabeth Quiver Adams', like: 0, comment: 0, share: 0 },
  { name: 'Jonathan Downing', like: 0, comment: 0, share: 0 },
  { name: 'Ian Grealish', like: 0, comment: 0, share: 0 },
  { name: 'Ezekiel Hammitt', like: 0, comment: 0, share: 0 },
  { name: 'Anna Kokumo', like: 0, comment: 0, share: 0 },
];

const PAGE_SIZE = 8;
const TOTAL_PAGES = Math.ceil(mockData.length / PAGE_SIZE);

function FriendsImpression() {
  const [currentPage, setCurrentPage] = useState(1);

  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const pageData = mockData.slice(startIdx, startIdx + PAGE_SIZE);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= TOTAL_PAGES) setCurrentPage(page);
  };

  return (
    <div className="friends-impression-container">
      <div className="fi-table-wrapper">
        <div className="fi-table-header-row">
          <div className="fi-th fi-th-name">Name</div>
          <div className="fi-th">
            {React.createElement(BiLike as any, { size: 18 })}
          </div>
          <div className="fi-th">
            {React.createElement(MdOutlineComment as any, { size: 18 })}
          </div>
          <div className="fi-th">
            {React.createElement(FiShare2 as any, { size: 18 })}
          </div>
          <div className="fi-th fi-th-action"></div>
        </div>
        {pageData.map((row, idx) => (
          <div className="fi-table-row" key={idx}>
            <div className="fi-td fi-td-name">{row.name}</div>
            <div className="fi-td">{row.like}</div>
            <div className="fi-td">{row.comment}</div>
            <div className="fi-td">{row.share}</div>
            <div className="fi-td fi-td-action">&#8942;</div>
          </div>
        ))}
      </div>
      {TOTAL_PAGES > 1 && (
        <div className="fi-pagination">
          <button
            className="fi-page-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lsaquo;
          </button>

          {TOTAL_PAGES <= 4 ? (
            // Show all pages if 4 or fewer
            Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`fi-page-btn${
                  currentPage === page ? ' active' : ''
                }`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))
          ) : (
            // Show pages with ellipsis if more than 4
            <>
              {/* First 3 pages */}
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  className={`fi-page-btn${
                    currentPage === page ? ' active' : ''
                  }`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}

              {/* Ellipsis */}
              <span className="fi-page-ellipsis">...</span>

              {/* Last page */}
              <button
                className={`fi-page-btn${
                  currentPage === TOTAL_PAGES ? ' active' : ''
                }`}
                onClick={() => handlePageChange(TOTAL_PAGES)}
              >
                {TOTAL_PAGES}
              </button>
            </>
          )}

          <button
            className="fi-page-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === TOTAL_PAGES}
          >
            &rsaquo;
          </button>
        </div>
      )}
    </div>
  );
}

export default FriendsImpression;
