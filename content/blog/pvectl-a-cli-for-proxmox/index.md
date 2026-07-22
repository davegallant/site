---
title: "pvectl: A CLI for Managing Proxmox"
date: "2026-07-20T13:00:00-04:00"
draft: false
comments: true
toc: false
author: "Dave Gallant"
tags: ["proxmox", "cli", "go", "homelab", "pvectl"]
images: ["pvectl-demo.png"]
---

My home Proxmox cluster has grown into two nodes, a few dozen LXC containers, and a handful of VMs. Recently I've been exploring ways to make this experience more streamlined, especially when creating new containers, shelling into containers, running migrations, restoring from backups, etc. Usually when I need to do this, I either SSH into one of the proxmox nodes or open up the GUI. When on a node, I usually run `pct` or `qm`, and then immediately run into the issue: which ID was the thing I actually wanted? Which node was it running on?
<!--more-->

## Bash wrapper

My initial attempt to relieve some of the complexity was a bash script that shelled out to `pct` and piped the result through `fzf` so I could fuzzy-search containers by name instead of scanning a list of IDs. It worked well enough.

The problem with this approach is that it only worked when I was already on the proxmox node itself, since it called `pct` directly — no running it from my laptop, and it only knew about LXC containers.

## Rewriting it against the API

After years of using `kubectl`, I really wished there was something comparable for proxmox. I decided to start making `pvectl`, which communicates with Proxmox with the [Proxmox VE API](https://pve.proxmox.com/wiki/Proxmox_VE_API) directly instead of shelling out to `pct`/`qm`. It can work from any machine that can reach the cluster's API. `ct` and `qm` are separate command trees under the same CLI (`pvectl ct start web`, `pvectl qm start pihole`).

A few other things have since been implemented:

- Tab completion suggests container/VM names as you type, so you never touch an id unless you want to.
- Anything that runs as a background Proxmox task (start, migrate, backup, snapshot) shows a live spinner and a final pass/fail summary with timing, instead of leaving you guessing whether it's still running.
- `pvectl setup` will try to store the API token in your OS keychain instead of a plaintext config file.
- Support for machine-readable output on list/summary commands instead of a table (`--output json`)
- A raw escape hatch for any Proxmox API endpoint using `pvectl api get/post/put/delete <path>`
- `pvectl schema` prints the full command tree (names, flags, descriptions) as JSON for introspection. 


![gif](pvectl-demo.gif)

### Caveats

Before starting out, I didn't realize that certain commands had no REST equivalents and still required shelling out to `ssh <node> ...`. This includes `pct enter`, `pct exec`, and some config updates that touch `lxc.*`. I still included these commands in `pvectl` for completeness, but it requires having a valid SSH config setup.

`pvectl` is not a drop-in replacement for any existing tool. Most of the tools that do exist (`pct`, `qm`, and `pvesh`) all have access to a vast API and need to run on the host. What it does handle well is the day-to-day lifecycle — start/stop, snapshots, backups, migrations, config edits, console access — because that's what I mostly need on a repeating basis. It doesn't touch cluster/storage/network configuration, and for anything with no REST equivalent, it still shells out to `ssh <node> ...` under the hood. If you need the full surface area of the Proxmox API, `pvesh` is likely the right tool.

## Trying it out

macOS:

```sh
brew install davegallant/public/pvectl
```

Linux:

```sh
curl -fsSL https://raw.githubusercontent.com/davegallant/pvectl/main/scripts/install.sh | sh
```

Nix:

```sh
nix profile install github:davegallant/pvectl
```

The source and full documentation can be found at [github.com/davegallant/pvectl](https://github.com/davegallant/pvectl). 

I'm actively using it against my own cluster. If you decide to try it against yours and something breaks — or behaves differently on a setup I haven't tested — feel free to open an issue or PR.

---
