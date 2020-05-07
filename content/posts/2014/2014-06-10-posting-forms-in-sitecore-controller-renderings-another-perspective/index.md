---
title: 'Posting forms in Sitecore controller renderings – another perspective'
date: '2014-06-10T08:23:00.000Z'
tags: ['Sitecore']
template: 'post'
---

[Martina Welander](http://mhwelander.net/), Technical Consulting Engineer at
Sitecore, recently blogged about posting forms in Sitecore MVC: [Part 1 – View
Renderings](http://mhwelander.net/2014/05/28/posting-forms-in-sitecore-mvc-part-1-view-renderings/)
and [Part 2 – Controller
Renderings](http://mhwelander.net/2014/05/30/posting-forms-in-sitecore-mvc-part-2-controller-renderings/).
Especially for controller renderings there are multiple ways of doing it. In
this blog post I want to explain another way of doing it. This post is based on
the [comments on her
blog](http://mhwelander.net/2014/05/30/posting-forms-in-sitecore-mvc-part-2-controller-renderings/#comments)
and an [SDN forum
post](http://sdn.sitecore.net/Forum/ShowPost.aspx?PostID=61553).

##Recap
In Sitecore MVC the page is rendered by different renderings. This means that on
one single page request, there could be multiple controller renderings. In pure
ASP.NET MVC, a form is always posted to one certain action, which is marked with
the attribute `[HttpPost]`. In Sitecore this is not possible because the page is
rendered through the rendering pipeline and not only through a single action.
Martina mentioned several ways of dealing with this:

- Using `@Html.Sitecore().FormHandler()` to post to the specific action of the
  controller rendering. In the action, redirect back to a normal page.
- Posting the form with Ajax.
- Manually start the rendering pipeline of Sitecore and work with `TempData`.
- Inherit from `SitecoreController`, calling the `base.Index()` method and work
  with `TempData`.

All this ideas are a bit away from pure ASP.NET MVC. Additionally you may need
to deal with `TempData` and could not use strongly typed view models. Also form
validation does not work in every case.

##Pure ASP.NET MVC
I like the way how ASP.NET MVC works and I would like to create my Sitecore
controllers as near as possible to the standard way. Let’s look into a small
example which I would do with pure ASP.NET MVC. I have the following view model:

```csharp
public class FormModel
{
    [Required]
    public string Name { get; set; }
}
```

On the GET-request, I want to show a simple form with my name field:

```csharp
@model Website.Models.FormModel

@using (Html.BeginForm())
{
    @Html.DisplayFor(m => m.Name)
    @Html.TextBoxFor(m => m.Name)
    @Html.ValidationMessageFor(m => m.Name)

    <input type="submit" value="submit"/>
}
```

On the POST-request, I want to show a simple success message. If validation
fails (remember, my `Name`-property is required), I want to show the form again.
This can be done with the following controller:

```csharp
public class MyController : Controller
{
    public ActionResult Index()
    {
        return View(new FormModel());
    }

    [HttpPost]
    public ActionResult Index(FormModel model)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        // do some other stuff, like storing the name in the database

        return View("Success");
    }
}
```

This code also works with Sitecore MVC, as long as we do not have multiple
controller renderings with a form on single page request. If we have, the
POST-action of each controller rendering is called instead of the GET-action.
But the POST-action should only be called from the controller where the user has
posted the form. For all other controller renderings, the GET-action should be
called.

##Finding the correct POST-action
The initial hint of how to solve this, I’ve found on a [blog post from Mike
Edwards](http://www.experimentsincode.com/?p=425). I searched for a more generic
way of doing this and found, that Sitecore almost implemented this with the
FormHandler. I simply add two hidden fields to each of my forms. In my example I
would add these:

```xml
<input type="hidden" name="fhController" value="MyController"/>
<input type="hidden" name="fhAction" value="Index"/>
```

This can be manually added into the view, or we could create a custom
`HtmlHelper` function which does this (something similar like Sitecore is doing
with `@Html.Sitecore().FormHandler()`).

This means, that on the POST-request we know which controller/action has forced
the post and also which POST-action should be called. With a custom attribute on
every POST-action, we can then check if the action is valid or not:

```csharp
public class ValidateFormHandler : ActionMethodSelectorAttribute
{
    public override bool IsValidForRequest(ControllerContext controllerContext, MethodInfo methodInfo)
    {
        var controller = controllerContext.HttpContext.Request.Form["fhController"];
        var action = controllerContext.HttpContext.Request.Form["fhAction"];

        return !string.IsNullOrWhiteSpace(controller)
                && !string.IsNullOrWhiteSpace(action)
                && controller == controllerContext.Controller.GetType().Name
                && methodInfo.Name == action;
    }
}
```

The POST-action then gets this additional attribute:

```csharp
[HttpPost]
[ValidateFormHandler]
public ActionResult Index(FormModel model)
{
    // code
}
```

##Summary
There are many options you have when building forms with Sitecore MVC. None of
them are bad or wrong. Several options are more based on Sitecore, the others
are more based on pure ASP.NET MVC. It’s up to you what you like more and which
one you choose.

What do you think about the different options? Which one do you prefer or do you
use in your projects? Are there other options which we have missed?
