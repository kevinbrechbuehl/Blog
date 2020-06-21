import { graphql } from 'gatsby';
import React from 'react';

import Layout from '../components/layout';
import SEO from '../components/seo';

const PageTemplate = ({ data }) => {
  const page = data.markdownRemark;

  return (
    <Layout>
      <SEO
        title={page.frontmatter.title}
        description={page.frontmatter.description || page.excerpt}
      />
      <article className="post">
        <header>
          <h1 className="post-title">{page.frontmatter.title}</h1>
        </header>
        <section
          dangerouslySetInnerHTML={{ __html: page.html }}
          className="post-content"
        />
      </article>
    </Layout>
  );
};

export default PageTemplate;

export const pageQuery = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        description
      }
    }
  }
`;
