import * as vscode from 'vscode';
import { AudioManager, NotificationType } from './audioManager';
import { CopilotMonitor } from './copilotMonitor';
import { ConfigurationManager } from './configurationManager';
import { StatusBarManager } from './statusBarManager';

export function activate(context: vscode.ExtensionContext) {
    console.log('VoiceVox Copilot Notifier is now active!');
    console.log('Extension path:', context.extensionPath);
    
    // Also show activation message in VS Code
    vscode.window.showInformationMessage('VoiceVox Copilot Notifier activated!');

    try {
        // Initialize managers
        console.log('Initializing ConfigurationManager...');
        const configManager = new ConfigurationManager();
        
        console.log('Initializing AudioManager...');
        const audioManager = new AudioManager(context.extensionPath, configManager);
        
        console.log('Initializing StatusBarManager...');
        const statusBar = new StatusBarManager();
        
        console.log('Initializing CopilotMonitor...');
        const copilotMonitor = new CopilotMonitor(audioManager, configManager);

        // Set initial status immediately
        console.log('Setting initial status...');
        const isEnabled = configManager.isEnabled();
        console.log('Configuration enabled status:', isEnabled);
        statusBar.updateStatus(isEnabled);

        // Initialize components
        Promise.all([
            audioManager.initialize(),
            copilotMonitor.initialize()
        ]).then(() => {
            console.log('VoiceVox Copilot Notifier initialized successfully');
            statusBar.updateStatus(configManager.isEnabled());
        }).catch(error => {
            console.error('Failed to initialize VoiceVox Copilot Notifier:', error);
            vscode.window.showErrorMessage(
                `VoiceVox Copilot Notifier initialization failed: ${error.message}`
            );
            statusBar.updateStatus(false);
        });

        // Register commands
        const toggleCommand = vscode.commands.registerCommand(
            'voicevox-copilot.toggle',
            () => {
                const wasEnabled = configManager.isEnabled();
                const isEnabled = configManager.toggleEnabled();
                
                statusBar.updateStatus(isEnabled);
                console.log(`VoiceVox toggled: ${wasEnabled} -> ${isEnabled}`);
                
                vscode.window.showInformationMessage(
                    `VoiceVox notifications ${isEnabled ? 'enabled' : 'disabled'}`
                );
            }
        );

        const testCommand = vscode.commands.registerCommand(
            'voicevox-copilot.playTest',
            async () => {
                try {
                    const config = configManager.getConfiguration();
                    console.log('Current configuration for test:', config);
                    
                    await audioManager.playCompletionSound(NotificationType.TASK_COMPLETE);
                    vscode.window.showInformationMessage(
                        `Test sound played successfully (${config.voiceCharacter})`
                    );
                } catch (error) {
                    console.error('Test sound error:', error);
                    vscode.window.showErrorMessage(`Failed to play test sound: ${error}`);
                }
            }
        );

        const replayCommand = vscode.commands.registerCommand(
            'voicevox-copilot.playLastMessage',
            async () => {
                try {
                    await audioManager.playLastNotification();
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to replay notification: ${error}`);
                }
            }
        );

        // Register for disposal
        context.subscriptions.push(
            toggleCommand,
            testCommand, 
            replayCommand,
            statusBar,
            copilotMonitor,
            audioManager
        );

        // Listen for configuration changes
        const configChangeListener = vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('voicevox-copilot')) {
                console.log('Configuration change detected');
                
                // Get old and new configurations for comparison
                const newConfig = configManager.getConfiguration();
                console.log('New configuration:', newConfig);
                
                configManager.refresh();
                audioManager.updateConfiguration();
                statusBar.updateStatus(configManager.isEnabled());
                
                vscode.window.showInformationMessage(
                    `VoiceVox settings updated (Voice: ${newConfig.voiceCharacter})`
                );
            }
        });

        context.subscriptions.push(configChangeListener);

    } catch (error) {
        console.error('Failed to activate VoiceVox Copilot Notifier:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(
            `VoiceVox Copilot Notifier activation failed: ${errorMessage}`
        );
    }
}

export function deactivate() {
    console.log('VoiceVox Copilot Notifier deactivated');
}
