# プロジェクト構成

## ディレクトリ構造

```text
VboxResponce/
├── 📁 src/                    # TypeScriptソースコード
│   ├── audioManager.ts        # 音声管理システム
│   ├── copilotMonitor.ts     # Copilot活動監視
│   ├── configurationManager.ts # 設定管理
│   ├── statusBarManager.ts   # ステータスバー表示
│   ├── errorReporter.ts      # エラー報告システム
│   └── extension.ts          # 拡張機能エントリーポイント
├── 📁 assets/                 # 音声アセット
│   ├── task-complete_zundamon.wav
│   ├── task-complete_metan.wav
│   ├── task-complete_tsumugi.wav
│   ├── task-complete_kiritan.wav
│   ├── task-complete_yukari.wav
│   └── task-complete_idoroid.mp3
├── 📁 out/                    # コンパイル済みJavaScript
├── 📁 build/                  # ビルド成果物
│   └── VboxResponce-0.1.0.vsix
├── 📁 dist/                   # 配布パッケージ
│   ├── VboxResponce-0.1.0.vsix
│   ├── install.bat
│   └── PRIVATE_USAGE.md
├── 📁 docs/                   # 開発文書
├── 📁 scripts/                # ビルドスクリプト
├── 📁 temp/                   # 一時ファイル
├── 📁 .github/                # GitHub Actions
│   └── workflows/
├── 📄 package.json            # 拡張機能設定
├── 📄 tsconfig.json          # TypeScript設定
├── 📄 README.md              # プロジェクト説明
├── 📄 LICENSE                # ライセンス
├── 📄 PRIVATE_USAGE.md       # プライベート使用説明
└── 📄 .gitignore             # Git除外設定
```

## フォルダ用途

### 開発関連
- **src/**: TypeScriptソースコード
- **out/**: tscでコンパイルされたJavaScript
- **temp/**: 開発中の一時ファイル

### 配布関連
- **build/**: `vsce package`で生成される.vsixファイル
- **dist/**: エンドユーザー向け配布パッケージ
- **assets/**: 音声ファイル（拡張機能に含まれる）

### ドキュメント
- **docs/**: 開発時の技術文書
- **README.md**: プロジェクト概要
- **PRIVATE_USAGE.md**: プライベート使用向け説明

### 設定ファイル
- **package.json**: VS Code拡張機能の設定とメタデータ
- **tsconfig.json**: TypeScriptコンパイル設定
- **.vscodeignore**: パッケージング時の除外設定
- **.gitignore**: Git追跡除外設定

## ビルドフロー

1. **開発**: `src/` でTypeScriptコード編集
2. **コンパイル**: `npm run compile` → `out/` にJavaScript生成
3. **パッケージング**: `vsce package` → `build/` に.vsix生成
4. **配布準備**: 必要ファイルを `dist/` にコピー
