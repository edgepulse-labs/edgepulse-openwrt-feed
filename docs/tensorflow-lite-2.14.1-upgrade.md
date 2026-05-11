# TensorFlow Lite 2.14.1 Upgrade Notes

This document summarizes the practical differences between the EdgePulse
OpenWrt TensorFlow Lite `2.11.0` package baseline and the current `2.14.1`
package.

## Summary

The `2.14.1` package is the recommended version for current EdgePulse OpenWrt
builds. It keeps the same runtime validation flow as `2.11.0`, while moving
the TensorFlow Lite runtime forward and aligning the package dependency set
with what TensorFlow `2.14.1` expects.

The `tensorflow-lite-2.11.0` Git tag remains available as a stable baseline for
comparison or rollback. The `tensorflow-lite-2.14.1` Git tag records the
validated upgrade.

## What Changed

| Area                    | 2.11.0 baseline                           | 2.14.1 package                                                                        |
|-------------------------|-------------------------------------------|---------------------------------------------------------------------------------------|
| TensorFlow Lite runtime | `TfLiteVersion: 2.11.0`                   | `TfLiteVersion: 2.14.1`                                                               |
| Package artifact        | `tensorflow-lite-2.11.0-r1.apk`           | `tensorflow-lite-2.14.1-r1.apk`                                                       |
| Compressed package size | 896.43 KiB                                | 1.02 MiB                                                                              |
| FlatBuffers             | `25.2.10` in this feed                    | `23.5.26`, matching TensorFlow 2.14.1 generated headers                               |
| Build dependencies      | Existing TFLite support libraries         | Adds `abseil-cpp`, `ml-dtypes`, and `pthreadpool` to the build dependency set         |
| Patch set               | Several local patches required for 2.11.0 | Most of those patches are no longer needed; only the gemmlowp link adjustment remains |
| Runtime validation      | `tflite-runtime-check` passed             | `tflite-runtime-check` passed on OpenWrt One                                          |

## Package-Level Differences

TensorFlow Lite `2.14.1` needs a slightly broader build environment than the
old `2.11.0` package. The feed now carries a small `ml-dtypes` header package,
installs the `fft2d` license/readme file into the staging source directory, and
uses `FETCHCONTENT_SOURCE_DIR_*` CMake options so the build stays offline and
uses staged OpenWrt sources instead of downloading dependencies during build.

FlatBuffers was aligned to `23.5.26` because the generated TensorFlow Lite
headers in `2.14.1` check for the FlatBuffers 23.x version family. Keeping the
newer `25.2.10` FlatBuffers package caused a generated-header compatibility
failure during compilation.

The resulting `tensorflow-lite` runtime still links only against the expected
target runtime libraries:

```text
libfarmhash.so.0
libfft2d_fftsg2d.so
libfft2d_fftsg.so
libstdc++.so.6
libgcc_s.so.1
libc.so
```

## Validation

The `2.14.1` package was built for `aarch64_cortex-a53` and installed on
OpenWrt One. The runtime validation utility completed successfully:

```text
TensorFlow Lite runtime OK: 2 + 3.5 = 5.5
TfLiteVersion: 2.14.1
```

## Why Upgrade

Upgrade to `2.14.1` for current development and deployment because it:

- Uses a newer TensorFlow Lite runtime while preserving the existing small
  runtime validation workflow.
- Reduces local patch maintenance by dropping patches that are no longer needed
  with TensorFlow `2.14.1`.
- Makes the dependency set explicit and reproducible for OpenWrt package builds.
- Has been compiled, packaged, installed, and runtime-tested on OpenWrt One.

The `2.11.0` package remains useful as a known-good historical baseline, but
new work should use `2.14.1` unless a downstream model or device image has a
specific compatibility reason to stay on the older runtime.
