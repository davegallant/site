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
    "darkweb",
    "haveibeenpwned",
    "hibp",
    "passwords",
    "privacy",
  ]
author: "Dave Gallant"
---

The increasing number of data breaches has become a concern for anyone trying to live a life of relative privacy. Just last month, the PowerSchool informed its customers that [hackers stole data of 62 million students](https://www.bleepingcomputer.com/news/security/powerschool-hacker-claims-they-stole-data-of-62-million-students/). Unless you have been practicing [Extreme Privacy](https://inteltechniques.com/book7.html) techniques for decades, you likely have been impacted by at least one data breach.

<!--more-->

## Understanding Data Breaches

Data breaches occur when individuals gain access to sensitive information and then share it for public consumption. This sensitive information is dumped on hacker forums and other sites that comprise the [dark web](https://en.wikipedia.org/wiki/Dark_web).

## Check if you have been impacted

There are a number of services that can be used to check if you have been impacted by any data breaches, including [Mozilla monitor](https://monitor.mozilla.org), [Google Dark web report](https://myactivity.google.com/dark-web-report/dashboard), and [haveibeenpwned.com](https://haveibeenpwned.com/). Password managers often also offer features that scan your saved credentials against known breaches. These services can also be configured to send you notifications when a breach occurs. It is a good idea to become aware of these breaches as soon as you can, so that you can protect yourself from malicious behaviour such as phishing.

If you have been an email or phone number for any length of time, there is a high probability that some of your data has been exposed. You can easily check by querying [haveibeenpwned.com](https://haveibeenpwned.com/). Many of the tools that offer breach detection, query the haveibeenpwned database. Although I believe this is service is a public good, it also opens the door for anyone who may be looking to gain more information about your present and past usages of various platforms.

## Opting out

If you have an email that you'd like to protect, I'd suggest [opting out of public searchability](https://haveibeenpwned.com/OptOut/). This of course does not undo the data breach that happened, but does it make it more challenging for someone to quickly search for an affected email address. This does not impact the ability for you to [subscribe to breach notifications](https://haveibeenpwned.com/NotifyMe), but it does require you to validate that you have access to the email, before receiving breach notifications.

There are a number of other websites that offer similar lookups to haveibeenpwned, but many of them are either paywalled or require account registration.

## Email aliases

A more proactive method of reducing the likelihood of future exposures is to use an email aliasing service such as [Firefox Relay](https://relay.firefox.com), [DuckDuckGo Email Protection](https://duckduckgo.com/email/), or if you use Proton Mail, [hide-my-email aliases](https://proton.me/support/addresses-and-aliases#hide). This will allow you sign up for services using an alias instead of revealing your email address. The service then forwards all emails to your real address that you configure when setting up the alias.

