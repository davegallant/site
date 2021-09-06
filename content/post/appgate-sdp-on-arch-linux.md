---
title: "AppGate SDP on Arch Linux"
date: 2020-03-16T22:00:15-04:00
draft: false
keywords: ['linux', 'vpn']
description: ""
tags: ['linux', 'vpn', 'python']
categories: ['linux']
author: "Dave Gallant"
---

AppGate SDP provides a Zero Trust network. This post describes how to get AppGate SDP `4.3.2` working on Arch Linux.
<!--more-->

Depending on the AppGate SDP Server that is running, you may require a client that is more recent than the latest package on [AUR](https://aur.archlinux.org/packages/appgate-sdp/).
As of right now, the latest AUR is `4.2.2-1`.

These steps highlight how to get it working with `Python3.8` by making a 1 line modification to AppGate source code.

# Package

We already know the community package is out of date, so let's clone it:

```shell
git clone https://aur.archlinux.org/appgate-sdp.git
cd appgate-sdp
```

You'll likely notice that the version is not what we want, so let's modify the `PKGBUILD` to the following:

```shell
# Maintainer: Pawel Mosakowski <pawel at mosakowski dot net>
pkgname=appgate-sdp
conflicts=('appgate-sdp-headless')
pkgver=4.3.2
_download_pkgver=4.3
pkgrel=1
epoch=
pkgdesc="Software Defined Perimeter - GUI client"
arch=('x86_64')
url="https://www.cyxtera.com/essential-defense/appgate-sdp/support"
license=('custom')
# dependecies calculated by namcap
depends=('gconf' 'libsecret' 'gtk3' 'python' 'nss' 'libxss' 'nodejs' 'dnsmasq')
source=("https://sdpdownloads.cyxtera.com/AppGate-SDP-${_download_pkgver}/clients/${pkgname}_${pkgver}_amd64.deb"
        "appgatedriver.service")
options=(staticlibs)
prepare() {
    tar -xf data.tar.xz
}
package() {
    cp -dpr "${srcdir}"/{etc,lib,opt,usr} "${pkgdir}"
    mv -v "$pkgdir/lib/systemd/system" "$pkgdir/usr/lib/systemd/"
    rm -vrf "$pkgdir/lib"
    cp -v "$srcdir/appgatedriver.service" "$pkgdir/usr/lib/systemd/system/appgatedriver.service"
    mkdir -vp "$pkgdir/usr/share/licenses/appgate-sdp"
    cp -v "$pkgdir/usr/share/doc/appgate/copyright" "$pkgdir/usr/share/licenses/appgate-sdp"
    cp -v "$pkgdir/usr/share/doc/appgate/LICENSE.github" "$pkgdir/usr/share/licenses/appgate-sdp"
    cp -v "$pkgdir/usr/share/doc/appgate/LICENSES.chromium.html.bz2" "$pkgdir/usr/share/licenses/appgate-sdp"
}
md5sums=('17101aac7623c06d5fbb95f50cf3dbdc'
         '002644116e20b2d79fdb36b7677ab4cf')

```

Let's first make sure we have some dependencies. If you do not have [yay](https://github.com/Jguer/yay), check it out.

```shell
yay -S dnsmasq gconf
```

Now, let's install it:

```shell
makepkg -si
```

# Run

Ok, let's run the client by executing `appgate`.

It complains about not being able to connect.

Easy fix:

```shell
sudo systemctl start appgatedriver.service
```

Now we should be connected... but DNS is not working?

# Fix DNS

Running `resolvectl` should display that something is not right.

Why is the DNS not being set by appgate?

```shell
$ head -3 /opt/appgate/linux/set_dns
#!/usr/bin/env python3
'''
This is used to set and unset the DNS.
```

It seems like python3 is required for the DNS setting to happen.
Let's try to run it.

```shell
$ sudo /opt/appgate/linux/set_dns
/opt/appgate/linux/set_dns:88: SyntaxWarning: "is" with a literal. Did you mean "=="?
  servers = [( socket.AF_INET if x.version is 4 else socket.AF_INET6, map(int, x.packed)) for x in servers]
Traceback (most recent call last):
  File "/opt/appgate/linux/set_dns", line 30, in <module>
    import dbus
ModuleNotFoundError: No module named 'dbus'
```

Ok, let's install it:

```shell
$ sudo python3.8 -m pip install dbus-python
```

It should work now... right?

```shell
$ sudo /opt/appgate/linux/set_dns
/opt/appgate/linux/set_dns:88: SyntaxWarning: "is" with a literal. Did you mean "=="?
  servers = [( socket.AF_INET if x.version is 4 else socket.AF_INET6, map(int, x.packed)) for x in servers]
module 'platform' has no attribute 'linux_distribution'
```

This is a breaking change in Python3.8.

So what is calling `platform.linux_distribution`?

Let's search for it:

```shell
$ sudo grep -r 'linux_distribution' /opt/appgate/linux/
/opt/appgate/linux/nm.py:    if platform.linux_distribution()[0] != 'Fedora':
```

Aha! So this is in the local AppGate source code. This should be an easy fix. Let's just replace this line with:

```python
if True: # Since we are not using Fedora :)
```

# Conclusion

It turns out there are [breaking changes](https://docs.python.org/3.7/library/platform.html#platform.linux_distribution) in Python3.8.

The docs that say `Deprecated since version 3.5, will be removed in version 3.8: See alternative like the distro package.`

I guess this highlights one of the caveats of relying upon system python.

