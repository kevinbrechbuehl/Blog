---
title: 'Sitecore and Solr: Your query is using non UTC dates'
date: '2016-10-01T17:35:39.000Z'
tags: ['Sitecore']
template: 'post'
---

In a current project we are using Solr for the first time. We ran into several
problems which all of you may had. Most of them are well documented and a
solution is easy to find. This blog post describes an issue with non UTC dates
which was not that easy to find.

My use case was to build a news application where each item has a field
`Publication Date`. The date is stored in Solr as follow (in UTC):

```bash
"publication_date_tdt" : "2016-09-15T00:00:00Z"
```

Now when I want to query all news that are older than first of January 2016, I
first need to get the date:

```csharp
var myDate = new DateTime(2016, 1, 1);
```

Depending on your current culture this date won't be in UTC. When using this
date now in your Solr query, your search log will have the following entry in
it:

```bash
> Your query is using non UTC dates. field:publication\_date_tdt value: 01.01.2016 00:00:00. You will probably have incorrect search result.
```

By default, Sitecore/Solr recalculates the date to be in UTC. In my current
case, the date which will be queried will be `31.12.2016 22:00:00` which will
return incorrect results. The easiest solution is to get your date in UTC and
use this in your Solr query instead. You can _convert_ your date into a UTC date
(without chaning the actual time) with the following code snipped:

```csharp
var myUtcDate = DateTime.SpecifyKind(myDate, DateTimeKind.Utc);
```

This is very simple, but is also a bit risky. In my specific case this works as
it is exactly what I want. But you should always care about timezones and be
sure that you query your index or database in the correct timezone and with the
correct dates. I hope that helps the next one who searches for this error
message and didn't find a solution ;-)
