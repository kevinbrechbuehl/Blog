import { Link } from 'gatsby';
import React from 'react';

import logo from '../../content/assets/logo.png';

class Header extends React.Component {
  render() {
    return (
      <header id="site-head">
        <h1 className="blog-title">
          <Link to={`/`}>
            <img src={logo} alt="ctor.io | Tech Blog" />
          </Link>
        </h1>
        <h1 className="blog-subtitle">
          Software Engineering &amp; Web Technologies
        </h1>
      </header>
    );
  }
}

export default Header;
