import { graphql } from 'gatsby';
import React from 'react';

import Layout from '../components/layout';
import Pagination from '../components/pagination';
import PostExcerpt from '../components/post-excerpt';
import SEO from '../components/seo';

class PostListTemplate extends React.Component {
  render() {
    const { data } = this.props;
    const posts = data.allMarkdownRemark.edges;

    const { currentPage, numPages } = this.props.pageContext;
    const isFirst = currentPage === 1;
    const isLast = currentPage === numPages;
    const prevPage =
      currentPage - 1 === 1 ? '/' : 'page/' + (currentPage - 1) + '/';
    const nextPage = 'page/' + (currentPage + 1) + '/';

    const seoTitle = isFirst
      ? 'ctor.io | Tech Blog'
      : 'Page ' + currentPage + ' | ctor.io';

    return (
      <Layout>
        <SEO title={seoTitle} home={true} />

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
  }
}

export default PostListTemplate;

export const pageQuery = graphql`
  query($skip: Int!, $limit: Int!) {
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { template: { eq: "post" } } }
      limit: $limit
      skip: $skip
    ) {
      edges {
        node {
          excerpt(pruneLength: 160)
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
