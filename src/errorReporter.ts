import * as vscode from 'vscode';

export class ErrorReporter {
    private static instance: ErrorReporter;
    private errorCount: Map<string, number> = new Map();
    private maxErrorsPerType = 5;

    static getInstance(): ErrorReporter {
        if (!ErrorReporter.instance) {
            ErrorReporter.instance = new ErrorReporter();
        }
        return ErrorReporter.instance;
    }

    reportError(category: string, error: Error, context?: any): void {
        const errorKey = `${category}:${error.message}`;
        const currentCount = this.errorCount.get(errorKey) || 0;
        
        if (currentCount < this.maxErrorsPerType) {
            console.error(`[${category}] Error:`, error);
            if (context) {
                console.error(`[${category}] Context:`, context);
            }
            
            this.errorCount.set(errorKey, currentCount + 1);
            
            // Show user-friendly error message for critical errors
            if (category === 'AUDIO_CRITICAL' && currentCount === 0) {
                vscode.window.showErrorMessage(
                    `VoiceVox Copilot: ${error.message}`,
                    'Open Settings'
                ).then(selection => {
                    if (selection === 'Open Settings') {
                        vscode.commands.executeCommand('workbench.action.openSettings', 'voicevox-copilot');
                    }
                });
            }
        }
    }

    resetErrorCounts(): void {
        this.errorCount.clear();
    }
}
