---
title: 'Test your Fast Queries with Sitecore.FakeDb'
date: '2015-09-08T10:41:00.000Z'
tags: ['Sitecore']
template: 'post'
---

During the last few months I was very busy with my Master Thesis. Now the
project is almost finish and I can spend more time on my blog and helping in the
community. Yay! While implementing my project for the Master Thesis I’ve learned
a lot about Unit Testing with Sitecore and I realised how easy and fast you can
write them. This blog post should show you in a very simple example how you can
test your [Sitecore Fast
Queries](https://sdn.sitecore.net/upload/sdn5/developer/using%20sitecore%20fast%20query/using%20sitecore%20fast%20query001.pdf).

When you decide not to use the [Sitecore Content
Search](https://doc.sitecore.net/sitecore_experience_platform/searching), then
Sitecore Fast Queries are a common way of querying items from the Sitecore
database. A good example would be a news application, where the news should be
filtered by year. The following method will return all news items available
under `/sitecore/content/News` in a given year:

```csharp
public class NewsRepository
{
    public virtual IEnumerable<Item> GetNews(int year)
    {
        // generate the search query
        var query = string.Format("fast:/sitecore/content/News/*[@Date >= '{0}' and @Date <= '{1}']",
            DateUtil.ToIsoDate(new DateTime(year, 1, 1)),
            DateUtil.ToIsoDate(new DateTime(year, 12, 31)));

        // get items from the database
        return Sitecore.Context.Database.SelectItems(query);
    }
}
```

One year ago, I thought this is pretty much impossible to test. But no, it
isn’t. It’s even very easy, when using
[Sitecore.FakeDb](https://github.com/sergeyshushlyapin/Sitecore.FakeDb). FakeDb
allows you to fake the Sitecore database and build a database in memory. So you
only need to build a fake database and everything else is handled by FakeDb.
First you need to install Sitecore.FakeDb into your test project (see
introductions
[here](https://github.com/sergeyshushlyapin/Sitecore.FakeDb/wiki/Installation)).
Then we create a simple static method to fake our database. The start point of
the fake database is `/sitecore/content`, so the first item added is directly
under this path. The following example shows how to add three news entries under
`/sitecore/content/News` (with a different data of course):

```csharp
private static Db GetDatabase()
{
    var db = new Db();
    var root = new DbItem("News");

    var news1 = new DbItem("News 1") { { "Title", "News 1" }, { "Date", DateUtil.ToIsoDate(new DateTime(2015, 4, 2)) } };
    root.Add(news1);

    var news2 = new DbItem("News 2") { { "Title", "News 2" }, { "Date", DateUtil.ToIsoDate(new DateTime(2015, 12, 20)) } };
    root.Add(news2);

    var news3 = new DbItem("News 3") { { "Title", "News 3" }, { "Date", DateUtil.ToIsoDate(new DateTime(2014, 2, 10)) } };
    root.Add(news3);

    db.Add(root);

    return db;
}
```

The unit test then simply needs to use this database and call the method in the
repository:

```csharp
[Test]
public void GetNewsTest()
{
    using (var database = GetDatabase())
    {
        // arrange
        var newsRepository = new NewsRepository();

        // act
        var news = newsRepository.GetNews(2015);

        // assert
        Assert.IsNotNull(news);
        Assert.AreEqual(2, news.Count());
    }
}
```

That’s it! You see, also when using the `Sitecore.Context` directly in your code
(which is usually the case when you don’t use some ORM like [Glass
Mapper](http://www.glass.lu/)), it’s possible to test your code. With FakeDb you
can test almost every code you have in your solution (also some old legacy
code).
