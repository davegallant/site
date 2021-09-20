---
title: "Automatically Rotating AWS Access Keys"
date: 2021-09-17T12:48:33-04:00
lastmod: 2021-09-17T12:48:33-04:00
draft: false
keywords: []
description: ""
tags: ['aws', 'python', 'security', 'aws-vault']
categories: []
author: ""

# You can also close(false) or open(true) something for this content.
# P.S. comment can only be closed
comment: false
toc: false
autoCollapseToc: false
postMetaInFooter: false
hiddenFromHomePage: false
# You can also define another contentCopyright. e.g. contentCopyright: "This is another copyright."
contentCopyright: false
reward: false
mathjax: false
mathjaxEnableSingleDollar: false

flowchartDiagrams:
  enable: false
  options: ""

sequenceDiagrams: 
  enable: false
  options: ""

---

<!--more-->

Rotating credentials is a security best practice. This morning, I read a question about automatically rotating AWS Access Keys without having to go through the hassle of navigating the AWS console. There are some existing solutions already, but I decided to write a [script](https://gist.github.com/davegallant/2c042686a78684a657fe99e20fa7a924#file-aws_access_key_rotator-py) since it was incredibly simple. The script could be packed up as a systemd/launchd service to continually rotate access keys in the background.

In the longer term, migrating my local workflows to [aws-vault](https://github.com/99designs/aws-vault) seems like a more secure solution. This would mean that credentials (even temporary session credentials) never have to be written in plaintext to disk (i.e. where [AWS suggests](https://docs.aws.amazon.com/sdkref/latest/guide/file-location.html)). Any existing applications, such as terraform, could be have their credentials passed to them from aws-vault, which retrieves them from the OS's secure keystore. There is even a [rotate command](https://github.com/99designs/aws-vault/blob/master/USAGE.md#rotating-credentials) included.

