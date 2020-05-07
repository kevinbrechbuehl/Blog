---
title: 'Specify datasource item of a statically binded rendering'
date: '2014-09-02T08:41:00.000Z'
tags: ['Sitecore']
template: 'post'
---

[This StackOverflow
question](http://stackoverflow.com/questions/25597940/sitecore-controller-rendering-datasource)
brought me to write this blog post. The question was, how it would be possible
to specify the datasource item when you want to add a rendering directly from
the code in Sitecore MVC.

There are two types on how it’s possible to add a layout or a rendering to a
page request:

- The renderings is attached via the presentation details of an item (called
  **dynamic binding**).
- The rendering is added directly in the code of another rendering (called
  **static binding**).

Dynamic bindings are usually configured by a developer in the Content Editor.
Depending on how to add content to an item, also components added by authors
within the Page Editor are dynamically binded. A little different from this is
the static binding: It’s added directly into any Razor view (i.e. a Sitecore
view rendering) by a developer with the following line of code:

```csharp
@Html.Sitecore().Rendering("<your rendering definition item id>")
```

With an anonymous object, it is possible to add other parameters to the
rendering. The datasource of the rendering is one parameter and can be specify
as follow:

```csharp
@Html.Sitecore().Rendering("<your rendering definition item id>", new { DataSource = "<your datasource item id>" })
```

This has the same result as when the datasource item has been chosen within the
dialog in a dynamic binding. It’s also possible to add other parameters, for
example to specify the type of caching:

```csharp
@Html.Sitecore().Rendering("<your rendering definition item id>", new { Cacheable = true, CacheKey = "my_rendering", Cache_VaryByData = true })
```
