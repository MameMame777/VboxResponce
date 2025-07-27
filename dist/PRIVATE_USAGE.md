# VoiceVox Copilot Notifier - プライベート版

このVS Code拡張機能は、GitHub Copilot Chat完了時にVoiceVox音声で通知を行います。

## 🚀 **インストール方法**

### 手動インストール

1. `.vsix` ファイルをダウンロード
2. VS Code を開く
3. `Ctrl+Shift+P` でコマンドパレットを開く
4. `Extensions: Install from VSIX...` を選択
5. `voicevox-copilot-notifier-0.1.0.vsix` を選択

### コマンドラインインストール

```bash
code --install-extension voicevox-copilot-notifier-0.1.0.vsix
```

## ⚙️ **設定**

VS Code設定 (`Ctrl+,`) で以下を調整できます：

- `voicevox-copilot.enabled`: 音声通知の有効/無効
- `voicevox-copilot.voiceCharacter`: 音声キャラクター選択
- `voicevox-copilot.volume`: 音量 (0.0-1.0)
- `voicevox-copilot.notificationDelay`: 通知遅延時間
- `voicevox-copilot.randomTaskComplete`: ランダム音声選択

## 🎯 **使用方法**

1. **自動通知**: GitHub Copilot Chat完了時に自動で音声が鳴ります
2. **手動テスト**: `Ctrl+Alt+V` でトグル、`Ctrl+Shift+P` > "Play Test Sound"
3. **ステータスバー**: 右下のアイコンでオン/オフ切り替え

## 🔧 **トラブルシューティング**

### 音声が鳴らない場合

1. ステータスバーのアイコンが有効になっているか確認
2. 設定で `voicevox-copilot.enabled` が `true` になっているか確認
3. テストサウンド機能で基本動作を確認

### パフォーマンス問題

- 音声キャッシュが有効になっているため、初回読み込み後は高速再生
- 同時再生を防ぐため、連続通知は自動制限

## 📁 **ファイル構成**

```text
voicevox-copilot-notifier-0.1.0.vsix
├── assets/          # 音声ファイル (6種類)
├── out/             # コンパイル済みJavaScript
├── package.json     # 拡張機能設定
├── README.md        # ドキュメント
├── LICENSE          # MITライセンス
└── icon.png         # 拡張機能アイコン
```

## 🎤 **音声キャラクター**

- **ずんだもん** (zundamon): フレンドリー
- **四国めたん** (metan): 明るい
- **春日部つむぎ** (tsumugi): 穏やか
- **東北きりたん** (kiritan): 自然
- **結月ゆかり** (yukari): 上品
- **音街ウナ** (idoroid): エネルギッシュ

## 🔄 **アップデート**

新しいバージョンが利用可能になった場合：

1. 古いバージョンをアンインストール
2. 新しい`.vsix`ファイルをインストール

---
**開発者**: Nautilus Development  
**ライセンス**: MIT  
**バージョン**: 0.1.0
