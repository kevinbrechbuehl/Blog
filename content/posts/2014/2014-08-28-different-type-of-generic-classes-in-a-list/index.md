---
title: 'Different type of generic classes in a list'
date: '2014-08-28T08:36:00.000Z'
tags: ['C#']
template: 'post'
---

I recently came across a functionality where I need to have a generic class with
a generic property. As an example I needed different field classes where each
field has it’s value. I have two different classes for a string and an integer.

```csharp
public interface IField<TValue>
{
    TValue Value { get; set; }
}

public class StringField : IField<string>
{
    public StringField()
    {
        this.Value = "my string";
    }

    public string Value { get; set; }
}

public class IntField : IField<int>
{
    public IntField()
    {
        this.Value = 7;
    }

    public int Value { get; set; }
}
```

Now I need a list, where I want to store this different fields, something like
this:

```csharp
var myFields = new List<IField<TValue>>();
myFields.Add(new StringField());
myFields.Add(new IntField());
```

But unfortunately the compiler is not happy with this. Why should he? It’s
totally unclear what the type `TValue` is. So I thought about how to specify
this type. But I don’t know neither. On the first field the type should be
`string`, on the second `int`. I searched a lot and didn’t find a solution for
this. Fortunately a friend of mine could help me out. The solution is to create
a non-generic interface for fields and specify the `Value` property as `object`
(notice the `new` keyword, as this is important here).

```csharp
public interface IField
{
    object Value { get; set; }
}

public interface IField<TValue> : IField
{
    new TValue Value { get; set; }
}
```

A base class implementation of this interface then does the fancy stuff for me.
The interesting thing happens in `IField.Value`, where we set the "real" value.

```csharp
public abstract class FieldBase<TValue> : IField<TValue>
{
    object IField.Value
    {
        get { return this.Value; }
        set { this.Value = value != null ? (TValue)value : default(TValue); }
    }

    public virtual TValue Value { get; set; }
}
```

My field implementations then are very easy.

```csharp
public class StringField : FieldBase<string>
{
    public StringField()
    {
        this.Value = "my string";
    }
}

public class IntField : FieldBase<int>
{
    public IntField()
    {
        this.Value = 7;
    }
}
```

And how does my list now looks like? Very handy, with the type `IField`.

```csharp
var myFields = new List<IField>();
myFields.Add(new StringField());
myFields.Add(new IntField());

foreach (var field in myFields)
{
    Console.WriteLine(field.GetType() + ": " + field.Value);
}
```

Cool, now we are able to store a generic field into our non-generic list. This
seems to me like a very common issue. Do you also experience this issue before?
Are there any other ways of implementing this? Feedback is very welcome.
