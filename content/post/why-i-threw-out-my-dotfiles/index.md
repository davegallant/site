---
title: "Why I threw out my dotfiles"
date: 2021-09-08T00:42:33-04:00
lastmod: 2021-09-08T00:42:33-04:00
draft: false
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
Over the years I have collected a number of dotfiles that I have shared across both Linux and macOS machines (`~/.zshrc`, `~/.config/git/config`, `~/.config/tmux/tmux.conf`, etc). I have tried several different ways to manage them, including [bare git repos](https://www.atlassian.com/git/tutorials/dotfiles) and utilities such as [GNU Stow](https://www.gnu.org/software/stow/). These solutions work well enough, but I have since found what I would consider a much better solution for organizing user configuration: [home-manager](https://github.com/nix-community/home-manager).

## What is home-manager?

Before understanding home-manager, it is worth briefly discussing what nix is. [nix](https://nixos.org/) is a package manager that originally spawned from a [PhD thesis](https://edolstra.github.io/pubs/phd-thesis.pdf). Unlike other package managers, it uses symbolic links to keep track of the currently installed packages, keeping around the old ones in case you may want to rollback.

For example, I have used nix to install the package [bind](https://search.nixos.org/packages?channel=unstable&show=bind&from=0&size=50&sort=relevance&type=packages&query=bind) which includes `dig`. You can see that it is available on multiple platforms. The absolute path of `dig` can be found by running:

```console
$ ls -lh $(which dig)
lrwxr-xr-x 73 root 31 Dec  1969 /run/current-system/sw/bin/dig -> /nix/store/0r4qdyprljd3dki57jn6c6a8dh2rbg9g-bind-9.16.16-dnsutils/bin/dig
```

Notice that there is a hash included in the file path? This is a nix store path and is computed by the nix package manager. This [nix pill](https://nixos.org/guides/nix-pills/nix-store-paths.html) does a good job explaining how this hash is computed. All of the nix pills are worth a read, if you are interested in learning more about nix itself. However, using home-manager does not require extensive knowledge of nix.

Part of the nix ecosystem includes [nixpkgs](https://github.com/NixOS/nixpkgs). Many popular tools can be found already packaged in this repository. As you can see with these [stats](https://repology.org/repositories/statistics/total), there is a large number of existing packages that are being maintained by the community. Contributing a new package is easy, and anyone can do it!

home-manager leverages the nix package manager (and nixpkgs), as well the nix language so that you can declaratively define your system configuration. I store my [nix-config](https://github.com/davegallant/nix-config) in git so that I can keep track of my packages and configurations, and retain a clean and informative git commit history so that I can understand what changed and why.

## Setting up home-manager

> ⚠️ If you run this on your main machine, make sure you backup your configuration files first. home-manager is pretty good about not overwriting existing configuration, but it is better to have a backup! Alternatively, you could test this out on a VM or cloud instance.

The first thing you should do is [install nix](https://nixos.org/guides/install-nix.html):

```shell
curl -L https://nixos.org/nix/install | sh
```

It's generally not a good idea to curl and execute files from the internet (without verifying integrity), so you might want to download the install script first and take a look before executing it!

Open up a new shell in your terminal and running `nix` *should* work. If not, run `. ~/.nix-profile/etc/profile.d/nix.sh`

Now, [install home-manager](https://github.com/nix-community/home-manager#installation):

```shell
nix-channel --add https://github.com/nix-community/home-manager/archive/master.tar.gz home-manager
nix-channel --update
nix-shell '<home-manager>' -A install
```

You should see a wave of `/nix/store/*` paths being displayed on your screen.

Now, to start off with a basic configuration, open up `~/.config/nixpkgs/home.nix` in the editor of your choice and paste this in (you will want to change `userName` and `homeDirectory`):


```nix
{ config, pkgs, ... }:

{
  programs.home-manager.enable = true;

  home = {
    username = "dave";
    homeDirectory = "/home/dave";
    stateVersion = "21.11";
    packages = with pkgs; [
      bind
      exa
      fd
      ripgrep
    ];
  };

  programs = {

    git = {
      enable = true;
      aliases = {
        aa = "add -A .";
        br = "branch";
        c = "commit -S";
        ca = "commit -S --amend";
        cb = "checkout -b";
        co = "checkout";
        d = "diff";
        l =
          "log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit";
      };

      delta = {
        enable = true;

        options = {
          features = "line-numbers decorations";
          whitespace-error-style = "22 reverse";
          plus-style = "green bold ul '#198214'";
          decorations = {
            commit-decoration-style = "bold yellow box ul";
            file-style = "bold yellow ul";
            file-decoration-style = "none";
          };
        };
      };

      extraConfig = {
        push = { default = "current"; };
        pull = { rebase = true; };
      };

    };

    starship = {
      enable = true;
      enableZshIntegration = true;

      settings = {
        add_newline = false;
        scan_timeout = 10;
      };
    };

    zsh = {
      enable = true;
      enableAutosuggestions = true;
      enableSyntaxHighlighting = true;
      history.size = 1000000;

      localVariables = {
        CASE_SENSITIVE = "true";
        DISABLE_UNTRACKED_FILES_DIRTY = "true";
        RPROMPT = ""; # override because macOS defaults to filepath
        ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE = "fg=#838383,underline";
        ZSH_DISABLE_COMPFIX = "true";
      };

      initExtra = ''
        export PAGER=less
      '';

      shellAliases = {
        ".." = "cd ..";
        grep = "rg --smart-case";
        ls = "exa -la --git";
      };

      "oh-my-zsh" = {
        enable = true;
        plugins = [
          "gitfast"
          "last-working-dir"
        ];
      };

    };

  };
}
```

Save the file and run:

```
home-manager switch
```

You should see another wave of `/nix/store/*` paths. The new configuration should now be active.

If you run `zsh`, you should see that you have [starship](https://starship.rs/) and access to several other utils such as `rg`, `fd`, and `exa`.

This basic configuration above is also defining your `~/.config/git/config` and `.zshrc`. If you already have either of these files, home-manager will complain about them already existing.

If you run `cat ~/.zshrc`, you will see the way these configuration files are generated.

You can extend this configuration for programs such as (neo)vim, emacs, alacritty, ssh, etc. To see other programs, take a look at [home-manager/modules/programs](https://github.com/nix-community/home-manager/tree/master/modules/programs).

## Gateway To Nix

In ways, home-manager can be seen as a gateway to the nix ecosystem. If you have enjoyed the way you can declare user configuration with home-manager, you may be interested in expanding your configuration to include other system dependencies and configuration. For example, in Linux you can define your entire system's configuration (including the kernel, kernel modules, networking, filesystems, etc) in nix. For macOS, there is [nix-darwin](https://github.com/LnL7/nix-darwin) that includes nix modules for configuring launchd, dock, and other preferences and services. You may also want to check out [Nix Flakes](https://nixos.wiki/wiki/Flakes): a more recent feature that allows you declare dependencies, and have them automatically pinned and hashed in `flake.lock`, similar to that of many modern package managers.

## Wrapping up

The title of this post is slightly misleading, since it's possible to retain some of your dotfiles and have them intermingle with home-manager by including them alongside nix. The idea of defining user configuration using nix can provide a clean way to maintain your configuration, and allow it to be portable across platforms. Is it worth the effort to migrate away from shell scripts and dotfiles? I'd say so.
