# TensorFlow Lite 2.14.1 升級說明

這份文件簡要整理 EdgePulse OpenWrt feed 中 TensorFlow Lite `2.11.0`
baseline 與目前 `2.14.1` package 的實際差異。

## 摘要

目前建議新的 EdgePulse OpenWrt build 使用 `2.14.1`。這個版本保留原本
`2.11.0` 的 runtime 驗證流程，同時把 TensorFlow Lite runtime 往前升級，
並把 package 相依性調整到 TensorFlow `2.14.1` 需要的組合。

`tensorflow-lite-2.11.0` Git tag 仍保留作為穩定 baseline，方便比較或回退。
`tensorflow-lite-2.14.1` Git tag 則記錄已驗證通過的升級版本。

## 主要差異

| 項目                    | 2.11.0 baseline                 | 2.14.1 package                                                      |
|-------------------------|---------------------------------|---------------------------------------------------------------------|
| TensorFlow Lite runtime | `TfLiteVersion: 2.11.0`         | `TfLiteVersion: 2.14.1`                                             |
| Package artifact        | `tensorflow-lite-2.11.0-r1.apk` | `tensorflow-lite-2.14.1-r1.apk`                                     |
| 壓縮後 package 大小     | 896.43 KiB                      | 1.02 MiB                                                            |
| FlatBuffers             | feed 中的 `25.2.10`             | `23.5.26`，符合 TensorFlow 2.14.1 generated headers                  |
| Build dependencies      | 原有 TFLite 支援函式庫          | 新增 `abseil-cpp`、`ml-dtypes`、`pthreadpool` 到 build dependency set |
| Patch set               | 2.11.0 需要多個本地 patches     | 多數 patches 在 2.14.1 已不需要，只保留 gemmlowp link 調整           |
| Runtime 驗證            | `tflite-runtime-check` 通過     | `tflite-runtime-check` 已在 OpenWrt One 通過                        |

## Package 層面的變更

TensorFlow Lite `2.14.1` 比舊的 `2.11.0` package 需要稍微完整一點的建置環境。
feed 現在新增一個 header-only 的 `ml-dtypes` package，並且讓 `fft2d` 把
license/readme 檔安裝到 staging source 目錄。TensorFlow Lite package 也改用
`FETCHCONTENT_SOURCE_DIR_*` CMake options，確保 build 使用 OpenWrt staging
中的來源，而不是在編譯期間嘗試下載相依套件。

FlatBuffers 固定到 `23.5.26`，原因是 TensorFlow Lite `2.14.1` 的 generated
headers 會檢查 FlatBuffers 23.x 版本族。若沿用較新的 `25.2.10`，編譯時會
因 generated-header 相容性檢查而失敗。

目前產出的 `tensorflow-lite` runtime 仍只連結到預期的 target runtime
libraries：

```text
libfarmhash.so.0
libfft2d_fftsg2d.so
libfft2d_fftsg.so
libstdc++.so.6
libgcc_s.so.1
libc.so
```

## 驗證結果

`2.14.1` package 已針對 `aarch64_cortex-a53` 建置並安裝到 OpenWrt One。
runtime 驗證工具執行成功：

```text
TensorFlow Lite runtime OK: 2 + 3.5 = 5.5
TfLiteVersion: 2.14.1
```

## 建議升級原因

建議目前的開發與部署使用 `2.14.1`，原因是：

- 使用較新的 TensorFlow Lite runtime，同時保留既有的小型 runtime 驗證流程。
- 移除多個在 TensorFlow `2.14.1` 已不需要的本地 patches，降低後續維護成本。
- 讓 OpenWrt package build 需要的相依性更明確、可重現。
- 已完成編譯、打包、OpenWrt One 安裝，以及實際 runtime 測試。

`2.11.0` 仍適合作為已知可用的歷史 baseline；但除非下游模型或特定 device
image 有明確相容性需求，新的工作建議使用 `2.14.1`。
