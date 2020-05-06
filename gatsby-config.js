module.exports = {
  siteMetadata: {
    title: `ctor.io`,
    author: {
      name: `Kevin Brechbühl`,
      summary: `Hi, I'm a Software Engineer with a focus on web technologies, mainly with ASP.NET Core and Angular. Previously worked a lot with Sitecore too.`,
    },
    description: `Software Engineering & Web Technologies in general with a focus on .NET, Angular and Sitecore.`,
    siteUrl: `https://ctor.io/`,
    social: {
      twitter: `aquasonic`,
    },
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/posts`,
        name: `posts`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/pages`,
        name: `pages`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/assets`,
        name: `assets`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 630,
            },
          },
          `gatsby-remark-responsive-iframe`,
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-feed`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `ctor.io | Tech Blog`,
        short_name: `Tech Blog`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#c83219`,
        icon: `content/assets/icon.png`,
      },
    },
    `gatsby-plugin-react-helmet`,
  ],
};
