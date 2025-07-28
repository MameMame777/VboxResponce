import * as vscode from 'vscode';

export interface NotificationConfig {
    voiceCharacter: string;
    volume: number;
    enableStartupGreeting: boolean;
    randomChatInterval: number;
}

export class ConfigurationManager {
    private static readonly CONFIG_SECTION = 'voicevoxCompanion';

    getConfiguration(): NotificationConfig {
        const config = vscode.workspace.getConfiguration(ConfigurationManager.CONFIG_SECTION);
        
        return {
            voiceCharacter: config.get<string>('voiceCharacter', 'zundamon'),
            volume: config.get<number>('volume', 0.7),
            enableStartupGreeting: config.get<boolean>('enableStartupGreeting', true),
            randomChatInterval: config.get<number>('randomChatInterval', 30)
        };
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
