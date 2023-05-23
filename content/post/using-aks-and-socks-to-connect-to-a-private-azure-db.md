---
title: "Using AKS and SOCKS to connect to a Private Azure DB"
date: 2023-05-22T16:31:29-04:00
lastmod: 2023-05-22T16:31:29-04:00
draft: false
keywords: []
description: ""
tags: ['azure', 'database', 'proxy', 'socks', 'aks', 'k8s', 'aws', 'bastion', 'eks', 'cloud-sql-proxy', 'kubectl-plugin-socks5-proxy']
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

## The Problem

I ran into a roadblock recently where I wanted to be able to conveniently connect to a managed postgres database within Azure that was not running on public subnets. And by conveniently, I mean that I'd rather not have to spin up an ephemeral virtual machine running in the same network and proxy the connection. After several web searches, it became evident that Azure does not readily provide much tooling to support this.

## Go Public?

Should the database be migrated to public subnets? Ideally not, since it is good practice to host critical infrastructure in restricted subnets.

## How do others handle this?

With GCP, connecting to a private db instance from any machine can be achieved with [cloud-sql-proxy](https://github.com/GoogleCloudPlatform/cloud-sql-proxy). This works by proxying requests from your machine to the SQL database instance in the cloud, while the authentication is handled using GCP's IAM.

So what about Azure? Is there any solution that is as elegant as cloud-sql-proxy?

## A Bastion

Similar to what [AWS has recommended](https://aws.amazon.com/blogs/database/securely-connect-to-an-amazon-rds-or-amazon-ec2-database-instance-remotely-with-your-preferred-gui/), perhaps a bastion is the way forward?

[Azure Bastion](https://azure.microsoft.com/en-ca/products/azure-bastion) is a fully managed service that both [costs money](https://azure.microsoft.com/en-ca/pricing/details/azure-bastion/#pricing) and provides secure access to virtual machines that do not have public IPs.

Because this adds cost and requires a virtual machine, it does not seem like a very desirable option in its current state.

## SOCKS

[SOCKS](https://en.wikipedia.org/wiki/SOCKS) is a way to proxy connections by exchanging network packets between the client and the server. There are many implementations and many readily available container images that can run a SOCKS server.

It is certainly possible to use this sort of proxy to connect to a private DB, but is it any simpler than using a virtual machine as a jumphost? It wasn't until I stumbled upon [kubectl-plugin-socks5-proxy](https://github.com/yokawasa/kubectl-plugin-socks5-proxy) that I was convinced that using SOCKS could be made simple.

So how does it work? By installing the kubectl plugin and then running `kubectl socks5-proxy`, a SOCKS proxy server is spun up in a pod and then opens up port-forwarding session using kubectl.

As you can see below, this k8s plugin is wrapped up nicely:

```console
$ kubectl socks5-proxy
using: namespace=default
using: port=1080
using: name=davegallant-proxy
using: image=serjs/go-socks5-proxy
Creating SOCKS5 Proxy (Pod)...
pod/davegallant-proxy created
```

With the above proxy connection open, it is possible to access both the DNS and private IPs accessible within the k8s cluster. In this case, I am able to access the private database, since there is network connectivity between the k8s cluster and the database.

## Caveats and Conclusion

The above outlined solution makes some assumptions:

- there is a k8s cluster
- the k8s cluster has network connectivity to the desired private database

If these stars align, than this solution might work as a stopgap for accessing a private Azure DB (and I'm assuming this could work similarly on AWS).

It would be nice if Azure provided tooling similar to cloud-sql-proxy, so that using private databases would be more of a convenient experience.

One other thing to note is that some clients (such as [dbeaver](https://dbeaver.io/)) [do not provide DNS resolution over SOCKS](https://github.com/dbeaver/dbeaver/issues/872). So in this case, you won't be able to use DNS as if you were inside the cluster, but instead have to rely on knowing private ip addresses.
