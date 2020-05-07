---
title: 'Provoke 404 for inexistent language version'
date: '2014-02-01T15:36:00.000Z'
tags: ['Sitecore']
template: 'post'
---

Most of our customers have their websites organized in multiple country sites
with multiple languages. If we say we have one site which should be available in
German and English, then each page should be translated in both languages. In
fact, there are always pages/items which are not available in both languages, or
are not yet translated for some reasons. What if the user requests an item in
German which is only available English? Exactly, the user should see a 404 (page
not found) error message. But this is not the way Sitecore deals with this. The
Sitecore `ItemResolver` only looks for items, and in fact, the requested item is
found in the database.

So to fulfill this requirement, we need to add some custom code. First of all we
need a helper to check if an item has an existing version in the current
language. This is very easy, done with this extension method on the `Item`
class:

```csharp
public static bool HasLanguageVersion(this Item item)
{
    if (item == null) return false;

    var itemInLanguage = ItemManager.GetItem(item.ID, Sitecore.Context.Language, Sitecore.Data.Version.Latest, item.Database);
    return itemInLanguage.Versions.GetVersions().Length > 0;
}
```

Directly after the Sitecore item resolving, we have to inject a custom pipeline
processor, which additionally checks for an existing language version:

```csharp
public class LanguageContextResolver : HttpRequestProcessor
{
    public override void Process(HttpRequestArgs args)
    {
        if (Sitecore.Context.Item == null || Sitecore.Context.Database == null)
        {
            return;
        }

        if (!Sitecore.Context.Item.HasLanguageVersion())
        {
            Sitecore.Context.Item = null;
            return;
        }
    }
}
```

The only thing we do is setting the `Sitecore.Context.Item` to `null`. This way
we tell Sitecore that no item was found in the database and therefor, the page
not found error message will be displayed. As I said before, this processor has
to be enabled directly after the `ItemResolver` from Sitecore. This can be done
with a custom config file within the `App_Config/Include` folder of your website
folder:

```xml
<configuration xmlns:patch="http://www.sitecore.net/xmlconfig/">
    <sitecore>

    <pipelines>
        <httpRequestBegin>
        <processor patch:after="processor[@type='Sitecore.Pipelines.HttpRequest.ItemResolver, Sitecore.Kernel']"
                   type="Website.Pipelines.LanguageContextResolver, Website" />
        </httpRequestBegin>
    </pipelines>

    </sitecore>
</configuration>
```

This is all the magic. If you don’t want to use the default error page from
Sitecore, you could use the [Sitecore Error
Manager](http://marketplace.sitecore.net/en/Modules/Sitecore_Error_Manager.aspx),
found in the [Marketplace](http://marketplace.sitecore.net/). With this module,
you can show a custom content item as your 404 page.
