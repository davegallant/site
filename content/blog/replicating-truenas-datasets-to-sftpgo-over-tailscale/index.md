---
title: "Replicating TrueNAS datasets to sftpgo over Tailscale"
date: "2025-04-17T22:03:33-04:00"
draft: false
comments: true
toc: false
author: "Dave Gallant"
tags:
  [
    "tailscale",
    "truenas",
    "sftpgo",
  ]
---

I've recently spun up an instance of TrueNAS SCALE after salvaging a couple hard drives from a past computer build and decided I could use additional network storage for various backups such as Proxmox VMs and home directory backups.

<!--more-->

The only app I've needed to install has been Tailscale which has enabled me to access the TrueNAS Web UI from anywhere. I've setup a few datasets and NFS shares to store various backups and the rest of the periodic backups have routinely been working without a hitch. Since my homelab is becoming more of a vital piece of infrastructure for my daily needs, I wanted to ensure that these datasets had [Cloud Sync Tasks](https://www.truenas.com/docs/scale/scaletutorials/dataprotection/cloudsynctasks/) setup for offsite backups. These encrypted backups are mostly being stored in places such as Google Drive and other blob storage providers.

More recently, to reduce cloud costs, I've setup some a small node at another physical location and installed both Tailscale and [sftpgo](https://github.com/drakkan/sftpgo) on it to facilitate offsite backups. After setting up the infrastructure and adding a Cloud Sync Task in TrueNAS SCALE to replicate these backups offsite to sftpgo, I noticed that Tailscale's Magic DNS was not working, nor was the Tailscale IPv4 address.

After reading the [Tailscale docs](https://tailscale.com/kb/1483/truenas#route-non-tailnet-traffic-through-truenas) , it became clear that the **Userspace** box had to be unchecked in the Tailscale app settings. This is because the Tailscale app is running within a docker container on the TrueNAS SCALE VM. After unchecking the **Userspace** box, I was able to verify that the Backup Credentials created for sftpgo worked when specifying the host as a Tailscale IPv4 address. This was probably good enough since the IP won't change unless the node is re-registered.

~~To get MagicDNS working, I went to Network > Global Configuration and set "Nameserver 1" to **100.100.100.100**. After this, I was able to specify the FQDN in the Backup Credentials and the Cloud Sync Tasks started.~~ 

This method of adding MagicDNS can lead to issues with DNS when updating the tailscale application in TrueNAS, so I ended using the Tailscale IP directly.


