import { graphql, useStaticQuery } from 'gatsby';
import Image from 'gatsby-image';
import React from 'react';

const Author = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      avatar: file(absolutePath: { regex: "/author.jpg/" }) {
        childImageSharp {
          fixed(width: 80, height: 80) {
            ...GatsbyImageSharpFixed
          }
        }
      }
      site {
        siteMetadata {
          author {
            name
            summary
          }
        }
      }
    }
  `);

  const { author } = data.site.siteMetadata;

  return (
    <section className="author">
      <Image
        fixed={data.avatar.childImageSharp.fixed}
        alt={author.name}
        className="authorimage"
      />
      <h4 className="author-name">{author.name}</h4>
      <p className="bio">{author.summary}</p>
    </section>
  );
};

export default Author;
