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

## Google Apps Script（GAS）版で公開する

GitHubやVercelを使わず、Googleアカウントだけで公開したい場合はこちらです。
`apps-script/` フォルダに、JS・CSSをすべて1つのHTMLに固めたビルド済みファイルを用意してあります。

1. https://script.google.com にアクセスし、「新しいプロジェクト」を作成
2. 左メニューの「Code.gs」の中身を、このリポジトリの `apps-script/Code.gs` の内容に置き換える
3. 左メニューの「+」→「HTML」でファイルを追加し、ファイル名を `index`（拡張子なし）にする
4. 中身を `apps-script/index.html` の内容にすべて置き換えて保存
5. 右上の「デプロイ」→「新しいデプロイ」→種類の選択で「ウェブアプリ」を選ぶ
6. 「アクセスできるユーザー」を用途に応じて設定（自分のみ／全員 等）し、「デプロイ」を押す
7. 発行された `https://script.google.com/macros/s/.../exec` のURLをスマホでブックマークすれば、そのままアプリとして使えます

### コードを更新したとき（GAS版の再ビルド）

`src/App.jsx` を編集したら、以下のコマンドで `apps-script/index.html` を作り直せます。

```bash
npm install
npm run build:gas
```

生成された `dist-gas/index.html` の中身を、Apps Scriptエディタの `index` ファイルに貼り直し、「新しいデプロイ」または既存デプロイの「管理」→「編集」から再デプロイしてください。
