# Package Size Reference

This document records the currently built EdgePulse feed `.apk` package sizes
so the team can quickly estimate download, storage, and image size impact.

Snapshot time: 2026-05-10 22:34 Asia/Taipei

Build output:

```text
/home/nier/.openclaw/workspace/openwrt-build/bin/packages/aarch64_cortex-a53/edgepulse/
```

Target package architecture: `aarch64_cortex-a53`

## EdgePulse Feed Packages

| Package artifact                  |           Size |       Bytes | Built/updated             |
|-----------------------------------|---------------:|------------:|---------------------------|
| `tensorflow-lite-2.11.0-r1.apk`   |     896.43 KiB |     917,949 | 2026-05-09 13:19:51 +0800 |
| `edgepulse-1.apk`                 |      46.25 KiB |      47,361 | 2026-05-10 22:34:55 +0800 |
| `tensorflow-lite-test-1.0-r1.apk` |       8.45 KiB |       8,655 | 2026-05-09 13:19:54 +0800 |
| `farmhash-1.1.0-r1.apk`           |       7.77 KiB |       7,960 | 2026-05-09 12:26:47 +0800 |
| `luci-app-edgepulse-1.apk`        |       6.95 KiB |       7,116 | 2026-05-10 22:30:53 +0800 |
| **Total**                         | **965.86 KiB** | **989,041** |                           |

## Notes

- These are compressed `.apk` artifact sizes, not installed filesystem usage.
- This table only includes packages produced by this feed in the `edgepulse`
  package output directory. OpenWrt base, LuCI, and other dependency packages
  are emitted into adjacent directories and should be measured separately when
  estimating a complete image or install set.
- Refresh this record after rebuilding packages, especially after changing
  TensorFlow Lite build options or adding LuCI assets.

## Refresh Command

Run these commands from the OpenWrt buildroot:

```sh
stat -c '%n	%s	%y' bin/packages/aarch64_cortex-a53/edgepulse/*.apk
du -h bin/packages/aarch64_cortex-a53/edgepulse/*.apk
```
