# EdgePulse Package 發佈規劃

這份文件規劃 EdgePulse feed 編譯完成後的 package artifact 發佈方式。目標是讓
`edgepulse`、`luci-app-edgepulse`、`tensorflow-lite`、`tensorflow-lite-test`
與其他相依套件可以被穩定下載、驗證與安裝。

目前此 buildroot 產出的 artifact 是 `.apk`；若目標 OpenWrt 版本仍使用 `opkg`，
對應產物會是 `.ipk`。以下規劃同時適用兩者，差異主要在 index、簽章與安裝指令。

## 建議結論

建議採用兩層發佈：

1. GitHub Releases：保存每次 release 的完整 artifact、checksum、安裝說明與
   驗證紀錄。
2. Static package repository：提供可直接給 `opkg` 或 `apk` 使用的 feed index，
   讓測試機與部署機可以用 package manager 安裝與升級。

短期可以先只做 GitHub Releases，因為最容易人工檢查與回溯。等 package ABI、
target architecture 與安裝流程穩定後，再把同一批 artifact 同步到 static package
repository。

## 發佈渠道比較

| 渠道                      | 適合用途                        | 優點                      | 風險或限制                       |
|---------------------------|---------------------------------|---------------------------|----------------------------------|
| GitHub Releases           | 里程碑、手動測試、可追溯 artifact | 簡單、可附 checksum 與說明 | 使用者仍需手動下載或複製到裝置   |
| Static package repository | 測試機與部署機日常安裝、升級     | 可用 package manager 管理 | 需要維護 index、簽章、目錄結構     |
| Image 內建 package        | 固定硬體或展示 image            | 開箱即用                  | 更新彈性較低，需重建完整 firmware |
| SCP/臨時目錄              | 本機開發驗證                    | 最快                      | 不可作為正式發佈，沒有版本治理    |

## 推薦 Release Artifact

每次正式或候選 release 至少保留以下內容：

- Package artifacts：
  - `edgepulse`
  - `luci-app-edgepulse`
  - `tensorflow-lite`
  - `tensorflow-lite-test`
  - 此 feed 直接產出的其他 runtime dependency，例如 `farmhash`
- Package index：
  - `.ipk` feed：`Packages`、`Packages.gz`、`Packages.sig`
  - `.apk` feed：對應 package manager 需要的 repository index 與簽章檔
- Checksums：
  - `SHA256SUMS`
  - `SHA256SUMS.sig`，若 release key 已準備好
- Release notes：
  - target architecture，例如 `aarch64_cortex-a53`
  - OpenWrt build baseline 或 commit
  - feed commit
  - package version 與 release number
  - 是否啟用 `EDGEPULSE_ENABLE_AI_AGENT`
  - 已知限制與升級注意事項

## 版本與命名

正式發佈應避免只用檔名中的 `PKG_RELEASE` 判斷版本，因為不同 target architecture
可能同時存在。建議 release tag 使用以下格式：

```text
edgepulse-openwrt-v<edgepulse-version>-<yyyymmdd>
```

範例：

```text
edgepulse-openwrt-v1.1.0-20260514
```

Artifact 目錄建議保留 target architecture：

```text
releases/
  edgepulse-openwrt-v1.1.0-20260514/
    aarch64_cortex-a53/
      edgepulse/
        *.ipk 或 *.apk
        Packages*
        SHA256SUMS
```

若同一版同時發佈多個 OpenWrt target，不要混放在同一個 package directory。LuCI
package 可能是 `PKGARCH:=all`，但它仍依賴 target repository 中的 runtime
packages，因此 release notes 要清楚列出它是跟哪個 target set 一起驗證。

## Release Gate

每次發佈前應至少完成：

1. Clean build：從乾淨 buildroot 或 CI workspace 重新編譯，不使用手動修改過的
   staging artifact。
2. Package inventory：列出本 feed 產出的全部 package、大小、mtime 與 SHA256。
3. Dependency check：確認安裝時需要的 OpenWrt base/LuCI packages 不在本 feed
   裡被漏列或錯列。
4. Install test：在目標裝置或同 target image 上使用 package manager 安裝。
5. Runtime smoke test：
   - `edgepulse-ctl status --json`
   - LuCI 頁面可載入
   - 若包含 TensorFlow Lite：執行 `tflite-runtime-check`
   - 若啟用 AI agent：執行 agent status 與一個 read-only ask flow
6. Upgrade test：從前一個 release 安裝後升級，確認 UCI config 與 init script 行為
   沒有被意外覆蓋。
7. Rollback note：release notes 說明如何回到上一版 artifact 或 repository URL。

## Static Repository 規劃

正式 feed repository 建議用靜態檔案服務即可，例如 GitHub Pages、物件儲存或內網
HTTP server。目錄應以 package manager、target architecture 與 feed name 分層。

建議結構：

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

裝置端設定應把 repository 視為可替換的來源，不要寫死在 package 本身。短期測試
可以使用 unsigned install；對外或多人測試時應改為 signed repository。

## 安裝方式

### `.ipk` / `opkg`

臨時手動安裝適合開發測試：

```sh
opkg install /tmp/edgepulse-ipks/*.ipk
```

正式 repository 安裝應改為設定 feed source，然後使用 package name 安裝：

```sh
opkg update
opkg install edgepulse luci-app-edgepulse
```

### `.apk` / `apk`

臨時手動安裝可用本機檔案：

```sh
apk add --allow-untrusted /tmp/edgepulse-apks/*.apk
```

正式 repository 安裝應改為加入 repository index 與信任的 signing key，然後使用
package name 安裝：

```sh
apk update
apk add edgepulse luci-app-edgepulse
```

## 簽章與信任

正式發佈前應建立專用 release signing key，不建議使用個人日常開發 key。建議：

- release key 只用於 package repository 與 checksum 簽章。
- public key 放在 release notes 與 repository root。
- private key 只放在 CI secret 或離線 release machine。
- 每次 release 都產生 `SHA256SUMS`，方便即使不使用 repository install，也能驗證
  單一 artifact。

## CI/CD 建議

可以先把自動化分成三階段：

1. Build job：針對固定 OpenWrt baseline 與 target architecture 編譯 packages。
2. Verify job：收集 package inventory、checksum，並在可用時跑裝置或 image smoke
   test。
3. Publish job：只有在 tag 或手動批准時，把 artifact 上傳到 GitHub Releases，
   再同步到 static repository。

Publish job 應避免覆寫既有 release。若同一 tag 需要重發，應用新的 `PKG_RELEASE`
或新的 release tag，讓安裝端與回溯紀錄都能分辨。

## 建議短期執行順序

1. 先用 GitHub Releases 發佈一版 `aarch64_cortex-a53` 的完整 package set。
2. 在 release notes 放入安裝指令、SHA256 與 smoke test 結果。
3. 用一台 OpenWrt One 或同 target 裝置完成 install/upgrade test。
4. 建立 static repository 目錄與 signing key。
5. 下一版開始同時發佈 GitHub Release 與 repository index。
6. 等流程穩定後，再把 build、verify、publish 串進 CI。
