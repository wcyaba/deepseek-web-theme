# ORCA LINK / MAID ATELIER · DeepSeek 官网版（Edge 扩展）

把 DSH 上的**两套**皮肤搬到 **chat.deepseek.com**，popup 里一键切换：

| 皮肤 | 来源包 | 视觉语言 |
|---|---|---|
| **ORCA LINK** 虎鲸链路 | `@smalltailqwq/dsh-client-ui-skin-orca-link@0.1.7` | 全局直角契约、直线图标、石墨+暖白、浮动状态角色（10 状态动画） |
| **MAID ATELIER** 深海女仆工坊 | `@smalltailqwq/dsh-client-ui-skin-maid-atelier@0.1.7` | 深海蓝+陶瓷白+柔金、**衬线字体**、宫殿背景、左右双女仆立绘 |

两套都出自 [Small-tailqwq/dsh-deep-whale](https://github.com/Small-tailqwq/dsh-deep-whale)（2316★）。素材、配色令牌、场景图、状态机参数全部取自原皮肤包，逐项对齐后重新实现为浏览器扩展。

![深海女仆工坊 · 暗色](docs/screenshot-maid-dark.webp)

> ⚠️ 这不是那两个插件本身。DSH 皮肤是寄生在 DSH 的 Cordis 插件系统 + `data-dsh-*` DOM 契约上的客户端插件（原包 CSS 里 572 处 `[data-dsh-`、289 处 `[data-slot`），chat.deepseek.com 没有插件接口、DOM 也完全不同，所以这里是**同素材同设计的重新实现**。

## 安装（Edge）

1. 打开 `edge://extensions/`
2. 打开左下角 **开发人员模式**
3. 点 **加载解压缩的扩展**，选择本目录（克隆下来的仓库根目录）
4. 打开或刷新 https://chat.deepseek.com/ —— 左下角出现皮肤面板
5. 在面板里点 **ORCA LINK** 或 **MAID ATELIER** 即可切换（**即时生效，无需刷新**）

> Edge 默认不会把新装的扩展固定到工具栏：点地址栏右侧的**拼图图标**，找到本扩展并点**图钉**固定，之后点图标可打开 popup（含「背景兜底透明化」「重置位置」等开关）。

卸载：在同一页面点「移除」。扩展不改站点文件，随删随净。

## 切换皮肤

切换入口有**两个**，设置互通、自动同步：

1. **页面左下角面板**（推荐）：标题 `皮肤 · SKIN` 下两行选项，各带配色预览块与中文说明；当前皮肤有 ✓ 与高亮描边。首次使用会浮出一个「↑ 从这里换皮肤 / 背景」的引导气泡，点选后不再出现。面板可随部件一起拖拽。
2. **工具栏 popup**：点扩展图标，最上方的 **SKIN** 两个按钮。

## 两套皮肤的令牌层

| | orca-link | maid-atelier |
|---|---|---|
| 宿主 `--dsw-*` 覆盖 | 浅 61 / 暗 43 | 浅 47 / 暗 42 |
| `--dsw-alias-bg-base` | 半透明暖白纱 `#faf7f13d` / `#080c1338` | **`transparent`**（宫殿图整层透出） |
| 侧栏 | 暖白 `#faf7f194` | 深海蓝 `#0b1942e0` / `#050d28e6` |
| 强调色 | 石墨 `#4b483f` / ORCA 蓝 `#4d91ff` | 长春花蓝 `#526aa8` / 柔金 `#c5a468` |
| 正文字体 | 跟随站点 | **改成衬线体系**（Georgia / 宋体族） |
| 直角契约 | 是（令牌 + 定向规则两手） | 否（蕾丝圆角语言，扩展里用 `:not(maid)` 隔离） |

全部 **193 项**令牌逐值照搬并有断言守着（见下）。

## 关键发现：两个 DeepSeek 产品共用同一套设计令牌

原皮肤 CSS 里有一整段对 `--dsw-*` 的覆盖——这是 DSH 宿主的令牌命名空间，而 chat.deepseek.com 用的是**同一套**。所以配色不是靠逐个选择器硬凑，而是**整段照搬令牌**，颜色顺着站点自己的变量系统自动流到用户气泡、品牌色、边框、标签、侧栏、菜单、代码块。

## 已移植的功能

| 原皮肤功能 | 本扩展 | 实现方式 |
|---|---|---|
| 宿主 `--dsw-*` 令牌覆盖 | ✅ 104 项 | 逐值照搬（浅 61 / 暗 43），断言逐字节一致 |
| 亮/暗各一对 16:9 场景（空态 Hero / 工作态 Active） | ✅ | 原包 4 张 webp 原图 `1672×941`，640ms 交叉淡化，渐晕层一致 |
| 空态/工作态判定 | ✅ | 按会话 URL（`/a/chat/s/<id>`）+ 消息节点数，替代 DSH 的 `[data-orca-scene]` |
| 亮暗令牌全表（含暗色覆盖） | ✅ | 19 个 `--orca-*` 逐值照搬 |
| 全局直角契约 | ✅ | 令牌侧 `--dsw-radius-*: 0px`（同皮肤）+ 定向 `border-radius: 0` 全域兜底 |
| 页面图标（favicon） | ✅ | 换成原包 ORCA 图标，卸载还原 |
| 状态角色：10 状态 × 8 帧动画 | ✅ | 原图集 `1888×2360`（236px 单元），`800%/1000%` 切片公式 + 80 个逐帧质心补偿 1:1 |
| 状态信号块（10 条文案） | ✅ | 原包 `STATUS_LABELS` 原文 |
| 窄屏收起装饰 / 减少动效 | ✅ | 同原包断点与媒体查询 |
| ~~峰谷定价红绿灯~~ | ❌ 已按需移除 | 那是 DeepSeek **API** 的计费时段提示，网页版免费无意义，见下 |

## 没能照搬的部分

- **皮肤管理器**：原包靠 DSH 的插件花名册与皮肤互斥机制，官网没有宿主接口，改用扩展 popup 的开关。
- **运行时图标重绘**：原包把 DSH 图标库的 SVG 逐条改写成「只用横线/竖线/45°折线」的直线图形。官网图标体系不同，**未实现**——直角契约覆盖了形状语言，但这是实打实的缺口。
- **token 账房 / 轨迹面板 / 设置页接管 / composer 折叠把手**：官网没有对应面板。

## 本版本调整（0.3.26）

**修「侧栏没变深蓝，只有字变淡金了」——根因是 CSS 特异性，不是令牌名**（用户一眼看出「有别的代码在覆盖」）。

0.3.25 我把 `--dsw-specific-sidebar-fill: #1d294fe6` 写在侧栏作用域块里，但**女仆的 body 令牌块**
（`html[data-orca-link][data-orca-skin='maid'] body`，第 678 行）里也声明了这个令牌：

| 声明处 | 选择器特异性 |
|---|---|
| 女仆 body 令牌块（写 `#0b1942e0`，**早**） | (0,3,1) |
| 我的侧栏作用域块（写 `#1d294fe6`，**晚**） | (0,3,0) ← 输了 |

两边都带 `!important`，特异性低的一方**在后面也赢不了** → 底色一直是旧的半透明蓝。
文字令牌之所以生效，纯属巧合：body 块里**没有**声明它们。

修法：把这个令牌放到**同一层（body 作用域）**并排在 body 块之后；

```css
html[data-orca-link][data-orca-skin='maid'] body { --dsw-specific-sidebar-fill: #1d294fe6 !important; }
html[data-orca-link][data-orca-skin='maid'] body[data-ds-dark-theme] { --dsw-specific-sidebar-fill: #16213fdb !important; }
```

并加了两条断言钉住「必须在 body 作用域声明」+「暗色也必须有一档」——
以后谁把它挪回侧栏作用域块，测试会直接报出来。

> 说明：这个令牌在**抽取出的站点/DHS CSS 里没有任何消费点**（`grep dsw-specific-sidebar-fill`
> 只命中原皮肤自己的两处定义），所以它是站点内部消费的令牌、我无法在本地仿真页里复现渲染效果。
> 本次是**按选择器特异性的确定性推导**修的，没有截图实证 —— 如果刷新后仍是半透明，
> 请把侧栏那个元素的 DevTools 计算样式截图给我，我按实际生效的那条规则改。

## 本版本调整（0.3.25）

**深海女仆工坊 · 侧栏改成「深蓝 + 10% 透明度 + 淡金字」**（用户要求）。

颜色不是眼估的 —— 把用户给的侧栏截图解码取样：

```
侧栏底（分组头/行间空白） rgb(29,41,79)   = #1d294f   → 取为底色，alpha e6（90% 不透明 = 10% 透明度）
文字（出现最多的暖色）     rgb(216,192,128) = #d8c080  → 取为文字色
```

改动（全部在侧栏作用域令牌里，仍然**不碰品牌元素、不给容器刷背景**）：

| 令牌 | 原值 | 新值 |
|---|---|---|
| `--dsw-specific-sidebar-fill` / `--dsw-alias-bg-base` | `#0b1942e0` / `#050e2bf5` | **`#1d294fe6`** |
| `bg-layer-1/2/3`、`bg-overlay` | 偏亮的蓝 | 同族深蓝（`#22305af0` …） |
| `--dsw-alias-label-primary` 等 5 项文字令牌 | 米白／浅蓝灰 | **淡金**（`#d8c080` / `#dcc89a` / `#cdb98b` / `#b3a078` / `#9c8b66`） |
| 会话行选中／悬停薄纱 | `#d8c08c33` / `#d8c08c1f` | `#d8c08c3d` / `#d8c08c24`（淡金字下要略实才看得出选中） |

兜底那条「只给侧栏文字上色」的窄规则改用独立令牌 `--maid-sidebar-ink`（`#d8c080`），
不再挂 `--dsw-alias-label-primary`，避免以后改令牌时兜底颜色跟着漂。

> ⚠️ 测试里有一条「侧栏作用域令牌必须**逐值照搬原皮肤**」的断言 —— 这次是用户要求的
> **主动偏离**，所以在测试里建了一张 `INTENTIONAL_DIVERGENCE` 登记表（13 项），
> **逐项显式登记**而不是偷偷放宽断言：以后谁再改这些值，测试会指名报出是哪一项。

## 本版本调整（0.3.24）

**虎鲸链路（ORCA LINK）也铺同一块正文玻璃，日间用淡金色**（用户指定）。

1. 几何规则从「只给 maid」改成**两套皮肤共用**：宿主 `position:relative`、`::before` 铺
   `top/bottom:0` + `--orca-glass-left/--orca-glass-w`；颜色由各皮肤自己的令牌给。
2. 新增虎鲸令牌 `--orca-glass-surface` / `--orca-glass-frame`，日间 `#faf3e8e8`（实测渲染
   `rgba(250,243,232,.91)`）。
   颜色不是我拍的 —— 把用户给的参考图解码取样，实测 `rgb(245,240,230)`（暖偏移 R−B=15），
   按同族取值。
3. 顺手去掉宿主容器上的 `overflow: hidden`：那会**裁剪站点自己的浮层/下拉/代码块**，
   属于不必要的副作用（宽度已经由 JS 量出的正文范围控制，不需要靠裁剪兜底）。

> ⚠️ 踩到一个撞名坑：根令牌块（第 8 行 `html[data-orca-link]`）里**本来就有**
> `--orca-reading-surface`（虎鲸自己的阅读面 `#fbf7efa8`），我第一版复用了这个名字，
> 等于把它覆盖掉了。现在玻璃令牌改名 `--orca-glass-*`，并加了一条断言钉住
> 「根令牌块里的 `--orca-reading-surface` 必须仍是原值」。
> （测试辅助函数也一并修了：同名选择器会出现多次，必须用「选择器 + 含目标声明」一起定位。）

实测（本地 HTTP + 无头 Edge + CDP 注入扩展源码，皮肤 = orca）：

```
::before 计算值：background rgba(250,243,232,0.91)   width 824px   left 129px
滚到底：uncoveredBelow = 0
单条大消息：hostCoversMessage = true     切聊天：重新标记新容器
```

## 本版本调整（0.3.23）

**把玻璃范围收到正文宽度并居中**（用户：范围太大了，往中间缩小点）。

0.3.21 那版是「铺满整个正文列」，宽屏上比正文宽出一大截。现在只量**正文实际占用的横向范围**
（容器内所有文本块的并集），两侧各留 22px，再在列里居中：

```css
[data-orca-glass-host]:before { top:0; bottom:0;
                                left: var(--orca-glass-left);
                                width: var(--orca-glass-w); /* JS 只写这两个数 */ }
```

> 试过用 `inset:0 + max-width + margin:auto` 居中，但左右偏移会被优先解算，
> 居中不可靠 —— 所以还是写「左偏移 + 宽度」两个具体数字，其余（高度/颜色/圆角/边框）仍全在 CSS。

实测（仿真：列宽 1112px、正文 780px）：

```
--orca-glass-w = 824px   --orca-glass-left = 129px   ::before 计算值一致
滚到底：uncoveredBelow = 0
单条大消息：hostCoversMessage = true（盖住整条）
切聊天：重新标记新容器      空会话：marked=false
```

## 本版本调整（0.3.22）

**修「怎么只有这块」**（用户截图：白玻璃只盖住了最后一条消息）。

原因在挑容器：在「**单条大消息**」的页面上，消息的 markdown 容器自身也满足我原来的判据
（有正文、有高度），而我的循环里 `continue` 只跳过、**已经赋值的候选不会被清掉**，
于是标记停在了那一层 —— 白玻璃就只盖住一条。我搭建的仿真页当时每条消息很短、
markdown 层不达标，所以一直没复现出来；这次把仿真页改成「每个文本块都像站点那样」，
**立刻复现**（`hostCls: "_md"`）。

现在的挑法（两步，都不依赖类名）：

1. 沿正文中轴往上，找**最近的「装消息的容器」**：孩子是一批消息（≥2 个有体量有正文）；
2. 再锚定**最近的可滚动祖先**，在它的孩子里取**正文最多的那个** —— 那就是正文列。
   侧栏作为兄弟不可能赢（正文块数量差一个量级），也不会因为外面多包几层 div 而跑偏。

空态判据同时修了一处：原来用「祖先链上某层的正文密度」，而正文列里**挂着输入框**
（placeholder 也算文本），会让空会话看着"有内容" → 残留白板。改成用**全页正文块数量**。

### 实测（本地 HTTP + 无头 Edge + CDP 注入扩展源码）

```
多消息：   host = 正文列 (x=288 w=1112，不含侧栏)  ::before bg=rgba(249,251,255,.91)
滚到底：   scrollTop=1039  hostBottom=1086  scrollerBottom=1086  uncoveredBelow=0
单条大消息：hostCoversMessage=true（白玻璃盖住整条，而不是一小块）
切聊天：   marked=true → 新容器 id=msgs，旧标记已清理
切到空会话：marked=false
```

> ⚠️ 这一轮又学一遍：**测试用例必须覆盖"边界形态"**（这里是「只有一条大消息」），
> 否则仿真页全绿、真实页面照样错。以后改挑容器这类启发式，必须同时跑
> 「多消息 / 单条大消息 / 空会话 / 切换会话」四种形态。

## 本版本调整（0.3.21）

**回到 DSH 原包的做法：纯 CSS `inset: 0`，JS 只负责找容器。**

用户一句话点破了问题：「**你自己试过吗，你有没有按照 dsh 插件的那个逻辑来**」。答案是：
先前 **没有**。原包是

```css
[class*=centerCol]        { position: relative; overflow: hidden }
[class*=centerCol]:before { content:""; position:absolute; inset:0;
                            background: var(--maid-reading-surface) }
```

**尺寸完全由容器决定，不量坐标、不设尺寸、不管滚动**。而我从 0.3.13 起做的是
「JS 量首/末条消息 → 算 left/top/width/height → 挂自建面板」，之后为了圆这个错，
一连加了四种补丁：滚动监听、rAF 节流、内容指纹缓存、`scrollHeight` 上限。
出界、模糊、滚底缺底、切聊天间歇失效，**全是这四种补丁的副作用**。

现在（0.3.21）：

| | 0.3.13–0.3.20 | 0.3.21 |
|---|---|---|
| 容器 | JS 打标记 | 同（只是找容器） |
| 玻璃层 | JS 建 `#orca-reading-panel` 并写 inline 尺寸 | **`[data-orca-glass-host]::before { inset: 0 }`** |
| 尺寸来源 | JS 量首/末条消息 | **容器自身** |
| 额外机制 | 滚动监听 + rAF + 指纹缓存 + scrollHeight 上限 | **全部删除**（JS 里 0 处 left/top/width/height 写入） |
| 容器样式 | `position: relative` | `position: relative + overflow: hidden`（同原包） |

`tagReadingSurface()` 现在只做三件事：找容器、打 `data-orca-glass-host`、在空会话/换皮肤时摘掉标记；
已标记且节点还在就直接复用（切换会话时站点会换掉消息区，标记随之失效 → 自动重新找）。

### 实测（本地 HTTP + 无头 Edge + CDP 注入扩展源码）

```
mid:     marked=true  hostCls=_list  pos=relative  overflow=hidden
         before-bg=rgba(249,251,255,0.91)  host.h=1867  uncoveredBelow=0
bottom:  scrollTop=781  hostBottom=1086  scrollerBottom=1086  uncoveredBelow=0
切换聊天（换掉整个消息区）：marked=true  id=list2  旧标记已失效清理
切到空会话：marked=false
```

`test-tokens.mjs` 的断言整组换成了新契约，其中几条是**反向断言**，防止我再退回老路：
`JS 不再自建面板元素`、`JS 不再写 left/top/width/height`、`不再需要滚动监听/指纹缓存/scrollHeight 上限`。

> ⚠️ 这段经历的教训：**当一个实现需要靠第三、第四个补丁才能正确时，说明做法从一开始就错了**，
> 应该回到参照物（这里是原包的几行 CSS）重新对齐，而不是继续加补丁。

## 本版本调整（0.3.20）

**修「有时好有时坏，尤其经常切换聊天的时候」**。这一轮把剩下两个同源缺陷一起拔掉了：

1. **短路判据太弱**：我用「宿主存在 + `scrollHeight` 未变 + `top` 未变」当作"几何没变"的证据。
   但**切换会话时消息列表节点会被整个换掉**，而新列表的这两个数字很可能与旧值相同
   （列表位置固定、消息都短）→ 短路生效、几何却是旧的 → 白板盖在错的地方。
   现在改成**指纹**：宿主孩子名单 + 每个孩子的相对位置/尺寸 + 滚动祖先的滚动量
   （指纹里**排除面板自己**，否则又是自我影响）。
2. **空会话没清理**：切到还没有内容的新会话时，正文块数量不足会让函数提前 `return`，
   **旧面板留在上一个会话的位置上**（实测 `panelBottom=-44`，整块跑到视口上方）。
   现在这条分支改成 `clear()` 后再返回；等新会话出内容（观察器每 500ms 会再调）面板会重建。

加上 0.3.19 修掉的两个（面板被移掉后不重建、`scrollHeight` 正反馈），切换聊天相关的路径
实测结论：

```
切换聊天（换掉整个消息列表、滚动尺寸故意保持一致）：
  panelRebuilt = true     宽度覆盖 = true
切到空会话：  panel = false   host = false      ← 旧面板被清干净
滚到底：      uncoveredBelow = 0
面板被移除后滚动：重建 = true，scrollHeight 仍 2274（不再被自己撑大）
```

> ⚠️ 这四轮都在同一条链上翻车，教训归拢成两条：
> ① **任何"没变就跳过"的短路，判据必须是内容指纹**，不能是两三个聚合数字；
> ② **凡是会被自己影响的量（scrollHeight / 祖先几何）都不能作为计算依据**，
>    也不能留在缓存判据里。

## 本版本调整（0.3.19）

**修「翻到底部时整块白板消失」**（用户截图：滚到底后文字背后的白底整块没了）。

真因有两层，都是我上一轮为了"治缺口"自己引进来的：

1. **提前返回条件不严 → 面板被移掉后永不重建**。我加的「几何没变就直接返回」只检查了
   `宿主存在 + scrollHeight 未变`，但**面板自己可能已被移掉**（站点重渲染、或上一次
   `clear()` 先摘了它）。此时条件成立 → 直接 return → 面板再也建不回来，表现就是
   「滚到底白板整块消失」。现在必须**同时**确认 `:scope > #orca-reading-panel` 还在。
2. **正反馈**：我用滚动容器的 `scrollHeight` 兜底，而面板是绝对定位的**定位后代**，
   会把祖先滚动容器的 `scrollHeight` 撑大 → 「面板越长 → 可视底越大 → 面板又更长」。
   实测 `scrollHeight` 从 2274 涨到 3418（`contain: layout` 也挡不住）。
   现在改为：**量之前先把自己的高度归零**，记下"不含面板"的原始 `scrollHeight` 作为上限，
   高度取 `min(可视底, 原始内容底)`；面板再加 `contain: layout` 减少影响。

实测（本地 HTTP + 无头 Edge + CDP 注入扩展）：

```
mid:      scrollHeight=2274  panelBottom=2274  uncoveredBelow=0
bottom:   scrollTop=1188    panelBottom=1086  uncoveredBelow=0
移除面板后再滚动：面板重建 = true
rebuilt:  scrollHeight=2274（不再被面板撑大，修复前是 3418）  uncoveredBelow=0
```

> ⚠️ 教训：给「会随内容变化重算」的自建元素做几何时，**永远不要读会被自己影响的尺寸**
> （`scrollHeight` / `getBoundingClientRect` 的祖先聚合量），否则就是正反馈。
> 另外任何"几何没变就跳过"的短路，都必须把"我的产物还在不在"纳入条件。

## 本版本调整（0.3.18）

**修「翻到最底下有一部分没白底，往上翻一点又有了」**（用户截图反馈）。

根因：面板高度当时是 `末条消息底 − 首条消息顶`，而**流式回答是边写边长**的 ——
高度是某一刻算出来的，之后新消息/长出来的内容落在面板下边界之外；滚动到底部那一段
就没有底，触发一次重扫（往上翻、resize）才补上。

两条修法：

1. **高度用可滚动内容兜底**：`contentBottom = max(末条消息底, 容器顶 + scrollHeight)`，
   面板一直铺到内容底，而不是只到「当时看到的最后一条消息」。
2. **滚动容器挂滚动监听**（rAF 节流，几何没变就直接返回，避免每帧重扫文本块）：
   内容一变长就重算几何，流式回答增长时面板会跟着变长。

### 实测验证（本轮自己跑通的）

这次没有靠截图猜 —— 起了个本地 HTTP 服务 + 无头 Edge，用 CDP 把扩展的 CSS/JS 注进仿真页
（MV3 在 `file://` 下不注入，所以走 http），滚到底部量覆盖：

```
mid:    scrollHeight=2274  panelBottom=2274  uncoveredBelow=0   ← 面板铺满内容底
bottom: scrollTop=1188     panelBottom=1086  uncoveredBelow=0   ← 滚到底部，零未覆盖
```

脚本留在 `D:\AI\orca-plate-check\verify-scroll.mjs`，可随时重跑（它会自己起服务、起浏览器、
量几何、落截图）。

> ⚠️ 本轮我的两个操作失误，都记在这里：
> ① 用 PowerShell `Set-Content` 打补丁改 `manifest.json` 时**没指定 UTF-8**，把中文写成了乱码
>    （已用 write 工具按 UTF-8 重建，JSON 校验通过）；
> ② 自建静态服务器的越权校验写成 `file.startsWith(ROOT)`，而 Windows 上 `path.join` 是反斜杠，
>    于是**每个请求都判成 404**（已改成归一化后比较）。以后不再用 PowerShell 改带中文的文件。

## 本版本调整（0.3.17）

**正文白底改成「一整块玻璃面板」，并且第一次做到「交付前自己看见」**。

### 之前为什么做不像 DSH

我把 DSH 的布局包解出来（`@deepseek-ai/dsh-client-ui-layout/lib/client.js`）确认了原包的对应物：

```css
/* DSH 的中列容器是 .pI_x6G_centerCol —— 皮肤里那句 [class*=centerCol] 命中的就是它 */
[class*=centerCol] { position: relative; overflow: hidden; }
[class*=centerCol]:before {
  content: ""; position: absolute; inset: 0; z-index: 1;
  background: var(--maid-reading-surface);   /* 亮 #f9fbffc7 / 暗 #0a122ac7 */
  backdrop-filter: blur(16px) saturate(.95);
}
```

**它是一整块「铺满中列」的面板**。而网页版没有这个容器（`centerCol` 只存在于 DSH 自己的布局包里），
我先前的做法是退回「给段落贴小片」—— 从那一刻起就不可能像，还引出了出界、模糊、药丸感三个新问题。

### 现在的做法

`tagReadingSurface()` 量出**消息列表**，在它内部挂一枚 `#orca-reading-panel`，按首/末条消息算出边界，
铺一整块半透明玻璃（圆角 14px，`--maid-reading-surface`，**不用** `backdrop-filter`）。
等价于原包那层 `inset:0`，但落点是我们量出来的正文范围，不会连侧栏一起铺。

顺带修掉一个**只有实测才能发现的 bug**：绝对定位元素的 `left/top` 是**相对包含块的偏移**，
我第一版直接写成页面坐标，面板被整体右推了「列表左边界」那么多（实测 `x=1060`，应为 `521`）。

### 这次是怎么验的

上一轮浏览器权限被拒（Chrome 里也没装这个扩展），这一轮改用 **Edge + 无头 + 加载本扩展**，
在仿真页面上让**真的扩展**跑起来，用 CDP 量几何并截图自查：

```pwsh
& "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" `
  --headless=new --no-sandbox --disable-gpu --disable-sync `
  --user-data-dir="$env:TEMP\orca-e2e" --remote-debugging-port=9225 `
  --window-size=1600,900 `
  --load-extension=D:\AI\orca-edge-extension `
  --disable-extensions-except=D:\AI\orca-edge-extension about:blank

node D:\AI\orca-plate-check\cdp-verify.mjs 9225   # 造仿真页 + 量几何 + 截图
```

实测（仿真两列布局：`_side` 288px + `_list` 780px）：

```
panel: x=536 y=45 w=816 h=510        ← 正好包住对话
host : x=554 w=780                    ← 消息列表
overlapsSidebar: false                ← 不再压侧栏
background: rgba(249,251,255,0.91)    ← 略透
backdrop: none                        ← 无模糊
文字层: _msg { z-index: 1; position: relative }  ← 文字压在面板之上
```

> 注意：`file:///*` 那条 content script 匹配**只是验证时临时加过**，已撤掉（扩展仍只作用于
> `https://chat.deepseek.com/*`）。仿真脚本与 CDP 客户端留在 `D:\AI\orca-plate-check\`，随时可重跑。

## 本版本调整（0.3.16）

**修「部分文字莫名其妙模糊化」**（用户截图）。

模糊来自 `backdrop-filter: blur(16px)`：它是在元素**背后**做模糊，而块里还会有嵌套的玻璃元素
（列表项里再套段落/块），采样与叠加之后连块内文字一起糊掉 —— 截图里那一行 `Ctrl + A 全选` 就是这样。

改法：文字块规则**去掉 `backdrop-filter`**，只留一层够实的半透明底 + 圆角：

```css
html[data-orca-link][data-orca-skin='maid'] [data-orca-reading-block] {
  background-color: var(--maid-reading-surface) !important;   /* 亮 #f9fbffe8 / 暗 #0a122ac9 */
  border-radius: 8px;
}
```

半透明本身就带来了「玻璃感」（宫殿能透出来一点），不需要模糊。`test-tokens.mjs` 增加硬断言：
文字块规则里不许出现 `backdrop-filter`。

> ⚠️ 文字块规则现在有两条**禁止项**，都是被截图打回来的：
> ① 不许 `padding` / `margin`（撑宽被裁 → 文字出界/重叠）；② 不许 `backdrop-filter`（嵌套叠加 → 文字模糊）。

## 本版本调整（0.3.15）

**修 0.3.14 的两个排版 bug：文字出界、文字重叠/显示不全**（用户截图）。

根因是我在文字块上写了

```css
padding: 6px 10px;
margin: -6px -10px;   /* ← 就是这两条 */
```

本意是「文字位置不变、背后多出一圈底」，但块级元素（`p` / `li` / 站点的行容器）宽度由容器决定：
加内边距后盒宽变成 `容器宽 + 20px`，减负外边距又把它往两边各推 10px —— 站点容器一裁剪，
**右边文字被吃掉、左边序号被挤出去**（截图里 `README.md`→`README.m`、`Settings`→`Setting`、
`Generate`→`Gener`、行首 5. 被切一半，都是这个）。

改法：**文字块只保留背景 + 圆角 + `backdrop-filter`，尺寸完全交回站点排版**（不写 padding、
不写 margin）。少了那圈留白，但不会再破坏任何容器；`test-tokens.mjs` 加了硬断言：
文字块规则里**不许出现 `padding` / `margin`**。

顺带把 JS 的收块条件放宽为「除了 `pre` / `table` 之外都收」，不再用 `display` 过滤
（防止「出界」靠的是上面那条 CSS 约束，不是 display 白名单）。

> ⚠️ 教训（第二次同类）：给站点既有排版元素加 padding / 负 margin 是危险操作 ——
> 站点容器大多带 `overflow: hidden`，撑宽即被裁。**要么只上背景，要么另起一层自建元素**。

## 本版本调整（0.3.14）

**白玻璃收细到「文字块」粒度**（用户截图：「你搞的整块都白了，我只要文字一小部分白了就行，而且这白色也是带有一点点透明度的」）。

0.3.13 我把阅读面铺在了**正文列**上（JS 量出列容器打 `data-orca-reading`）—— 但网页版的正文列在亮色下几乎顶到整页，于是侧栏与会话列表一起被冲白。现在：

| | 0.3.13（已撤） | 0.3.14 |
|---|---|---|
| 打标对象 | 正文列容器（`[data-orca-reading]`） | **文字块**：markdown 容器的直接子元素 + 列表项（`[data-orca-reading-block]`） |
| CSS 选择器 | `:is([data-orca-reading], [class*='centerCol'], .ds-scroll-area)` | 只认 `[data-orca-reading-block]`，类名兜底一律去掉 |
| 观感 | 整页/半页变白，侧栏都被冲淡 | 每段文字背后一小块圆角玻璃（8px 圆角 + `padding: 6px 10px` / `margin: -6px -10px`，**文字位置不变**，只是背后多出一圈） |
| 透明度 | 亮 `#f9fbffec`（≈93%） | 亮 `#f9fbffe8`（≈91%，略透，能看见一点宫殿）/ 暗 `#0a122ac9` |

`tagReadingSurface()` 的挑法也收紧了：仍先用「所有可见文本块的水平中位数」定位正文中轴、再从中轴下方往上找「孩子都是内容块」的容器，但往后只在**这个容器内部**找文字块，三套选择器（`[class*=markdown i]` / `[class*="message"|"chat" i] [class*="content" i]`）各查一遍取并集，都命中不了才退回「一条消息」这一层。仍然：打错只加背景、不改布局；切回 orca 套会摘掉全部标记。

## 本版本调整（0.3.13）

**女仆套正文补上 DSH 那层「白玻璃」阅读底**（用户截图：正文深蓝衬线字直接压在宫殿图上，读不清；「字背后都像 dsh 里面的一样弄个白底」）。

原皮肤确实有这一层，网页版一直没搬：

```css
body[data-dsh-maid-atelier][data-maid-panel-page] [class*=centerCol]:before {
  background: var(--maid-reading-surface);   /* 亮 #f9fbffc7 / 暗 #0a122ac7 */
  backdrop-filter: blur(16px) saturate(.95);
  position: absolute; inset: 0;
}
```

搬法上**刻意不猜类名**（0.3.10/0.3.11 就是猜类名猜翻的）：`orca.js` 新增 `tagReadingSurface()` —— 取所有可见文本块（`p/li/h1..h4/pre/blockquote/td`，排除本扩展自己的 DOM）的**水平中位数**当正文列中轴，在该中轴下方用 `elementFromPoint` 探一个点，向上找「跨过中轴、且宽度 ≥ 视口 55%」的最外层祖先，给它打上 `data-orca-reading`；CSS 就照着这个标记铺面：

```css
html[data-orca-link][data-orca-skin='maid'] :is([data-orca-reading], [class*='centerCol'], .ds-scroll-area) {
  background-color: var(--maid-reading-surface) !important;   /* 亮 #f9fbffec / 暗 #0a122ad6 */
  backdrop-filter: blur(16px) saturate(.95);
}
```

- 触发点：启动时、`applySettings`、内容观察器（500ms 去抖那一路）、窗口 resize；切回 orca 套会摘掉标记。
- 打错也无害（只加背景色、不改布局）；打不上则维持原样。
- 用背景色而不是原皮肤的 `:before` 伪元素：站点滚动容器上的伪元素容易被内容盖住、也怕影响滚动。

## 本版本调整（0.3.12）

**按用户要求：侧栏那处改动退回原样**（0.3.10 / 0.3.11 越改越宽，副作用滚雪球）。

| | 0.3.9（现在恢复成这样） | 0.3.10 / 0.3.11（已撤） |
|---|---|---|
| 侧栏选择器 | 原样三个：`.b8812f16`、`.dc04ec1d`、`[class*=sidebarCol]` | 扩成 `aside` / `[class*='sidebar' i]` / `[class*='sider' i]` / `[role=complementary]` |
| 侧栏底 | 原作那层纱 `#0b1942e0`（交给站点用令牌上色） | 我另刷 `background-color: #0b1942 !important` 实体底 + 中间容器 `transparent` |
| brand 色 | 不碰 | 侧栏内 `--dsw-alias-brand-*` 改成金/米白（→ 品牌标记也变金） |
| 会话行选中 | orca 那套（深色主题的金） | 女仆套内换柔金薄纱 + 金色强调条 |

**保留**的只有一条**最小兜底**，且只上色、不碰背景：

```css
html[data-orca-link][data-orca-skin='maid'] [class*='sidebarCol'] :is(span, a, button, li, p),
html[data-orca-link][data-orca-skin='maid'] .b8812f16 :is(span, a, button, li, p),
html[data-orca-link][data-orca-skin='maid'] .dc04ec1d :is(span, a, button, li, p) {
  color: var(--dsw-alias-label-primary, #f8f3e8);
}
```

之所以留它：0.3.9 那版侧栏作用域令牌的三个选择器**一个都不匹配**（站点换掉了哈希类名），于是字色回落到 body 级深蓝 `#172347`、压在海军蓝侧栏上读不出来 —— 这就是你最早报的那个问题。现在令牌层恢复原样（窄），但即使它再次失配，这条只改文字的规则也会把侧栏文字拉成米白。

> ⚠️ 教训：这类「看不清」的问题，我连着两版都在**扩大改动面**（先动令牌、再动背景、再动 brand），每次都引入新症状（侧栏被压色、宫殿透上来、品牌元素变金）。正确做法是**把改动限制在症状本身**（字看不清 → 只改字色），其余交回站点与原作。

## 本版本调整（0.3.11）

**修 0.3.10 的回归：女仆套侧栏整块被冲淡（用户截图：「问题更严重了」）**。

0.3.10 修完「会话标题是亮蓝/深蓝看不清」之后，副作用是侧栏变成一层灰蒙蒙的纱 —— 宫殿图整幅透上来了。两个原因，都已修：

1. **侧栏底是半透明的**：令牌 `--dsw-specific-sidebar-fill` 是 `#0b1942e0`（alpha `e0` ≈ 88%），配 `--dsw-alias-bg-base: transparent`，宫殿图直接透上来。现在改成**实体海军蓝 `#0b1942`**，并另加一层兜底：
   ```css
   html[data-orca-link][data-orca-skin='maid'] [class*='sidebar' i] > div { background-color: #0b1942 !important; }
   ```
   深色主题走 `[data-orca-dark]` 那组（`#050d28`）。选 `[class*=sidebar] > div`（侧栏里那一层容器）而不是压在 `aside` 上，是为了不把顶栏一起染深。
2. **brand 色覆盖撤掉**：0.3.10 把侧栏作用域里的 `--dsw-alias-brand-primary` 改成金、`--dsw-alias-brand-text` 改成米白，结果侧栏里凡是吃 brand 色的元素（品牌标记、状态点）都变成金色。现在只留 label 系（文字）与 nav-item 系（选中/悬停），brand 色交回站点。

顺带修了 `test-tokens.mjs` 自身一个**假通过**：块提取用 `css.indexOf('\n}', open)` 收尾，撞上了注释里以 `}` 结尾的那一行，把声明块从中间截断，于是前半段令牌（包括 `--dsw-specific-sidebar-fill`）根本没被解析；另一个坑是注释里写了 `--dsw-alias-bg-base: transparent`，正则从注释里的名字一路吃到下一行的 `;`，把中间那条声明整个吞掉 —— 所以提取前**必须先剔除块内注释**。这两处都补了注释说明。

## 本版本调整（0.3.10）

**修「深海女仆工坊 · 日间模式侧栏会话标题看不清」**（用户截图：深蓝字压在海军蓝侧栏上，只有选中行能勉强看出轮廓）。

根因是**侧栏作用域令牌那一层整段失效**了：原作（也是本扩展早先照搬过的写法）把「深蓝底 + 米白字」成对写在 `[class*=sidebarCol]` 上，而我那版选择器写成了

```css
html[data-orca-link][data-orca-skin='maid'] .b8812f16,
html[data-orca-link][data-orca-skin='maid'] .dc04ec1d,
html[data-orca-link][data-orca-skin='maid'] [class*='sidebarCol'] { … }
```

—— 站点改版换掉了侧栏的哈希类名，三个选择器一个都不匹配，于是这层令牌**一条都没生效**：侧栏仍是海军蓝（`--dsw-specific-sidebar-fill: #0b1942e0` 写在 body 级，还在生效），而文字回落到 body 级的深蓝（`--dsw-alias-label-primary: #172347`）→ 深底深字。

改法：

1. **选择器改宽**，与 JS 里 `ANCHOR_SELECTORS` 那套判据对齐：`[class*=sidebarCol]`、`[class*='sidebar' i]`、`[class*='sider' i]`、`aside`、`[role=complementary]`。哈希类名只在注释里留档，代码不再依赖任何一个。`test-tokens.mjs` 新增断言：作用域必须认这几类锚点、**且不许再出现 `.b8812f16` / `.dc04ec1d`**。
2. **侧栏内的 brand 色一并改浅**：会话标题用的是 brand 系亮蓝（`--dsw-alias-brand-primary` / `--dsw-alias-brand-text`），压在海军蓝上等于隐形。侧栏作用域内改成米白 `#f8f3e8` + 女仆的金 `#d8c08c`。比逐个元素 `color: …` 稳妥 —— 不会误伤图标、徽标、按钮里的彩色元素。
3. **选中/悬停行改成柔金薄纱**：orca 那边给的是实体金块（`#d8c08c` 底 + 深色字，为深色主题设计），压在女仆的深蓝侧栏上又亮又糊。女仆套作用域内换成 `#d8c08c33`（选中）／`#d8c08c1f`（悬停）+ 金色强调条 `#dbbe7c`。

## 本版本调整（0.3.9）

**角色背板再次整体删除（用户截图确认不要）**：上一版（0.3.8）把背板改成「亮/暗跟随主题」，但用户发的截图说明的是另一件事 —— 那块板子**本身就是多余的**：「这板子和背景是两码事，你把这板子删了」。所以这次不是让它跟随主题，而是把它彻底拿掉：`#orca-character::before` 那一整套（底板 / 渐晕 / 细纹 / 粒子）连同它的令牌一起从样式表里消失，角色直接浮在场景上。

- 删掉的规则：`#orca-character[data-status]::before`（底板）、`[data-orca-dark]` 那条覆盖、`[data-status='working']` 明暗两条（底光偏青的板子）、以及 maid 的兜底板子。
- 删掉的令牌：`--orca-char-plate`、`--orca-char-plate-color`、`--orca-char-dots*`，以及 `#faf7f1a3` / `#080c13e0` 两个舞台底色值。
- **保留**：角色精灵 `.orca-char-sprite`（原包的金色描边光 + 8×10 切片）、状态气泡、左上角定位、`data-orca-dark` 下精灵自己的暗色滤镜。
- 0.3.8 那两条与「板子跟随主题」直接相关的改动随之作废（令牌合并、CSS 兜底规则）；但**主题位镜像到角色层**这一条留着 —— 精灵的暗色滤镜与状态气泡本来就挂在 `[data-orca-dark]` 上，`applyTheme()` 仍然把主题位同步到 `.orca-row` / `#orca-character`，站点换主题时角色这块不会停旧档。

`test-plate.mjs` / `scan-css.mjs` 恢复成**正向断言「背板规则 0 条」**（含选择器兜底、令牌不存在、两个底色值不出现，注释里提到旧名字不算违规），同时断言角色本体还在（精灵 + 气泡 + 切片公式）。`test-status.mjs` 另外新增 5 条主题镜像断言（见 0.3.8 那条留档）。

**「开启新对话」台座改成跟随主题（浅色不再是一块黑底）**：用户截图里的「左上角角色背景还是黑的」，量下来是 **240px 宽**的那块方板 —— 那是侧栏「开启新对话」按钮被改成的竖排舞台，角色画在它内部的 `#orca-newchat-art` 上，**垫底的那块板子就是按钮自己的底色**。它此前是写死的深色常量（`NC_STAGE_FACE = '#12161de6'` / `NC_STAGE_FACE_DARK = '#0a0e14f2'`），亮暗两档都是深的，所以浅色模式里永远黑。

- 底色改用 CSS 令牌 `--orca-nc-stage-face`，描边 / 投影走 `--orca-nc-stage-face-border`、`--orca-nc-stage-face-shadow`：**亮 `#fffcf6f2`（暖白纸面）/ 暗 `#0a0e14f2`（深海墨蓝）**，JS 只写 `background-color: var(--orca-nc-stage-face) !important`，主题一变自动换牌。
- `applyTheme()` 里补一次 `applyNewChatStage()`：站点可能在扩展判定出主题之前就把按钮塞进 DOM（启动竞态），那时台座会被涂成旧档色，现在每次主题判定后重刷一遍，浅色模式不会留暗面。
- 顺带说明这块面**不是** 0.3.8/0.3.9 里那块被删的角色背板：背板挂在浮空角色 `#orca-character::before` 上，已整段删除；台座是按钮的面，两者位置相近但来源不同（这也是「删了板子还是黑的」的原因）。

**台座面加上光效（当前生效的版本）**：按 `@smalltailqwq/dsh-client-ui-skin-orca-link` 里 `[data-slot=sidebar]>:first-child`（及其 `:before`）的舞台语言，给台座加了一层「舞台面 + 扫光」：

| 层 | 扩展里的取值 | 由来 |
|---|---|---|
| 底色 | `--orca-nc-stage-face`：亮 `#fffcf6f2` / 暗 `#0a0e14f2` | 承接上一版的跟随主题，按实体色给出 |
| ① 顶部柔光 | `linear-gradient(180deg,#ffffffcf 0%,#ffffff00 44%)`（暗 `#8fb6e033→透明`） | 原包顶部柔光的等价物 |
| ② 舞台下沿接缝 | `…#fffcf600 60%,#ede6d8d9 100%`（暗 `#05080dc4`） | 原包舞台下沿那道接缝的等价物 |
| ③ 横向细纹 | `repeating-linear-gradient(90deg,#2b374826 0 1px,transparent 1px 7px)`（暗 `#b4c7e21f`），`background-size:100% 9px` | 原包细纹 |
| ④ 扫光 | `#orca-nc-sweep` 自建元素 + `--orca-nc-stage-sweep`；`transform` 从 `calc(-1*(w+24)px)` 过渡到 `calc(100%+(w+24)px)`，1.15s `cubic-bezier(.22,1,.36,1)`，宽度按台座宽度算 | 原包 `orcaSeamSweep` 那条扫光的等价物（按钮伪元素被站点占着，所以另起一枚元素） |

触发点：**挂载时 + 主题变化时**各扫一遍；`prefers-reduced-motion` 时 JS 直接摘掉扫描带、CSS 再兜底 `display: none`。

> 📌 版本留档：中途还做过一版「**逐值**照搬原包」的台座（底色 `#faf7f1a3` / `#080c13e0` 半透明、柔光 `#faf7f18c→#faf7f100 76px`、细纹只铺底部 8px 带、**不含扫光**）。用户看过之后要求「回退上一版」，于是恢复成上面这套带扫光的版本；那一版的全部取值与铺法（含「原包板子上其实没有扫光、`orcaWordmarkScan` 是单词标的动画」这个发现）已记录在 `orca-extract/` 的比对脚本与提交说明里，要切回去只需替换 `--orca-nc-stage-face` / `--orca-nc-stage-layers` 两支令牌并删掉 `#orca-nc-sweep`。
>
> ⚠️ 教训：我先前声称「照搬原包」，实际把底色换成不透明色、柔光换成自造色、细纹铺满整块面，还自己加了一条扫光。用户一句「你是不是做的和原包不一样」之后逐字比对才发现。**说「照搬」之前必须逐值核对**；`test-plate.mjs` 现在把「有扫光 + 亮暗两档取值」这套契约钉住了（它比的是令牌取值与铺法，不是「像不像原包」）。

另外修掉一个会变噪音的行为：原来 `syncNewChatArt()` 每次调用都无条件重铺台座，而它每 2s 就调一次 —— 现在台座面只在**主题变化**或新节点挂载时重铺，扫光也就只在这两个时机各扫一遍，不会每 2 秒闪一次。

## 本版本调整（0.3.8 · 已被 0.3.9 取代）

> 结论留档：这一版把背板改成跟随主题，但用户要的是**删掉板子**，所以 0.3.9 整段撤掉。下面这段只作为「背板曾经怎么不跟随主题」的根因记录。

**「左上角角色背景不跟随深色/浅色模式」的根因**：背板亮/暗两档此前是**一半走令牌、一半写死在规则里** —— 渐晕走 `--orca-char-plate` / `--orca-char-plate-dark`，底色却写死在基础规则的 `background-color: #faf7f1a3` 里、只在 `html[...][data-orca-dark] #orca-character::before` 那一条里覆盖。于是暗色那条一旦没命中（根元素主题位没被观察到、或工作态规则按特异性把它顶回亮色档），板子就停在亮色那一档。

## 本版本调整（0.3.6）

**材质核对（逐字节）**：把 `assets/` 全部素材与 `@smalltailqwq` 三个原包做了 SHA-256 对照 —— 除扩展自己新增的 `favicon-deepseek-blue.svg` 与重命名的图标外，**每一张都是原包运行时的同一份字节**（场景 4 张、状态图集、女仆 26 张立绘/饰件/图标全部 `SAME-DATA`）。三个原包里只有前两个带美术资源，`deep-whale-manager` 是纯代码（无图片），它对应的「皮肤切换面板」在本扩展里由左下角面板 + popup 承担。

> 留档：0.3.6 删过一次背板（理由是它看着像「一块跟角色分离的独立板子」），0.3.7 又要了回来，0.3.9 再次删除 —— **这次是定论：不要这块板子**。

**背板已整体删除**：`#orca-character::before` 那一整套（底色 / 渐晕 / 竖排细纹 / 星点粒子）全部删掉，角色直接浮在页面上，不再有任何垫底的板子。

保留（与背板无关）：角色精灵 `.orca-char-sprite`（仍带原包的暖褐 `drop-shadow` 金色描边光、8×10 切片）、状态气泡、左上角定位、以及两边角色统一的 `stageSize()` 尺寸。


> 留档：DSH 那边角色的底来自侧栏舞台容器 `[data-slot=sidebar]>:first-child`（亮 `#faf7f1a3` / 暗 `#080c13e0`，暗色再叠一条 `repeating-linear-gradient(90deg,#b4c7e233 0 1px,transparent 1px 7px)`）。网页版没有对应容器，硬造一块只会多出一块「独立板子」，所以最终整段撤掉。

**金色光**（保留）在 sprite 自己的滤镜里，逐项照搬：

```css
filter: sepia(.124) saturate(.945) contrast(1.112) brightness(.988)
        drop-shadow(.45px .65px #4c2f1638);   /* 暖褐/淡金描边光 */
```

（暗色为 `drop-shadow(.45px .65px #00000059)`。）

**角色改回左上角独立浮层**：DSH 那边角色是**侧栏左上角**的固定元素（原包注释「左上角小人」，原作 `top: calc(58px + var(--orca-stage-top)); left: 22px`），而扩展一直把它塞在左下角的 `#orca-widgets` 面板组里 —— 面板是 `flex-direction: column`，角色又是最后一个子节点，于是它排到皮肤面板**下面**，看着像凭空多出一块面板（当时那版还带竖纹与粒子，更像一块独立板子）。

现在拆成两块独立浮层：

- `.orca-row` 自己 `position: fixed; top: 58px; left: 22px`（照搬原作锚点），挂到 `body` 上，不再参与面板的 flex 流。
- `#orca-widgets` 只剩字标 + 皮肤面板，继续留在左下角。
- 拖拽落点分开记：角色层存 `cornerPos`、面板存 `posPanel`（原来共用一个 `pos`，拖动任一个都会把另一个弹走）。**旧的 `pos` 值不再读取**，所以升级后第一次加载会回到默认位置（角色左上、面板左下），再拖一次即重新记住。

新增断言（`test-runtime.mjs`）：角色层必须在 `body` 下、且**不在** `#orca-widgets` 的子节点里。为此还把测试桩的 `append/prepend/remove` 改成和真实 DOM 一样会先摘除原父节点 —— 原来的空 `remove()` 让这条断言一直是假通过。

**「开启新对话」台座改成 DSH 那套**：站点原按钮是**圆角浅灰**，DSH 原作是**深色方角台座 + 青蓝方括号角标**。现在：

- 按钮本体强制 `border-radius: 0`、深色底、1px 描边 + 投影 —— 让灰调像素角色立在深底上。
- 左上 / 右下各一枚 9px 的 `border` L 形角标（`data-orca-nc-bracket`，色值取 `--orca-cyan`），对应原作的 `┌` `┘`。
- 台座样式抽成 `applyNewChatStage()`，**每次 `syncNewChatArt()` 都重刷一遍**，站点在会话切换时重置按钮样式也不会丢。

> ⚠️ 踩坑记录（0.3.x 早期）：台座底色当时写成 `color-mix(in srgb, var(--orca-ink) 88%, #05070a)`，而 `--orca-ink` 在 `[data-orca-dark]` 下是 **`#eef4ff`（近白）** —— 于是暗色主题里按钮变成一块浅色，用户直接看到「背景怎么是白的」。后来改成两档写死的深色常量（`#12161de6` / `#0a0e14f2`），却是亮暗都深 —— 浅色模式又永远是一块黑板。**0.3.9 起**才是最终形态：底色改为跟随主题的令牌 `--orca-nc-stage-face`（亮暖白 / 暗墨蓝），并叠上原包舞台那三层光效与扫光，见本版说明。

**两个角色尺寸统一（原来差一倍）**：浮空角色写死 `118px`，而「开启新对话」上的角色按 DSH 舞台公式算 `clamp(240,34vh,320) − 66 ≈ 240px`。现在抽出唯一来源 `stageSize()`：

- `charSize()` = `stageSize()`，浮空角色通过 `--orca-char-size` 写回，按钮角色读同一个值；窗口 resize 时一起重算（含宽度约束，窄窗口不会撑出侧栏）。
- 逐帧质心补偿也跟着统一（`renderFrame` 里原来还留着 `settings.charSize || 118` 这条旧路径，导致两个角色的补偿量差一倍）。

新增 `orca-extract/test-plate.mjs`（53 条声明式契约断言）钉住这些材质/尺寸参数；其中「按主题解析 `--orca-ink` 并断言其亮度」这条是专门用来抓上面那个白底回归的，「粒子核心半径 ≥ 1px / 平铺尺寸 ≤ 140px / 无低位色标写法」这三条是抓「粒子看不见」那一类的。
另外 `orca-extract/scan-css.mjs` 用**逐字符扫描**（而不是正则）重解一遍样式表，确认 `#orca-character::before` 上真的落到 `content` / `background-image` / `background-size`，并且没有语法错误把整段规则丢掉。

**背景层逐项对齐原皮肤**（原来有两处不一致，就是「材质看着不一样」的来源）：

- 基础缩放：亮 `scale(1.008)` / 暗 `scale(1.01)`；此前两套都写成 `1.012`。
- 非当前角色层补上 `blur(2px)`：原作亮/暗的 Hero/Active 两态各自带 2px 模糊，扩展此前漏了，导致空态↔工作态切换是「两张图硬切」。
- 补上 `z-index: 1` 与 `will-change: opacity, transform, filter`，渐晕层（`::after`，`z-index: 2`）压在图层之上，与原作层级一致。

**「开启新对话」按钮上的角色与浮空角色统一坐标系**：

- 浮空角色是**两段**位移：`background-position` 选帧 + `transform` 做逐帧质心补偿。
- 按钮上的角色此前把补偿**折进了** `background-position`（只有一段），于是同一帧下两张图差 `align × size/236` 像素。
- 现在两边同式：`background-position = -col*size / -row*size`，补偿单独走 `transform`，且各自按 `size/236` 等比缩放（两者尺寸本就不同：浮空 118px、舞台角色约 214px，补偿量按尺寸等比即视觉中心一致）。

0.3.5 的「可见性判定」还不够，这一次把左上角那枚浮动角色**永远停在 TASK RUNNING 且一直乱动**的两个根因都钉死：

- **可见性判定补全（状态卡在 working 的直接原因）**：0.3.5 只看 `getBoundingClientRect()` 有没有尺寸，可站点把停止按钮**淡出**（`opacity:0`）、**藏起来**（`display:none` / `visibility:hidden`，包括祖先）、或**移出视口**时，元素照样有 rect —— 于是永远命中「正在生成」。现在 `isVisible()` 会沿祖先链检查 `display` / `visibility` / `opacity`，并要求落在视口内。
- **`setStatus()` 改为幂等（「一直乱动」的直接原因）**：旧写法每次调用都 `state.frame = 0` 再重启逐帧循环，而流式输出期间 MutationObserver 每 500ms 就会调它一次 —— 帧号被反复归零，角色和「开启新对话」按钮上的两个动画在 working/input 之间来回跳。现在状态没变就只重绘一帧、续上循环，**绝不重置 frame**。
- **迟滞 + 安全阀**：新增 `WORKING_EXIT_GRACE_MS`（1200ms，叠加原有的 500ms 观察器去抖）与 `WORKING_MAX_MS`（12000ms 强制回落）。前者压住按钮重挂造成的 working⇄standby 抖动，后者保证**任何**误判都会在 12s 内自己爬出「工作态」。
- **顺手修掉的三个次生问题**：
  - 开机态 `setStatus('ready', 1800)` 的定时回落挂在「状态变化」分支里，而 `state.status` 初值本来就是 `ready` —— 这个定时器**从来没建立过**，状态永远不会被站点推导更新；现在定时回落独立于状态是否变化。
  - CSS 里 `@media (prefers-reduced-motion: reduce) {}` 与 `@media (width <= 1180px) {}` 只有悬空选择器、没有声明，整条规则无效（前者本意是关掉逐帧动画）；已改成有效声明，并在 JS 侧让逐帧循环在「减少动态效果」与后台标签页时真正停表。
  - 角色 sprite 加上 0.12s 的位移过渡，状态切行时不再「咯噔」一下。
- **回归测试**：新增 `orca-extract/test-status.mjs`（21 条断言，自带假时钟与假 DOM），专门复现「有尺寸但不可见」「观察器反复轮询」这两类站点行为，并断言帧序不会被打断。

## 本版本调整（0.3.5）

修两个真 bug（都是「角色终于显示出来、尺寸放大到 234px 后」才暴露的）：

- **状态永远停在「工作态」**：`isGenerating()` 原来只看语义标签就判定，而研究笔记里写明**站点的发送与停止是同一个按钮组件**（`jsx(ve,{...mode,onStop})`），DOM 里常驻一个隐藏的停止按钮 —— `querySelector` 不看可见性，于是永远命中。现在改为**语义标签 + 真实可见（`getBoundingClientRect` 有尺寸、不在 `aria-hidden` 子树内）双重判定**，并删掉 `[class*=stop]` / `[class*=loading]` 这类宽泛猜测。
- **逐帧乱抖**：原作靠 `STATUS_FRAME_ALIGNMENT`（10 状态 × 8 帧 = 80 组质心补偿）把每帧角色拉回同一视觉中心；我此前只给小尺寸的角落角色加了这个补偿，**舞台角色漏了**，于是 234px 下每一帧的位置跳动非常明显。现已按 `size / 236` 等比套用同一张对齐表。

## 本版本调整（0.3.4）

- **角色改为原作侧栏舞台的尺寸**（此前只有 64px，太小）。尺寸**逐项照搬原皮肤源码**：
  - `--orca-stage: clamp(240px, 34vh, 320px)`（原作侧栏舞台高度）→ 我取同一组常量 `NC_STAGE_MIN=240 / NC_STAGE_MAX=320`、`34vh`；
  - 角色高 = **舞台高 − 66px**（原作 `height: calc(var(--orca-stage,300px) - 66px)`）→ 典型约 **234px**，并按按钮可用宽度取正方形；
  - 原作用 `left:22px; top:58px` 把舞台放在侧栏顶部、让按钮内容让位；这里把「开启新对话」按钮本身改成**竖排舞台**：角色在上、文字在下，点击行为不变。
- **彻底解决平铺问题**：0.3.3 把角色画在站点按钮的 `background` 上时，`background-repeat: no-repeat` 被站点样式回落成 `repeat`，结果平铺出 5 个角色（截图可见）。现在改为**把我自己的 `<span>` 塞进按钮内部**，inline 样式写在自建元素上，没有任何竞争者可干扰。
- 站点按钮原有 inline 样式（`flex-direction` / `padding` / `height` 等 7 项）在切换皮肤或卸载时**逐项原样还原**。

## 本版本调整（0.3.3）

- **再修「新对话按钮角色不显示」**：0.3.2 的独立浮层方案也没能显形（截图显示按钮变高、加号被隐藏 ⇒ JS 确实在跑，但浮层不可见）。不再继续猜层叠，改为**最不依赖环境**的做法：
  - 角色直接写成**按钮自身的 inline 背景**（`background-image` / `background-size` / `background-position` 全部 `setProperty(..., 'important')`）——inline `!important` 除了动画几乎无法被站点顶掉；
  - 切片改用**像素定位**（`8×64px × 10×64px` 的图集、按 `-col*64px` / `(h-64)/2 - row*64px` 取格），不再依赖 CSS 变量或百分比换算；
  - 图集 URL 用 `chrome.runtime.getURL('assets/status-atlas.webp')` 绝对路径；
  - 浮层元素与相关 CSS **全部删除**，回归单一实现路径。
- 校验器同步修正：`chrome.runtime.getURL('assets/…')` 形式的引用过去会被误判为「素材缺失」。

## 本版本调整（0.3.2）

- **修「新对话按钮角色不显示」**（0.3.1 反馈）：上一版把角色画在按钮自己的 `::before` 上，并靠 CSS 改 `padding-left` 与隐藏自带图标——实测**按钮变高了（`min-height` 生效）但角色没出来、加号也没被隐藏**，说明站点按钮自身的样式/伪元素把 `::before` 与 `padding` 顶掉了。**CSS 与站点样式对撞不可靠。**
- 改为**独立浮层 + JS 直接控制**：
  - `#orca-newchat-art` 是独立的 `position: fixed` 浮层（`pointer-events: none`），位置由 JS 按按钮实测矩形摆放，完全不碰站点的伪元素；
  - 按钮自带的 `+` 图标用 `style.setProperty('display','none','important')` 直接隐藏，缩进也走 inline `!important`，不参与优先级之争；
  - 每 2 秒低频重同步（按钮仍在时只重算浮层位置），窗口缩放 / 侧栏开合都能跟上；
  - 换到女仆套或找不到按钮时，浮层移除、按钮图标与缩进原样还原。
- 顺带确认：上一版**扩展是重载成功了的**（按钮确实变高了即为证据），所以问题不在"网页版不行"，而在实现方式。

## 本版本调整（0.3.0）

- **把站点「开启新对话」按钮换成虎鲸角色，并随状态切换姿势**（虎鲸套专属）：
  - 角色取自同一张状态图集 `status-atlas.webp`，按 `--nc-row` / `--nc-col` 切片，与左下角状态角色**共用同一套状态推导**（`deriveStatus()`）；
  - **正在回复 / 思考时是「工作态」（打字姿势）**，空闲时回到**「待机态」**，故障 / 待授权 / 已就绪等 10 种状态同样自动跟着走；
  - 状态循环独立于状态角色：popup 里关掉「状态角色」后，按钮的姿势仍会变化；
  - 按钮用**文本匹配 + 左半屏位置约束**打上 `data-orca-newchat` 标记（不依赖会变的哈希类名），换到女仆套时自动摘除标记；
  - 按钮高度 72px、角色 64px，保留「开启新对话」文字与点击行为。

## 本版本调整（0.2.9）

- **修复女仆套日间模式侧栏不可读**（真 bug，根因在移植方法上）：
  - 原皮肤把侧栏的**深蓝底与米白字成对**写在作用域选择器 `body[data-dsh-maid-atelier] [class*=sidebarCol]` 上（12 项令牌）；
  - 我的令牌抽取是「把任何作用域的 `--dsw-*` 声明拍平到 `body`，同名只留第一个」——于是这一层被丢掉，侧栏只剩 body 级的深蓝底色 `#0b1942e0`，文字却仍是 body 级的深蓝 `#172347` → **深底深字**，亮色下几乎看不见（暗色下因为 body 级文字本来就是浅色，反而正常，所以只暴露在日间模式）。
  - 修复：按原作照搬这 12 项侧栏作用域令牌（含底色、文字、金描边、滚动条、交互态），选择器对准站点当前侧栏容器 `.b8812f16` / `.dc04ec1d`，并保留原作的 `[class*=sidebarCol]`。
  - **新增对照断言**：直接从皮肤包里抽 `[class*=sidebarCol]` 的声明，逐项核对我的值与原作一致；另加两条断言盯住「侧栏文字不得回落到 `#172347`」「侧栏底色不得透出宫殿」。
- 顺带记一笔方法论教训：令牌抽取**必须保留作用域**，不能拍平——否则像这样"底色搬了、字色没搬"的错，只能靠肉眼在特定主题下发现。

## 本版本调整（0.2.8）

- **修复 0.2.7 误删的「暗金选中会话」**：撤直角契约时，切片脚本以「顶栏下沿」注释为结束标记，而暗金选中规则（`#d8c08c`）正好夹在两者之间，被一并切走。已补回。
- **加一道结构清单测试**：这已是切片脚本第三次吃掉不该吃的内容（前两次：皮肤面板样式 + `.orca-row`；本次：暗金选中）。测试现在会逐条核对 **10 个章节注释**是否在场，以及 4 处关键规则的**实质内容**（防止"注释还在、规则没了"）。
- 现状：两套皮肤都保留站点圆角；暗金选中会话（暗色模式）恢复；侧栏框（虎鲸方括号 / 女仆金框）保持移除。

## 本版本调整（0.2.7）

按使用反馈撤掉了三处「设计上忠实、但用起来不想要」的东西：

- **移除虎鲸链路的侧栏框**（0.2.5 刚加的 18px 直角方括号 + 竖排 ORCA LINK 字标 + 侧栏右缘 spine）。DOM 与样式整体删除。
- **移除女仆套的侧栏金框**（四条渐变金线 + 四枚角饰）。顶 / 底饰带保留。
- **撤掉全局直角契约**：`border-radius: 0` 全域归零规则、`--dsw-radius-*: 0px` 六项令牌、`data-orca-square` 标记与 popup 开关全部移除。**两套皮肤现在都保留站点自己的圆角**（这也是女仆套原本的样子）。
  - 代价要讲清：虎鲸链路的「全直角界面」是原皮肤的核心识别特征之一，这一条现在**不再移植**。令牌保真断言相应改为「浅色 55 项（原 61 项减去 6 项 radius）」，并加反向断言守着。

## 本版本调整（0.2.5）

- **虎鲸链路的侧栏升级**：照搬原皮肤侧栏舞台的三件套（此前只搬了配色与直角，结构没搬）：
  - **直角方括号舞台框**：四个 18px 方括号（原作是八条 `18×1` / `1×18` 的 `--orca-blue` 渐变角线）围住侧栏上部；框内壁一圈 12% 透明度极淡描边，右下角一枚 9px 实心三角角标（对应原作 `:before` / `:after`）。
  - **竖排 ORCA LINK 字标**：`writing-mode: vertical-rl`、字距 `0.42em`、8px 等宽字体，贴舞台框左侧垂直居中，参数与原作一致（暗色下换深色投影）。
  - **侧栏右缘 spine**：每 56px 断一次的 1px 竖虚线，上下各 56px 渐隐遮罩，位置随站点的 `--sider-width` 走。
- 侧栏框改为**两套皮肤共用同一份 DOM**，外观由 CSS 按 `[data-orca-skin]` 区分（女仆仍是柔金四角 + 金线）；顶 / 底饰带依旧只在女仆套显示。

## 本版本调整（0.2.4）

- **修复 0.2.3 引入的样式丢失**：移除信号块时用的切片脚本以「主题字标」注释为结束标记，而皮肤面板样式正好位于两者之间，导致 `.orca-skin-*` 全部规则与基准 `.orca-row` 被一并切走——表现是面板塌成一堆裸按钮、两个选项都带 ✓。
- **补上缺失的测试层**（这才是根因）：此前只测 JS 行为，从不校验 CSS 里是否真有对应规则。新增 `test-css.mjs`：
  - **交叉核对**：`orca.js` 里 `className = '…'` 创建的 16 个 class，必须在 `orca.css` 里有规则；
  - 22 条**基准规则行首锚定**检查（防止被 `某作用域 .x {` 里的片段蒙混过关）；
  - 两套皮肤的令牌块在场、CSS 括号平衡、体积下限；
  - 反向断言：已移除的 `orca-signal-chip` / `orca-pricing` 不许复活。

## 本版本调整（0.2.3）

- **移除「LINK ACTIVE」状态信号块**：原皮肤把它挂在 DSH 侧栏词标旁当一个信号点，搬到网页后它浮在内容之上、挡视野；而状态角色头顶的气泡（`...` / `!` / `?` / `§`）本来就已经表达状态，它是冗余的。相关 DOM 与样式**整体删除**（不是藏起来）。
- 保留：状态角色的十状态动画、逐帧质心补偿，以及 `--orca-lamp-*` 信号色（故障 / 待授权仍用它上色）。

## 本版本调整（0.2.2）

- **皮肤面板加「收起 / 展开」**：一枚 `– 收起` 按钮，收起后整块面板只剩一枚 `▸ 皮肤` 胶囊（标题、两个选项、引导气泡一并收起），再点一下展开；收起状态写进设置，刷新后保持。
- 想彻底不看见部件：orca 皮肤下可在 popup 关掉「状态角色」；要连字标一起隐藏的话说一声，我加个总开关。

## 本版本调整（0.2.1）

- **切换入口重做成「面板」**，解决"那两枚小按钮看不出是干什么的"：
  - 加标题行 `皮肤 · SKIN` + 右侧「点此切换」；
  - 每个选项加**配色预览块**（虎鲸＝石墨/青，女仆＝深海蓝/柔金）与**中文副标题**（虎鲸链路 / 深海女仆工坊）；
  - 当前项加 ✓ 与高亮描边；面板背景改为实底 + 毛玻璃 + 投影，读起来是个控件而不是装饰；
  - **首次使用浮出引导气泡**「↑ 从这里换皮肤 / 背景」，点选后永久不再出现（存在 `chrome.storage.local.skinHintSeen`）；
  - 女仆皮肤下面板自动换成深海蓝底 + 柔金描边。

## 本版本调整（0.2.0）

- 新增第二套皮肤 **MAID ATELIER 深海女仆工坊**：47+42 项宿主令牌、宫殿亮暗背景、左右双女仆立绘、衬线字体、顶/底饰带与侧栏四角金框。
- 直角契约与状态角色用 `:not(maid)` 隔离，避免破坏女仆的蕾丝圆角语言。

## 本版本调整（0.1.4）

- **图标蓝化**（与 DSH 侧的 ORCA 黑鲸图标区分开）：浅色圆角底与描边保持原样，只把**鲸身**由 `#11151b` 改成 DeepSeek 官网蓝 `#3964fe`；鲸身上那个 4px 小方点原本是蓝的（`#086cff`），蓝底上是蓝的会看不见，因此改成白色。
  - 工具栏图标 `icons/icon{16,32,48,128}.png` 与标签页图标 `assets/favicon-deepseek-blue.svg` 用同一份 SVG 渲染，两处一致。
  - 标签页图标另外清掉了站点图标上的 `media` 属性（站点给亮/暗各挂了一条，指向同一个蓝版后 `media` 只会让其中一条失效），卸载时连同 `type` / `media` 一起还原。
  - **想换更深的蓝**：改 `assets/favicon-deepseek-blue.svg` 里那一个 `#3964fe`（官网品牌蓝；暗色版为 `#5686fe`），例如 `#1e40af` / `#2a4fd8`，然后重跑一次渲染脚本即可。
  - 旧的 `assets/orca-link.ico`（黑鲸版）保留未删，需要回退时可直接指回去。

## 本版本调整（0.1.2）

- **夜间模式选中会话改为「古典淡金」**：站点规则是 `._546d736.b64fb9ae { background: var(--dsw-specific-sidebar-nav-item-active-accent) }`，而原皮肤在暗色下把这个令牌覆盖成 `#4d91ff`（ORCA 亮蓝），反馈太亮。现在：
  - 选中行底色 `#d8c08c`、文字 `#2a2110`、行内操作按钮的 mask 转深色；
  - 侧栏容器内同时改写令牌（`-active-accent` / `-active` / `-hover`），站点改版换掉哈希类名时这层仍在；
  - 悬停态一并转成 12% 淡金，避免金色选中旁边闪出蓝色。
  - **换色只改 `src/orca.css` 里那三个值**（注释已标注）。浅色模式未改动。

## 本版本调整（0.1.1）

- **移除「峰谷定价红绿灯」**：原皮肤那盏红绿灯提示的是 DeepSeek **API** 的计费时段（高峰/低谷半价），而 chat.deepseek.com 网页版免费、没有 token 计费概念，留在界面上只会误导。相关代码已整体删除，不是关掉开关：
  - `orca.js` 删掉北京时间换算、高峰窗口 `09:00-12:00 / 14:00-18:00`、20 分钟预警、2026 工作日节假日表与红绿灯挂载逻辑；
  - `orca.css` 删掉全部 `.orca-pricing*` 样式与脉冲动画（91 行）；
  - popup 去掉对应开关。
  - 保留 `--orca-lamp-red/amber/green` 三个令牌——状态角色的「故障 / 待授权」信号色仍在用它们。

## 站点适配层（基于生产 bundle 实证）

扩展用的选择器来自对 chat.deepseek.com 当前生产包（`commit-id=44809ea4` / appVersion 2.5.0）的静态分析，**优先语义类，哈希类只作 fallback**：

| 用途 | 选择器 | 性质 |
|---|---|---|
| 主题机制 | 深色 `body.dark` + `body[data-ds-dark-theme="dark"]`；浅色 `body.light` | 硬编码，稳定 |
| AI 消息正文 | `.ds-markdown` / `.ds-assistant-message-main-content` | 硬编码，稳定 |
| 消息行 | `[data-virtual-list-item-key]` / `.ds-message` | 硬编码，稳定 |
| 输入框 | `.ds-textarea`（当前哈希 `.aaff8b8f` / `._77cefa5` / textarea `._27c9245`） | 语义 + 哈希 |
| 侧栏 | 当前 `.b8812f16`（外层 `.dc04ec1d`，宽度 `--sider-width` 261px） | 哈希 |
| 用户气泡 | 当前 `.fbb737a4`（`--dsw-specific-bubble`） | 哈希 |
| 顶栏 | `.the-header` | 硬编码，稳定 |

背景遮挡的**主凶**是 `body` 自身与聊天底板 `._55ff781`（都吃 `--dsw-alias-bg-base`），令牌层已一并解决。popup 里另有一个 **「背景兜底透明化」**开关（默认关闭）：万一站点改版导致背景重新被盖住，打开它会用「以输入框/侧栏/顶栏为锚点向上标记祖先」的启发式手段强制让出底色。改选择器只需动 `src/orca.js` 顶部的 `ANCHOR_SELECTORS`。

## 验证记录

三组断言全绿，脚本都在 `D:\AI\orca-extract\`：

| 脚本 | 项数 | 内容 |
|---|---|---|
| `test-tokens.mjs` | 15 | **104 项 `--dsw-*` 令牌与皮肤逐值一致**；bg-base 半透明值、侧栏/composer/气泡映射、直角令牌、暗色挂载点 |
| `test-port.mjs` | 15 | 状态行号表、80 个质心补偿、standby 逐帧时长、10 条文案、帧序；图集切片 2 例；**6 项反向断言**确认定价代码已彻底移除 |
| `test-runtime.mjs` | 19 | 用最小 DOM 桩真跑 `orca.js`：启动无异常、场景/部件/角色装配、初始状态 `ready`、红绿灯已不存在、两个观察器回调可执行、帧动画可执行 |

另加 manifest 引用完整性、JS 语法检查、CSS 括号平衡。

## 许可与署名

- 代码：原皮肤为 **MIT**，本扩展实现同样以 MIT 释出。
- **美术资源：CC BY-NC-SA 4.0 —— 禁止商业使用**，需署名、衍生同许可。署名链：
  1. 一创 **上善**（[Pixiv](https://www.pixiv.net/users/62155430) · [Bilibili：上善无形](https://b23.tv/8h5L4xz)）—— 鲸鱼娘角色原作者
  2. 二创 **Small-tailqwq** —— ORCA LINK 皮肤场景、状态图集与 UI 素材
- 素材取自 `@smalltailqwq/dsh-client-ui-skin-orca-link@0.1.7` 的 `assets/runtime/`，原字节打包，未二次压缩。

## 已知限制

- 所有 `._xxxxxxx` 是 CSS Modules 哈希，**站点改版即变**；扩展已尽量依赖语义类与 `--dsw-*` 令牌，哈希失效时的表现是局部观感回落，不会坏页面。
- 直角契约含全域 `border-radius: 0`，比原包的定向规则霸道；不喜欢可在 popup 关掉。
- **已移除峰谷定价红绿灯**（网页版不计费）；若你以后要在 DSH 侧看计费时段，那本来就在 DSH 皮肤里，与本扩展无关。
- 未做活体 DOM 验证（本机无无头浏览器与登录态）；结论来自生产 bundle 静态证据 + 两份第三方样式交叉验证。首次使用如遇局部错位，截图给我即可快速修正。
