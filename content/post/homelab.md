---
title: "What To Do With A Homelab"
date: 2021-09-06T01:12:54-04:00
lastmod: 2021-09-06T01:12:54-04:00
draft: false
keywords: []
description: ""
tags: ['linux', 'homelab']
author: "Dave Gallant"
---

A homelab can be an inexpensive way to host a multitude of internal/external services and learn *a lot* in the process.
<!--more-->
Do you want host your own Media server? Ad blocker? Web server?
Are you interested in learning more about Linux? Virtualization? Networking? Security?
Building a homelab can be an entertaining playground to enhance your computer skills.

One of the best parts about building a homelab is that it doesn't have to be a large investment in terms hardware.

One of the simplest ways to build a homelab is out of a [refurbished computer](https://ca.refurb.io/products/hp-800-g1-usff-intel-core-i5-4570s-16gb-ram-512gb-ssd-wifi-windows-10-pro?variant=33049503825943).
Having multiple machines/nodes provides the advantage of increased redundancy, but starting out with a single node is enough to reap many of the benefits of having a homelab.

## Virtualization

![image](https://user-images.githubusercontent.com/4519234/132440142-3acd9c41-86e9-447d-b507-08b9a22b1cc6.png)

Virtualizing your hardware is an organized way of dividing up your machine's resources. This can be done with something such as a *Virtual Machine* or something lighter like a container using *LXC* or *runC*.
Containers have much less overhead in terms of boot time and storage allocation. This [Stack Overflow answer](https://stackoverflow.com/questions/16047306/how-is-docker-different-from-a-virtual-machine) sums it up nicely.

## Services

So what are some useful services to run a homelab?

- [Plex](https://www.plex.tv/) - basically a self-hosted Netflix that can be used to stream from multiple devices, and the best part is that you manage the content!
- [changedetection](https://github.com/dgtlmoon/changedetection.io) - is a self-hosted equivalent to something like [visualping.io](https://visualping.io/) that will notify you when a webpage changes and keep track of the diffs
- [Adguard](https://github.com/AdguardTeam/AdGuardHome) or [Pihole](https://pi-hole.net/) - can block a list of known trackers for all clients on your local network. I've used pihole for a long time, but have recently switched to Adguard since the UI is more modern and it has the ability to toggle on/off a pre-defined list of services, including Netflix (this is useful if you have stealthy young kids). Either of these will speed up your internet experience, simply because you won't need to download all of the extra tracking bloat.

Of course, there is much much more you can self-host, including your own applications that you might be developing.

## VPN

You could certainly setup and manage your own VPN by using something like [OpenVPN](https://openvpn.net/community-downloads/), but there is also something else you can try: [tailscale](https://tailscale.com/). It is a very quick way to create fully-encrypted connections between clients. And by using its [MagicDNS](https://tailscale.com/kb/1081/magicdns/), it is a truly magical solution. If one of your nodes names is `plex`, you can simply access it by referring to its name (i.e `ssh plex@plex`).

## Monitoring

Monitoring can become an important aspect of your homelab after it starts to become something that is relied upon. One of the simplest ways to setup some monitoring is using [netdata](https://www.netdata.cloud/). It can be installed on individual containers, VMs, and also a hypervisor (such as Proxmox). All of the monitoring works out of the box by detecting disks, memory, network interfaces, etc.

Additionally, all of these different agents can be connected to *netdata cloud*, which can alert you when some of your infrastructure is down or in a degraded state. Adding additional nodes to netdata cloud is as simple as a 1 line shell command.

[Grafana](https://grafana.com/) is another popular way of visualizing metrics, although it requires more initial setup.

## In Summary

Building out a homelab can be incredibly rewarding and it doesn't always require buying a rack full of expensive servers to get a significant amount of utility.
