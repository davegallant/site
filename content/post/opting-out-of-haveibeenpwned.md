---
title: "Opting out of haveibeenpwned"
date: "2025-02-16T21:15:07-05:00"
draft: false
comments: true
toc: false
author: "Dave Gallant"
tags:
  [
    "breach",
    "haveibeenpwned",
    "hibp",
    "privacy",
    "darkweb",
  ]
author: "Dave Gallant"
---

The increasing number of data breaches has become a concern for anyone trying to live a life of relative privacy. Just last month, the PowerSchool Data informed its customers that [hackers stole data of 62 million students](https://www.bleepingcomputer.com/news/security/powerschool-hacker-claims-they-stole-data-of-62-million-students/). Unless you have been practicing [Extreme Privacy](https://inteltechniques.com/book7.html) techniques for decades, you likely have been impacted by at least one data breach.

<!--more-->

## Understanding Data Breaches

Data breaches occur when individuals gain access to sensitive information and then share it for public consumption. This sensitive information is dumped on hacker forums and other sites that comprise the [dark web](https://en.wikipedia.org/wiki/Dark_web).

## Check if you have been impacted

There are a number of services that can be used to check if you have been impacted by any data breaches, including [Mozilla monitor](https://monitor.mozilla.org), [Google Dark web report](https://myactivity.google.com/dark-web-report/dashboard), and [HIBP](https://haveibeenpwned.com/). Password managers often also offer ways to check your current credentials against known breaches. These services can also be configured to send you notifications on breaches. It is a good idea to become aware of these breaches as soon as you can, so that you can limit the blast radius of these exposures.

If you have been an email or phone number for any length of time, there is a high probability that some of your data has been exposed somewhere. You can easily check by querying [HIBP](https://haveibeenpwned.com/). Many of the tools that offer breach detection, query this database. Although I think this is a great service (and I recommend using it), it also opens the door for anyone who may be looking to gain more information about your present and past usages of services.

## Opting out

If you have an email that you'd like to protect, I'd suggest [opting out of public searchability](https://haveibeenpwned.com/OptOut/). This of course does not undo the data breach that happened, but does it make it more challenging for someone to quickly find out information about an associated email address. This does not impact the ability for you to be [subscribe to breach notifications](https://haveibeenpwned.com/NotifyMe), but it does force you to validate that you have access to the email, before receiving the notifications.

## Email aliases

One way to prevent future exposures is to use an email aliasing service such as [Firefox Relay](https://relay.firefox.com), [DuckDuckGo Email Protection](https://duckduckgo.com/email/), or if you use Proton Mail, [hide-my-email aliases](https://proton.me/support/addresses-and-aliases#hide). This will allow you sign up for services using an alias. The service then forwards all emails to your real address that you configure when setting up the alias.

