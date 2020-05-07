---
title: 'Dynamic field sources with getLookupSourceItems pipeline'
date: '2015-01-02T12:09:00.000Z'
tags: ['Sitecore']
template: 'post'
---

In many link and list fields in Sitecore we can set an item source in the data
template. With the source we define what for items the content authors can
choose later on when editing his content. Sitecore resolves these items with the
`getLookupSourceItems` pipeline.

This means that we can inject any action we want to resolve the source items.
For example we could resolve items dependent on the value the author has chosen
in another field. In the following little example I have a `Treelist` in my item
to choose several themes. I also have a `Droplink` where I want to choose a
master theme. All themes chosen in the `Treelist` I want to have available in my
`Droplink`.

With the following processor you can set a `fromfield` property i the source of
the data template. This means that all the items available in the list should be
dependent of the items added in the other field. This looks like this:

![](./images/droplink_fromfield.png)

The following pipeline processor is based on this property and dynamically
creates a Sitecore query which resolves all the items chosen in the dependent
field.

```csharp
public class LookupItemsFromField
{
    private const string FromFieldParam = "fromfield";

    public void Process(GetLookupSourceItemsArgs args)
    {
        // check if "fromfield" is available in the source
        if (!args.Source.Contains(FromFieldParam))
        {
            return;
        }

        // get the field
        var parameters = Sitecore.Web.WebUtil.ParseUrlParameters(args.Source);
        var fieldName = parameters[FromFieldParam];

        // set the source to a query with all items from the other field included
        var items = args.Item[fieldName].Split('|');
        args.Source = this.GetDataSource(items);
    }

    private string GetDataSource(IList<string> items)
    {
        if (!items.Any()) return string.Empty;

        var query = items.Aggregate(string.Empty, (current, itemId) => current + string.Format(" or @@id='{0}'", itemId));
        return string.Format("query://*[{0}]", query.Substring(" or ".Length));
    }
}
```

Don’t forget to register this pipeline processor in your config file:

```xml
<configuration xmlns:patch="http://www.sitecore.net/xmlconfig/">
  <sitecore>
    <pipelines>
      <getLookupSourceItems>
        <processor patch:before="processor[1]"
                   type="Website.LookupItemsFromField, Website" />
        </getLookupSourceItems>
    </pipelines>
  </sitecore>
</configuration>
```

I read many forum and blog posts about this requirement and many solutions are
to create a custom field. Of course this also works, but I’m pretty sure that
the easier and more flexible solution is to make use of this fantastic pipeline.
The pipeline processor is generic and can be used for many purposes with
dependent source items. And you also don’t have to add any custom definition
items for new field types in the core database.

_Note: The source in this post I originally created for [this Stack Overflow
answer](http://stackoverflow.com/a/25785363/2074649)._
