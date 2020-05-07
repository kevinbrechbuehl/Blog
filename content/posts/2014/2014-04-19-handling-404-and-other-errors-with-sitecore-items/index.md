---
title: 'Handling 404 and other errors with Sitecore items'
date: '2014-04-19T08:03:00.000Z'
tags: ['Sitecore']
template: 'post'
---

Error handling is very important in any type of application. But it’s not only
important to handle the error in the backend, it’s also very important to give a
properly and easy to read feedback to the user. Sitecore provides a basic set of
error pages (page not found (404), access denied (403) and layout not found
(500)). But these pages are static and not adapted to the customer layout.

The most comfortable way of creating nice error pages is to have an item within
Sitecore for each error. The item should be managed by authors in every language
and could be different for each site in a multisite environment. There are
several ways of doing this, mostly by adding a new pipeline processor and
overriding the `Context.Item` (see [Handling HTTP
404](http://sdn.sitecore.net/upload/sitecore6/handling_http_404_a4.pdf)). But
there is a better and easier way: My company [Unic](http://www.unic.com/) has
written the [Sitecore Error
Manager](https://marketplace.sitecore.net/en/Modules/Sitecore_Error_Manager.aspx)
module, which is doing all you need to show the error pages you want.

##How does it work?
The _Sitecore Error Manager_ does not directly interact with Sitecore, instead
he overrides the Sitecore error pages. When Sitecore couldn’t resolve an item to
an url, it creates a redirect to the `notfound.aspx` in the `ExecuteRequest`
pipeline (the file is configured in the `web.config` node
`/sitecore/settings/ItemNotFoundUrl`). The _Sitecore Error Manager_ overrides
this setting and points to a custom page. This page creates a http request to
the configured item within Sitecore and responds the html markup from the item
back to the user.

With this idea, each statuscode (including substatuscodes) could be handled.
Error pages for handling 404, 403 and 500 are included, other could be added.

Detailed information about the features and the configuration can be found on
the [GitHub wiki](https://github.com/unic/SitecoreErrorManager/wiki). Because it
doesn’t interact that much with Sitecore, it should compatible with almost every
version of Sitecore (tested up to version 6.4.1).

##Download
The _Sitecore Error Manager_ can be downloaded from the [Sitecore
Marketplace](http://marketplace.sitecore.net/Modules/Sitecore_Error_Manager.aspx)
and installed over a Sitecore package. You can also download the source code and
build the module manually. The source code is available at
[GitHub](https://github.com/unic/SitecoreErrorManager). Happy error handling :)

_Note:_ This is a repost from our german written blog [Sitecore
Vibes](http://sitecore.unic.com/de/2012/12/19/Sitecore-Error-Manager).
