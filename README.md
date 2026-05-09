# EdgePulse OpenWrt Feed

This repository is an OpenWrt package feed for EdgePulse and the native
libraries it needs on OpenWrt targets.

It packages the EdgePulse telemetry daemon, its LuCI application, TensorFlow
Lite runtime support, and a small TensorFlow Lite validation utility. The feed
also carries the TensorFlow Lite build dependencies that are not normally
available from the target OpenWrt package feeds used by this project.

## Packages

- `edgepulse`: telemetry daemon and CLI tools for collecting local device
  metrics and preparing time-window features for later AI workflows.
- `luci-app-edgepulse`: LuCI pages and RPC helper for viewing and configuring
  EdgePulse from the OpenWrt web UI.
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

## Runtime Validation

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
