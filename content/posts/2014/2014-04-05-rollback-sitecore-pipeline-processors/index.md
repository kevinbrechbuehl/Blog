---
title: 'Rollback Sitecore Pipeline Processors'
date: '2014-04-05T07:36:00.000Z'
tags: ['Sitecore']
template: 'post'
---

[Sitecore
Pipelines](http://www.sitecore.net/Community/Technical-Blogs/John-West-Sitecore-Blog/Posts/2011/05/All-About-Pipelines-in-the-Sitecore-ASPNET-CMS.aspx)
are an easy and powerful way to execute encapsulated actions in a pipeline. But
what missing is, that you can’t execute processors in a transaction: Once
executed, the action can’t be reverted. To add this functionality to your code,
you could implement the [Reversible Command
Pattern](http://blogs.msdn.com/b/pedram/archive/2007/10/02/reversible-command-pattern.aspx).

In most cases, the functionality of the Sitecore Pipelines are enough for the
requirements. But there are cases where they don’t. An example is a contact
form, which executes the following action after the postback:

1. Save data to database
2. Register user to the newsletter
3. Send email to the customer service and the user

So what happens if the delivery of the email fails? Exactly, the user should see
an error message. And of course the newsletter registration and the data in the
database should be deleted again. This use case would be perfect for a custom
pipeline, if there wasn’t the rollback requirement.

For executing multiple actions after each other (like pipelines do), the
[Command Design Pattern](http://en.wikipedia.org/wiki/Command_pattern) could be
used. With just a little extensions, we make this pattern reversible. Instead of
only executing an action, a command becomes also a reverse method:

```csharp
public interface ICommand
{
    bool Execute();
    void Reverse();
}
```

The `CommandInvoker` is responsible to execute each command in the queue and
call the `Reverse()` method of each command which has already been executed, if
an error occurred. The code of the invoker can add commands and has a method to
execute the commands in the queue:

```csharp
public class CommandInvoker
{
    private SynchronizedCollection<ICommand> commands = new SynchronizedCollection<ICommand>();

    private Stack<ICommand> executedCommands;

    public void AddCommand(ICommand command)
    {
        this.commands.Add(command);
    }

    public bool Execute()
    {
        Monitor.Enter(this.commands.SyncRoot);
        try
        {
            if (this.commands.Count > 0)
            {
                this.executedCommands = new Stack<ICommand>();
                foreach (ICommand command in this.commands)
                {
                    this.executedCommands.Push(command);
                    if (!command.Execute())
                    {
                        throw new Exception(string.Format("Error while processing command '{0}'", command.ToString()));
                    }
                }
            }
            return true;
        }
        catch (Exception ex)
        {
            this.Rollback();
            return false;
        }
        finally
        {
            Monitor.Exit(this.commands.SyncRoot);
        }
    }

    private void Rollback()
    {
        while (this.executedCommands.Count > 0)
        {
            ICommand command = this.executedCommands.Pop();
            command.Reverse();
        }
    }
}
```

And here an example of a concrete command implementation:

```csharp
public class TestCommand : ICommand
{
    private string test;

    public TestCommand(string test)
    {
        this.test = test;
    }

    public bool Execute()
    {
        Sitecore.Diagnostics.Log.Info(string.Format("Test: {0}", this.test), this);
        return true;
    }

    public void Reverse()
    {
        // do revert here
    }
}
```

In your code where you would start your custom pipeline (where the actions
should be executed) just add the command and execute the queue:

```csharp
var invoker = new CommandInvoker();
invoker.AddCommand(new TestCommand("My Command"));
invoker.Execute();
```

I know that these snippets do not base on Sitecore and could be used in any C#
project. Also the classes cannot be configured in the config file like it can be
done with Sitecore Pipelines. You could of course extends the `CorePipeline`
class from Sitecore and add this functionality. Then you should be able to use
the reversible command pattern as a real extension of Sitecore Pipelines.

For those of you which would be happy with this implementation, download the
full classes here:

> [ReversibleCommand.zip](./files/ReversibleCommand.zip)

_Note:_ This is a repost from our german written blog [Sitecore
Vibes](http://sitecore.unic.com/de/2013/01/31/Pipeline-mit-Rollback-Funktionalitaet).
