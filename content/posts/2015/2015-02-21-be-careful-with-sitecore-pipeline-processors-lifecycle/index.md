---
title: 'Be careful with Sitecore pipeline processors lifecycle'
date: '2015-02-21T12:25:00.000Z'
tags: ['Sitecore']
template: 'post'
---

In a current project we have the requirement to show the same content in
different contextes. For example, we want to show the same content item under
different url’s with different breadcrumb navigation etc. To achieve this we’ve
added a new processor for the `httpRequestBegin` pipeline where we build our
context. In the different views we catch up this context and generate the
markup. The context we build was registered with an IoC ([inversion of
control](http://en.wikipedia.org/wiki/Inversion_of_control)) container in a "per
webrequest" lifecycle (a new instance for each http request). We ran into many
problems with the pipeline processor... But let’s start at the beginning.

Our processor resolves an instance of `IContext` from the container in the
constructor. There are of course better ways (i.e. [poor man dependency
injection](https://software2cents.wordpress.com/2013/03/29/poor-mans-dependency-injection/)
or [adding a factory to resolve pipeline
processors](http://cardinalcore.co.uk/2014/07/02/sitecore-pipelines-commands-using-ioc-containers/)),
but for demonstrating I think it’s enough.

```csharp
public class LifecycleTest : HttpRequestProcessor
{
    private IContext context;

    public LifecycleTest()
    {
        this.context = MyContainer.Resolve<IContext>;
        Sitecore.Diagnostics.Log.Info("ctor() has been called", this);
    }

    public override void Process(HttpRequestArgs args)
    {
        Sitecore.Diagnostics.Log.Info("Process(HttpRequestArgs args) method has been called", this);

        // do stuff here
    }
}
```

After some tests we found that the context is always the same (not only the same
for one web request). Here the log for this processor with three requests:

```bash
21.02.2015 14:03:23 ctor() has been called
21.02.2015 14:03:23 Process(HttpRequestArgs args) method has been called
21.02.2015 14:03:39 Process(HttpRequestArgs args) method has been called
21.02.2015 14:03:55 Process(HttpRequestArgs args) method has been called
```

In fact, pipeline processors from Sitecore lives in a Singleton lifecycle and
therefor the constructor is only called once at the first request and our
context stays the same for all future requests. So we tried to resolve the
context within the `Process()` method, as this method is called once per web
request:

```csharp
public class LifecycleTest : HttpRequestProcessor
{
    private IContext context;

    public override void Process(HttpRequestArgs args)
    {
        Sitecore.Diagnostics.Log.Info("Process(HttpRequestArgs args) method has been called", this);
        this.context = MyContainer.Resolve<IContext>;

        // do stuff here
    }
}
```

We needed the context in several methods of the processor, so we did it with a
private field. This works then very well, until we have seen the results of load
tests. We got really strange results. The key point was, that different requests
swap/takes the context of another request. How is this possible? The answer is
quite simple, but hard to find when you did the mistake: As the pipeline
processor is in fact a Singleton, the private field keeps it’s value over
multiple requests. Because the `Process()` method overrides the field at every
request this works fine for single requests, but under high load with concurrent
requests, no chance. We have also tried the way with a factory, as [described by
Nat in his
blog](http://cardinalcore.co.uk/2014/07/02/sitecore-pipelines-commands-using-ioc-containers/),
with the same result: Pipeline processors have a Singleton scope.

##Conclusion
A rule when working with dependency injection is, that the lifecycle of a class
can never be lower than the one which holds it’s reference. Same is when working
with Sitecore pipeline processors: Constructor injection (or working with
private fields at all) only works for classes which lives in a Singleton
lifecycle.

**_Update:_** [Nick Wesselman](https://twitter.com/techphoria414) mentioned on
[Twitter](https://twitter.com/techphoria414/status/569514453579927552) that
there is an (undocumented) attribute `reusable="false"` on the processor
configuration which makes the scope of the pipeline processor transient.

```xml
<configuration xmlns:patch="http://www.sitecore.net/xmlconfig/">
  <sitecore>
    <pipelines>
      <httpRequestBegin>
        <processor type="Website.Pipelines.HttpRequestBegin.LifecycleTest, Website" reusable="false" />
      </httpRequestBegin>
    </pipelines>
  </sitecore>
</configuration>
```

And yes, this worked. With this configuration, the constructor of the processor
is called for every request. For performance reasons, I would only use this for
testing purposes or if it’s really necessary to have the processor in transient
scope. I prefer to solve the described requirements with local variables.
