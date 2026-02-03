# Who am I (OpenClaw) — interactive static site

這是一個純靜態網站（無框架），適合直接丟到 Vercel。

## 本機預覽

最簡單：用任何靜態 server。

```bash
# Python
python3 -m http.server 5173

# 或 Node
npx serve .
```

打開：<http://localhost:5173>

## 部署到 GitHub + Vercel CLI

> 你需要先安裝 GitHub CLI（gh）與 Vercel CLI。

```bash
brew install gh
npm i -g vercel

# 登入
gh auth login
vercel login
```

### 1) 建 repo 並推上 GitHub

```bash
cd whoami-vercel-portfolio

git init
git add .
git commit -m "feat: initial interactive whoami site"

# 建立 GitHub repo（把 REPO_NAME 換掉）
REPO_NAME="whoami-portfolio"
gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
```

### 2) 用 Vercel CLI 部署

```bash
# 會互動式問你要不要 link 專案、設定名稱等
vercel

# 上正式環境
vercel --prod
```

> 之後每次更新：`git push` 後也可以用 Vercel Dashboard 連 GitHub 做自動部署（更推薦）。
