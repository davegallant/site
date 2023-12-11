---
title: "What To Do With A Homelab"
date: 2021-09-06T01:12:54-04:00
lastmod: 2021-09-06T01:12:54-04:00
draft: false
keywords: []
description: ""
tags: ['tailscale', 'homelab', 'netdata', 'jellyfin', 'plex', 'pihole', 'virtualization', 'adguard', 'grafana']
author: "Dave Gallant"
---

A homelab can be an inexpensive way to host a multitude of internal/external services and learn *a lot* in the process.
<!--more-->
Do you want host your own Media server? Ad blocker? Web server?
Are you interested in learning more about Linux? Virtualization? Networking? Security?
Building a homelab can be an entertaining playground to enhance your computer skills.

One of the best parts about building a homelab is that it doesn't have to be a large investment in terms of hardware. One of the simplest ways to build a homelab is out of a [refurbished computer](https://ca.refurb.io/products/hp-800-g1-usff-intel-core-i5-4570s-16gb-ram-512gb-ssd-wifi-windows-10-pro?variant=33049503825943).
Having multiple machines/nodes provides the advantage of increased redundancy, but starting out with a single node is enough to reap many of the benefits of having a homelab.

## Virtualization

Virtualizing your hardware is an organized way of dividing up your machine's resources. This can be done with something such as a *Virtual Machine* or something lighter like a container using *LXC* or *runC*.
Containers have much less overhead in terms of boot time and storage allocation. This [Stack Overflow answer](https://stackoverflow.com/questions/16047306/how-is-docker-different-from-a-virtual-machine) sums it up nicely.

![image](proxmox.png)

A hypervisor such as [Proxmox](https://www.proxmox.com/en/proxmox-ve/get-started) can be installed in minutes on a new machine. It provides a web interface and a straight-forward way to spin up new VMs and containers. Even if your plan is to run mostly docker containers, Proxmox can be a useful abstraction for managing VMs, disks and running scheduled backups. You can even run docker within an LXC container by enabling nested virtualization. You'll want to ensure that VT-d and VT-x are enabled in the BIOS if you decide to install a hypervisor to manage your virtualization.

## Services

So what are some useful services to deploy?

- [Jellyfin](https://jellyfin.org/) or [Plex](https://www.plex.tv/) - basically a self-hosted Netflix that can be used to stream from multiple devices, and the best part is that you manage the content! Unlike Plex, Jellyfin is open source and can be found [here](https://github.com/jellyfin/jellyfin).
- [changedetection](https://github.com/dgtlmoon/changedetection.io) - is a self-hosted equivalent to something like [visualping.io](https://visualping.io/) that will notify you when a webpage changes and keep track of the diffs
- [Adguard](https://github.com/AdguardTeam/AdGuardHome) or [Pihole](https://pi-hole.net/) - can block a list of known trackers for all clients on your local network. I've used pihole for a long time, but have recently switched to Adguard since the UI is more modern and it has the ability to toggle on/off a pre-defined list of services, including Netflix (this is useful if you have stealthy young kids). Either of these will speed up your internet experience, simply because you won't need to download all of the extra tracking bloat.
- [Gitea](https://gitea.io/) - A lightweight git server. I use this to mirror git repos from GitHub, GitLab, etc.
- [Homer](https://github.com/bastienwirtz/homer) - A customizable landing page for services you need to access (including the ability to quickly search).
- [Uptime Kuma](https://github.com/louislam/uptime-kuma) - A fancy tool for monitoring the uptime of services.

There is a large number of services you can self-host, including your own applications that you might be developing. [awesome-self-hosted](https://github.com/awesome-selfhosted/awesome-selfhosted) provides a curated list of services that might be of interest to you.

## VPN

You could certainly setup and manage your own VPN by using something like [OpenVPN](https://openvpn.net/community-downloads/), but there is also something else you can try: [tailscale](https://tailscale.com/). It is a very quick way to create fully-encrypted connections between clients. With its [MagicDNS](https://tailscale.com/kb/1081/magicdns/), your can reference the names of machines like `homer` rather than using an IP address. By using this mesh-like VPN, you can easily create a secure tunnel to your homelab from anywhere.

## Monitoring

![dashboard](netdata.png)

Monitoring can become an important aspect of your homelab after it starts to become something that is relied upon. One of the simplest ways to setup some monitoring is using [netdata](https://www.netdata.cloud/). It can be installed on individual containers, VMs, and also a hypervisor (such as Proxmox). All of the monitoring works out of the box by detecting disks, memory, network interfaces, etc.

Additionally, agents installed on different machines can all be centrally viewed in netdata, and it can alert you when some of your infrastructure is down or in a degraded state. Adding additional nodes to netdata is as simple as a 1-line shell command.

As mentioned above, [Uptime Kuma](https://github.com/louislam/uptime-kuma) is a convenient way to track uptime and monitor the availability of your services.

![uptime-kuma](uptime-kuma.png)

## In Summary

Building out a homelab can be a rewarding experience and it doesn't require buying a rack full of expensive servers to get a significant amount of utility. There are many services that you can run that require very minimal setup, making it possible to get a server up and running in a short period of time, with monitoring, and that can be securely connected to remotely.
