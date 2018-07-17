---
title: "Why Learn Python?"
date: 2018-07-14T22:48:15-04:00
draft: true
keywords: []
description: ""
tags: ['python', 'pip']
categories: ['python']
author: "Dave Gallant"

# You can also close(false) or open(true) something for this content.
# P.S. comment can only be closed
comment: true
toc: false
autoCollapseToc: false
postMetaInFooter: false
hiddenFromHomePage: false
# You can also define another contentCopyright. e.g. contentCopyright: "This is another copyright."
contentCopyright: false
reward: false
mathjax: false
mathjaxEnableSingleDollar: false
mathjaxEnableAutoNumber: false

# You unlisted posts you might want not want the header or footer to show
hideHeaderAndFooter: false

# You can enable or disable out-of-date content warning for individual post.
# Comment this out to use the global config.
#enableOutdatedInfoWarning: false

flowchartDiagrams:
  enable: false
  options: ""

sequenceDiagrams: 
  enable: false
  options:
---

Python is a high-level, general-purpose language that has a wide range of use cases.

Simple script? Web crawling? Back-end web server? Test automation? Python is likely up for the task.

<!--more-->

Do you want to download a webpage? Simple:

{{< highlight python >}}

import requests

print(requests.get('https://www.theregister.co.uk/').text)

{{< /highlight >}}

After that, there is any number of things that can be done with it.
