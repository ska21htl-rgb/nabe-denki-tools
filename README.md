# 電気工事ツール

現場向け電気工事支援ツール集（検索系・計算系）のWebアプリです。

## ローカルで動作確認する

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開くと動作確認できます。

## GitHubにpushする

このフォルダをそのままリポジトリにしてpushしてください。

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<あなたのユーザー名>/<リポジトリ名>.git
git push -u origin main
```

## Vercelで公開する

1. https://vercel.com にGitHubアカウントでログイン
2. 「Add New...」→「Project」を選択
3. 今pushしたリポジトリを選ぶ
4. Framework Presetは自動で「Vite」が検出されます（Build Command: `npm run build`、Output Directory: `dist`）
5. 「Deploy」を押すと数十秒でビルドされ、`https://<プロジェクト名>.vercel.app` のようなURLが発行されます

以降はGitHubにpushするたびに自動で再ビルド・再公開されます。
