# Korewa Frame

写真をサーバーへ送らず、ブラウザ内だけでEXIF付きSNSフレームを作成する静的Webアプリです。

## ローカル起動

```bash
npm install
npm run dev
```

## Cloudflare Pages

- Framework preset: `None`
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js version: `20` 以上

カスタムドメインは、用途が直感的に伝わる `frame.korewausa.com` を推奨します。

## プライバシー

EXIF解析、Canvas描画、PNG/JPEG保存はすべてクライアントサイドで実行されます。バックエンド、DB、画像アップロード処理はありません。
