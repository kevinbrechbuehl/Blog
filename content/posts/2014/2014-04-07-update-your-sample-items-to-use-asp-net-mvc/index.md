---
title: 'Update your sample items to use ASP.net MVC'
date: '2014-04-07T07:57:00.000Z'
tags: ['Sitecore']
template: 'post'
---

After installing Sitecore you get a sample item template with some sample
renderings. Unfortunately all the sample layouts and renderings are written in
ASP.net WebForms and not in ASP.net MVC.

All of our new projects are based on MVC, so I also want to play around with
MVC. Because you can’t mix MVC and WebForms components in one single http
request I have to change the layouts for every installation, which takes me
longer than the installation itself (with the [Sitecore Instance
Manager](http://marketplace.sitecore.net/en/Modules/Sitecore_Instance_Manager.aspx),
of course). See the [Sitecore MVC Developer’s Reference
Guide](http://sdn.sitecore.net/Reference/Sitecore%207/MVC%20Reference.aspx):

> Both ASP.NET WebForms and MVC are supported and can be mixed, although a
> single request must be rendered by either WebForms or MVC.

For all of you who are annoyed about this after every new installation too, I
created a little Sitecore package which adds new view renderings and changes the
sample item presentation details to the new MVC renderings. The result is the
same, only in MVC. Get it here:

> [Sample-MVC-1.0.zip](./files/Sample-MVC-1.0.zip)

You can install this very easily over the [Sitecore Installation
Wizard](http://sitecoreguild.blogspot.ch/2013/03/quickstart-installing-sitecore-packages.html).
