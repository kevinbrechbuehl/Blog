---
title: 'Cross-Origin Resource Sharing for static assets'
date: '2014-02-18T08:48:00.000Z'
tags: ['ASP.NET']
template: 'post'
---

We recently had to provide a javascript snippet which includes an icon font
dynamically. The javascript snippet will be included on a custom domain from our
customer, where the icon font (the \*.woff file) is hosted on our domain. We
rapidly came into cross-origin problems, the so called [Cross-Origin Resource
Sharing](http://www.w3.org/TR/cors/) (CORS).

There is a http header called
[Access-Control-Allow-Origin](http://www.w3.org/TR/cors/#access-control-allow-origin-response-header),
which is exactly what we use here. So, anywhere in our code we can set this
header to allow resource sharing. We could either allow this for every domain
(with a `*`) or for a specific address, i.e. `https://www.kevinbrechbuehl.com`.

```csharp
HttpContext.Response.AppendHeader("Access-Control-Allow-Origin", "*");
```

or

```csharp
HttpContext.Response.AppendHeader("Access-Control-Allow-Origin", "https://www.kevinbrechbuehl.com");
```

But what if we want to add this header for static resources on the file system,
without going through the ASP.net pipeline? Of course we can configure this in
the `web.config` too

```xml
<system.webServer>
  <httpProtocol>
    <customHeaders>
      <add name="Access-Control-Allow-Origin" value="*" />
    </customHeaders>
  </httpProtocol>
</system.webServer>
```

This adds the header for all requests. But as I mentioned in the beginning, we
only want to set this on fonts. All our fonts are located under the directory
`/assets/fonts`, so we could simple put this configuration into a
`<location>`-tag:

```xml
<location path="assets/fonts">
  <system.webServer>
    <httpProtocol>
      <customHeaders>
        <add name="Access-Control-Allow-Origin" value="*" />
      </customHeaders>
    </httpProtocol>
  </system.webServer>
</location>
```

If possible, you should always consider adding only the domain really needed.
CORS is a security feature, and allowing every origin on a specific resource
does not make the usage of your resource more secure.
