---
title: "Throwing Out Your Dotfiles"
date: 2021-09-08T00:42:33-04:00
lastmod: 2021-09-08T00:42:33-04:00
draft: true
keywords: []
description: ""
tags: ['nix', 'dotfiles', 'home-manager']
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

Do you manage a `.zshrc`? `.vimrc`? `tmux.conf`?  Do you have dozens of configuration files that you manage in a git repo?  Or maybe don't backup at all? Do you also have a bunch of command line utilities that you forget you installed? Or don't remember why you installed them?

Over the years I have collected a number of dotfiles that I have shared across both Linux and macOS machines. I have tried several different ways to manage them, including [bare git repos](https://www.atlassian.com/git/tutorials/dotfiles) and utilities such as [GNU Stow](https://www.gnu.org/software/stow/). These solutions work well enough, but I have since found what I would consider a much better solution for organizing user configuration: [home-manager](https://github.com/nix-community/home-manager).

## What is nix and why is it required?
