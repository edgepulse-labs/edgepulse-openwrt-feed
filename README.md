# EdgePulse OpenWrt Feed

This repository is an OpenWrt package feed for EdgePulse and the native
libraries it needs on OpenWrt targets.

It packages the EdgePulse telemetry daemon, its LuCI application, TensorFlow
Lite runtime support, and a small TensorFlow Lite validation utility. The feed
also carries the TensorFlow Lite build dependencies that are not normally
available from the target OpenWrt package feeds used by this project.

Current status as of 2026-05-10: the `edgepulse` and `luci-app-edgepulse`
packages have been installed and validated on OpenWrt One. The daemon package
includes the optional AI Agent build, shared chat storage, policy-gated
OpenWrt actions, and the first local C MCP adapter. The LuCI package includes
AI Agent settings, shared chat helper commands, and a Diagnostic report view
that renders structured results in a human-readable form.

## Packages

- `edgepulse`: telemetry daemon and CLI tools for collecting local device
  metrics, preparing time-window features for later AI workflows, and
  optionally running the policy-gated AI Agent and local C MCP adapter.
- `luci-app-edgepulse`: LuCI pages and RPC helper for viewing and configuring
  EdgePulse from the OpenWrt web UI, including AI Agent settings, diagnostics,
  shared chat helpers, and readable Diagnostic reports.
- `tensorflow-lite`: TensorFlow Lite 2.11.0 shared runtime library for running
  trained models on-device.
- `tensorflow-lite-test`: runtime check tool that generates a minimal `.tflite`
  ADD model, loads it through TensorFlow Lite, runs inference, and verifies the
  result.
- TensorFlow Lite support libraries: `cpuinfo`, `eigen`, `farmhash`, `fft2d`,
  `flatbuffers`, `fp16`, `fxdiv`, `gemmlowp`, `neon-2-sse`, `psimd`,
  `pthreadpool`, `ruy`, and `xnnpack`.

## Using The Feed

Add the feed to an OpenWrt buildroot with a local feed line in
`feeds.conf.default` or `feeds.conf`:

```text
src-link edgepulse /path/to/edgepulse-openwrt-feed
```

Then update and install the feed:

```sh
./scripts/feeds update edgepulse
./scripts/feeds install -a -p edgepulse
```

## Building Packages

Build EdgePulse from the upstream source configured in the package Makefile:

```sh
make package/feeds/edgepulse/edgepulse/compile V=s
```

For an AI Agent enabled development build, pass the build option used by the
current validation flow:

```sh
make package/feeds/edgepulse/edgepulse/compile V=s \
  CONFIG_EDGEPULSE_ENABLE_AI_AGENT=y
```

For local EdgePulse source development, point the package at a working tree:

```sh
make package/feeds/edgepulse/edgepulse/compile V=s \
  EDGEPULSE_LOCAL_SOURCE=/path/to/edgepulse
```

Build the LuCI application:

```sh
make package/feeds/edgepulse/luci-app-edgepulse/compile V=s
```

Build TensorFlow Lite and its runtime validation package:

```sh
make package/feeds/edgepulse/tensorflow-lite/compile V=s
make package/feeds/edgepulse/tensorflow-lite-test/compile V=s
```

On APK-based OpenWrt builds, the generated packages are written under the
target package output directory, for example:

```text
bin/packages/<arch>/edgepulse/
```

For a quick reference of the currently built `.apk` artifact sizes, see
[`docs/package-sizes.md`](docs/package-sizes.md).

## Runtime Validation

Install the related APKs on an OpenWrt target:

```sh
apk add --allow-untrusted \
  /tmp/edgepulse-apks/farmhash-1.1.0-r1.apk \
  /tmp/edgepulse-apks/tensorflow-lite-2.11.0-r1.apk \
  /tmp/edgepulse-apks/tensorflow-lite-test-1.0-r1.apk \
  /tmp/edgepulse-apks/edgepulse-1.apk \
  /tmp/edgepulse-apks/luci-app-edgepulse-1.apk
```

Validate the EdgePulse agent and MCP surface:

```sh
edgepulse-ctl agent status
edgepulse-ctl agent chat ask default "Check router health."
edgepulse-ctl agent chat list default
edgepulse-ctl agent mcp methods
printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | \
  edgepulse-ctl agent mcp serve
```

Install `tensorflow-lite` and `tensorflow-lite-test` on a target device, then
run:

```sh
tflite-runtime-check
```

A successful run prints output similar to:

```text
TensorFlow Lite runtime OK: 2 + 3.5 = 5.5
TfLiteVersion: 2.11.0
```

The validation tool does not require downloading a model. It creates a small
test model on the target, saves it as a `.tflite` file, loads it through the
TensorFlow Lite runtime, runs inference, and checks the output.
