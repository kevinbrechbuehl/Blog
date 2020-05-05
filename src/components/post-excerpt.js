import { Link } from 'gatsby';
import React from 'react';

class PostExcerpt extends React.Component {
  render() {
    const post = this.props.post;
    const title = post.frontmatter.title || post.fields.slug;

    return (
      <article className="preview">
        <header>
          <h1 className="post-title">
            <Link to={post.fields.slug}>{title}</Link>
          </h1>
          <div className="post-meta">{post.frontmatter.date}</div>
        </header>
        <section className="post-excerpt">
          <Link to={post.fields.slug} className="excerptlink">
            <p
              dangerouslySetInnerHTML={{
                __html: post.frontmatter.description || post.excerpt,
              }}
            />
          </Link>
          <p className="readmore">
            <Link to={post.fields.slug}>
              Keep reading <span className="icon">&raquo;</span>
            </Link>
          </p>
        </section>
      </article>
    );
  }
}

export default PostExcerpt;
