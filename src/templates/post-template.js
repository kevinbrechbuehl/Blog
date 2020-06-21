import { faAngleDoubleUp, faTags } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { graphql, Link } from 'gatsby';
import { kebabCase } from 'lodash';
import React from 'react';
import AnchorLink from 'react-anchor-link-smooth-scroll';

import Author from '../components/author';
import Layout from '../components/layout';
import SEO from '../components/seo';

const PostTemplate = ({ data }) => {
  const post = data.markdownRemark;

  return (
    <Layout>
      <SEO
        title={post.frontmatter.title}
        description={post.frontmatter.description || post.excerpt}
      />
      <article className="post">
        <header>
          <h1 className="post-title">{post.frontmatter.title}</h1>
          <div className="post-meta">{post.frontmatter.date}</div>
        </header>
        <section
          dangerouslySetInnerHTML={{ __html: post.html }}
          className="post-content"
        />
        <section className="post-tags">
          <div className="backtotop">
            <AnchorLink href="#site-head" offset="20">
              <FontAwesomeIcon icon={faAngleDoubleUp} />
            </AnchorLink>
            <AnchorLink href="#site-head" offset="20">
              <span className="backtotoptext">Back to top</span>
            </AnchorLink>
          </div>
          <div className="post-meta tags">
            <FontAwesomeIcon icon={faTags} />
            {post.frontmatter.tags
              .map((tag) => {
                return (
                  <Link key={tag} to={`/tag/${kebabCase(tag)}/`}>
                    {tag}
                  </Link>
                );
              })
              .reduce((prev, curr) => [prev, ', ', curr])}
          </div>
        </section>
        <footer className="post-footer">
          <Author />
        </footer>
      </article>
    </Layout>
  );
};

export default PostTemplate;

export const pageQuery = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "DD MMMM YYYY")
        description
        tags
      }
    }
  }
`;
