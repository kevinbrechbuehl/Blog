---
title: 'One way to implement Dependency Injection for Sitecore Habitat'
date: '2016-05-06T07:59:03.000Z'
tags: ['Sitecore']
template: 'post'
---

[Habitat](https://github.com/Sitecore/Habitat) is an example architecture from
Sitecore. With this modular architecture, everything is encapsulated and
separated into modules, where each module is a Visual Studio project. A great
introduction to Habitat can be found in this [blog post by Anders
Laub](https://laubplusco.net/the-groundbreaking-sitecore-habitat/).

Encapsulation also means, that a module doesn't know other modules. When using
[dependency injection](https://en.wikipedia.org/wiki/Dependency_injection), you
need to configure all dependencies somewhere. And this place needs to know every
implementation, which is not possible with Habitat. Because each module only
knows itself, only the module itself can configure its dependencies. My first
idea and a very simple way to achieve this is using a [custom Sitecore
pipeline](https://laubplusco.net/creating-custom-pipeline-in-sitecore/). So
let's do this.

I have forked Habitat and implemented everything as described in this post in
[the fork available at
GitHub](https://github.com/kevinbrechbuehl/Habitat/tree/dependency-injection).

## Container Initialization

First of all we need to initialize our dependency injection container. My
primary framework choice is [Simple Injector](https://simpleinjector.org/), but
of course you can choose any framework you like. I have added all the code to
initialize dependency injection in a new foundation module
`DependencyInjection`.

Every pipeline needs pipeline arguments. In our custom pipeline, we need to have
a reference to the container. The pipeline arguments for our custom pipeline
look like this:

```csharp
public class InitializeDependencyInjectionArgs : PipelineArgs
{
    public SimpleInjector.Container Container { get; set; }

    public InitializeDependencyInjectionArgs(SimpleInjector.Container container)
    {
        this.Container = container;
    }
}
```

Then we need to create a new processor for the `<initialize>`-pipeline. This
processor basically configures Simple Injector and starts our custom pipeline:

```csharp
public class InitializeDependencyInjection
{
    public void Process(PipelineArgs args)
    {
        // Create the container
        var container = DependencyInjection.Container.CreateContainer();

        // start the custom pipeline to register all dependencies
        var dependencyInjectionArgs = new InitializeDependencyInjectionArgs(container);
        CorePipeline.Run("initializeDependencyInjection", dependencyInjectionArgs);

        // Register Mvc controllers (all assemblies in your solution)
        var assemblies = AppDomain.CurrentDomain.GetAssemblies()
            .Where(a => a.FullName.StartsWith("Sitecore.Feature.") || a.FullName.StartsWith("Sitecore.Foundation."));
        container.RegisterMvcControllers(assemblies.ToArray());

        // Register Mvc filter providers
        container.RegisterMvcIntegratedFilterProvider();

        // Verify if the container
        container.Verify();

        // Set the ASP.NET dependency resolver
        DependencyResolver.SetResolver(new SimpleInjectorDependencyResolver(container));
    }
}
```

You may wonder what `DependencyInjection.Container.CreateContainer()` is. In a
perfect world we would resolve all our dependencies with constructor injection
and would never need to have a reference to our container after initialization.
This is currently not possible in Sitecore. E.g. when using a pipeline
processor, Sitecore will create an instance of it and you are not able to add a
custom constructor to the class. The mentioned line of code is an implementation
of the [Service Locator
pattern](https://en.wikipedia.org/wiki/Service_locator_pattern). The static
class for this looks like this (I will show you later in this post how to use
it):

```csharp
public static class Container
{
    private static SimpleInjector.Container configuration;

    public static SimpleInjector.Container CreateContainer()
    {
        configuration = new SimpleInjector.Container();
        return configuration;
    }

    public static T Resolve<T>() where T : class
    {
        return configuration.GetInstance<T>();
    }

    public static object Resolve(Type type)
    {
        return configuration.GetInstance(type);
    }
}
```

Finish? Not quite yet. We need to register our pipeline processor to the
`<initialize>`-pipeline. It's important to do this before Sitecore registered
the `ControllerFactory`:

```xml
<configuration xmlns:patch="http://www.sitecore.net/xmlconfig/">
  <sitecore>
    <pipelines>
      <initialize>
        <processor type="Sitecore.Foundation.DependencyInjection.Pipelines.Initialize.InitializeDependencyInjection, Sitecore.Foundation.DependencyInjection"
                   patch:before="processor[@type='Sitecore.Mvc.Pipelines.Loader.InitializeControllerFactory, Sitecore.Mvc']" />
        </initialize>
    </pipelines>
  </sitecore>
</configuration>
```

## Configure Dependencies

Now we have a dependency injection container set up, but we don't have any
dependendies configured. This is now the job of each module. The following
example adds the configuration for the _News_ module. All we need to add is a
new pipeline processor in the module:

```csharp
public class RegisterServices
{
    public void Process(InitializeDependencyInjectionArgs args)
    {
        args.Container.Register<INewsRepositoryFactory, NewsRepositoryFactory>();

        // Register other dependencies you have
    }
}
```

And register this processor to our new pipeline
`<initializeDependencyInjection>`:

```xml
<configuration xmlns:patch="http://www.sitecore.net/xmlconfig/">
  <sitecore>
    <pipelines>
      <initializeDependencyInjection>
        <processor type="Sitecore.Feature.News.Pipelines.InitializeDependencyInjection.RegisterServices, Sitecore.Feature.News" />
      </initializeDependencyInjection>
    </pipelines>
  </sitecore>
</configuration>
```

That's it. Just repeat this for all your modules and your container is fully
configured.

## Resolving Dependencies

Habitat is already prepared to use dependency injection, as it uses [poor man’s
dependency
injection](https://software2cents.wordpress.com/2013/03/29/poor-mans-dependency-injection/).
With our new configuration, we want to use constructor injection for all the Mvc
controllers. For the `NewsController` this means we only need to remove this
constructor:

```csharp
public NewsController() : this(new NewsRepositoryFactory())
{
}
```

The only constructor left is:

```csharp
public NewsController(INewsRepositoryFactory newsRepositoryFactory)
{
    this.newsRepositoryFactory = newsRepositoryFactory;
}
```

As I mentioned earlier, this is fine for Mvc controllers, but can't be used e.g.
int pipeline processors. If you need a reference in a pipeline processor (e.g.
to the `INewsRepositoryFactory`) you can now resolve the dependency over the
service locator implementation with the following line of code:

```csharp
DependencyInjection.Container.Resolve<INewsRepositoryFactory>()
```

That's all. What do you think about this implementation? How do you implement
dependency injection in a modular architecture? Please add a comment to this
blog post if you have other ideas or remarks.
