# TensorFlow Lite 後續升級評估

這份文件評估 EdgePulse 是否應該繼續把目前的 TensorFlow Lite package 往
`2.14.1` 之後的新 TensorFlow 版本更新，或是開始往 LiteRT 遷移。

評估日期：2026-05-11

## 建議結論

建議保留 `tensorflow-lite` `2.14.1` 作為目前已驗證的 OpenWrt runtime，並
另外啟動 LiteRT package 的 proof of concept。不要立刻把 production runtime
再切到更新的 TensorFlow tag。

也就是說：

- 不建議只因為 TensorFlow 有更新版就立刻追到最新版。
- 建議下一步評估 LiteRT，因為 Google 未來的 on-device runtime 功能與效能
  改進會往 LiteRT 集中。
- 在 LiteRT package 驗證完成前，保留現有 `tensorflow-lite-2.14.1` 作為穩定
  fallback。

## 目前觀察

TensorFlow release 頁面目前列出 TensorFlow `2.21.0` 為最新版本。它的 release
notes 仍包含 `tf.lite` 相關改進，但 TensorFlow `2.20.0` 的 notes 也已說明
`tf.lite` 會逐步改由新的 `google-ai-edge/LiteRT` repository 承接。

Google 的 LiteRT migration 文件說明 TensorFlow Lite 現在是 LiteRT，既有
TensorFlow Lite packages 仍可使用，但未來的功能更新與效能改善會只放在
LiteRT。

LiteRT GitHub releases 目前列出 `v2.1.4` 為最新 LiteRT release。近期 LiteRT
release 也提到 C/C++ API 與 CMake build stability 的改善，這對 OpenWrt feed
這種 native source package 很重要。

## 選項一：繼續追 TensorFlow Releases

這個方向是把目前 package 從 TensorFlow `2.14.1` 升到更後面的 TensorFlow
tag，例如 `2.21.0`，並繼續從 TensorFlow source tree 裡建置 TensorFlow Lite
runtime。

### 優點

- 最接近目前 feed 已經驗證通過的 package 架構。
- 既有的 `tflite-runtime-check` 驗證流程大致可沿用。
- 目前以 C API 為主的整合比較不容易需要 application-level 修改。

### 風險

- TensorFlow upstream 的 on-device runtime 方向已往 LiteRT 移動，所以這條路
  可能只是短期保持版本較新。
- 新版 TensorFlow tag 可能改動或移除 TensorFlow Lite 的 source layout、
  dependency graph、或 CMake behavior。
- OpenWrt build 可能需要像 `2.14.1` 升級時那樣重新整理相依性，但最後得到的
  runtime 未必是未來主要維護方向。

### 什麼時候值得做

只有在特定模型、operator、bug fix、或相容性需求明確要求較新的 TensorFlow
Lite runtime，而 LiteRT package 尚未準備好時，才建議走這條路。

## 選項二：往 LiteRT 遷移

這個方向是新增 LiteRT package 路徑。建議先從 Interpreter API 開始，讓既有
`.tflite` model flow 和 runtime check 可以維持可比較。

### 優點

- LiteRT 是 Google 對未來 on-device AI runtime 的主要方向。
- 未來功能與效能改善預期會集中在 LiteRT。
- 近期 LiteRT release 已改善 CMake 與 C/C++ API 穩定性，對 source packaging
  比早期更有利。
- 長期來看，若要評估硬體加速或新的 edge AI workload，LiteRT 的路線比較完整。

### 風險

- 官方 migration guidance 對 Android Maven 與 Python package 最單純；本 feed
  是 native C/C++ runtime source build，因此應把 LiteRT 視為新的 packaging
  工作，而不是單純改名。
- 若直接採用 LiteRT 新的 `CompiledModel` API，可能需要修改應用程式整合方式。
- 目前還沒有在此 feed 驗證 LiteRT 的 binary size、dependency closure、
  cross-compilation 行為。
- 如果 OpenWrt One deployment 短期仍是 CPU-only，LiteRT 的 GPU/NPU 優勢未必
  會立刻反映在目前 workload。

### 建議 LiteRT 評估步驟

1. 新增獨立 experimental package，例如 `litert`，暫時不要取代
   `tensorflow-lite`。
2. 先建 Interpreter API，因為它最接近目前 TensorFlow Lite C API 的驗證方式。
3. 移植或複製 `tflite-runtime-check`，用同一個 ADD model 驗證 LiteRT runtime。
4. 比較 package size、linked libraries、build dependencies、runtime 結果，並
   對照已驗證的 `tensorflow-lite-2.14.1` package。
5. 等 Interpreter API packaging 穩定後，再評估 `CompiledModel` API 是否適合
   GPU/NPU 或 GenAI workload。

## 決策矩陣

| 路線                                     | 短期風險 | 長期價值 | 建議                             |
|------------------------------------------|---------:|---------:|----------------------------------|
| 維持 TensorFlow Lite 2.14.1              |       低 |       中 | 保留作為目前穩定 runtime         |
| 追新版 TensorFlow tag 的 TensorFlow Lite |       中 |     中低 | 只有明確需要 fix/operator 時才做 |
| Package LiteRT Interpreter API           |       中 |       高 | 建議下一步優先研究               |
| 直接切 LiteRT CompiledModel API          |       高 |       高 | 等 LiteRT packaging 驗證後再評估 |

## 實務結論

對這個 OpenWrt feed 來說，下一步不應該是立刻把 production package 跳到最新
TensorFlow release。比較安全且更有長期價值的路線是：

1. 保留 `tensorflow-lite` `2.14.1` 作為已驗證 runtime。
2. 建立 experimental LiteRT package branch。
3. 用相同 target、model、runtime check 驗證 LiteRT。
4. 只有當 LiteRT 能乾淨編譯、安裝到 OpenWrt One、通過相同驗證，且 package
   大小與相依性影響可接受時，再考慮切換 production packaging。

## 參考資料

- TensorFlow releases: https://github.com/tensorflow/tensorflow/releases
- LiteRT overview: https://ai.google.dev/edge/litert/
- TensorFlow Lite to LiteRT migration: https://ai.google.dev/edge/litert/migration
- LiteRT releases: https://github.com/google-ai-edge/LiteRT/releases
