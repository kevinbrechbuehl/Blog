import { graphql, useStaticQuery } from 'gatsby';
import React from 'react';

import image from '../../content/assets/author.jpg';

const Author = () => {
  const data = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            author {
              name
              summary
            }
          }
        }
      }
    `
  );

  const { author } = data.site.siteMetadata;

  return (
    <section className="author">
      <div
        className="authorimage"
        style={{ background: `url(${image})` }}
      ></div>
      <h4 className="author-name">{author.name}</h4>
      <p className="bio">{author.summary}</p>
    </section>
  );
};

export default Author;
