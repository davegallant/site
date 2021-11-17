---
title: "Running K3s in LXC on Proxmox"
date: 2021-11-14T10:07:03-05:00
lastmod: 2021-11-14T10:07:03-05:00
draft: false
keywords: []
description: ""
tags: ["k3s", "proxmox", "lxc"]
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

It has been a while since I've actively used Kubernetes and wanted to explore the evolution of tools such as [Helm](https://helm.sh) and [Tekton](https://tekton.dev). I decided to deploy [K3s](https://k3s.io), since I've had success with deploying it on resource-contrained Raspberry Pis in the past. I thought that this time it'd be convenient to have K3s running in a LXC container on Proxmox. This would allow for easy snapshotting of the entire Kubernetes deployment. LXC containers also provide an efficient way to use a machine's resources.

## What is K3s?

K3s is a Kubernetes distro that advertises itself as a lightweight binary with a much smaller memory-footprint than traditional k8s. K3s is not a fork of k8s as it seeks to remain as close to upstream as it possibly can.

## Configure Proxmox

This [gist](https://gist.github.com/triangletodd/02f595cd4c0dc9aac5f7763ca2264185) contains snippets and discussion on how to deploy K3s in LXC on Proxmox. It mentions that `bridge-nf-call-iptables` should be loaded, but I did not understand the benefit of doing this.

## Disable swap

There is an issue on Kubernetes regarding swap [here](https://github.com/kubernetes/kubernetes/issues/53533). There claims to be support for swap in 1.22, but for now let's disable it:

```
sysctl vm.swappiness=0
swapoff -a
```

It might be worth experimenting with swap enabled in the future to see how that might affect performance.

### Enable IP Forwarding

To avoid IP Forwarding issues with Traefik, run the following on the host:

```sh
sudo sysctl net.ipv4.ip_forward=1
sudo sysctl net.ipv6.conf.all.forwarding=1
sudo sed -i 's/#net.ipv4.ip_forward=1/net.ipv4.ip_forward=1/g' /etc/sysctl.conf
sudo sed -i 's/#net.ipv6.conf.all.forwarding=1/net.ipv6.conf.all.forwarding=1/g' /etc/sysctl.conf
```

## Create LXC container

Create an LXC container in the Proxmox interface as you normally would. Remember to:

- Uncheck `unprivileged container`
- Use a LXC template (I chose a debian 11 template downloaded with [pveam](https://pve.proxmox.com/wiki/Linux_Container#Create_container))
- In memory, set swap to 0
- Create and start the container

### Modify container config

Now back on the host run `pct list` to determine what VMID it was given.

Open `/etc/pve/lxc/$VMID.conf` and append:

```sh
lxc.apparmor.profile: unconfined
lxc.cap.drop:
lxc.mount.auto: "proc:rw sys:rw"
lxc.cgroup2.devices.allow: c 10:200 rwm
```

All of the above configurations are described in the [manpages](https://linuxcontainers.org/lxc/manpages/man5/lxc.container.conf.5.html).
Notice that `cgroup2` is used since Proxmox VE 7.0 has switched to a [pure cgroupv2 environment](https://pve.proxmox.com/pve-docs/chapter-pct.html#pct_cgroup).

Thankfully cgroup v2 support has been supported in k3s with these contributions:
- https://github.com/k3s-io/k3s/pull/2584
- https://github.com/k3s-io/k3s/pull/2844

## Enable shared host mounts

From within the container, run:

```sh
echo '#!/bin/sh -e
ln -s /dev/console /dev/kmsg
mount --make-rshared /' > /etc/rc.local
chmod +x /etc/rc.local
reboot
```

## Install K3s

One of the simplest ways to install K3s on a remote host is to use [k3sup](https://github.com/alexellis/k3sup).
Ensure that you supply a valid `CONTAINER_IP` and choose the `k3s-version` you prefer.
As of 2021/11, it is still defaulting to the 1.19 channel, so I overrode it to 1.22 for cgroup v2 support. See the published releases [here](https://github.com/k3s-io/k3s/releases).

```sh
ssh-copy-id root@$CONTAINER_IP
k3sup install --ip $CONTAINER_IP --user root --k3s-version v1.22.3+k3s1
```

If all goes well, you should see a path to the `kubeconfig` generated. I moved this into `~/.kube/config` so that kubectl would read this by default.

## Wrapping up

Installing K3s in LXC on Proxmox works with a few tweaks to the default configuration. I later followed the Tekton's [Getting Started](https://tekton.dev/docs/getting-started/) guide and was able to deploy it in a few commands.


```console
$ kubectl get all --namespace tekton-pipelines
NAME                                               READY   STATUS    RESTARTS      AGE
pod/tekton-pipelines-webhook-8566ff9b6b-6rnh8      1/1     Running   1 (50m ago)   12h
pod/tekton-dashboard-6bf858f977-qt4hr              1/1     Running   1 (50m ago)   11h
pod/tekton-pipelines-controller-69fd7498d8-f57m4   1/1     Running   1 (50m ago)   12h

NAME                                  TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)                              AGE
service/tekton-pipelines-controller   ClusterIP   10.43.44.245    <none>        9090/TCP,8080/TCP                    12h
service/tekton-pipelines-webhook      ClusterIP   10.43.183.242   <none>        9090/TCP,8008/TCP,443/TCP,8080/TCP   12h
service/tekton-dashboard              ClusterIP   10.43.87.97     <none>        9097/TCP                             11h

NAME                                          READY   UP-TO-DATE   AVAILABLE   AGE
deployment.apps/tekton-pipelines-webhook      1/1     1            1           12h
deployment.apps/tekton-dashboard              1/1     1            1           11h
deployment.apps/tekton-pipelines-controller   1/1     1            1           12h

NAME                                                     DESIRED   CURRENT   READY   AGE
replicaset.apps/tekton-pipelines-webhook-8566ff9b6b      1         1         1       12h
replicaset.apps/tekton-dashboard-6bf858f977              1         1         1       11h
replicaset.apps/tekton-pipelines-controller-69fd7498d8   1         1         1       12h

NAME                                                           REFERENCE                             TARGETS   MINPODS   MAXPODS   REPLICAS   AGE
horizontalpodautoscaler.autoscaling/tekton-pipelines-webhook   Deployment/tekton-pipelines-webhook   9%/100%   1         5         1          12h
```

I made sure to install Tailscale in the container so that I can easily access K3s from anywhere.

If I'm feeling adventurous, I might experiment with [K3s rootless](https://rancher.com/docs/k3s/latest/en/advanced/#running-k3s-with-rootless-mode-experimental).
