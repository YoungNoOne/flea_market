# 大学跳蚤市场个人摊位应用实施计划

## 1. 项目目标

为个人跳蚤市场摊位制作一个手机端网页应用。学生扫描摊位二维码后，可以直接查看商品图片、简介、价格和详细信息，像点餐系统一样选择商品并查看总金额。同时提供许愿墙功能，让学生提交想要购买的物品；提交内容既可以在前端公开展示，也可以由摊主在后台查看和管理。

本项目第一版不接入微信支付或支付宝支付。购物清单只用于现场确认，最终付款仍通过线下扫码收款完成。

## 2. 推荐技术方案

- 前端框架：React + Vite
- 页面样式：移动端优先的 CSS，后续可接入 Tailwind CSS
- 商品数据：本地 JSON 文件维护
- 商品图片：放在项目的 `public/products/` 目录
- 许愿墙数据库：Supabase
- 部署平台：Netlify
- 访问方式：Netlify 公网 HTTPS 链接生成二维码

选择该方案的原因：

- 学生扫码即可访问，不需要安装 App 或微信小程序。
- 商品展示和购物清单可以完全前端实现，加载快、风险低。
- Supabase 可以保存许愿墙数据，前端可读取展示，摊主也可以在后台查看。
- Netlify 部署流程简单，适合活动型项目。

## 3. 第一版功能范围

### 3.1 商品浏览

- 展示摊位名称、活动地点、营业时间和简短说明。
- 展示商品分类，例如数码、书籍、生活用品、衣物、其他。
- 展示商品卡片：
  - 商品图片
  - 商品名称
  - 商品价格
  - 简短介绍
  - 库存或售出状态
- 支持按分类筛选商品。

### 3.2 商品详情

- 点击商品图片或商品卡片后打开详情弹窗。
- 详情弹窗展示：
  - 大图
  - 商品名称
  - 价格
  - 详细简介
  - 成色
  - 尺寸或规格
  - 备注
  - 是否可购买

### 3.3 加购和总金额

- 商品可以加入购物清单。
- 支持数量增加、减少和删除。
- 页面底部固定展示购物清单入口和总金额。
- 购物清单页面展示：
  - 已选商品
  - 单价
  - 数量
  - 小计
  - 总金额
- 显示提示：请拿此页面给摊主确认，现场完成付款。

### 3.4 许愿墙提交

- 学生可以提交想要购买的商品。
- 表单字段：
  - 想要的商品名称，必填
  - 预算，可选
  - 详细描述，可选
  - 昵称，可选
  - 联系方式，可选，仅后台可见
- 提交成功后显示反馈。

### 3.5 许愿墙展示

- 前端展示公开许愿内容。
- 展示字段：
  - 想要的商品名称
  - 预算
  - 描述
  - 昵称
  - 提交时间
- 不在前端公开展示联系方式。
- 默认按最新提交排序。

## 4. 我可以直接实现的内容

- 创建 React + Vite 前端项目。
- 搭建手机端商品展示界面。
- 创建商品数据模板。
- 接入当前项目中的商品图片，并整理为网页可访问资源。
- 实现商品详情弹窗。
- 实现购物清单、数量控制和总金额计算。
- 实现许愿墙提交表单。
- 实现许愿墙公开展示列表。
- 写好 Supabase 连接代码。
- 提供 Supabase 建表 SQL 和权限 SQL。
- 配置 Netlify 构建所需文件。
- 本地运行并完成构建测试。
- 提供二维码生成和上线前测试清单。

## 5. 需要你操作或提供的内容

- 提供真实商品资料：
  - 商品图片
  - 商品名称
  - 价格
  - 分类
  - 简介
  - 详细描述
  - 库存状态
- 注册或登录 GitHub、Netlify、Supabase。
- 在 Supabase 创建项目。
- 在 Supabase 后台执行我提供的 SQL。
- 将 Supabase 的 `Project URL` 和 `anon public key` 配置到 Netlify 环境变量。
- 将代码仓库连接到 Netlify 并点击部署。
- 用 Netlify 生成的公网地址制作二维码。
- 活动前用真实手机测试扫码访问。

## 6. 建议项目结构

```text
flea_market/
  public/
    products/
      logitech-k380.jpg
  src/
    components/
      ProductCard.jsx
      ProductModal.jsx
      CartDrawer.jsx
      WishForm.jsx
      WishWall.jsx
    data/
      products.json
    lib/
      supabaseClient.js
    App.jsx
    main.jsx
    styles.css
  .env.example
  index.html
  package.json
  README.md
  IMPLEMENTATION_PLAN.md
```

## 7. 商品数据模板

```json
[
  {
    "id": "keyboard-001",
    "name": "罗技 K380 蓝牙键盘",
    "category": "数码",
    "price": 70,
    "shortDesc": "轻便蓝牙键盘，适合平板和电脑使用。",
    "detail": "功能正常，按键反馈正常，外观有轻微使用痕迹。适合日常学习、打字和便携办公。",
    "condition": "二手，功能正常",
    "spec": "蓝牙连接，适配 macOS、Windows、iPadOS",
    "note": "现场确认后付款。",
    "images": ["/products/logitech-k380.jpg"],
    "stock": 1,
    "status": "available"
  }
]
```

## 8. Supabase 数据库设计

创建 `wishes` 表：

```sql
create table wishes (
  id uuid primary key default gen_random_uuid(),
  item_name text not null,
  budget text,
  description text,
  nickname text,
  contact text,
  is_public boolean default true,
  created_at timestamp with time zone default now()
);
```

开启 RLS 后配置基础策略：

```sql
alter table wishes enable row level security;

create policy "Anyone can submit wishes"
on wishes
for insert
to anon
with check (true);

grant insert on wishes to anon;
revoke select on wishes from anon;

create view public_wishes as
select
  id,
  item_name,
  budget,
  description,
  nickname,
  is_public,
  created_at
from wishes
where is_public = true;

grant select on public_wishes to anon;
```

注意：

- 前端公开展示时读取 `public_wishes` 视图，该视图不包含 `contact` 字段。
- 摊主可以在 Supabase 后台查看完整数据。
- 如果担心乱提交，可以后续将 `is_public` 默认改成 `false`，由摊主审核后再展示。

## 9. 环境变量

前端需要两个 Supabase 环境变量：

```text
VITE_SUPABASE_URL=你的 Supabase Project URL
VITE_SUPABASE_ANON_KEY=你的 Supabase anon public key
```

本地开发时放在 `.env` 文件中。提交代码时只提交 `.env.example`，不要提交真实密钥。

Netlify 部署时，在项目设置中添加同名环境变量。

## 10. 开发里程碑

### 阶段一：静态商品页

- 创建 Vite 项目。
- 加入商品数据和商品图片。
- 完成移动端商品列表。
- 完成商品详情弹窗。

验收标准：

- 手机宽度下页面排版正常。
- 商品图片、价格、简介清楚可见。
- 点击商品可以查看详情。

### 阶段二：购物清单

- 实现加入购物清单。
- 实现数量增减和删除。
- 实现总金额计算。
- 完成底部购物清单栏。

验收标准：

- 多个商品加购后总价正确。
- 数量变化后金额实时更新。
- 已售出商品不能加入清单。

### 阶段三：许愿墙

- 创建 Supabase 表。
- 接入 Supabase 客户端。
- 实现许愿提交。
- 实现公开许愿列表展示。

验收标准：

- 学生可以提交许愿。
- 提交后 Supabase 后台能看到数据。
- 前端能展示公开许愿内容。
- 联系方式不在公开页面展示。

### 阶段四：部署和二维码

- 推送代码到 GitHub。
- 连接 Netlify。
- 配置构建命令和环境变量。
- 部署生成公网地址。
- 生成二维码。

验收标准：

- 使用手机相机或微信扫码可以打开网页。
- 校园 Wi-Fi 和手机流量都能访问。
- 商品页和许愿墙功能都能正常使用。

## 11. Netlify 部署配置

如果使用 Vite，Netlify 配置如下：

```text
Build command: npm run build
Publish directory: dist
```

部署完成后会得到类似下面的地址：

```text
https://your-stall-name.netlify.app
```

二维码应使用这个公网 HTTPS 地址生成，不能使用 `localhost`、`127.0.0.1` 或本机局域网地址。

## 12. 上线前测试清单

- 用电脑本地运行，确认页面无报错。
- 用 `npm run build` 确认可以成功构建。
- 检查商品图片是否能正常显示。
- 检查每个商品价格是否正确。
- 检查已售出商品是否不能加购。
- 检查购物清单总金额是否正确。
- 检查许愿墙是否能提交。
- 检查 Supabase 后台是否能看到许愿数据。
- 检查公开许愿墙是否不显示联系方式。
- 用 Netlify 公网地址测试访问。
- 用至少两台手机扫码测试。
- 分别测试校园 Wi-Fi 和手机流量。
- 打印二维码前确认二维码清晰可扫。
- 在二维码旁边打印短链接，防止扫码失败。

## 13. 风险和处理

| 风险 | 处理方式 |
| --- | --- |
| 图片太大导致加载慢 | 压缩图片，单张建议控制在 200KB 到 500KB |
| 学生乱提交许愿内容 | 增加审核字段，默认不公开展示 |
| Netlify 在部分网络环境下较慢 | 活动前测试校园网，必要时换国内静态托管 |
| 商品临时售出但页面未更新 | 活动中手动更新商品状态并重新部署，或先用醒目纸质标记 |
| 支付接入复杂 | 第一版不接支付，只做现场确认清单 |

## 14. 第一版交付物

- 可本地运行的手机端网页应用。
- 商品数据模板。
- 商品图片目录。
- 购物清单功能。
- 许愿墙提交和展示功能。
- Supabase SQL 文件或说明。
- Netlify 部署说明。
- 上线前测试清单。

第一版完成后，学生扫码即可查看商品、点开详情、加入购物清单、查看总金额，并提交或浏览许愿墙内容。摊主可以在 Supabase 后台查看所有许愿提交。
