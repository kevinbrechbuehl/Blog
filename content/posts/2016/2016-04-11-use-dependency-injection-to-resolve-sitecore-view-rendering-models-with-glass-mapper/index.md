---
title: 'Use Dependency Injection to resolve Sitecore View Rendering Models with Glass Mapper'
date: '2016-04-11T07:42:04.000Z'
tags: ['Sitecore']
template: 'post'
---

In Sitecore MVC, a view rendering consists of a (Razor) view and optionally a
model. The model has a definition item under `/sitecore/layout/Models` and must
be referenced in the field `Model` of the rendering definition item. Now when
Sitecore is loading a view rendering, it starts the pipeline `mvc.getModel` to
create an instance of the referenced model and passes the model to the view. By
default Sitecore creates the model instance with `Activator.CreateInstance()`,
which means that the class needs a default constructor and doesn't allow
[constructor
injection](https://en.wikipedia.org/wiki/Dependency_injection#Constructor_injection).
John West has written a good blog post
[here](http://www.sitecore.net/da-dk/learn/blogs/technical-blogs/john-west-sitecore-blog/posts/2012/06/using-dependency-injection-to-determine-mvc-models-with-the-sitecore-aspnet-cms.aspx)
how you can use dependency injection to create the model.

But what is different when you use [Glass
Mapper](http://www.glass.lu/Mapper/Sc)? Glass Mapper adds a new processor
[`GetModelFromView.cs`](https://github.com/mikeedwards83/Glass.Mapper/blob/master/Source/Glass.Mapper.Sc.Mvc/Pipelines/Response/GetModelFromView.cs)
in the `mvc.getModel` pipeline which resolves the model automatically out of the
model definition in the view (`@model xyz`). The model definition item under
`/sitecore/layout/Models` and the reference in the rendering definition item are
not needed anymore. Wohhooo! But this also means, that the approach from John
West to create models using dependency injection doesn't work anymore.
Fortunately Glass Mapper is almost as flexible than Sitecore itself, so there is
a way too.

Glass Mapper has a concept called _Object Construction pipeline_. This is not a
Sitecore pipeline, but works similar. There are different tasks in this pipeline
and each task is responsible to create an object. When resolving the model from
the view rendering, the model instance is also created using this pipeline. So
the only thing we need to do is adding a new task to resolve our model with our
dependency injection container. A task must always implement the interface
`IObjectConstructionTask`. In the following example I have added an empty
interface `IContainerModel` to identify which models I want to resolve using the
container. All models in my view renderings which should be resolved using
dependency injection must implement the interface `IContainerModel` as well. The
task itself is very simple:

```csharp
public class CreateViewModelTask : IObjectConstructionTask
{
    public virtual void Execute(ObjectConstructionArgs args)
    {
        // check that no other task has created an object and that this is a model which should be resolved using the container
        if (args.Result != null || !typeof(IContainerModel).IsAssignableFrom(args.Configuration.Type)) return;

        // create instance using the container
        var model = MyContainer.Resolve(args.Configuration.Type);

        // set the new object as the returned result
        args.Result = model;
    }
}
```

The task needs to be registered in Glass Mapper and it's important that this
task runs first. Otherwise it will result in a similar exception than in the
beginning that there is no default constructor available. With Glass Mapper V4
the task can be registered in `GlassMapperScCustom.cs` while initializing Glass
Mapper:

```csharp
public static IDependencyResolver CreateResolver()
{
    var config = new Glass.Mapper.Sc.Config();
    var dependencyResolver = new DependencyResolver(config);

    // register the task at index 0 (first)
    dependencyResolver.ObjectConstructionFactory.Insert(0, () => new CreateViewModelTask());

    return dependencyResolver;
}
```

That's it. Summarized this has the following advantages:

- You don't need to create a model definition item in Sitecore anymore, just
  define the model type in your view and let Glass Mapper handle the rest.
- All your models will automatically be resolved using your prefered dependency
  injection container.
- You can control which models should be resolved using your container with the
  interface `IContainerModel`.

Do you already use this feature from Glass Mapper? Are there any other ways to
have similar results?
