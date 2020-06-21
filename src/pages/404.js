import React from 'react';

import Layout from '../components/layout';
import SEO from '../components/seo';

const NotFoundPage = () => {
  return (
    <Layout>
      <SEO title="404: Not Found" />
      <article className="post">
        <header>
          <h1 className="post-title">Oh no! Page not found.</h1>
        </header>
        <section className="post-content">
          <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
        </section>
      </article>
    </Layout>
  );
};

export default NotFoundPage;
