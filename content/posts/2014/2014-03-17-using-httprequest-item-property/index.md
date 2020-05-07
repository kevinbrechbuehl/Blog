---
title: 'Using HttpRequest.Item property'
date: '2014-03-17T09:31:00.000Z'
tags: ['ASP.NET']
template: 'post'
---

I’m currently in the last part of my military service and don’t have much time
to work or blog. However I could answer some Stack Overflow questions. One of
them was the question [if it is a good practice to use the HttpRequest.Item
property instead of HttpRequest.Form or
HttpRequest.QueryString](http://stackoverflow.com/questions/22407309/good-practice-for-request-and-request-form-in-asp-net-webpages-2).

When you want to get a query string value, you can get this from the
`QueryString` property of the current http request object. If you want to get a
posted form value, via the `Form` collection.

```csharp
// query string
HttpContext.Current.Request.QueryString["param"];

// form values
HttpContext.Current.Request.Form["param"];
```

Exactly the same is available for `Cookies` and `ServerVariables`. There is also
the `HttpRequest.Item` property, but what is it for?

```csharp
// what is the result of this?
HttpContext.Current.Request["param"];
```

The
[MSDN](<http://msdn.microsoft.com/en-us/library/system.web.httprequest.item(v=vs.110).aspx>)
doesn’t help you finding what exactly is going on there. After a bit of research
I found that the value will be calculated in the following order:

1. Value from `HttpRequest.QueryString` if not _null_
2. Value from `HttpRequest.Form` if not _null_
3. Value from `HttpRequest.Cookies` if not _null_
4. Value from `HttpRequest.ServerVariables` if not _null_
5. If no value was found, _null_

Simple hm? But is this a good practice to use? I think no. I wonder if your
application is well designed if you don’t know from which collection you expect
a value? I also think it could be a security risk if you don’t handle all side
effects of this. And last but not least, can you really maintain this 1 or 2
years after you wrote this code? So better use the collection where you expect
the value coming from.
