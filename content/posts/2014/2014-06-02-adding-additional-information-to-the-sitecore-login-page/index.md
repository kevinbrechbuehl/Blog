---
title: 'Adding additional information to the Sitecore login page'
date: '2014-06-02T08:18:00.000Z'
tags: ['Sitecore']
template: 'post'
---

In a current project we wanted to show the current build number on the login
page. This should help the content authors and testers to easily identify which
build is currently running and for which build they have to create issues/bugs
on our issue tracker.

I though this is an easy one and just altered the `/sitecore/login/default.aspx`
file with the following content:

```xml
<div id="CustomerVersion" class="SystemInformationDivider">
  Customer build: <%=System.Reflection.Assembly.GetAssembly(typeof(MyAssembly)).GetName().Version.ToString()%>
</div>
```

Today, I’ve learned from [Robbert Hock](https://twitter.com/kayeeNL) that this
isn’t they way of doing this ;-) I heard of the `getAboutInformation`-pipeline.
With this, we can easily add additional information to the right panel of the
login page:

```csharp
namespace Website.Pipelines
{
    public class AddBuildVersion
    {
        public void Process(GetAboutInformationArgs args)
        {
            args.LoginPageText = "Customer build: " + Assembly.GetExecutingAssembly().GetName().Version;
        }
    }
}
```

And configure the new processor in the `web.config`:

```xml
<configuration>
  <sitecore>
    <pipelines>
      <getAboutInformation>
        <processor type="Website.Pipelines.AddBuildVersion, Website" />
      </getAboutInformation>
    </pipelines>
  </sitecore>
</configuration>
```

That’s it! If you would like to show a custom text with an image on the login
page, there is a Shared Source Module in the
[Marketplace](http://marketplace.sitecore.net/) called [Sitecore Partner
Aboutinformation
Module](https://marketplace.sitecore.net/en/Modules/Sitecore_Partner_AboutInformation_Module.aspx)
(contributed by Robbert Hock as well).

Thanks again Robbert for giving me the hint.
