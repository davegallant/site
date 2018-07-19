---
title: "Why Learn Python?"
date: 2018-07-18T20:48:15-04:00
draft: false
keywords: ['python', 'pip', 'pypi']
description: ""
tags: ['python', 'pip']
categories: ['python']
author: "Dave Gallant"
---

Python is a high-level, general-purpose language that has a wide range of use cases from the mundanely simple to the increasingly complex.

<!--more-->

- Glue script?
- Web crawling?
- Web server?
- Testing?
- Micro-service?
- Network automation?
- Data Science?
- Machine Learning?

Python is likely a quick way to get any of these tasks done.

Including the abundant number of packages that can be found on [Python Package Index](https://pypi.org/), there is likely a package that can help you.

Do you want to download a webpage?

{{< highlight bash >}}
pip install requests
{{< /highlight >}}

and then invoke the [Python interpreter](https://docs.python.org/3/tutorial/interpreter.html):

{{< highlight python >}}
Python 3.7.0 (default, Jun 29 2018, 21:56:58)
[GCC 7.3.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> import requests
>>> requests.get('https://www.theregister.co.uk/').text
{{< /highlight >}}

After that, there is any number of things that can be done with the results.

As you can probably note, the syntax is simple and clean, which makes returning to your code months later less of jarring experience.

## Popularity

According to [Stack Overflow Stats](https://insights.stackoverflow.com/survey/2018/), Python has surpassed C## and PHP in popularity and is the 3rd most loved language, after Rust and Kotlin. Interestingly, it is "the most wanted language" for the second year in a row.

## Drawbacks

Is Python the magical solution to all the world's problems? No.

Python is not very suitable for much of the following:

- Static typing
- Performance-critical application (i.e. graphically-intense video game)
- Mobile app development
- Front-end web development

## Conclusion

So should you learn it? or stick with shell scripting?

Because of Python's simple syntax, dynamic typing and abundant Package Index, it makes the language a great asset to have in your toolchain.

And it hasn't hurt that giants like Google, Facebook and Microsoft have leaned heavily on Python.

## Resources

This list includes some truly remarkable resources for improving your Python:

- https://www.realpython.com

- https://pythonbytes.fm/ (podcast)

- https://talkpython.fm/ (podcast)

- https://awesome-python.com/
