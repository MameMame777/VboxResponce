# VS Code Extension Development Quick Reference

## 🚀 Essential Learning Points from VboxResponce Development

### 1. Project Setup & Structure

#### Essential Files
```
extension/
├── package.json         # Extension manifest
├── tsconfig.json       # TypeScript config  
├── src/extension.ts    # Main entry point
├── assets/             # Static resources
└── out/                # Compiled output
```

#### Key package.json sections
```json
{
  "engines": { "vscode": "^1.70.0" },
  "activationEvents": ["onStartupFinished"],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [...],
    "configuration": {...}
  }
}
```

### 2. Core Extension Pattern

```typescript
// src/extension.ts
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    // Initialize components
    const manager = new Manager(context.extensionPath);
    
    // Register commands  
    const command = vscode.commands.registerCommand('extension.command', () => {
        // Command logic
    });
    
    // Always register disposables
    context.subscriptions.push(command, manager);
}

export function deactivate() {
    // Cleanup
}
```

### 3. Configuration Management

```typescript
export class ConfigurationManager {
    private static readonly SECTION = 'extensionName';
    
    public static get<T>(key: string, defaultValue?: T): T {
        return vscode.workspace.getConfiguration(this.SECTION).get(key, defaultValue!);
    }
    
    public static async set(key: string, value: any): Promise<void> {
        await vscode.workspace.getConfiguration(this.SECTION)
            .update(key, value, vscode.ConfigurationTarget.Global);
    }
}
```

### 4. Status Bar Integration

```typescript
export class StatusBarManager implements vscode.Disposable {
    private statusBarItem: vscode.StatusBarItem;
    
    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right, 100
        );
        this.statusBarItem.command = 'extension.toggle';
        this.updateDisplay();
        this.statusBarItem.show();
    }
    
    dispose() {
        this.statusBarItem.dispose();
    }
}
```

### 5. Event Monitoring Patterns

```typescript
// Document changes
vscode.workspace.onDidChangeTextDocument(event => {
    // Handle text changes
});

// Active editor changes  
vscode.window.onDidChangeActiveTextEditor(editor => {
    // Handle editor switches
});

// Configuration changes
vscode.workspace.onDidChangeConfiguration(e => {
    if (e.affectsConfiguration('extensionName')) {
        // Reload configuration
    }
});
```

### 6. Resource Management Best Practices

```typescript
export class ResourceManager implements vscode.Disposable {
    private resources: vscode.Disposable[] = [];
    
    constructor(context: vscode.ExtensionContext) {
        // Register all disposables
        this.resources.push(
            vscode.workspace.onDidChangeTextDocument(this.handleChange),
            vscode.commands.registerCommand('cmd', this.handleCommand)
        );
        
        // Add to context for automatic cleanup
        context.subscriptions.push(...this.resources);
    }
    
    dispose() {
        this.resources.forEach(r => r.dispose());
    }
}
```

### 7. Error Handling & Logging

```typescript
export class Logger {
    private static outputChannel: vscode.OutputChannel;
    
    static initialize() {
        this.outputChannel = vscode.window.createOutputChannel('Extension');
    }
    
    static info(message: string) {
        this.outputChannel.appendLine(`[INFO] ${new Date().toISOString()} ${message}`);
    }
    
    static error(error: Error, context?: string) {
        const msg = `[ERROR] ${new Date().toISOString()} ${context || ''}: ${error.message}`;
        this.outputChannel.appendLine(msg);
        console.error(error);
    }
}
```

### 8. Cross-Platform Compatibility

```typescript
import * as os from 'os';

class PlatformHelper {
    static getCommand(): string {
        switch (os.platform()) {
            case 'win32':
                return 'powershell -Command "..."';
            case 'darwin':
                return 'osascript -e "..."';
            case 'linux':
                return 'pactl play-sample ...';
            default:
                throw new Error(`Unsupported platform: ${os.platform()}`);
        }
    }
}
```

### 9. Development Commands

```bash
# Development
npm run compile        # Compile TypeScript
npm run watch         # Watch mode
F5                    # Launch Extension Development Host

# Testing  
npm test             # Run tests
Ctrl+Shift+P         # Command palette

# Packaging
vsce package         # Create .vsix
code --install-extension file.vsix  # Install locally
```

### 10. Key VS Code APIs

| API | Purpose | Example |
|-----|---------|---------|
| `vscode.commands` | Register commands | `registerCommand('id', handler)` |
| `vscode.workspace` | Workspace operations | `getConfiguration()`, `onDidChange*` |
| `vscode.window` | UI operations | `showInformationMessage()`, status bar |
| `vscode.languages` | Language features | Diagnostics, hover providers |
| `context.subscriptions` | Resource cleanup | `push(disposable)` |

### 11. Performance Tips

- **Lazy Loading**: Only load components when needed
- **Debouncing**: Prevent excessive event firing
- **Memory Management**: Dispose resources properly  
- **Async Operations**: Don't block UI thread
- **Caching**: Cache expensive computations

### 12. Common Patterns

#### Singleton Manager
```typescript
export class SingletonManager {
    private static instance: SingletonManager;
    
    public static getInstance(): SingletonManager {
        if (!this.instance) {
            this.instance = new SingletonManager();
        }
        return this.instance;
    }
}
```

#### Event Debouncing
```typescript
class DebouncedHandler {
    private timeout: NodeJS.Timeout | null = null;
    
    handle(callback: () => void, delay: number = 500) {
        if (this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(callback, delay);
    }
}
```

### 13. Testing Strategy

```typescript
// src/test/extension.test.ts
import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
    test('Extension should activate', async () => {
        const ext = vscode.extensions.getExtension('publisher.extension');
        await ext?.activate();
        assert.ok(ext?.isActive);
    });
});
```

### 14. Publishing Checklist

- [ ] Update version in package.json
- [ ] Test in Extension Development Host
- [ ] Run `vsce package` successfully  
- [ ] Verify .vsix installs correctly
- [ ] Check all features work as expected
- [ ] Update README and documentation
- [ ] Create GitHub release with .vsix attachment

---

## 🎯 Key Takeaways

1. **Always use `context.subscriptions.push()`** for proper cleanup
2. **Implement `vscode.Disposable`** for custom classes with resources
3. **Use configuration watchers** for dynamic settings updates
4. **Platform-specific code** for cross-platform compatibility
5. **Debounce high-frequency events** to prevent performance issues
6. **Comprehensive error handling** with proper logging
7. **Test thoroughly** in Extension Development Host before packaging

This quick reference summarizes the most important concepts learned during VboxResponce development!
