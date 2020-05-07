---
title: 'Absolute urls for internal links with Glass Mapper'
date: '2014-02-03T18:07:00.000Z'
tags: ['Sitecore']
template: 'post'
---

We recently decided to include an
[ORM](http://en.wikipedia.org/wiki/Object-relational_mapping) in our next
Sitecore project. It should be [Glass Mapper](http://glass.lu/). The key feature
of the ORM would be, that we can map all our Sitecore items and their data to
strongly-typed objects in C#, _automatically_. One of the first features I had
to implement was a Web Api which should return the Url (internal or external) of
a General Link field of an item. This url should of course be absolute, so the
client system can make use of the url.

My first thoughts were to add some [url
options](http://www.theinsidecorner.com/en/Developers/ContentDisplay/LinkManagement/UrlOptionsDefaults)
to the `SitecoreFieldAttribute`, but I didn’t find anything about this. And I
also didn’t want to make some ugly hacks (hey I’m using Glass Mapper to make it
nice, not ugly), hence I ask this on [Stack
Overflow](http://stackoverflow.com/questions/21218457/get-absolute-url-for-internal-links-with-glass-mapper-for-sitecore).
[Michael Edwards](http://stackoverflow.com/users/148361/michael-edwards),
developer of the Sitecore Glass Mapper project, confirms that this feature is
not yet implemented and just created a new version of Glass Mapper. One day
after my feature request on Stack Overflow, wow! Thanks again.

So at the end, it became very easy to add url options to a link field:

```csharp
[SitecoreField(FieldName = "My Link Field", UrlOptions = SitecoreInfoUrlOptions.AlwaysIncludeServerUrl | SitecoreInfoUrlOptions.SiteResolving)]
public virtual Link MyLinkField { get; set; }
```

As you can see, you can also add multiple options, separated by a pipe ( | ).
That’s it.

The `SitecoreInfoUrlOptions` is an `enum` with the following values (use them as
you would on normal `UrlOptions`):

```csharp
public enum SitecoreInfoUrlOptions
{
    Default = 0,
    AddAspxExtension = 1,
    AlwaysIncludeServerUrl = 2,
    EncodeNames = 4,
    LanguageEmbeddingAlways = 8,
    LanguageEmbeddingAsNeeded = 22,
    LanguageEmbeddingNever = 50,
    LanguageLocationFilePath = 100,
    LanguageLocationQueryString = 296,
    ShortenUrls = 598,
    SiteResolving = 1298,
    UseUseDisplayName = 4132
}
```

**Note:** As this feature is new, it is only available from [release 3.1.6 of
Glass Mapper](http://www.nuget.org/packages/Glass.Mapper.Sc/).
