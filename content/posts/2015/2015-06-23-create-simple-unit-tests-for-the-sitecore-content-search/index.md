---
title: 'Create simple Unit Tests for the Sitecore Content Search'
date: '2015-06-23T10:36:00.000Z'
tags: ['Sitecore']
template: 'post'
---

I recently wanted to test a class where I used the Sitecore Content Search. As I
didn’t found a simple example on Google I started to write this blog post. I
want to show you in a very simple example how you can create a Unit Test for
testing your Content Search queries.

Let’s assume that I have a products data template, with a checkbox field `Free`
(to mark that this is for free) and an Item Bucket where I store all the
products. I want to retrieve all products in the Bucket which are for free,
using the Sitecore Content Search. So first of all I need a custom model for my
search results:

```csharp
public class ProductSearchResultItem : SearchResultItem
{
    [IndexField("free")]
    public virtual bool Free { get; set; }
}
```

This model is used in my search repository class. The class is very simple.
First I get the search context from Sitecore and get the `Queryable` (which
contains actually all items in the index). Then I filter by my `Free` field and
return the list. The class could look like this:

```csharp
public class SearchRepository
{
    public virtual IEnumerable<ProductSearchResultItem> GetProducts(SitecoreIndexableItem item)
    {
        using (var context = ContentSearchManager.CreateSearchContext(item))
        {
            var query = context.GetQueryable<ProductSearchResultItem>();

            var products = query.Where(searchResultItem => searchResultItem.Free);

            return products.ToList();
        }
    }
}
```

And could be used as follow (i.e. in a MVC controller):

```csharp
var bucketItem = Sitecore.Context.Database.GetItem("<bucket id>")
var repository = new SearchRepository();
var products = repository.GetProducts(bucketItem);
```

This works fine, but is not testable, because we have a strong dependency to the
Sitecore `ContentSearchManager`. To remove this, we simply need to create a
custom method to get the search context. The refactored repository looks like
this:

```csharp
public class SearchRepository
{
    public virtual IEnumerable<ProductSearchResultItem> GetProducts(SitecoreIndexableItem item)
    {
        using (var context = this.GetSearchContext(item))
        {
            var query = context.GetQueryable<ProductSearchResultItem>();

            var products = query.Where(searchResultItem => searchResultItem.Free);

            return products.ToList();
        }
    }

    protected virtual IProviderSearchContext GetSearchContext(SitecoreIndexableItem item)
    {
        return ContentSearchManager.CreateSearchContext(item);
    }
}
```

This is now the point where we can go to the Unit Test. We want to fake the
Lucene index with dummy data, so we need to mock the search context. Fortunately
Sitecore has already created an interface `IProviderSearchContext`, so we can do
this easily i.e. with [Moq](https://github.com/Moq/moq4) (grab it on
[NuGet](http://www.nuget.org/packages/moq)). We will create a fake
`IProviderSearchContext` which returns a dummy index with the `GetQueryable()`
method. Take a look here:

```csharp
public class TestableSearchRepository : SearchRepository
{
    protected override IProviderSearchContext GetSearchContext(SitecoreIndexableItem item)
    {
        // create the magic product index
        var index = new List<ProductSearchResultItem>();

        index.Add(new ProductSearchResultItem { Free = true });
        index.Add(new ProductSearchResultItem { Free = false });
        index.Add(new ProductSearchResultItem { Free = true });

        // create the mock context
        var context = new Mock<IProviderSearchContext>();
        context.Setup(c => c.GetQueryable<ProductSearchResultItem>()).Returns(index.AsQueryable());
        return context.Object;
    }
}
```

The fake index contains 3 products where 2 of them are for free. With this new
`TestableSearchRepository` we have no dependency to the Lucene index and can
write a very simple unit test:

```csharp
[Test]
public void GetProductsTest()
{
    // arrange
    var repository = new TestableSearchRepository();

    // act
    var products = repository.GetProducts(null);

    // assert
    Assert.AreEqual(2, products.Count());
}
```

The item passed to the `GetProducts()` method can be `null`, as it’s only used
for retrieving the correct search context in the `ContentSearchManager`. This
example should be a starting point for your Unit Tests. If you have a very
complex Content Search query, you can now test all your conditions with ease.
