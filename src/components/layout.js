import React from 'react';

import Footer from './footer';
import Header from './header';

class Layout extends React.Component {
  render() {
    const { children } = this.props;

    return (
      <>
        <Header />
        <main className="content">{children}</main>
        <Footer />
      </>
    );
  }
}

export default Layout;
