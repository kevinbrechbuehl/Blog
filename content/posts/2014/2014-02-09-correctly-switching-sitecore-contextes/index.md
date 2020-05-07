---
title: 'Correctly switching Sitecore contextes'
date: '2014-02-09T18:18:00.000Z'
tags: ['Sitecore']
template: 'post'
---

In the last couple of weeks I came across multiple posts on [Stack
Overflow](http://stackoverflow.com/questions/tagged/sitecore) and the [SDN
forum](http://sdn.sitecore.net/forum//ShowForum.aspx?ForumID=10), where someone
needs to switch a specific Sitecore context property for some reason. Let's take
the `Sitecore.Context.Language`: we need to change the language, do some actions
(i.e. loading some items in this language) and change the language back to the
one before.

I saw, that most of the users do this fully manual:

1. Buffer the current language in a variable
2. Set the new language with `Sitecore.Context.SetLanguage()`
3. Do whatever needs to be done
4. Reset the language with the one in the temporary variable

Yes, this works. If error handling is ok and resetting the language is done in a
finally-block, everything is ok. But do you know that there is a much simpler
way to do this?

So basically, the
[IDisposable](<http://msdn.microsoft.com/en-us/library/system.idisposable(v=vs.110).aspx>)
is a very good way to achieve this: Set the new language in the constructor and
reset to the old language while disposing. Then simply use the class in a
using-block. Sitecore has exactly done this with the `LanguageSwitcher`:

```csharp
var myItem = Sitecore.Context.Item;
using (new Sitecore.Globalization.LanguageSwitcher("de"))
{
    myItem = myItem.Database.GetItem(myItem.ID);
}
```

You have neither to care about resetting the language nor to implement a
try-finally block and custom exception handling (as long as your language given
in the constructor is valid). Isn't it very easy?

Sitecore offers different "switchers", the mostly used ones are:

- `Sitecore.Globalization.LanguageSwitcher` for switching the
  `Sitecore.Context.Language`.
- `Sitecore.Sites.SiteContextSwitcher` for switching the
  `Sitecore.Context.Site`.
- `Sitecore.Data.DatabaseSwitcher` for switching the
  `Sitecore.Context.Database`, i.e. to read something out of the master database
  on a delivery environment (but be careful with this!).
- `Sitecore.Security.Accounts.UserSwitcher` for switching the
  `Sitecore.Context.User`, i.e. to execute some code with administrator
  permissions.
