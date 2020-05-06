import { faGithub, faLinkedinIn, faStackOverflow, faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faRss } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

class Footer extends React.Component {
  render() {
    return (
      <footer className="site-footer">
        <div className="inner">
          <section className="footer-social">
            <a
              href="https://twitter.com/aquasonic"
              target="_blank"
              rel="noopener noreferrer"
              title="Twitter"
            >
              <FontAwesomeIcon icon={faTwitter} />
              <span className="hidden">Twitter</span>
            </a>
            &nbsp;
            <a
              href="https://github.com/aquasonic"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub"
            >
              <FontAwesomeIcon icon={faGithub} />
              <span className="hidden">GitHub</span>
            </a>
            &nbsp;
            <a
              href="https://stackoverflow.com/users/2074649/kevin-brechbuhl"
              target="_blank"
              rel="noopener noreferrer"
              title="Stack Overflow"
            >
              <FontAwesomeIcon icon={faStackOverflow} />
              <span className="hidden">Stack Overflow</span>
            </a>
            &nbsp;
            <a
              href="https://ch.linkedin.com/in/kevinbrechbuehl"
              target="_blank"
              rel="noopener noreferrer"
              title="LinkedIn"
            >
              <FontAwesomeIcon icon={faLinkedinIn} />
              <span className="hidden">LinkedIn</span>
            </a>
            &nbsp;
            <a
              href="/rss.xml"
              target="_blank"
              rel="noopener noreferrer"
              title="RSS Feed"
            >
              <FontAwesomeIcon icon={faRss} />
              <span className="hidden">RSS Feed</span>
            </a>
          </section>

          <section className="footer-author">
            A blog by{' '}
            <a
              href="https://www.aquasonic.ch"
              target="_blank"
              rel="noopener noreferrer"
            >
              Kevin Brechbühl
            </a>
          </section>

          <section className="copyright">
            &copy; {new Date().getFullYear()}{' '}
            <a href="https://ctor.io">ctor.io</a>. All rights reserved
          </section>

          <section className="theme">
            <a
              href="https://github.com/epistrephein/Steam"
              target="_blank"
              rel="noopener noreferrer"
            >
              Steam theme
            </a>{' '}
            by Tommaso Barbato,
            <br />
            ported to{' '}
            <a
              href="https://www.gatsbyjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Gatsby
            </a>{' '}
            by{' '}
            <a
              href="https://github.com/aquasonic/Blog"
              target="_blank"
              rel="noopener noreferrer"
            >
              aquasonic
            </a>
          </section>

          <nav className="footer-menu">
            <ul>
              <li>
                <a
                  href="https://plausible.io"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Stats
                </a>
              </li>
              <li>
                <a href="/imprint-and-privacy">Imprint &amp; Privacy</a>
              </li>
            </ul>
          </nav>
        </div>
      </footer>
    );
  }
}

export default Footer;
