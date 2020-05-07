---
title: 'Limit the number of components in a Sitecore placeholder'
date: '2016-06-04T19:55:51.000Z'
tags: ['Sitecore']
template: 'post'
---

One missing feature in Sitecore is the ability to limit the number of components
which can be binded to a
[placeholder](http://www.sitecore.net/learn/blogs/technical-blogs/john-west-sitecore-blog/posts/2012/06/processing-placeholders-with-mvc-in-the-sitecore-aspnet-cms.aspx).
By default, an author can add as many components to a placeholder as he wants.
But sometimes there are restrictions in the layout, where more than a specific
number of components would break it. Let's say we have a teaser row to add
components. In a three-column layout, the maximum of allowed teasers would be
three.

There are already good solutions available for this (e.g. [this one
here](http://www.newguid.net/sitecore/2014/restricting-the-number-of-components-in-the-sitecore-page-editor/)
from [Robbert Hock](https://twitter.com/kayeenl)). But all solutions I found
were built for Webforms. As we are using MVC and the placeholder definition and
rendering in MVC works slightly different, I was not able to use this approach.
In addition, my requirement was to only limit the number of components in the
frontend: The author should be able to add as many components in the Experience
Editor as he wants. In the frontend (or preview), only the first _n_ components
should be shown.

In Sitecore MVC, the pipeline `mvc.renderPlaceholder` is responsible to render
it's content. In this pipeline there is the processor
`Sitecore.Mvc.Pipelines.Response.RenderPlaceholder.PerformRendering` which has a
method `GetRenderings()`. This seems to be perfect for my needs. Instead of
returning all renderings there, I need to only return the first _n_ renderings.
This is the idea, but first we need to configure the maximum number of
components.

To achieve this, I have written a custom `HtmlHelper` method which adds the
number of components to the pipeline arguments:

```csharp
public class CustomSitecoreHelper : SitecoreHelper
{
    public CustomSitecoreHelper(System.Web.Mvc.HtmlHelper htmlHelper)
        : base(htmlHelper)
    {
    }

    public HtmlString Placeholder(string placeholderName, int maxComponents)
    {
        Assert.ArgumentNotNull(placeholderName, "placeholderName");
        using (ContextService.Get().Push(this.HtmlHelper.ViewContext))
        {
            var stringWriter = new StringWriter();
            var args = new RenderPlaceholderArgs(placeholderName, stringWriter, this.CurrentRendering);
            if (maxComponents > 0)
            {
                args.CustomData["maxComponents"] = maxComponents;
            }

            PipelineService.Get().RunPipeline("mvc.renderPlaceholder", args);
            return new HtmlString(stringWriter.ToString());
        }
    }
}
```

It's important to add this method in a custom `HtmlHelper`, as I have described
in [this post](https://ctor.io/extend-the-sitecore-htmlhelper/#customhtmlhelper)
(see section _Custom HtmlHelper_). This can then be used in the Razor view as
follow:

```csharp
@Html.Custom().Placeholder("my-placeholder-name", 3)
```

Now the number of allowed components can be read out of the pipeline arguments
in the pipeline processor I mentioned at the beginning. So let's write this
custom processor and override the `GetRenderings()` method:

```csharp
public class PerformRendering : Sitecore.Mvc.Pipelines.Response.RenderPlaceholder.PerformRendering
{
    protected override IEnumerable<Rendering> GetRenderings(string placeholderName, RenderPlaceholderArgs args)
    {
        // get all renderings
        var renderings = base.GetRenderings(placeholderName, args);

        // return all renderings in Experience Editor
        if (Sitecore.Context.PageMode.IsExperienceEditor) return renderings;

        // get the maximum number of components
        var maxComponents = this.GetMaxComponents(args);

        // return only first n components
        return maxComponents > 0 ? renderings.Take(maxComponents) : renderings;
    }

    private int GetMaxComponents(RenderPlaceholderArgs args)
    {
        var maxComponents = 0;
        if (args.CustomData.ContainsKey("maxComponents"))
        {
            int.TryParse(args.CustomData["maxComponents"].ToString(), out maxComponents);
        }

        return maxComponents;
    }
}
```

Last but not least we need to patch the original pipeline processor and replace
it with the custom one:

```xml
<configuration xmlns:patch="http://www.sitecore.net/xmlconfig/">
  <sitecore>
    <pipelines>
      <mvc.renderPlaceholder>
        <processor patch:instead="*[@type='Sitecore.Mvc.Pipelines.Response.RenderPlaceholder.PerformRendering, Sitecore.Mvc']"
                   type="Website.Pipelines.RenderPlaceholder.PerformRendering, Website" />
      </mvc.renderPlaceholder>
    </pipelines>
  <sitecore>
</configuration>
```

That's it. This is a very clean way of restricting the number of components in a
placeholder. However if you have the requirement that the author should not be
able to add more components than allowed in the Experience Editor, it is not the
perfect solution. Unfortunately I didn't found a solution for this within
Sitecore MVC. Does anyone of you have a solution for this? How do you handle
these requirements?
