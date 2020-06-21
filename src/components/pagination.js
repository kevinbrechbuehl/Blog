import { faChevronCircleLeft, faChevronCircleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'gatsby';
import PropTypes from 'prop-types';
import React from 'react';

const Pagination = ({
  currentPage,
  numPages,
  isFirst,
  isLast,
  prevPage,
  nextPage,
}) => {
  return (
    <nav className="pagination">
      {!isFirst && (
        <Link to={prevPage} rel="prev" className="newer-posts">
          <FontAwesomeIcon icon={faChevronCircleLeft} /> Newer
        </Link>
      )}
      <span className="page-number">
        Page {currentPage} of {numPages}
      </span>
      {!isLast && (
        <Link to={nextPage} rel="next" className="older-posts">
          Older <FontAwesomeIcon icon={faChevronCircleRight} />
        </Link>
      )}
    </nav>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  numPages: PropTypes.number.isRequired,
  isFirst: PropTypes.bool.isRequired,
  isLast: PropTypes.bool.isRequired,
  prevPage: PropTypes.string.isRequired,
  nextPage: PropTypes.string.isRequired,
};

export default Pagination;
