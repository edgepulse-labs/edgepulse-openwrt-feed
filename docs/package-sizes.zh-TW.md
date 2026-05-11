# Package 大小紀錄

這份文件記錄目前已編譯出的 EdgePulse feed `.apk` 套件大小，方便大家快速評估
下載、儲存與 image 空間影響。

紀錄時間：2026-05-11 10:31 Asia/Taipei

建置輸出位置：

```text
/home/nier/.openclaw/workspace/openwrt-build/bin/packages/aarch64_cortex-a53/edgepulse/
```

Target package architecture：`aarch64_cortex-a53`

## EdgePulse Feed Packages

| Package artifact                  |           大小 |       Bytes | 編譯/更新時間             |
|-----------------------------------|---------------:|------------:|---------------------------|
| `tensorflow-lite-2.14.1-r1.apk`   |       1.02 MiB |   1,067,744 | 2026-05-11 10:31:27 +0800 |
| `edgepulse-1.apk`                 |      46.25 KiB |      47,361 | 2026-05-10 22:34:55 +0800 |
| `tensorflow-lite-test-1.0-r1.apk` |       8.49 KiB |       8,691 | 2026-05-11 10:31:34 +0800 |
| `farmhash-1.1.0-r1.apk`           |       7.77 KiB |       7,960 | 2026-05-09 12:26:47 +0800 |
| `luci-app-edgepulse-1.apk`        |       6.95 KiB |       7,116 | 2026-05-10 22:30:53 +0800 |
| **Total**                         |   **1.09 MiB** | **1,138,872** |                           |

## 備註

- 這裡記錄的是壓縮後的 `.apk` artifact 大小，不是安裝後佔用的 filesystem
  空間。
- 表格只包含此 feed 在 `edgepulse` package output directory 產出的套件。
  OpenWrt base、LuCI 與其他相依套件會輸出在相鄰目錄；如果要估算完整 image
  或完整安裝集合，需要另外量測。
- 重新編譯套件後請更新這份紀錄，特別是調整 TensorFlow Lite build options
  或新增 LuCI assets 之後。

## 更新指令

在 OpenWrt buildroot 中執行：

```sh
stat -c '%n	%s	%y' bin/packages/aarch64_cortex-a53/edgepulse/*.apk
du -h bin/packages/aarch64_cortex-a53/edgepulse/*.apk
```
