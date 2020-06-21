import { faTag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { graphql } from 'gatsby';
import { kebabCase } from 'lodash';
import React from 'react';

import Layout from '../components/layout';
import Pagination from '../components/pagination';
import PostExcerpt from '../components/post-excerpt';
import SEO from '../components/seo';

const TagTemplate = ({ data, pageContext }) => {
  const posts = data.allMarkdownRemark.edges;

  const { tag, currentPage, numPages } = pageContext;
  const isFirst = currentPage === 1;
  const isLast = currentPage === numPages;
  const tagSlug = '/tag/' + kebabCase(tag) + '/';
  const prevPage =
    currentPage - 1 === 1
      ? tagSlug
      : tagSlug + 'page/' + (currentPage - 1) + '/';
  const nextPage = tagSlug + 'page/' + (currentPage + 1) + '/';

  const seoTitle = isFirst ? `${tag}` : `${tag} - Page ${currentPage}`;

  return (
    <Layout>
      <SEO title={seoTitle} />

      <h3 className="posts-tagged">
        <FontAwesomeIcon icon={faTag} /> {tag}
      </h3>

      {posts.map(({ node }) => (
        <PostExcerpt key={node.fields.slug} post={node} />
      ))}

      <Pagination
        currentPage={currentPage}
        numPages={numPages}
        isFirst={isFirst}
        isLast={isLast}
        prevPage={prevPage}
        nextPage={nextPage}
      />
    </Layout>
  );
};

export default TagTemplate;

export const pageQuery = graphql`
  query($tag: String, $skip: Int!, $limit: Int!) {
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: {
        frontmatter: { tags: { in: [$tag] }, template: { eq: "post" } }
      }
      limit: $limit
      skip: $skip
    ) {
      edges {
        node {
          excerpt(pruneLength: 500)
          fields {
            slug
          }
          frontmatter {
            date(formatString: "DD MMMM YYYY")
            title
            description
          }
        }
      }
    }
  }
`;
