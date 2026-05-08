# EdgePulse OpenWrt Feed

OpenWrt package feed for EdgePulse.

Use it from an OpenWrt buildroot with either a remote git feed:

```text
src-git edgepulse https://github.com/Pod-01-Nier/edgepulse-openwrt-feed.git
```

or a local development feed:

```text
src-link edgepulse /path/to/edgepulse-openwrt-feed
```

Then run:

```sh
./scripts/feeds update edgepulse
./scripts/feeds install -a -p edgepulse
make menuconfig
```

