import * as vscode from 'vscode';
import { AudioManager, NotificationType } from './audioManager';
import { ConfigurationManager } from './configurationManager';

export class CopilotMonitor implements vscode.Disposable {
    private observer: MutationObserver | null = null;
    private audioManager: AudioManager;
    private configManager: ConfigurationManager;
    private isMonitoring: boolean = false;
    private retryInterval: NodeJS.Timeout | null = null;
    private disposables: vscode.Disposable[] = [];
    private textEditorMonitoringSetup: boolean = false; // Flag to prevent duplicate setup
    
    // Debouncing and duplicate detection
    private lastNotificationTime: number = 0;
    private notificationCooldownMs: number = 10000; // 10秒�Eクールダウン�E�重褁E��止強化！E
    private pendingNotification: NodeJS.Timeout | null = null;
    private activeDetectionMethods: Set<string> = new Set(); // アクチE��ブな検�E方法を追跡

    constructor(audioManager: AudioManager, configManager: ConfigurationManager) {
        this.audioManager = audioManager;
        this.configManager = configManager;
    }

    async initialize(): Promise<void> {
        console.log('Initializing Copilot Monitor...');
        
        try {
            await this.startMonitoring();
            console.log('Copilot Monitor initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Copilot Monitor:', error);
            throw error;
        }
    }

    private async startMonitoring(): Promise<void> {
        this.isMonitoring = true;
        console.log('Started monitoring for Copilot completion events');
        
        // PRIORITY 1: Set up text editor monitoring (for inline completions)
        console.log('🔥 Setting up text editor monitoring as primary detection method...');
        this.setupTextEditorMonitoring();
        
        // PRIORITY 2: Enhanced output channel monitoring (for chat responses)
        console.log('🔥 Setting up enhanced output channel monitoring...');
        this.setupEnhancedOutputChannelMonitoring();
        
        // PRIORITY 3: Window state monitoring (for chat panel activity)
        console.log('🔥 Setting up window state monitoring...');
        this.setupWindowStateMonitoring();
        
        // PRIORITY 4: Extension activity monitoring
        console.log('🔥 Setting up extension activity monitoring...');
        this.setupExtensionActivityMonitoring();
        
        // Start actively searching for Copilot Chat panels (fallback method)
        this.setupCopilotPanelDetection();
    }

    private setupEnhancedOutputChannelMonitoring(): void {
        console.log('Setting up enhanced output channel monitoring for Copilot activity...');
        
        // Monitor VS Code output channels for Copilot-related activity more frequently
        const outputChannelTimer = setInterval(() => {
            this.checkCopilotOutputChannels();
            this.checkCopilotChatActivity();
        }, 1000); // Check every 1 second for more responsive detection
        
        // Store the timer for cleanup
        this.disposables.push({
            dispose: () => clearInterval(outputChannelTimer)
        });
        
        console.log('✁EEnhanced output channel monitoring setup complete!');
    }

    private setupWindowStateMonitoring(): void {
        console.log('Setting up window state monitoring for chat activity...');
        
        // Monitor window focus changes that might indicate chat responses
        const windowFocusTimer = setInterval(() => {
            this.checkForChatResponseActivity();
        }, 500); // Check every 0.5 seconds for real-time detection
        
        this.disposables.push({
            dispose: () => clearInterval(windowFocusTimer)
        });
        
        console.log('✁EWindow state monitoring setup complete!');
    }

    private setupExtensionActivityMonitoring(): void {
        console.log('Setting up extension activity monitoring...');
        
        // Monitor VS Code extension host for Copilot extension activity
        const extensionTimer = setInterval(() => {
            this.detectCopilotExtensionActivity();
        }, 2000); // Check every 2 seconds
        
        this.disposables.push({
            dispose: () => clearInterval(extensionTimer)
        });
        
        console.log('✁EExtension activity monitoring setup complete!');
    }

    private checkCopilotChatActivity(): void {
        // Check for Copilot Chat specific indicators
        try {
            // Look for chat-related activity indicators
            if (vscode.window.terminals && vscode.window.terminals.length > 0) {
                // Check if there are any new terminals that might indicate chat activity
                this.analyzeTerminalActivity();
            }
        } catch (error) {
            // Silently handle errors to avoid spam
        }
    }

    private checkForChatResponseActivity(): void {
        // Check for indicators that suggest a chat response has completed
        try {
            const activeEditor = vscode.window.activeTextEditor;
            if (activeEditor) {
                // Check if the active document has been modified recently (potential Copilot edit)
                this.analyzePotentialCopilotEdit(activeEditor);
            }
        } catch (error) {
            // Silently handle errors
        }
    }

    private detectCopilotExtensionActivity(): void {
        // Detect if GitHub Copilot extensions are actively responding
        try {
            // Check if there are recent changes that suggest Copilot activity
            this.analyzeRecentCopilotActivity();
        } catch (error) {
            // Silently handle errors
        }
    }

    private analyzeTerminalActivity(): void {
        // Analyze terminal activity for Copilot-related processes
        const terminals = vscode.window.terminals;
        if (terminals.length > this.lastTerminalCount) {
            console.log('🎯 New terminal detected - potential Copilot activity');
            this.scheduleCompletionNotification(NotificationType.TASK_COMPLETE, 'Terminal activity detected');
            this.lastTerminalCount = terminals.length;
        }
    }

    private analyzePotentialCopilotEdit(editor: vscode.TextEditor): void {
        // Check if the document has been recently modified in a way that suggests Copilot involvement
        const currentTime = Date.now();
        const documentUri = editor.document.uri.toString();
        
        if (!this.lastDocumentChangeTime.has(documentUri)) {
            this.lastDocumentChangeTime.set(documentUri, currentTime);
            return;
        }
        
        const lastChangeTime = this.lastDocumentChangeTime.get(documentUri) || 0;
        const timeSinceLastChange = currentTime - lastChangeTime;
        
        // If there was a significant text change recently, it might be from Copilot
        if (timeSinceLastChange > 1000 && timeSinceLastChange < 10000) { // 1-10 seconds ago
            console.log('🎯 Potential Copilot edit detected in active editor');
            this.scheduleCompletionNotification(NotificationType.TASK_COMPLETE, 'Potential Copilot edit detected');
        }
        
        this.lastDocumentChangeTime.set(documentUri, currentTime);
    }

    private analyzeRecentCopilotActivity(): void {
        // Look for patterns that indicate recent Copilot activity
        const now = Date.now();
        if (this.lastActivityCheck && (now - this.lastActivityCheck) < 30000) { // Within last 30 seconds
            // Check if there have been multiple recent events that suggest Copilot completion
            if (this.recentEventCount > 2) {
                console.log('🎯 Multiple recent events suggest Copilot completion');
                this.scheduleCompletionNotification(NotificationType.TASK_COMPLETE, 'Multiple activity indicators detected');
                this.recentEventCount = 0; // Reset counter
            }
        }
        this.lastActivityCheck = now;
    }

    // Add required properties to the class
    private lastTerminalCount: number = 0;
    private lastDocumentChangeTime: Map<string, number> = new Map();
    private lastActivityCheck: number = 0;
    private recentEventCount: number = 0;
    
    // Manual editing detection properties
    private lastKeystrokeTime: Map<string, number> = new Map();
    private recentChangeIntervals: Map<string, number[]> = new Map();
    private manualEditingThreshold: number = 100; // ms - below this suggests automated input

    private isSettingsOrConfigFile(document: vscode.TextDocument): boolean {
        return document.uri.scheme === 'vscode-userdata' || 
               document.fileName.includes('settings.json') ||
               document.fileName.includes('keybindings.json') ||
               document.fileName.includes('tasks.json') ||
               document.fileName.includes('launch.json');
    }

    private isLikelyManualEdit(document: vscode.TextDocument, changeLength: number, changeText: string): boolean {
        const now = Date.now();
        const documentUri = document.uri.toString();
        const lastTime = this.lastKeystrokeTime.get(documentUri) || 0;
        const timeSinceLastChange = now - lastTime;
        
        // Update keystroke timing
        this.lastKeystrokeTime.set(documentUri, now);
        
        // Track recent change intervals for pattern analysis
        if (!this.recentChangeIntervals.has(documentUri)) {
            this.recentChangeIntervals.set(documentUri, []);
        }
        
        const intervals = this.recentChangeIntervals.get(documentUri)!;
        if (intervals.length >= 5) {
            intervals.shift(); // Keep only last 5 intervals
        }
        intervals.push(timeSinceLastChange);
        
        console.log(`⌨️  Manual edit analysis for ${document.fileName}:`);
        console.log(`   - Time since last change: ${timeSinceLastChange}ms`);
        console.log(`   - Change length: ${changeLength} characters`);
        console.log(`   - Recent intervals: [${intervals.join(', ')}]ms`);
        
        // Indicators of manual editing:
        
        // 1. Very small changes (single characters/words) suggest typing
        if (changeLength <= 3 && timeSinceLastChange > this.manualEditingThreshold) {
            console.log('   ✋ Detected: Small change with human-like timing');
            return true;
        }
        
        // 2. Regular intervals between changes suggest human typing rhythm
        if (intervals.length >= 3) {
            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const hasRegularPattern = intervals.every(interval => 
                Math.abs(interval - avgInterval) < avgInterval * 0.5
            );
            
            if (hasRegularPattern && avgInterval > this.manualEditingThreshold) {
                console.log(`   ✋ Detected: Regular typing pattern (avg: ${avgInterval.toFixed(1)}ms)`);
                return true;
            }
        }
        
        // 3. Check for typical manual editing patterns in text
        const manualEditPatterns = [
            /^[a-zA-Z]$/, // Single character
            /^[a-zA-Z]+$/, // Single word without special formatting
            /^[0-9]+$/, // Just numbers
            /^\s+$/, // Only whitespace
            /^[a-zA-Z\s]{1,10}$/, // Short phrases
        ];
        
        const looksLikeTyping = manualEditPatterns.some(pattern => pattern.test(changeText.trim()));
        if (looksLikeTyping && timeSinceLastChange > 50) {
            console.log('   ✋ Detected: Manual typing pattern in text');
            return true;
        }
        
        // 4. Very fast changes (< 50ms) are likely automated (Copilot)
        if (timeSinceLastChange < 50 && changeLength > 20) {
            console.log('   🤖 Detected: Automated insertion (too fast + too large)');
            return false;
        }
        
        // 5. Large insertions happening instantly are likely Copilot
        if (changeLength > 100 && timeSinceLastChange < this.manualEditingThreshold) {
            console.log('   🤖 Detected: Large instant insertion (likely Copilot)');
            return false;
        }
        
        console.log('   ❓ Uncertain: Could be either manual or automated');
        return false; // When uncertain, assume it might be Copilot to avoid missing notifications
    }

    private setupCopilotPanelDetection(): void {
        // Moderate frequency of panel detection for balanced responsiveness
        this.retryInterval = setInterval(() => {
            if (!this.isMonitoring) {
                return;
            }

            this.searchForCopilotChatPanel();
        }, 5000); // Balanced frequency: Check every 5 seconds

        // Also try immediately
        this.searchForCopilotChatPanel();
    }

    private setupRetryMechanism(): void {
        this.retryInterval = setInterval(() => {
            if (!this.isMonitoring) {
                return;
            }

            // Placeholder: Check for Copilot panels
            this.attemptToFindCopilotPanel();
        }, 5000); // Check every 5 seconds
    }

    private searchForCopilotChatPanel(): void {
        try {
            // In VS Code extensions, we need to use indirect methods to access DOM
            // Since we can't directly access webviews of other extensions,
            // we'll use VS Code APIs to detect when Copilot is active
            
            console.log('Searching for Copilot Chat activity...');
            
            // Check if Copilot extension is active
            const copilotExtension = vscode.extensions.getExtension('GitHub.copilot-chat');
            if (copilotExtension && copilotExtension.isActive) {
                console.log('Copilot Chat extension is active');
                this.monitorCopilotActivity();
            } else {
                console.log('Copilot Chat extension not found or not active');
            }
            
        } catch (error) {
            console.error('Error searching for Copilot Chat panel:', error);
        }
    }

    private monitorCopilotActivity(): void {
        // Since we can't directly access Copilot's webview DOM,
        // we'll use alternative detection methods
        
        console.log('Setting up Copilot activity monitoring...');
        
        // Method 1: Monitor VS Code window focus changes
        this.setupWindowFocusMonitoring();
        
        // Method 2: Monitor text editor changes (might indicate Copilot usage)
        // Only set up if not already done
        if (!this.textEditorMonitoringSetup) {
            console.log('Setting up text editor monitoring from Copilot activity monitor...');
            this.setupTextEditorMonitoring();
        } else {
            console.log('Text editor monitoring already active, skipping setup...');
        }
        
        // Method 3: Monitor command execution (Copilot-related commands)
        this.setupCommandMonitoring();
    }

    private setupWindowFocusMonitoring(): void {
        // Window focus monitoring disabled as it creates false positives
        // We'll rely on more specific Copilot Chat detection methods instead
        console.log('Window focus monitoring disabled to prevent false positives');
    }

    private setupTextEditorMonitoring(): void {
        // Prevent duplicate setup
        if (this.textEditorMonitoringSetup) {
            console.log('⚠�E�EText editor monitoring already set up, skipping...');
            return;
        }
        
        console.log('🔥 Setting up text editor monitoring (PRIMARY DETECTION METHOD)...');
        this.textEditorMonitoringSetup = true;
        
        // Enhanced text document monitoring for better Copilot detection
        const disposable = vscode.workspace.onDidChangeTextDocument((e) => {
            console.log(`📝 TEXT DOCUMENT CHANGE: ${e.document.fileName}`);
            console.log(`📝 Change count: ${e.contentChanges.length}`);
            this.analyzeTextDocumentChange(e);
            
            // Only count as Copilot activity if it's not a settings/config file
            if (!this.isSettingsOrConfigFile(e.document)) {
                this.recentEventCount++; // Track activity for pattern detection
            }
        });
        
        // **CRITICAL: Monitor document saves (often indicates Copilot completion)**
        const saveDisposable = vscode.workspace.onDidSaveTextDocument((document) => {
            console.log(`💾 DOCUMENT SAVED: ${document.fileName} - potential Copilot completion`);
            
            // Skip settings files and other non-code files
            if (this.isSettingsOrConfigFile(document)) {
                console.log(`💾 Skipping settings/config file: ${document.fileName}`);
                return;
            }
            
            // Document saves often happen after Copilot insertions
            setTimeout(() => {
                this.scheduleCompletionNotification(NotificationType.TASK_COMPLETE, 'Document saved after potential Copilot edit');
            }, 500); // Small delay to let other events settle
        });
        
        // **CRITICAL: Enhanced activity pattern detection**
        const activityTimer = setInterval(() => {
            this.detectChatInputActivity();
        }, 1000); // Check every second
        
        // Also monitor active editor changes
        const activeEditorDisposable = vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor) {
                console.log(`📝 ACTIVE EDITOR CHANGED: ${editor.document.fileName}`);
                console.log('📝 Active editor changed - potential Copilot usage context');
                
                // Only count as Copilot activity if it's not a settings/config file
                if (!this.isSettingsOrConfigFile(editor.document)) {
                    this.recentEventCount++; // Track activity
                }
            }
        });
        
        // Monitor selection changes (might indicate user reviewing Copilot suggestions)
        const selectionDisposable = vscode.window.onDidChangeTextEditorSelection((e) => {
            console.log(`📝 SELECTION CHANGED: ${e.textEditor.document.fileName}`);
            this.analyzeSelectionChange(e);
        });
        
        // Monitor visible text editors changes (Copilot might add new editors)
        const visibleEditorsDisposable = vscode.window.onDidChangeVisibleTextEditors((editors) => {
            console.log(`📝 VISIBLE EDITORS CHANGED: count = ${editors.length}`);
            if (editors.length > 0) {
                editors.forEach((editor, index) => {
                    console.log(`  📝 Editor ${index}: ${editor.document.fileName}`);
                });
            }
        });
        
        this.disposables.push(disposable, activeEditorDisposable, selectionDisposable, visibleEditorsDisposable);
        this.disposables.push(saveDisposable); // Add save disposable
        this.disposables.push({
            dispose: () => clearInterval(activityTimer)
        });
        console.log('✁EText editor monitoring setup complete!');
    }

    private detectChatInputActivity(): void {
        // **より厳格な基準でチャチE��活動を検�E**
        const now = Date.now();
        
        // **高いアクチE��ビティ閾値�E�Eイベント以上！E*
        if (this.recentEventCount > 5) { // 5イベント以上でより確宁E
            console.log(`🎯 HIGH activity detected (${this.recentEventCount} events) - likely genuine chat interaction`);
            
            // **一度だけ検�Eを実衁E*
            if (!this.activeDetectionMethods.has('Chat interaction activity pattern detected')) {
                // Schedule a delayed check for completion notification
                setTimeout(() => {
                    console.log('🎯 Delayed chat completion notification triggered');
                    this.scheduleCompletionNotification(NotificationType.TASK_COMPLETE, 'Chat interaction activity pattern detected');
                }, 4000); // 4秒後により確実に
            }
            
            this.recentEventCount = 0; // Reset counter immediately
        }
        
        // **よりめE��くりとしたカウンターの減衰**
        if (this.recentEventCount > 0) {
            this.recentEventCount = Math.max(0, this.recentEventCount - 0.5);
        }
    }

    private analyzeTextDocumentChange(e: vscode.TextDocumentChangeEvent): void {
        // Only analyze changes in specific file types that are likely to be Copilot-generated
        const document = e.document;
        
        console.log(`Analyzing text document change in: ${document.fileName}`);
        console.log(`Document language: ${document.languageId}`);
        console.log(`Document scheme: ${document.uri.scheme}`);
        
        // Skip non-code files and settings/config files, but be less restrictive
        if (document.uri.scheme !== 'file' || 
            document.fileName.includes('.git') ||
            document.fileName.includes('node_modules') ||
            document.fileName.includes('.vscode')) {
            console.log('Skipping document due to file type/location filters');
            return;
        }

        // Analyze text changes for Copilot patterns with balanced criteria
        if (e.contentChanges.length > 0) {
            const change = e.contentChanges[0];
            const changeText = change.text;
            const changeLength = changeText.length;
            
            console.log(`Text change details:`);
            console.log(`  - Length: ${changeLength} characters`);
            console.log(`  - Lines: ${(changeText.match(/\n/g) || []).length + 1}`);
            console.log(`  - Range: ${change.range.start.line}-${change.range.end.line}`);
            console.log(`  - Text preview: "${changeText.substring(0, 100)}${changeLength > 100 ? '...' : ''}"`);
            
            // 🆕 Check if this looks like manual editing
            const config = this.configManager.getConfiguration();
            const isManualEdit = config.filterManualEdits && this.isLikelyManualEdit(document, changeLength, changeText);
            if (isManualEdit) {
                console.log('🚫 Skipping notification: Detected manual editing');
                return;
            }
            
            // Detect medium to large insertions (likely Copilot completions)
            // Reduced threshold to catch more Copilot interactions
            if (changeLength > 50) { // Reduced from 200 to catch smaller completions
                console.log(`Text insertion detected: ${changeLength} characters`);
                if (changeLength > 150 || this.looksLikeGeneratedCode(changeText)) {
                    console.log('🎯 Triggering completion notification for code insertion');
                    this.scheduleCompletionNotification(NotificationType.TASK_COMPLETE, 'Code insertion');
                }
            }
            
            // Detect multi-line code blocks with reasonable threshold
            const lineCount = (changeText.match(/\n/g) || []).length;
            if (lineCount > 3) { // Reduced from 10 to catch smaller multi-line completions
                console.log(`Multi-line code block detected: ${lineCount} lines`);
                console.log('🎯 Triggering completion notification for multi-line block');
                this.scheduleCompletionNotification(NotificationType.TASK_COMPLETE, 'Multi-line code block');
            }
            
            // Pattern matching for generated code with lower threshold
            if (changeLength > 30 && this.looksLikeGeneratedCode(changeText)) {
                console.log('Generated code pattern detected');
                console.log('ↁETriggering completion notification for generated code pattern');
                this.scheduleCompletionNotification(NotificationType.TASK_COMPLETE, 'Generated code pattern');
            }
            
            // Special detection for Copilot explanations or comments
            if (changeLength > 20 && this.looksLikeCopilotExplanation(changeText)) {
                console.log('Copilot explanation detected');
                console.log('ↁETriggering completion notification for Copilot explanation');
                this.scheduleCompletionNotification(NotificationType.TASK_COMPLETE, 'Copilot explanation');
            }
            
            // Log any change over 10 characters for debugging
            if (changeLength > 10) {
                console.log(`Notable text change (${changeLength} chars) - monitoring for patterns`);
            }
        } else {
            console.log('No content changes detected in this document change event');
        }
    }

    private analyzeSelectionChange(e: vscode.TextEditorSelectionChangeEvent): void {
        // Analyze selection changes that might indicate Copilot interaction
        const selection = e.selections[0];
        if (selection && !selection.isEmpty) {
            const selectedText = e.textEditor.document.getText(selection);
            
            // Large selections might indicate user reviewing Copilot output
            if (selectedText.length > 200) {
                console.log('Large text selection - possible Copilot output review');
            }
        }
    }

    private looksLikeCopilotExplanation(text: string): boolean {
        // Check if text looks like a Copilot explanation
        const explanationPatterns = [
            /^\/\*\*[\s\S]*\*\/$/m,  // JSDoc comments
            /^\/\/.*explanation/i,    // Explanation comments
            /^#.*explanation/i,       // Python explanation comments
            /This.*function.*does/i,  // Function explanations
            /The.*following.*code/i   // Code explanations
        ];
        
        return explanationPatterns.some(pattern => pattern.test(text));
    }

    private looksLikeGeneratedCode(text: string): boolean {
        // Check if text looks like generated code
        const generatedCodePatterns = [
            /function\s+\w+\s*\([^)]*\)\s*{/,     // Function definitions
            /class\s+\w+\s*{/,                    // Class definitions
            /const\s+\w+\s*=\s*\([^)]*\)\s*=>/,  // Arrow functions
            /if\s*\([^)]+\)\s*{[\s\S]*}/,        // If statements with blocks
            /for\s*\([^)]+\)\s*{[\s\S]*}/,       // For loops
            /try\s*{[\s\S]*}\s*catch/,           // Try-catch blocks
        ];
        
        return generatedCodePatterns.some(pattern => pattern.test(text));
    }

    private scheduleCompletionNotification(type: NotificationType, reason: string): void {
        // **重褁E���E防止の強匁E*
        const currentTime = Date.now();
        
        // チャチE��検�Eの場合�E短ぁE��ールダウンを使用
        const cooldownMs = reason.includes('Chat interaction') ? 3000 : this.notificationCooldownMs; // チャチE��は3私E
        
        // より厳格なクールダウンチェチE��
        if (currentTime - this.lastNotificationTime < cooldownMs) {
            console.log(`⏰ Completion notification (${reason}) BLOCKED - within ${cooldownMs/1000}s cooldown`);
            return;
        }
        
        // 同じ琁E��での重褁E���Eを防止
        if (this.activeDetectionMethods.has(reason)) {
            console.log(`🔄 Completion notification (${reason}) BLOCKED - already detected by this method`);
            return;
        }
        
        // Cancel any existing scheduled notification
        if (this.pendingNotification) {
            clearTimeout(this.pendingNotification);
            this.pendingNotification = null;
            console.log('⏹�E�ECancelled previous pending notification');
        }
        
        // 検�E方法をアクチE��ブリストに追加
        this.activeDetectionMethods.add(reason);
        
        // **1つの通知のみをスケジュール**
        console.log(`📅 SCHEDULING notification: ${reason} (${type})`);
        this.pendingNotification = setTimeout(() => {
            if (this.isMonitoring && this.configManager.isEnabled()) {
                // Additional check: Only proceed if it seems like genuine user activity
                const activeEditor = vscode.window.activeTextEditor;
                if (!activeEditor) {
                    console.log(`❁EScheduled completion notification (${reason}) canceled - no active editor`);
                    this.activeDetectionMethods.delete(reason);
                    return;
                }
                
                console.log(`🎯 EXECUTING completion notification: ${reason}`);
                this.onCompletionDetected(type);
                
                // 10秒後にアクチE��ブ検�Eをクリア
                setTimeout(() => {
                    this.activeDetectionMethods.clear();
                    console.log('🧹 Cleared active detection methods');
                }, 10000);
            } else {
                this.activeDetectionMethods.delete(reason);
            }
            this.pendingNotification = null;
        }, 2000); // 2秒�E遁E��で確実な検�E
    }

    private setupCommandMonitoring(): void {
        // Monitor VS Code commands that might indicate Copilot activity
        console.log('Setting up Copilot command monitoring...');
        
        // Monitor extension activation/deactivation
        const extensionChangedDisposable = vscode.extensions.onDidChange(() => {
            const copilotExtension = vscode.extensions.getExtension('GitHub.copilot-chat');
            if (copilotExtension && copilotExtension.isActive) {
                console.log('Copilot Chat extension state changed - now active');
                // Potential completion event
                setTimeout(() => {
                    if (this.isMonitoring && this.configManager.isEnabled()) {
                        console.log('ↁETriggering completion notification due to extension state change');
                        this.onCompletionDetected(NotificationType.TASK_COMPLETE);
                    }
                }, 1000);
            }
        });
        
        // Monitor clipboard changes (Copilot might copy text)
        const clipboardMonitoring = setInterval(async () => {
            if (!this.isMonitoring) return;
            
            try {
                const clipboardText = await vscode.env.clipboard.readText();
                if (clipboardText && clipboardText.length > 100) {
                    // Check if clipboard content looks like Copilot-generated
                    if (this.looksLikeGeneratedCode(clipboardText) || this.looksLikeCopilotExplanation(clipboardText)) {
                        console.log('Potential Copilot content detected in clipboard');
                        // Don't trigger immediately as this might be user copying
                    }
                }
            } catch (error) {
                // Clipboard access might fail, ignore
            }
        }, 5000);
        
        // Monitor workspace changes (new files might be Copilot-generated)
        const workspaceDisposable = vscode.workspace.onDidCreateFiles((e) => {
            console.log(`New files created: ${e.files.length}`);
            e.files.forEach(file => {
                console.log(`  - ${file.fsPath}`);
            });
            
            if (e.files.length > 0) {
                console.log('ↁENew files detected, potential Copilot activity');
                setTimeout(() => {
                    if (this.isMonitoring && this.configManager.isEnabled()) {
                        this.scheduleCompletionNotification(NotificationType.TASK_COMPLETE, 'New file creation');
                    }
                }, 2000);
            }
        });
        
        this.disposables.push(extensionChangedDisposable, workspaceDisposable);
        
        // Store interval for cleanup
        this.disposables.push({
            dispose: () => {
                if (clipboardMonitoring) {
                    clearInterval(clipboardMonitoring);
                }
            }
        });
        
        // Try to register command interceptors (if possible)
        this.attemptCommandInterception();
    }

    private attemptCommandInterception(): void {
        // Attempt to detect when Copilot-related commands are executed
        // This is experimental and may not work in all scenarios
        
        try {
            // Common Copilot Chat commands to monitor
            const copilotCommands = [
                'github.copilot.chat.open',
                'github.copilot.chat.sendMessage',
                'github.copilot.chat.clearHistory',
                'workbench.action.chat.openChat'
            ];
            
            copilotCommands.forEach(commandId => {
                // We can't directly intercept commands, but we can register similar ones
                // This is more of a detection strategy
                console.log(`Monitoring for command: ${commandId}`);
            });
            
            // Alternative: Monitor VS Code logs or output channels
            this.monitorOutputChannels();
            
        } catch (error) {
            console.error('Command interception setup failed:', error);
        }
    }

    private monitorOutputChannels(): void {
        // Monitor VS Code output channels for Copilot activity
        try {
            // Check if there are any Copilot-related output channels
            // This is a passive monitoring approach
            
            setTimeout(() => {
                // Periodically check for Copilot activity indicators
                this.checkCopilotOutputChannels();
            }, 5000);
            
        } catch (error) {
            console.error('Output channel monitoring setup failed:', error);
        }
    }

    private checkCopilotOutputChannels(): void {
        // **重褁E��声防止のため、ランダム検�Eを完�E無効匁E*
        if (!this.isMonitoring) {
            return;
        }
        
        try {
            // 実際のアウト�EチE��チャンネル監視�Eみ実行（ランダム検�Eは削除�E�E
            console.log('Checking for genuine Copilot output activity...');
            
            // ランダム検�Eを削除して重褁E��声を防止
            // 実際のCopilot活動�Eみを検�EするべぁE
            
        } catch (error) {
            console.error('Error checking Copilot output channels:', error);
        }
        
        if (this.isMonitoring) {
            // **30秒間隔に延長してスパムを防止**
            setTimeout(() => {
                this.checkCopilotOutputChannels();
            }, 30000); // 30秒間隁E
        }
    }

    private simulateDelayedCompletion(): void {
        // Simulation disabled to prevent false positive notifications
        console.log('Simulation disabled to prevent unwanted notifications');
    }

    private attemptToFindCopilotPanel(): void {
        try {
            // Placeholder implementation
            // In a real implementation, this would:
            // 1. Search for Copilot chat panel in VS Code DOM
            // 2. Set up MutationObserver on the panel
            // 3. Monitor for completion indicators (spinner disappearance, etc.)
            
            console.log('Attempting to find Copilot chat panel...');
            
            // Simulate finding the panel (placeholder)
            if (Math.random() > 0.8) { // 20% chance to simulate finding panel
                console.log('Copilot panel detected (placeholder)');
                this.setupDOMObserver();
            }
        } catch (error) {
            console.error('Error while searching for Copilot panel:', error);
        }
    }

    private setupDOMObserver(): void {
        try {
            // Real DOM observation for Copilot completion detection
            console.log('Setting up advanced DOM observer for Copilot completions...');
            
            // Since VS Code extensions have limited DOM access to other extensions,
            // we'll try to use the global document if available
            if (typeof document !== 'undefined') {
                this.setupAdvancedCopilotDetection();
            } else {
                console.log('Document not available, falling back to event-based detection');
                this.fallbackToEventBasedDetection();
            }
            
        } catch (error) {
            console.error('Failed to set up DOM observer:', error);
            this.fallbackToEventBasedDetection();
        }
    }

    private setupAdvancedCopilotDetection(): void {
        // Try to detect Copilot Chat elements in the DOM
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                this.processCopilotMutation(mutation);
            });
        });

        // Observe the entire document for changes
        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class', 'data-*', 'aria-*']
        });

        console.log('Advanced Copilot detection setup complete');
    }

    private processCopilotMutation(mutation: MutationRecord): void {
        // Look for Copilot-specific changes
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node as Element;
                    
                    // Check for Copilot completion indicators
                    if (this.isCopilotCompletionElement(element)) {
                        console.log('Copilot completion detected via DOM mutation');
                        this.onCompletionDetected(NotificationType.TASK_COMPLETE);
                    }
                    
                    // Check for Copilot error indicators
                    if (this.isCopilotErrorElement(element)) {
                        console.log('Copilot error detected via DOM mutation');
                        this.onCompletionDetected(NotificationType.TASK_COMPLETE);
                    }
                }
            });
        }
        
        // Check for attribute changes that might indicate completion
        if (mutation.type === 'attributes') {
            const element = mutation.target as Element;
            if (this.isCopilotRelatedElement(element)) {
                const attributeName = mutation.attributeName;
                
                // Check for loading state changes
                if (attributeName === 'class' || attributeName === 'aria-busy') {
                    if (this.hasCompletionStateChanged(element)) {
                        console.log('Copilot completion detected via attribute change');
                        this.onCompletionDetected(NotificationType.TASK_COMPLETE);
                    }
                }
            }
        }
    }

    private isCopilotCompletionElement(element: Element): boolean {
        // Look for patterns that indicate Copilot message completion
        const classList = element.classList;
        const textContent = element.textContent || '';
        
        // Common patterns in Copilot Chat UI
        const copilotPatterns = [
            /copilot.*message/i,
            /chat.*message/i,
            /assistant.*response/i,
            /streaming.*complete/i
        ];
        
        // Check class names
        for (let i = 0; i < classList.length; i++) {
            const className = classList[i];
            if (copilotPatterns.some(pattern => pattern.test(className))) {
                return true;
            }
        }
        
        // Check data attributes
        const dataAttributes = Array.from(element.attributes)
            .filter(attr => attr.name.startsWith('data-'))
            .map(attr => attr.value);
            
        for (const value of dataAttributes) {
            if (copilotPatterns.some(pattern => pattern.test(value))) {
                return true;
            }
        }
        
        return false;
    }

    private isCopilotErrorElement(element: Element): boolean {
        // Look for error indicators in Copilot UI
        const classList = element.classList;
        const textContent = element.textContent || '';
        
        return classList.contains('error') || 
               classList.contains('copilot-error') ||
               textContent.includes('Error') ||
               textContent.includes('Failed');
    }

    private isCopilotRelatedElement(element: Element): boolean {
        // Check if element is related to Copilot Chat
        const classList = element.classList;
        const id = element.id;
        
        const copilotIndicators = [
            'copilot',
            'chat',
            'assistant',
            'github-copilot'
        ];
        
        return copilotIndicators.some(indicator => 
            classList.toString().toLowerCase().includes(indicator) ||
            id.toLowerCase().includes(indicator)
        );
    }

    private hasCompletionStateChanged(element: Element): boolean {
        // Check if the element indicates a completion state change
        const classList = element.classList;
        const ariaBusy = element.getAttribute('aria-busy');
        
        // Loading spinner disappeared
        if (!classList.contains('loading') && !classList.contains('spinning')) {
            return true;
        }
        
        // Aria-busy changed to false
        if (ariaBusy === 'false') {
            return true;
        }
        
        return false;
    }

    private fallbackToEventBasedDetection(): void {
        // Fallback to event-based detection when DOM observation isn't available
        console.log('Using fallback event-based Copilot detection');
        
        // Continue with existing simulation for now
        this.simulateCompletionDetection();
        
        // Add comprehensive logging for any text changes
        console.log('Enabling comprehensive text change logging for debugging');
    }

    private simulateCompletionDetection(): void {
        // Simple test mechanism to verify detection is working
        console.log('Setting up test completion detection mechanism');
        
        // Create a test mechanism that triggers when user types "test copilot" in any editor
        const testDisposable = vscode.workspace.onDidChangeTextDocument((e) => {
            console.log('=== TEXT DOCUMENT CHANGE EVENT DETECTED ===');
            console.log(`Document: ${e.document.fileName}`);
            console.log(`Content changes count: ${e.contentChanges.length}`);
            
            if (e.contentChanges.length > 0) {
                const change = e.contentChanges[0];
                const changeText = change.text;
                console.log(`Change text: "${changeText}"`);
                console.log(`Change length: ${changeText.length}`);
                
                // Test trigger for any text containing "test" (DISABLED - debug only)
                // if (changeText.toLowerCase().includes('test')) {
                //     console.log('🔥 TEST TRIGGER DETECTED: "test" phrase found');
                //     console.log('ↁETriggering test completion notification');
                //     this.scheduleCompletionNotification(NotificationType.TASK_COMPLETE, 'Test trigger activated');
                // }
                
                // Test trigger for "copilot" (DISABLED - debug only)
                // This was for testing purposes - real Copilot detection uses other methods
                // if (changeText.toLowerCase().includes('copilot')) {
                //     console.log('🔥 COPILOT TRIGGER DETECTED: "copilot" phrase found');
                //     console.log('ↁETriggering copilot test notification');
                //     this.scheduleCompletionNotification(NotificationType.TASK_COMPLETE, 'Copilot test trigger');
                // }
                
                // Test trigger for any change over 5 characters (DISABLED - too sensitive)
                // This was causing too many false positives during normal typing
                // if (changeText.length > 5) {
                //     console.log(`🔥 MEDIUM TEXT CHANGE: ${changeText.length} characters`);
                //     console.log(`Text preview: "${changeText.substring(0, 50)}..."`);
                //     this.scheduleCompletionNotification(NotificationType.TASK_COMPLETE, 'Medium text change');
                // }
                
                // Also trigger on large pastes (might be from Copilot Chat)
                if (changeText.length > 200) {
                    console.log(`🔥 LARGE PASTE DETECTED: ${changeText.length} characters`);
                    console.log('ↁETriggering notification for large paste');
                    this.scheduleCompletionNotification(NotificationType.TASK_COMPLETE, 'Large text paste');
                }
                
                // Log every single character change for debugging
                console.log(`All text changes: "${changeText.replace(/\n/g, '\\n')}"`);
            } else {
                console.log('No content changes in this event');
            }
        });
        
        this.disposables.push(testDisposable);
        
        // Disable periodic test notifications to stop random audio
        console.log('Periodic test notifications disabled - focusing on text change detection');
    }

    private async onCompletionDetected(type: NotificationType): Promise<void> {
        try {
            const currentTime = Date.now();
            
            // Check if we're still in cooldown period
            if (currentTime - this.lastNotificationTime < this.notificationCooldownMs) {
                console.log(`Copilot completion detected (${type}) but within cooldown period - skipping`);
                return;
            }
            
            // Cancel any pending notification
            if (this.pendingNotification) {
                clearTimeout(this.pendingNotification);
                this.pendingNotification = null;
            }
            
            console.log(`Copilot completion detected: ${type}`);
            
            // Update last notification time
            this.lastNotificationTime = currentTime;
            
            // Play the notification
            await this.audioManager.playCompletionSound(type);
            
        } catch (error) {
            console.error('Failed to play completion notification:', error);
        }
    }

    // Methods for detecting different completion states
    private isLoadingSpinnerDisappeared(mutation: MutationRecord): boolean {
        // Placeholder implementation
        // In real implementation, check for loading spinner removal
        return false;
    }

    private isStopButtonDisappeared(mutation: MutationRecord): boolean {
        // Placeholder implementation  
        // In real implementation, check for "Stop generating" button removal
        return false;
    }

    private isNewMessageAppeared(mutation: MutationRecord): boolean {
        // Placeholder implementation
        // In real implementation, check for new message containers
        return false;
    }

    private isErrorStateDetected(mutation: MutationRecord): boolean {
        // Placeholder implementation
        // In real implementation, check for error indicators
        return false;
    }

    dispose(): void {
        this.isMonitoring = false;
        
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }

        if (this.retryInterval) {
            clearInterval(this.retryInterval);
            this.retryInterval = null;
        }

        // Cancel any pending notifications
        if (this.pendingNotification) {
            clearTimeout(this.pendingNotification);
            this.pendingNotification = null;
        }

        // Dispose all registered disposables
        this.disposables.forEach(disposable => {
            try {
                disposable.dispose();
            } catch (error) {
                console.error('Error disposing resource:', error);
            }
        });
        this.disposables = [];

        console.log('Copilot Monitor disposed');
    }
}
