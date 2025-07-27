# VS Code Extension Development: Practical Lessons from VboxResponce

## 📚 Overview

この文書は、VboxResponce（GitHub Copilot Chat用音声通知拡張機能）の開発を通じて得られた実践的な知見をまとめた学習資料です。VS Code拡張機能開発の実用的なテクニックとベストプラクティスを体系的に整理しています。

## 🎯 開発プロジェクトの概要

### プロジェクト名
**VboxResponce** - GitHub Copilot Chat完了時にVoiceVox音声で通知するVS Code拡張機能

### 実装した主要機能
- GitHub Copilot Chatの完了検知（多層検知システム）
- 日本語音声キャラクターのランダム選択
- メモリベース音声キャッシュシステム
- ステータスバー統合とトグル機能
- 包括的な設定管理システム
- PowerShellを使用したクロスプラットフォーム音声再生

### 技術スタック
- **言語**: TypeScript
- **対象プラットフォーム**: VS Code 1.70.0以上
- **音声システム**: PowerShell音声再生
- **TTS**: VoiceVox（事前生成音声ファイル）
- **ビルドツール**: TypeScript Compiler, VSCE

## 🏗️ 拡張機能の基本アーキテクチャ

### エントリーポイントパターン

```typescript
// src/extension.ts - 拡張機能のメインエントリーポイント
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('拡張機能が有効化されました');
    
    // コンポーネントの初期化
    const audioManager = new AudioManager(context.extensionPath);
    const copilotMonitor = new CopilotMonitor(audioManager);
    const statusBarManager = new StatusBarManager();
    
    // コマンドの登録
    const toggleCommand = vscode.commands.registerCommand(
        'VboxResponce.toggleEnabled', 
        () => {
            // トグル処理
        }
    );
    
    // リソースの適切な管理
    context.subscriptions.push(toggleCommand, audioManager, copilotMonitor);
}

export function deactivate() {
    // クリーンアップ処理
}
```

### コンポーネント設計

```text
拡張機能の構成要素：

Extension.ts (エントリーポイント)
    ↓
├── AudioManager (音声管理)
├── CopilotMonitor (アクティビティ検知)
├── ConfigurationManager (設定管理)
├── StatusBarManager (UI制御)
└── ErrorReporter (ログ・エラー処理)
```

## 🔧 実用的な実装テクニック

### 1. 設定管理システム

```typescript
export class ConfigurationManager {
    private static readonly CONFIG_SECTION = 'VboxResponce';
    
    // 設定値の取得
    public static get<T>(key: string, defaultValue?: T): T {
        const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
        return config.get<T>(key, defaultValue!);
    }
    
    // 設定値の更新
    public static async set(key: string, value: any): Promise<void> {
        const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);
        await config.update(key, value, vscode.ConfigurationTarget.Global);
    }
    
    // 設定変更の監視
    public static onConfigurationChanged(callback: () => void): vscode.Disposable {
        return vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(this.CONFIG_SECTION)) {
                callback();
            }
        });
    }
}
```

### 2. ステータスバー統合

```typescript
export class StatusBarManager implements vscode.Disposable {
    private statusBarItem: vscode.StatusBarItem;
    
    constructor() {
        // ステータスバーアイテムの作成
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right, 
            100
        );
        
        this.statusBarItem.command = 'VboxResponce.toggleEnabled';
        this.updateStatusBar();
        this.statusBarItem.show();
    }
    
    private updateStatusBar(): void {
        const enabled = ConfigurationManager.get<boolean>('enabled', true);
        this.statusBarItem.text = enabled ? '🔊' : '🔇';
        this.statusBarItem.tooltip = `VboxResponce: ${enabled ? '有効' : '無効'}`;
    }
    
    public dispose(): void {
        this.statusBarItem.dispose();
    }
}
```

### 3. 高度なイベント検知システム

```typescript
export class CopilotMonitor implements vscode.Disposable {
    private lastDetectionTime: number = 0;
    private detectionCooldown: NodeJS.Timeout | null = null;
    
    public startMonitoring(): void {
        // 多層検知システムの実装
        this.monitorTextDocumentChanges();
        this.monitorCommandExecution();
        this.monitorWebviewActivity();
    }
    
    private monitorTextDocumentChanges(): void {
        const disposable = vscode.workspace.onDidChangeTextDocument(event => {
            const change = event.contentChanges[0];
            if (this.isCopilotResponse(change?.text)) {
                this.scheduleNotification('TASK_COMPLETE', 'テキスト変更検知');
            }
        });
        
        this.disposables.push(disposable);
    }
    
    private scheduleNotification(type: string, reason: string): void {
        // 重複通知防止のデバウンス処理
        if (this.detectionCooldown) {
            clearTimeout(this.detectionCooldown);
        }
        
        const now = Date.now();
        const timeSinceLastDetection = now - this.lastDetectionTime;
        
        // 適応的クールダウン（チャット用は3秒、一般用は10秒）
        const cooldownTime = type === 'CHAT_COMPLETE' ? 3000 : 10000;
        
        if (timeSinceLastDetection > cooldownTime) {
            this.detectionCooldown = setTimeout(() => {
                this.audioManager.playNotification(type);
                this.lastDetectionTime = Date.now();
            }, 500);
        }
    }
}
```

## 🎵 音声システムの最適化

### メモリベースキャッシュシステム

```typescript
export class AudioManager implements vscode.Disposable {
    private audioCache: Map<string, Buffer> = new Map();
    private tempDir: string;
    
    constructor(extensionPath: string) {
        this.tempDir = path.join(os.tmpdir(), 'vboxresponce');
        this.ensureTempDirectory();
        this.preloadAudioFiles();
    }
    
    // 音声ファイルの事前読み込み
    private async preloadAudioFiles(): Promise<void> {
        const audioFiles = this.getAllTaskCompleteFiles();
        
        for (const filePath of audioFiles) {
            try {
                const buffer = await fs.readFile(filePath);
                this.audioCache.set(filePath, buffer);
                ErrorReporter.logInfo(`音声ファイルをキャッシュ: ${path.basename(filePath)}`);
            } catch (error) {
                ErrorReporter.logError(error as Error, `音声ファイル読み込み失敗: ${filePath}`);
            }
        }
    }
    
    // ランダム音声選択
    public getRandomTaskCompleteFile(): string | null {
        const files = this.getAllTaskCompleteFiles();
        if (files.length === 0) return null;
        
        const randomIndex = Math.floor(Math.random() * files.length);
        return files[randomIndex];
    }
}
```

### クロスプラットフォーム音声再生

```typescript
private async playAudioFile(audioBuffer: Buffer): Promise<void> {
    const tempFileName = `audio_${Date.now()}.wav`;
    const tempFilePath = path.join(this.tempDir, tempFileName);
    
    try {
        // 一時ファイルに書き込み
        await fs.writeFile(tempFilePath, audioBuffer);
        
        // プラットフォーム固有のコマンド実行
        const command = this.getPlayCommand(tempFilePath);
        
        await new Promise<void>((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(`音声再生エラー: ${error.message}`));
                } else {
                    resolve();
                }
            });
        });
        
    } finally {
        // 一時ファイルのクリーンアップ
        try {
            await fs.unlink(tempFilePath);
        } catch (cleanupError) {
            // クリーンアップエラーは無視（ファイルが既に削除されている可能性）
        }
    }
}

private getPlayCommand(tempFilePath: string): string {
    // PowerShellを使用した安定した音声再生
    return `powershell -Command "& {
        try {
            Add-Type -AssemblyName System.Windows.Forms
            [System.Media.SoundPlayer]::new('${tempFilePath}').PlaySync()
        } catch {
            Write-Error $_.Exception.Message
            exit 1
        }
    }"`;
}
```

## 📊 パフォーマンス最適化

### リソース管理のベストプラクティス

```typescript
export class ResourceManager implements vscode.Disposable {
    private disposables: vscode.Disposable[] = [];
    
    constructor(context: vscode.ExtensionContext) {
        // すべてのDisposableリソースを追跡
        this.disposables.push(
            vscode.workspace.onDidChangeTextDocument(this.handleTextChange.bind(this)),
            vscode.window.onDidChangeActiveTextEditor(this.handleEditorChange.bind(this)),
            vscode.workspace.onDidChangeConfiguration(this.handleConfigChange.bind(this))
        );
        
        // 自動クリーンアップのためcontextに登録
        context.subscriptions.push(this);
    }
    
    public dispose(): void {
        // すべてのリソースを適切に解放
        this.disposables.forEach(disposable => {
            try {
                disposable.dispose();
            } catch (error) {
                ErrorReporter.logError(error as Error, 'リソース解放エラー');
            }
        });
        this.disposables = [];
    }
}
```

### エラーハンドリングとログシステム

```typescript
export class ErrorReporter {
    private static outputChannel: vscode.OutputChannel;
    
    public static initialize(): void {
        this.outputChannel = vscode.window.createOutputChannel('VboxResponce');
    }
    
    public static logInfo(message: string): void {
        const timestamp = new Date().toISOString();
        const logMessage = `[INFO ${timestamp}] ${message}`;
        this.outputChannel.appendLine(logMessage);
        
        if (process.env.NODE_ENV === 'development') {
            console.log(logMessage);
        }
    }
    
    public static logError(error: Error, context?: string): void {
        const timestamp = new Date().toISOString();
        const contextInfo = context ? ` (${context})` : '';
        const errorMessage = `[ERROR ${timestamp}]${contextInfo} ${error.message}`;
        
        this.outputChannel.appendLine(errorMessage);
        this.outputChannel.appendLine(`スタックトレース: ${error.stack}`);
        
        // 開発環境ではコンソールにも出力
        if (process.env.NODE_ENV === 'development') {
            console.error(errorMessage, error);
        }
    }
    
    public static show(): void {
        this.outputChannel.show();
    }
}
```

## 🧪 テストと品質保証

### 拡張機能のテスト戦略

```typescript
// src/test/extension.test.ts
import * as assert from 'assert';
import * as vscode from 'vscode';
import { AudioManager } from '../audioManager';

suite('VboxResponce Extension Tests', () => {
    let audioManager: AudioManager;
    
    setup(() => {
        // テスト環境のセットアップ
        audioManager = new AudioManager('/test/path');
    });
    
    test('音声キャッシュが正常に動作する', async () => {
        const result = await audioManager.preloadAudioFiles();
        assert.strictEqual(result, true);
        
        const randomFile = audioManager.getRandomTaskCompleteFile();
        assert.notStrictEqual(randomFile, null);
    });
    
    test('設定管理が正常に動作する', () => {
        const defaultValue = ConfigurationManager.get('enabled', false);
        assert.strictEqual(typeof defaultValue, 'boolean');
    });
    
    teardown(() => {
        // テスト後のクリーンアップ
        audioManager.dispose();
    });
});
```

## 📦 パッケージングと配布

### ビルド設定の最適化

```json
// tsconfig.json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "outDir": "out",
    "lib": ["ES2020"],
    "sourceMap": true,
    "rootDir": "src",
    "strict": true,
    "declaration": false,
    "skipLibCheck": true
  },
  "exclude": [
    "node_modules",
    ".vscode-test",
    "**/*.test.ts"
  ]
}
```

### パッケージスクリプト

```json
// package.json
{
  "scripts": {
    "vscode:prepublish": "npm run compile",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./",
    "pretest": "npm run compile && npm run lint",
    "lint": "eslint src --ext ts",
    "test": "node ./out/test/runTest.js",
    "package": "vsce package --allow-missing-repository --out build/",
    "install-extension": "code --install-extension build/$(ls build/*.vsix | head -1)"
  }
}
```

## 💡 学習のポイント

### 開発で得られた重要な知見

1. **多層検知システムの重要性**
   - 単一の検知方法では不十分
   - 複数の検知ロジックの組み合わせが安定性を向上
   - デバウンス処理による重複防止が必須

2. **パフォーマンス最適化の実践**
   - 事前生成音声ファイルによる高速化
   - メモリキャッシュによるレスポンス向上
   - 適切なリソース管理による安定性確保

3. **クロスプラットフォーム対応**
   - PowerShellによる統一的な音声再生
   - プラットフォーム固有の処理の分離
   - エラーハンドリングの重要性

4. **ユーザビリティの向上**
   - 直感的なステータスバー統合
   - 豊富な設定オプション
   - リアルタイムでの設定反映

### よくある落とし穴とその対策

| 問題 | 原因 | 対策 |
|------|------|------|
| リソースリーク | Disposableの未実装 | 必ずDisposableを実装し、context.subscriptionsに登録 |
| 設定変更の未反映 | 設定監視の未実装 | onDidChangeConfigurationを使用した動的更新 |
| 重複通知 | イベントの多重発火 | デバウンス処理とクールダウンタイマー |
| 音声再生失敗 | プラットフォーム依存 | try-catch文と代替手段の準備 |

## 🎯 今後の学習ステップ

1. **VS Code API の深堀り**
   - Language Server Protocol の学習
   - カスタムエディタの実装
   - Webview API の活用

2. **拡張機能の高度化**
   - マルチワークスペース対応
   - 国際化（i18n）の実装
   - パフォーマンス監視とプロファイリング

3. **コミュニティとの連携**
   - オープンソースプロジェクトへの貢献
   - VS Code Marketplace への公開
   - ユーザーフィードバックの収集と改善

---

この学習資料は、実際の拡張機能開発で遭遇した課題とその解決策を体系的にまとめたものです。VS Code拡張機能開発の実践的なガイドとしてご活用ください。
