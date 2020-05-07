---
title: 'Extend the Sitecore HtmlHelper'
date: '2015-12-01T13:58:36.000Z'
tags: ['Sitecore']
template: 'post'
---

When you work with Sitecore MVC you usually also work with Razor as your view
engine. To support you in your Razor views, ASP.NET MVC has a number of useful
helper methods (e.g. to generate a form). These methods are part of the
[`HtmlHelper`](https://msdn.microsoft.com/en-us/library/system.web.mvc.htmlhelper.aspx)
class and are invoked with `@Html.MethodToCall()`. Sitecore has it's own html
helper, available with `@Html.Sitecore().MethodToCall()`. You may know the
following method to output the content of a Sitecore field, including inline
editing for the [Experience
Editor](https://doc.sitecore.net/sitecore%20experience%20platform/the%20editing%20tools/the%20experience%20editor):

```csharp
@Html.Sitecore().Field("My Field")
```

Sometimes you need more functionalities and you wish you could extend the
Sitecore html helper. I will show you two possibilities how you can easily
accomplish this.

## Extension methods

The ASP.NET `HtmlHelper` as well as the `SitecoreHelper` class are normal
classes, what means you can write [extension
methods](https://msdn.microsoft.com/en-us/library/bb383977.aspx) for it. So if
you want to extends the Sitecore html helper with a custom implementation, you
just need to write an extension method for the `SitecoreHelper` class:

```csharp
public static MvcHtmlString GetExtensionMethodString(this SitecoreHelper helper)
{
    return new MvcHtmlString("This comes from the extension method!");
}
```

Which you can call with:

```csharp
@Html.Sitecore().GetExtensionMethodString()
```

The benefits are clear: It's very simple and your co-developers don't even need
to know if this method is a Sitecore extension or your custom code, they can
simply use it the same way as it would be a Sitecore helper method.

## Custom `HtmlHelper`

Extension methods have one big disadvantage: You can't override methods nor can
you use protected methods of the "original" html helper. So another possibility
is to write a custom html helper the same way as Sitecore does. The goal is to
have something we can call like this:

```csharp
@Html.Custom().MethodToCall()
```

Also here the concept is very easy. `Custom()` is an extension method of the
ASP.NET `HtmlHelper` and returns a new instance of our custom html helper, which
inherits from the `SitecoreHelper`. First we need the custom html helper with a
new method:

```csharp
public class CustomSitecoreHelper : SitecoreHelper
{
    public CustomSitecoreHelper(System.Web.Mvc.HtmlHelper htmlHelper)
        : base(htmlHelper)
    {
    }

    public MvcHtmlString GetCustomHelperString()
    {
        return new MvcHtmlString("This comes from our custom html handler!");
    }
}
```

In this class it is also possible to use and/or override `protected` and
`public` methods of the original Sitecore html helper. One useful protected
method could be `GetValueFromCurrentRendering()` or it could make sense to
override the `FormHandler()` for multiple forms handling (see [this blog
post](https://ctor.io/posting-forms-in-sitecore-controller-renderings-another-perspective/)).

Last but not least we need to write the `HtmlHelper` extension method to get
your custom helper:

```csharp
public static CustomSitecoreHelper Custom(this System.Web.Mvc.HtmlHelper htmlHelper)
{
    // get the helper from current thread
    var threadData = ThreadHelper.GetThreadData<CustomSitecoreHelper>();
    if (threadData != null) return threadData;

    // create new helper if needed
    var helper = new CustomSitecoreHelper(htmlHelper);
    ThreadHelper.SetThreadData(helper);
    return helper;
}
```

Now we are able to use it:

```csharp
@Html.Custom().GetCustomHelperString()
```

In theory you are now able to "forget" the Sitecore html helper and always use
your custom one. This would have a similar effect to your co-workers like
extension methods. Because we inherit from the Sitecore html helper, you can
also call it's method over the custom class:

```csharp
@Html.Custom().Field("My Field")
```

How do you handle these situations in your daily business? Do you have a third,
even better option? If you have ever tried something like this, what did you
experience?
