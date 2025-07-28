import * as vscode from 'vscode';

export interface NotificationConfig {
    enabled: boolean;
    voiceCharacter: string;
    volume: number;
    notificationDelay: number;
    enableForErrors: boolean;
    randomTaskComplete: boolean;
    filterManualEdits: boolean;
}

export class ConfigurationManager {
    private static readonly CONFIG_SECTION = 'voicevox-copilot';

    getConfiguration(): NotificationConfig {
        const config = vscode.workspace.getConfiguration(ConfigurationManager.CONFIG_SECTION);
        
        return {
            enabled: config.get<boolean>('enabled', true),
            voiceCharacter: config.get<string>('voiceCharacter', 'zundamon'),
            volume: config.get<number>('volume', 0.7),
            notificationDelay: config.get<number>('notificationDelay', 500),
            enableForErrors: config.get<boolean>('enableForErrors', true),
            randomTaskComplete: config.get<boolean>('randomTaskComplete', true),
            filterManualEdits: config.get<boolean>('filterManualEdits', true)
        };
    }

    isEnabled(): boolean {
        return this.getConfiguration().enabled;
    }

    toggleEnabled(): boolean {
        const config = vscode.workspace.getConfiguration(ConfigurationManager.CONFIG_SECTION);
        const currentValue = config.get<boolean>('enabled', true);
        const newValue = !currentValue;
        
        config.update('enabled', newValue, vscode.ConfigurationTarget.Global);
        return newValue;
    }

    refresh(): void {
        // Configuration is automatically refreshed when workspace configuration changes
        const config = this.getConfiguration();
        console.log('Configuration refreshed:', config);
    }

    getSpeakerId(voiceCharacter: string): number {
        const speakerMap: { [key: string]: number } = {
            'zundamon': 3,   // ずんだもん ノーマル
            'metan': 2,      // 四国めたん ノーマル
            'tsumugi': 8,    // 春日部つむぎ ノーマル
            'kiritan': 108   // 東北きりたん ノーマル
        };
        
        return speakerMap[voiceCharacter] || 3;
    }
}
