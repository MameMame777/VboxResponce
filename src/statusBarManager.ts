import * as vscode from 'vscode';

export class StatusBarManager implements vscode.Disposable {
    private statusBarItem: vscode.StatusBarItem;

    constructor() {
        console.log('StatusBarManager: Creating status bar item');
        try {
            this.statusBarItem = vscode.window.createStatusBarItem(
                vscode.StatusBarAlignment.Right,
                100
            );
            
            this.statusBarItem.command = 'voicevox-copilot.toggle';
            this.statusBarItem.text = '🔊 VoiceVox';
            this.statusBarItem.tooltip = 'Click to toggle VoiceVox notifications';
            
            console.log('StatusBarManager: About to show status bar item');
            this.statusBarItem.show();
            console.log('StatusBarManager: Status bar item created and shown successfully');
            console.log(`StatusBarManager: Status bar text: ${this.statusBarItem.text}`);
        } catch (error) {
            console.error('StatusBarManager: Error creating status bar item:', error);
            throw error;
        }
    }

    updateStatus(enabled: boolean): void {
        console.log(`StatusBarManager: Updating status to ${enabled ? 'enabled' : 'disabled'}`);
        if (enabled) {
            this.statusBarItem.text = '🔊 VoiceVox';
            this.statusBarItem.backgroundColor = undefined;
            this.statusBarItem.tooltip = 'VoiceVox notifications enabled - Click to disable';
        } else {
            this.statusBarItem.text = '🔇 VoiceVox';
            this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
            this.statusBarItem.tooltip = 'VoiceVox notifications disabled - Click to enable';
        }
        console.log(`StatusBarManager: Status updated - Text: ${this.statusBarItem.text}`);
    }

    showActivity(): void {
        const originalText = this.statusBarItem.text;
        this.statusBarItem.text = '$(loading~spin) VoiceVox';
        
        setTimeout(() => {
            this.statusBarItem.text = originalText;
        }, 2000);
    }

    dispose(): void {
        this.statusBarItem.dispose();
    }
}
