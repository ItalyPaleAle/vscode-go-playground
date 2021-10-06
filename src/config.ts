import * as vscode from 'vscode'

class Config {
    config: ExtensionConfig

    constructor() {
        // Set default config
        this.config = {
            playgroundUrl: 'https://play.golang.org'
        }
    }

    init(context: vscode.ExtensionContext) {
        // Load the config
        this.config = this._loadConfig()

        // Reload the configuration if it's changed
        context.subscriptions.push(
            vscode.workspace.onDidChangeConfiguration(() => {
                this.config = this._loadConfig()
            })
        )
    }

    _loadConfig(): ExtensionConfig {
        const configObj = vscode.workspace.getConfiguration('go-playground')

        // playgroundUrl
        let playgroundUrl = configObj.get('playgroundUrl') as string
        if (!playgroundUrl) {
            playgroundUrl = 'https://play.golang.org'
        } else if (playgroundUrl.charAt(playgroundUrl.length - 1) === '/') {
            playgroundUrl = playgroundUrl.slice(0, -1)
        }

        return {
            playgroundUrl
        }
    }
}

// Export a singleton of the Config class
const config = new Config()
export default config
