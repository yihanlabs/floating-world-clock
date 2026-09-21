# Floating World Clock 悬浮世界时钟

轻量、始终置顶的桌面世界时钟。选好你关心的时区，它们会固定在一个不打扰工作的小窗口里。

基于 Electron 与原生 HTML/CSS/JS 构建 —— **零前端框架、零运行时第三方依赖**。所有时区计算
都走内置 `Intl` API，整个界面只有几百行原生代码。

[English](README.en.md) | **简体中文**

<p align="center">
  <img src="docs/screenshot-resting.png" width="300" alt="悬浮世界时钟：上海与洛杉矶">
  &nbsp;&nbsp;
  <img src="docs/screenshot-settings.png" width="300" alt="悬浮世界时钟：设置面板">
</p>

## 功能特性

- **始终置顶** —— 窗口浮于其他应用之上，参考时间不会被遮住。Windows 上使用 `screen-saver`
  窗口层级，这是它能压住任务栏的原因。
- **280 个时区，覆盖全部 195 个国家** —— 可按城市、国家、IANA 时区名或中文名搜索。
  10 个常用城市做成了预设，一键添加。
- **窗口尺寸由内容驱动** —— 窗口自动贴合实际显示的内容。展开设置面板会变高，收起则缩回。
- **位置记忆** —— 记住你放的位置，并与当前显示器布局做校验。拔掉一块屏幕后，它会回到
  可见角落，而不是把窗口开在屏幕外。
- **可自定义** —— 透明度、舒适/紧凑两种密度，以及整体浅色配色（主色 `#1f5fbf`），
  在浅色桌面上阅读舒适。
- **托盘集成** —— 显示/隐藏、切换置顶、重置位置、退出。
- **开机自启** —— 可选，默认关闭。
- **极小开销** —— 隐藏窗口的渲染进程计时器会被 Chromium 节流到每分钟一次，因此分钟计时器
  放在主进程，并自动对齐到分钟边界。

## 下载

到 [**Releases**](https://github.com/yihanlabs/floating-world-clock/releases) 页面下载最新构建。

| 平台 | 文件 | 说明 |
|---|---|---|
| Windows | `Floating.World.Clock-Setup-1.0.0.exe` | 安装包。按当前用户安装，无需管理员权限。 |
| Windows | `Floating.World.Clock-Portable-1.0.0.exe` | 免安装单文件。 |
| macOS | `Floating.World.Clock-1.0.0-arm64.dmg` | Apple Silicon（M 系列芯片）。 |
| macOS | `Floating.World.Clock-1.0.0.dmg` | Intel 芯片。 |

> 文件名用点号而非空格，是因为 GitHub 会把发布附件名里的空格改写成点。
> 本地构建出的文件名带空格，例如 `Floating World Clock-Setup-1.0.0.exe`。

**不确定自己的 Mac 是哪种？** 点左上角苹果菜单 → 关于本机。窗口里显示「芯片」一行
（M 系列芯片）就选 `arm64` 那个；显示「处理器」一行且是 Intel Core，就选另一个。

### macOS 首次打开

macOS 构建**未签名、未公证**（需要付费的 Apple 开发者账号），因此首次打开会被系统拦截。
按下面步骤运行：

1. 把应用拖进 `/Applications`。
2. **右键点击应用 → 打开**，在弹窗中确认。
   （或执行 `xattr -dr com.apple.quarantine "/Applications/Floating World Clock.app"`。）

这一步只需做一次。

> **关于 macOS 支持的说明：** 本应用在 Windows 上开发与测试。macOS 构建由 CI 产出，
> 能够编译并启动，但**窗口行为** —— 置顶层级、透明、以及不在 Dock 中显示 ——
> **未在真机验证过**。欢迎反馈与修复。

## 使用说明

- **移动窗口** —— 在卡片背景任意处拖动。
- **打开设置** —— 点击齿轮图标（右上角）。平时它很淡，悬停才变亮。
- **添加时区** —— 打开设置，在搜索框输入，点击结果。
  - 搜 `frank` 会得到 `Europe/Berlin`，并附上别名提示 *Frankfurt*。
  - 搜 `夏威夷` 或 `hawaii` 会得到 `Pacific/Honolulu`。
  - 若某个时区不在选择器里，直接输入精确的 IANA 名（如 `Etc/GMT+8`）同样可用。
- **移除时区** —— 在设置列表中点击该项旁的 `×`。
- **隐藏时钟** —— 右键托盘图标。
- **退出** —— 托盘菜单 → 退出，或设置面板里的退出按钮。

最多可同时显示 12 个时区，超出后窗口内部滚动。

## 开发

需要 Node.js 22+。

```bash
npm install
npm start
```

Windows 上也可以直接双击 **`start.bat`**，首次运行会自动安装依赖，之后启动应用且不留控制台窗口。

没有测试也没有 lint 需要跑 —— 应用没有构建步骤，源文件是直接加载的。

### 目录结构

```
src/main/         主进程
  main.js           生命周期、窗口、IPC、计时器、开机自启
  store.js          state.json 读写与校验
  window-state.js   多显示器位置校验
  tray.js           托盘菜单
  tray-icon.js      托盘图标，以 base64 PNG 内联
src/preload/      contextBridge 白名单（不暴露 ipcRenderer）
src/renderer/     界面
  zones.js          时区数据表与搜索排序
  format.js         Intl.DateTimeFormat 封装
  app.js            渲染、设置面板、尺寸上报
tools/
  make-icons.js     从零生成应用图标
build/            icon.png（已提交）+ 生成物 icon.ico
docs/             本 README 使用的截图
```

### 安全性

`contextIsolation` 开启、`nodeIntegration` 关闭、`sandbox` 开启，用 `contextBridge` 白名单
代替直接暴露 `ipcRenderer`，严格的 CSP，所有权限请求一律拒绝，`window.open` 与页面跳转
被阻止。渲染进程**完全不发起网络请求** —— `connect-src 'none'`。

## 构建

```bash
npm run icons      # 重新生成 build/icon.ico 与 build/icon.png
npm run dist:win   # Windows：NSIS 安装包 + 便携版 exe  -> dist/
npm run dist:mac   # macOS：x64 与 arm64 的 dmg        -> dist/
npm run dist       # 两者都构建
```

产物输出到 `dist/`。

`npm run icons` 用 `tools/make-icons.js` 从代码光栅化出应用图标，其中包含一个手写的 PNG
编码器 —— 仓库里没有图片源文件，也不依赖任何图像库。`build/icon.png` 之所以提交，
是因为 electron-builder 要从它派生出 macOS 的 `.icns`。

**macOS 构建必须在 macOS 上进行。** 从 Windows 交叉编译不支持签名与公证，这也是
`.github/workflows/release.yml` 让每个平台各自在对应 runner 上构建的原因。

## 时区数据

`src/renderer/zones.js` 中有一张 `META` 表，包含 280 个时区、覆盖全部 195 个国家，
每条都有短代码、国家和城市标签 —— 因此一行显示为 `SH, China` 而不是 `Asia/Shanghai`。
不在表中的时区会自动从 IANA 名推导出标签。

修改这个文件时，有几点值得注意：

- `Etc/GMT+N` 的符号与真实 UTC 偏移**相反**（`Etc/GMT+8` 是 UTC−8）。标签按实测偏移书写，
  不照抄 IANA 名。
- `Intl.supportedValuesOf('timeZone')` **不是**全集 —— Chromium 会剔除 `Etc/*` 和若干
  次区域时区，而 `DateTimeFormat` 仍能正确解析它们。因此搜索接受精确的 IANA 名，
  即使选择器里没有列出。
- 中国香港、中国澳门、中国台湾分别标注为 `HK, China` / `MO, China` / `TPE, China`。

## 许可证

[MIT](LICENSE)
