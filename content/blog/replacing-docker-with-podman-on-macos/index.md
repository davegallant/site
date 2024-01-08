---
title: "Replacing docker with podman on macOS (and Linux)"
date: 2021-10-11T10:43:35-04:00
lastmod: 2021-10-11T10:43:35-04:00
draft: false
comments: true
tags: ["docker", "podman", "containers"]
author: "Dave Gallant"
---

There are a number of reasons why you might want to replace docker, especially on macOS. The following feature bundled in Docker Desktop might have motivated you enough to consider replacing docker:

<!--more-->

{{< tweet user="moyix" id="1388586550682861568" >}}

Docker has been one of the larger influencers in the container world, helping to standardize the [OCI Image Format Specification](https://github.com/opencontainers/image-spec/blob/main/spec.md). For many developers, containers have become synonymous with terms like `docker` and `Dockerfile` (a file containing build instructions for a container image). Docker has certainly made it very convenient to build and run containers, but it is not the only solution for doing so.

This post briefly describes my experience swapping out docker for podman on macOS.

### What is a container?

A container is a standard unit of software that packages up all application dependencies within it. Multiple containers can be run on a host machine all sharing the same kernel as the host. Linux namespaces help provide an isolated view of the system, including mnt, pid, net, ipc, uid, cgroup, and time. There is an [in-depth video](https://www.youtube.com/watch?v=sK5i-N34im8) that discusses what containers are made from, and [near the end](https://youtu.be/sK5i-N34im8?t=2468) there is a demonstration on how to build your own containers from the command line.

By easily allowing the necessary dependencies to live alongside the application code, containers make the "works on my machine" problem less of a problem.

### Benefits of Podman

One of the most interesting features of Podman is that it is daemonless. There isn't a process running on your system managing your containers. In contrast, the docker client is reliant upon the docker daemon (often running as root) to be able to build and run containers.

Podman is rootless by default. It is now possible to [run the docker daemon rootless](https://docs.docker.com/engine/security/rootless/) as well, but it's still not the default behaviour.

I've also observed that so far my 2019 16" Macbook Pro hasn't sounded like a jet engine, although I haven't performed any disk-intensive operations yet.

### Installing Podman

Running Podman on macOS is more involved than on Linux, because the podman-machine must run Linux inside of a virtual machine. Fortunately, the installation is made simple with [brew](https://formulae.brew.sh/formula/podman) (read [this](https://podman.io/getting-started/installation#linux-distributions) if you're installing Podman on Linux):

```sh
brew install podman
```

The podman-machine must be started:

```sh
# This is not necessary on Linux
podman machine init
podman machine start
```

### Running a container

Let's try to pull an image:

```console
$ podman pull alpine
Trying to pull docker.io/library/alpine:latest...
Getting image source signatures
Copying blob sha256:a0d0a0d46f8b52473982a3c466318f479767577551a53ffc9074c9fa7035982e
Copying config sha256:14119a10abf4669e8cdbdff324a9f9605d99697215a0d21c360fe8dfa8471bab
Writing manifest to image destination
Storing signatures
14119a10abf4669e8cdbdff324a9f9605d99697215a0d21c360fe8dfa8471bab
```

> If you're having an issue pulling images, you may need to remove `~/.docker/config.json` or remove the set of auths in the configuration as mentioned [here](https://stackoverflow.com/a/69121873/1191286).

and then run and exec into the container:

```console
$ podman run --rm -ti alpine
Error: error preparing container 99ace1ef8a78118e178372d91fd182e8166c399fbebe0f676af59fbf32ce205b for attach: error configuring network namespace for container 99ace1ef8a78118e178372d91fd182e8166c399fbebe0f676af59fbf32ce205b: error adding pod unruffled_bohr_unruffled_bohr to CNI network "podman": unexpected end of JSON input
```

What does this error mean? A bit of searching lead to [this github issue](https://github.com/containers/podman/issues/11837).

Until the fix is released, a workaround is to just specify a port (even when it's not needed):

```sh
podman run -p 4242 --rm -ti alpine
```

If you're reading this from the future, there is a good chance specifying a port won't be needed.

Another example of running a container with Podman can be found in the [Jellyfin Documentation](https://jellyfin.org/docs/general/administration/installing.html#podman).

### Aliasing docker with podman

Force of habit (or other scripts) may have you calling `docker`. To work around this:

```sh
alias docker=podman
```

### podman-compose

You may be wondering: what about docker-compose? Well, there _claims_ to be a drop-in replacement for it: [podman-compose](https://github.com/containers/podman-compose).

```sh
pip3 install --user podman-compose
```

Now let's create a `docker-compose.yml` file to test:

```sh
cat << EOF >> docker-compose.yml
version: '2'
services:
  hello_world:
    image: ubuntu
    command: [/bin/echo, 'Hello world']
EOF
```

Now run:

```console
$ podman-compose up
podman pod create --name=davegallant.github.io --share net
40d61dc6e95216c07d2b21cea6dcb30205bfcaf1260501fe652f05bddf7e595e
0
podman create --name=davegallant.github.io_hello_world_1 --pod=davegallant.github.io -l io.podman.compose.config-hash=123 -l io.podman.compose.project=davegallant.github.io -l io.podman.compose.version=0.0.1 -l com.docker.compose.container-number=1 -l com.docker.compose.service=hello_world --add-host hello_world:127.0.0.1 --add-host davegallant.github.io_hello_world_1:127.0.0.1 ubuntu /bin/echo Hello world
Resolved "ubuntu" as an alias (/etc/containers/registries.conf.d/000-shortnames.conf)
Trying to pull docker.io/library/ubuntu:latest...
Getting image source signatures
Copying blob sha256:f3ef4ff62e0da0ef761ec1c8a578f3035bef51043e53ae1b13a20b3e03726d17
Copying blob sha256:f3ef4ff62e0da0ef761ec1c8a578f3035bef51043e53ae1b13a20b3e03726d17
Copying config sha256:597ce1600cf4ac5f449b66e75e840657bb53864434d6bd82f00b172544c32ee2
Writing manifest to image destination
Storing signatures
1a68b2fed3fdf2037b7aef16d770f22929eec1d799219ce30541df7876918576
0
podman start -a davegallant.github.io_hello_world_1
Hello world
```

This should more or less provide the same results you would come to expect with docker. The README does clearly state that podman-compose is under development.

### Summary

Installing Podman on macOS was not seamless, but it was manageable well within 30 minutes. I would recommend giving Podman a try to anyone who is unhappy with experiencing forced docker updates, or who is interested in using a more modern technology for running containers.

One caveat to mention is that there isn't an official graphical user interface for Podman, but there is an [open issue](https://github.com/containers/podman/issues/11494) considering one. If you rely heavily on Docker Desktop's UI, you may not be as interested in using podman yet.

> Update: After further usage, bind mounts do not seem to work out of the box when the client and host are on different machines. A rather involved solution using [sshfs](https://en.wikipedia.org/wiki/SSHFS) was shared [here](https://github.com/containers/podman/issues/8016#issuecomment-920015800).

I had been experimenting with Podman on Linux before writing this, but after listening to this [podcast episode](https://kubernetespodcast.com/episode/164-podman/), I was inspired to give Podman a try on macOS.
