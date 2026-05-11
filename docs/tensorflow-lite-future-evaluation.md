# TensorFlow Lite Future Upgrade Evaluation

This document evaluates whether EdgePulse should continue upgrading the current
TensorFlow Lite package beyond `2.14.1`, or start migrating toward LiteRT.

Assessment date: 2026-05-11

## Recommendation

Keep `tensorflow-lite` `2.14.1` as the current validated OpenWrt runtime, and
start a separate LiteRT packaging proof of concept before making another
production runtime switch.

In other words:

- Do not immediately chase the latest TensorFlow tag just because it is newer.
- Do evaluate LiteRT next, because it is the direction Google is taking for
  future on-device runtime features and performance work.
- Keep the existing `tensorflow-lite-2.14.1` package available as the stable
  fallback while the LiteRT package is tested.

## Current Signals

The latest TensorFlow release page lists TensorFlow `2.21.0` as the current
latest release. Its release notes still include `tf.lite` improvements, but
the TensorFlow `2.20.0` notes also state that `tf.lite` is being deprecated in
favor of the new `google-ai-edge/LiteRT` repository.

Google's LiteRT migration documentation says TensorFlow Lite is now LiteRT,
existing TensorFlow Lite packages remain functional, and future feature updates
and performance improvements are exclusive to LiteRT.

The LiteRT GitHub releases page currently lists `v2.1.4` as the latest LiteRT
release. Recent LiteRT releases mention C/C++ API and CMake build stability
improvements, which are especially relevant to this OpenWrt feed.

## Option 1: Continue Updating From TensorFlow Releases

This means moving the current package from TensorFlow `2.14.1` to a newer
TensorFlow tag, such as `2.21.0`, while still building the TensorFlow Lite
runtime from the TensorFlow source tree.

### Advantages

- It is closest to the package structure already proven in this feed.
- The existing `tflite-runtime-check` validation flow should remain useful.
- The current C API based integration is less likely to need application-level
  changes.

### Risks

- TensorFlow's upstream direction is moving the on-device runtime work to
  LiteRT, so this path may buy only short-term freshness.
- Newer TensorFlow tags may change or remove pieces of the TensorFlow Lite
  source layout, dependency graph, or CMake behavior.
- The OpenWrt build may need another dependency refresh similar to the
  `2.14.1` upgrade, with no guarantee that the result is the future-facing
  runtime.

### When This Is Worth Doing

Use this path only if a specific model, operator, bug fix, or compatibility
issue requires a newer TensorFlow Lite runtime and LiteRT is not ready in this
feed yet.

## Option 2: Move Toward LiteRT

This means creating a new LiteRT package path, likely starting with the
Interpreter API so the existing `.tflite` model flow and runtime check remain
comparable.

### Advantages

- LiteRT is Google's stated primary runtime for future on-device AI work.
- LiteRT is where future feature and performance improvements are expected to
  land.
- Recent LiteRT releases include CMake and C/C++ API stability work, which may
  make source packaging more practical than it was earlier.
- It gives the project a better long-term path toward hardware acceleration
  and newer edge AI workloads.

### Risks

- The migration guidance is simplest for Android Maven and Python packages.
  This OpenWrt feed builds a native C/C++ runtime from source, so the migration
  should be treated as a new packaging effort, not a simple rename.
- LiteRT's newer `CompiledModel` API may require application changes if we
  decide to adopt it instead of staying on the Interpreter API.
- Binary size, dependency closure, and cross-compilation behavior are not yet
  validated for this feed.
- Hardware acceleration benefits may not matter immediately if the OpenWrt One
  deployment remains CPU-only.

### Suggested LiteRT Evaluation Plan

1. Add a separate experimental package, for example `litert`, without replacing
   `tensorflow-lite` yet.
2. Build the LiteRT Interpreter API first, because it is the closest runtime
   match to the existing TensorFlow Lite C API validation.
3. Port or duplicate `tflite-runtime-check` so it can validate the LiteRT
   runtime with the same generated ADD model.
4. Compare package size, linked libraries, build dependencies, and runtime
   result against the validated `tensorflow-lite-2.14.1` package.
5. Only after the Interpreter API is stable, evaluate the `CompiledModel` API
   for GPU/NPU or GenAI-oriented workloads.

## Decision Matrix

| Path                                               | Short-term risk | Long-term value | Recommendation                                |
|----------------------------------------------------|----------------:|----------------:|-----------------------------------------------|
| Stay on TensorFlow Lite 2.14.1                     |             Low |          Medium | Keep as current stable runtime                |
| Upgrade TensorFlow Lite from newer TensorFlow tags |          Medium |      Medium-low | Do only for a specific needed fix or operator |
| Package LiteRT Interpreter API                     |          Medium |            High | Recommended next investigation                |
| Move directly to LiteRT CompiledModel API          |            High |            High | Defer until LiteRT packaging is proven        |

## Practical Conclusion

For this OpenWrt feed, the best next step is not an immediate production jump
to the latest TensorFlow release. The safer and more strategic path is:

1. Keep `tensorflow-lite` `2.14.1` as the validated runtime.
2. Create an experimental LiteRT package branch.
3. Validate LiteRT with the same target, model, and runtime check.
4. Switch production packaging only after LiteRT builds cleanly, installs on
   OpenWrt One, and passes the same validation with acceptable size and
   dependency impact.

## References

- TensorFlow releases: https://github.com/tensorflow/tensorflow/releases
- LiteRT overview: https://ai.google.dev/edge/litert/
- TensorFlow Lite to LiteRT migration: https://ai.google.dev/edge/litert/migration
- LiteRT releases: https://github.com/google-ai-edge/LiteRT/releases
