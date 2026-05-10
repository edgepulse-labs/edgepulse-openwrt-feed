# EdgePulse OpenWrt Feed

這個 repository 是 EdgePulse 專用的 OpenWrt package feed，包含
EdgePulse 在 OpenWrt target 上需要的套件與原生函式庫。

此 feed 提供 EdgePulse telemetry daemon、LuCI 管理介面、TensorFlow Lite
runtime 支援，以及一個用來驗證 TensorFlow Lite 是否能正常載入模型並執行
推論的小工具。這裡也收錄了本專案使用的 OpenWrt feeds 中通常沒有提供、
但建置 TensorFlow Lite 需要的相依套件。

截至 2026-05-10，`edgepulse` 與 `luci-app-edgepulse` packages 已安裝並在
OpenWrt One 驗證。Daemon package 包含 optional AI Agent build、shared chat
storage、policy-gated OpenWrt actions，以及第一版 local C MCP adapter。LuCI
package 包含 AI Agent settings、shared chat helper commands，以及會把
structured results 整理成人類可讀內容的 Diagnostic report view。

## 套件

- `edgepulse`：telemetry daemon 與 CLI 工具，用來收集本機裝置指標、整理
  後續 AI workflow 可使用的時間窗特徵，並可選擇啟用 policy-gated AI Agent
  與 local C MCP adapter。
- `luci-app-edgepulse`：LuCI 頁面與 RPC helper，可在 OpenWrt Web UI 中查看
  與設定 EdgePulse，包含 AI Agent settings、diagnostics、shared chat helpers
  與可讀的 Diagnostic reports。
- `tensorflow-lite`：TensorFlow Lite 2.11.0 shared runtime library，用來在
  裝置端執行訓練好的模型。
- `tensorflow-lite-test`：runtime 驗證工具，會產生一個最小的 `.tflite` ADD
  模型，透過 TensorFlow Lite 載入、執行推論，並檢查結果。
- TensorFlow Lite 支援函式庫：`cpuinfo`、`eigen`、`farmhash`、`fft2d`、
  `flatbuffers`、`fp16`、`fxdiv`、`gemmlowp`、`neon-2-sse`、`psimd`、
  `pthreadpool`、`ruy`、`xnnpack`。

## 使用 Feed

在 OpenWrt buildroot 的 `feeds.conf.default` 或 `feeds.conf` 加入本地 feed：

```text
src-link edgepulse /path/to/edgepulse-openwrt-feed
```

接著更新並安裝 feed：

```sh
./scripts/feeds update edgepulse
./scripts/feeds install -a -p edgepulse
```

## 建置套件

使用 package Makefile 中設定的 upstream source 建置 EdgePulse：

```sh
make package/feeds/edgepulse/edgepulse/compile V=s
```

若要建置啟用 AI Agent 的 development build，可使用目前驗證流程採用的 build
option：

```sh
make package/feeds/edgepulse/edgepulse/compile V=s \
  CONFIG_EDGEPULSE_ENABLE_AI_AGENT=y
```

如果正在開發本機 EdgePulse source，可以指定工作目錄：

```sh
make package/feeds/edgepulse/edgepulse/compile V=s \
  EDGEPULSE_LOCAL_SOURCE=/path/to/edgepulse
```

建置 LuCI 應用程式：

```sh
make package/feeds/edgepulse/luci-app-edgepulse/compile V=s
```

建置 TensorFlow Lite 與 runtime 驗證套件：

```sh
make package/feeds/edgepulse/tensorflow-lite/compile V=s
make package/feeds/edgepulse/tensorflow-lite-test/compile V=s
```

在使用 APK 的 OpenWrt build 中，產出的套件會放在 target package output
目錄，例如：

```text
bin/packages/<arch>/edgepulse/
```

目前已編譯出的 `.apk` 檔案大小紀錄在
[`docs/package-sizes.md`](docs/package-sizes.md)，可用來快速估算下載與儲存
空間。

## Runtime 驗證

在 OpenWrt target 安裝相關 APK：

```sh
apk add --allow-untrusted \
  /tmp/edgepulse-apks/farmhash-1.1.0-r1.apk \
  /tmp/edgepulse-apks/tensorflow-lite-2.11.0-r1.apk \
  /tmp/edgepulse-apks/tensorflow-lite-test-1.0-r1.apk \
  /tmp/edgepulse-apks/edgepulse-1.apk \
  /tmp/edgepulse-apks/luci-app-edgepulse-1.apk
```

驗證 EdgePulse agent 與 MCP surface：

```sh
edgepulse-ctl agent status
edgepulse-ctl agent chat ask default "Check router health."
edgepulse-ctl agent chat list default
edgepulse-ctl agent mcp methods
printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | \
  edgepulse-ctl agent mcp serve
```

在 target 裝置安裝 `tensorflow-lite` 與 `tensorflow-lite-test` 後執行：

```sh
tflite-runtime-check
```

成功時會看到類似輸出：

```text
TensorFlow Lite runtime OK: 2 + 3.5 = 5.5
TfLiteVersion: 2.11.0
```

這個驗證工具不需要另外下載模型。它會在 target 上產生一個小型測試模型，
存成 `.tflite` 檔案後，再透過 TensorFlow Lite runtime 載入、執行推論，
並檢查輸出是否正確。
