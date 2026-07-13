# 中国色汇报演示 Skill

以原稿章法为骨架，中国传统色彩为气韵，生成中文主导、中英双语、具备本地运行核心的 HTML 演示，并为 PPT/PPTX 提供汇报逻辑与版式框架。

Build source-faithful, Chinese-led bilingual presentation systems with traditional Chinese color themes. Generate interactive HTML decks with local runtime assets, or use the same logic and layout framework for PPT production.

## 适用场景 / Use cases

当演示任务需要梳理叙事逻辑、章节、页级结构或版式，并且符合以下任一条件时使用：

- 内容体现中华文化、传统文化或地域文化；
- 用户要求中国色、中国风、中式或东方审美；
- 用户点名本 Skill、模板或框架导航格式。

Use it when presentation logic or layout work concerns Chinese culture, traditional or regional culture, Chinese-color or Eastern aesthetics, or when the Skill and its framework navigation are explicitly requested.

仅使用中文或只涉及中国市场，并不会自动触发。通用 Markdown 转 PPT 也不会自动触发。

Chinese language or a China-market topic alone does not trigger the Skill. Generic Markdown-to-PPT conversion does not trigger it either.

## 能力 / Capabilities

- 从已确认文稿提炼汇报逻辑，不套用固定分组；
- 建立可追溯的章节、导航和逐页内容合同；
- 默认生成中文突出、英文缩小辅助的双语层级；
- 使用六套中国传统主题色之一；
- 在模板中本地分发 Motion、Lucide 和封面字体；断网时核心翻页与内容仍可用；
- 为 PPT/PPTX 输出结构与版式参考，但不直接创建 .pptx；
- 校验字体许可证、主题对比度、本地资源和双分辨率页面溢出。

It derives source-based grouping, creates traceable slide contracts, uses Chinese-led bilingual hierarchy, supports six traditional color themes, ships local runtime assets, guides PPT layout, and validates fonts, package integrity, assets, and overflow.

## 安装 / Installation

使用 Agent Skills CLI。将 `<github-owner>/zhongguose-ppt-skill` 换成当前仓库的 GitHub 路径：

    npx skills add <github-owner>/zhongguose-ppt-skill --skill zhongguose-ppt-skill

克隆仓库后，也可以直接从本地目录安装：

    npx skills add . --skill zhongguose-ppt-skill

Replace `<github-owner>/zhongguose-ppt-skill` with this repository's published GitHub path, or install from a local clone with `npx skills add . --skill zhongguose-ppt-skill`.

也可以手动把 skills/zhongguose-ppt-skill 复制到支持 Agent Skills 的 skills 目录。

You may also copy skills/zhongguose-ppt-skill into the skills directory of any Agent Skills-compatible tool.

## HTML 运行依赖 / HTML requirements

- Node.js 18 或更高版本；
- Python 3.10 或更高版本；
- FontTools、Brotli 与 Zopfli；
- Chrome、Edge 或 Chromium，用于自动浏览器 QA。

Install Python dependencies:

    python -m pip install -r skills/zhongguose-ppt-skill/requirements.txt

在仓库中执行浏览器 QA 前安装固定版本的 Playwright Core：

    npm ci

Install the pinned Playwright Core development dependency with npm ci before running repository browser QA.

PPT 结构参考模式不需要上述运行依赖。

PPT framework mode does not require these runtime dependencies.

模板优先加载本地 Motion、Lucide 与 `Zhongguose Cover` 封面字体。Inter、JetBrains Mono、LXGW WenKai、Noto Serif SC 和 Orbitron 由 Google Fonts 提供；断网或网络受限时会回退到系统字体，因此内容与交互仍可用，但字形效果不会完全一致。本地 Motion/Lucide 加载失败时，模板还提供 jsDelivr 回退。

The template loads local Motion, Lucide, and the `Zhongguose Cover` font first. Inter, JetBrains Mono, LXGW WenKai, Noto Serif SC, and Orbitron come from Google Fonts; offline or restricted networks fall back to system fonts, so content and navigation remain usable but typography is not identical. jsDelivr is an additional fallback only if local Motion or Lucide loading fails.

## 快速使用 / Quick use

向 Agent 提供文稿或大纲，并说明：

    使用 zhongguose-ppt-skill，把这份文稿整理成中国色主题的 HTML 汇报。

或者：

    使用 zhongguose-ppt-skill，提炼这份中式文化汇报的 PPT 章节、导航、逐页结构和版式规范。

HTML 完成后，通过本地服务器预览：

    node skills/zhongguose-ppt-skill/scripts/preview-deck.mjs path/to/index.html

## 输出 / Outputs

HTML：

    index.html
    assets/
      fonts/
        zhongguose-cover.woff2
        zhongguose-cover.manifest.json
        OFL-1.1.txt
        FONT-NOTICE.txt

PPT 参考：

- 原稿逻辑地图；
- 章节与导航；
- 逐页内容合同；
- 版式、字号、主题色和素材说明。

## 主题色 / Themes

内置飞泉绿、藕丝秋、湘蓝、绛缨、鸦黄、山岚。安装后打开：

    skills/zhongguose-ppt-skill/assets/theme-cover-gallery.html

查看 16:9 封面示例。

The gallery provides 16:9 cover previews for all six themes.

## 验证 / Validation

仓库 CI 会执行：

- Skill 包结构检查；
- Node 脚本语法检查；
- 逐稿字体子集化；
- HTML 结构与资源检查；
- 六套主题封面名称的字体字形检查；
- 1920×1080 与 1366×768 浏览器溢出检查。

CI validates package structure, script syntax, font subsetting, all six gallery-name glyphs, deck structure, local assets, and two browser viewports.

## 署名 / Credits

- 制作：木渡川 / Created by 木渡川 (Muduchuan).
- 产品思路与交互概念参考 guizang 的 guizang-ppt-skill：
  https://github.com/op7418/guizang-ppt-skill
- 封面字体源自 Lingdong Huang 的 qiji-font：
  https://github.com/LingDong-/qiji-font

## 许可证 / License

本仓库自有代码使用 MIT License。字体使用 SIL Open Font License 1.1；Motion 使用 MIT License；Lucide 使用 ISC License，其部分 Feather 派生图标使用 MIT License。详情见 THIRD_PARTY_NOTICES.md，以及模板 `assets/licenses/` 和字体目录中的许可证文件。

Original repository code is MIT-licensed. The font is licensed under SIL OFL 1.1, Motion under MIT, and Lucide under ISC with MIT-licensed Feather-derived icons. See THIRD_PARTY_NOTICES.md and the license files shipped beside the bundled assets.
