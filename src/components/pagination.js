import { faChevronCircleLeft, faChevronCircleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'gatsby';
import React from 'react';

class Pagination extends React.Component {
  render() {
    return (
      <nav className="pagination">
        {!this.props.isFirst && (
          <Link to={this.props.prevPage} rel="prev" className="newer-posts">
            <FontAwesomeIcon icon={faChevronCircleLeft} /> Newer
          </Link>
        )}
        <span className="page-number">
          Page {this.props.currentPage} of {this.props.numPages}
        </span>
        {!this.props.isLast && (
          <Link to={this.props.nextPage} rel="next" className="older-posts">
            Older <FontAwesomeIcon icon={faChevronCircleRight} />
          </Link>
        )}
      </nav>
    );
  }
}

export default Pagination;
