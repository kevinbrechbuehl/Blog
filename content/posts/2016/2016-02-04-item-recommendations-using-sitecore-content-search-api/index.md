---
title: 'Item recommendations using Sitecore Content Search API'
date: '2016-02-04T18:27:52.000Z'
tags: ['Sitecore']
template: 'post'
---

Last week it was time for the [third Sitecore
Hackathon](http://sitecorehackathon.org/sitecore-hackathon-2016/). Like in the
past two years, I have participated in the Team **Uniques**, together with [Reto
Hugi](https://twitter.com/retohugi) and [Tobias
Studer](https://twitter.com/studert). We wanted to build a simple recommendation
engine: It should recommend items (content) which are similar to the item the
user is currently viewing. With this blog post, I want to show how you can
easily build a very simple recommendation engine.

## Theory

Without being mathematicians and studying all the complex mathematics to
calculate the "perfect" recommendations, we decided to split the task into two
steps: First, all the items should be tagged (with important keywords, depending
on the content). Based on these keywords, we search for items with similar
keywords.

## Item tagging

There are a lot of different ways to tag your content. For demonstrating
purposes, the easiest way is to create a new field `Keywords` on each item and
enter pipe-separated keywords into this field, e.g. `Sitecore|Content Search|Habitat`.

During the Hackathon we wanted to build a solution which works fully automated.
So we have created a [computed
field](http://www.sitecore.net/learn/blogs/technical-blogs/john-west-sitecore-blog/posts/2013/03/sitecore-7-computed-index-fields.aspx)
with the Content Search API and use the **Key phrase extraction** service of the
[Azure Machine Learning
APIs](https://azure.microsoft.com/en-us/documentation/articles/machine-learning-apps-text-analytics/#key-phrase-extraction)
to get a list of important keywords depending on the content of the `Body` field
on each item. If you want to learn more about this, ping
[@studert](https://twitter.com/studert) on Twitter.

## Similarity algorithm

Calculating the similarity between two documents is done at runtime. As I have
already mentioned, this is a very simple algorithm. The [Content Search
API](https://sdn.sitecore.net/Reference/Sitecore%207/Developers%20Guide%20to%20Item%20Buckets%20and%20Search.aspx)
is an abstraction layer over the underlaying storage (which actually is Lucene
or Solr). Lucene would have a great API to calculate similarities between
documents, which would perfectly fit our needs. But as we don't want to rely on
Lucene, we needed to go with the abstraction (the Content Search API).

First we need to create a model to get the keywords in a search query (take care
of the property `Hits`, we need this later on):

```csharp
public class RecommendationSearchResult : SearchResultItem
{
    [IndexField("keywords")]
    [TypeConverter(typeof(IndexFieldEnumerableConverter))]
    public virtual IEnumerable<string> Keywords { get; set; }

    public virtual int Hits { get; set; }
}
```

With this model, we first execute a search to get all the items, which have at
least one same keyword as the current item. We make use of the
[`PredicateBuilder`](http://www.sitecore.net/learn/blogs/technical-blogs/sitecore-7-development-team/posts/2013/05/sitecore-7-predicate-builder.aspx)
with a combination of OR-conditions for this:

```csharp
private IQueryable<RecommendationSearchResult> GetAllMatching(IProviderSearchContext context, IEnumerable<string> keywords, Item item)
{
    // build the predicate -> Keyword1 OR keyword2 OR keyword 3
    var predicate = PredicateBuilder.False<RecommendationSearchResult>();
    predicate = keywords.Aggregate(predicate, (current, phrase) => current.Or(resultItem => resultItem.Keywords.Contains(phrase)));

    // execute the query, excluding the current item
    return context.GetQueryable<RecommendationSearchResult>()
        .Filter(resultItem => resultItem.ItemId != item.ID)
        .Where(predicate);
}
```

After this, we enrich the `Hits` property of each search result with the number
of keywords which are identical to the current item. If an item has 4 identical
keywords it should be ranked better than one with only 2 identical keywords.

```csharp
private IEnumerable<RecommendationSearchResult> GetRankedResults(IQueryable<RecommendationSearchResult> searchResults, IEnumerable<string> keywords)
{
    // calculate number of matchin keywords
    foreach (var searchResult in searchResults)
    {
        searchResult.Hits = searchResult.Phrases.Intersect(keywords).Count();
    }

    // order by number of hits
    return searchResults.OrderByDescending(x => x.Hits);
}
```

Last but not least we need to bring this all together and only return the top
ranked results:

```csharp
public IEnumerable<RecommendationSearchResult> GetRecommendations(Item item, int numberOfItems)
{
    var keywords = item["Keywords"].Split('|');
    using (var context = ContentSearchManager.GetIndex((SitecoreIndexableItem)item).CreateSearchContext())
    {
        var allMatching = this.GetAllMatching(context, keywords, item);
        var rankedResults = this.GetRankedResults(allMatching, keywords);
        var topResults = rankedResults.Take(numberOfItems);

        return topResults.ToList();
    }
}
```

As you see, this algorithm is very easy. What it doesn't consider is the
importance and relevance of the keywords. But our tests on
[Habitat](https://github.com/Sitecore/Habitat) have calculated good
recommendations, and we think that it's even better if there is more content
available on a website.

## Summary

There are a lot of buzzwords available for calculating similarity between two
documents, like vector space model, euclidean distance, cosine similarity, token
frequency and so on... The algorithm mentioned in this blog post is much simpler
and I know it doesn't calculate "perfect" recommendations. But it turned out
that the recommendations are very good too. I think, the more content is
available, the better the results are.

Did you ever build such a recommendation engine or do you rely on third party
implementation for this? How did you do it and what were your learnings?
