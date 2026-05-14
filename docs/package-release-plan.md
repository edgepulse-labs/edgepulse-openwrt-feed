# EdgePulse Package Release Plan

This document plans how to publish package artifacts after the EdgePulse feed
has been built. The goal is to make `edgepulse`, `luci-app-edgepulse`,
`tensorflow-lite`, `tensorflow-lite-test`, and related dependency packages easy
to download, verify, install, and roll back.

The current buildroot produces `.apk` artifacts. Older or different OpenWrt
targets may still use `opkg`, where the corresponding artifacts are `.ipk`
packages. This plan applies to both formats; the main differences are the
repository index, signatures, and install commands.

## Recommendation

Use two release layers:

1. GitHub Releases: keep the complete artifact set, checksums, install notes,
   and validation record for each release.
2. Static package repository: provide a feed index that can be consumed directly
   by `opkg` or `apk`, so test and deployment devices can install and upgrade
   through their package manager.

In the short term, GitHub Releases alone are enough because they are easy to
inspect and trace manually. After the package ABI, target architecture, and
install flow are stable, publish the same artifacts to a static package
repository.

## Publishing Channel Comparison

| Channel                   | Best for                                                  | Advantages                              | Risks or limits                                         |
|---------------------------|-----------------------------------------------------------|-----------------------------------------|---------------------------------------------------------|
| GitHub Releases           | Milestones, manual tests, traceable artifacts             | Simple, can include checksums and notes | Users still need to download or copy files manually     |
| Static package repository | Routine install and upgrade on test or deployment devices | Works with package managers             | Requires index, signatures, and directory maintenance   |
| Image-bundled package     | Fixed hardware or demo images                             | Works out of the box                    | Less update flexibility; requires rebuilding firmware   |
| SCP / temporary directory | Local development validation                              | Fastest path                            | Not suitable for formal releases; no version governance |

## Recommended Release Artifacts

Each formal or candidate release should keep at least:

- Package artifacts:
  - `edgepulse`
  - `luci-app-edgepulse`
  - `tensorflow-lite`
  - `tensorflow-lite-test`
  - Other runtime dependencies produced directly by this feed, such as
    `farmhash`
- Package index:
  - `.ipk` feed: `Packages`, `Packages.gz`, `Packages.sig`
  - `.apk` feed: the repository index and signature files required by the
    package manager
- Checksums:
  - `SHA256SUMS`
  - `SHA256SUMS.sig`, once the release key is ready
- Release notes:
  - target architecture, for example `aarch64_cortex-a53`
  - OpenWrt build baseline or commit
  - feed commit
  - package versions and release numbers
  - whether `EDGEPULSE_ENABLE_AI_AGENT` was enabled
  - known limitations and upgrade notes

## Versioning And Naming

Formal releases should not rely only on the `PKG_RELEASE` embedded in package
filenames, because multiple target architectures may exist at the same time.
Use release tags like:

```text
edgepulse-openwrt-v<edgepulse-version>-<yyyymmdd>
```

Example:

```text
edgepulse-openwrt-v1.1.0-20260514
```

Keep the target architecture in the artifact path:

```text
releases/
  edgepulse-openwrt-v1.1.0-20260514/
    aarch64_cortex-a53/
      edgepulse/
        *.ipk or *.apk
        Packages*
        SHA256SUMS
```

If one release includes multiple OpenWrt targets, do not mix them in the same
package directory. The LuCI package may use `PKGARCH:=all`, but it still depends
on runtime packages from a target-specific repository, so release notes should
state which target set it was validated with.

## Release Gate

Before publishing a release, complete at least:

1. Clean build: rebuild from a clean buildroot or CI workspace, without manually
   modified staging artifacts.
2. Package inventory: list every package produced by this feed, including size,
   mtime, and SHA256.
3. Dependency check: confirm that OpenWrt base and LuCI packages required at
   install time are not missing or incorrectly listed in this feed.
4. Install test: install with the package manager on a target device or a same
   target image.
5. Runtime smoke test:
   - `edgepulse-ctl status --json`
   - LuCI pages load successfully
   - if TensorFlow Lite is included: run `tflite-runtime-check`
   - if the AI Agent is enabled: run agent status and one read-only ask flow
6. Upgrade test: install the previous release first, then upgrade and confirm
   that UCI config and init script behavior are not unexpectedly overwritten.
7. Rollback note: document how to return to the previous artifact set or
   repository URL in the release notes.

## Static Repository Plan

A formal feed repository can be served as static files, for example from GitHub
Pages, object storage, or an internal HTTP server. Organize it by package
manager, target architecture, and feed name.

Suggested layout:

```text
packages/
  apk/
    aarch64_cortex-a53/
      edgepulse/
        *.apk
        <repository index files>
  ipk/
    aarch64_cortex-a53/
      edgepulse/
        *.ipk
        Packages
        Packages.gz
        Packages.sig
```

Device-side configuration should treat the repository as a replaceable source,
not something hardcoded into the packages themselves. Unsigned installs are
acceptable for short-term testing; public or multi-person testing should use a
signed repository.

## Install Methods

### `.ipk` / `opkg`

Manual local installs are useful for development testing:

```sh
opkg install /tmp/edgepulse-ipks/*.ipk
```

Formal repository installs should configure the feed source and then install by
package name:

```sh
opkg update
opkg install edgepulse luci-app-edgepulse
```

### `.apk` / `apk`

Manual local installs can use local files:

```sh
apk add --allow-untrusted /tmp/edgepulse-apks/*.apk
```

Formal repository installs should add the repository index and trusted signing
key, then install by package name:

```sh
apk update
apk add edgepulse luci-app-edgepulse
```

## Signatures And Trust

Before publishing formal releases, create a dedicated release signing key. Avoid
using a personal day-to-day development key. Recommended practice:

- Use the release key only for package repository signatures and checksum
  signatures.
- Publish the public key in the release notes and repository root.
- Keep the private key only in CI secrets or on an offline release machine.
- Generate `SHA256SUMS` for every release so individual artifacts can still be
  verified even without repository-based installation.

## CI/CD Recommendation

Start with three automation stages:

1. Build job: build packages for a fixed OpenWrt baseline and target
   architecture.
2. Verify job: collect package inventory and checksums, and run device or image
   smoke tests when available.
3. Publish job: only on tag or manual approval, upload artifacts to GitHub
   Releases and then sync them to the static repository.

The publish job should not overwrite existing releases. If the same tag needs
to be republished, use a new `PKG_RELEASE` or a new release tag so installation
clients and release history can distinguish the new artifact set.

## Suggested Short-Term Sequence

1. Publish one complete `aarch64_cortex-a53` package set through GitHub
   Releases.
2. Include install commands, SHA256 checksums, and smoke test results in the
   release notes.
3. Complete install and upgrade testing on an OpenWrt One or same-target device.
4. Create the static repository directory layout and signing key.
5. Starting with the next release, publish both the GitHub Release and the
   repository index.
6. Once the flow is stable, wire build, verify, and publish into CI.

