# 校园跳蚤市场个人摊位网页

学生扫码后可以查看商品、点开详情、加入现场确认清单，并在许愿墙提交想要的商品。

## 本地运行

```bash
npm install
npm run dev
```

## 商品数据

商品信息在 `src/data/products.json` 中维护。图片放在 `public/products/` 目录，数据里用 `/products/文件名.jpg` 引用。

当前示例商品：

- 罗技 K380
- 价格：70r
- 图片：`public/products/logitech-k380.jpg`

## 许愿墙后台

1. 注册并创建 Supabase 项目。
2. 在 Supabase SQL Editor 中执行 `supabase.sql`。
3. 复制项目的 `Project URL` 和 `anon public key`。
4. 本地创建 `.env`：

```text
VITE_SUPABASE_URL=你的 Supabase Project URL
VITE_SUPABASE_ANON_KEY=你的 Supabase anon public key
```

没有配置 Supabase 时，许愿墙会使用浏览器本地数据作为演示模式。

公开许愿墙读取的是 `public_wishes` 视图，不包含 `contact` 字段；联系方式只保存在 `wishes` 表中，供你在 Supabase 后台查看。

## Netlify 部署

Netlify 构建配置已经写在 `netlify.toml`：

```text
Build command: npm run build
Publish directory: dist
```

部署时需要在 Netlify 的 Environment variables 中加入：

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

部署成功后，用 Netlify 提供的 `https://...netlify.app` 链接生成二维码。二维码不能指向 `localhost`。
