import * as vscode from 'vscode'

import {runCommandHandler} from './run-command'
import {formatCommandHandler} from './format-command'

function loadConfig(): ExtensionConfig {
	const config = vscode.workspace.getConfiguration('go-playground')

	// playgroundUrl
	let playgroundUrl = config.get('playgroundUrl') as string
	if (!playgroundUrl) {
		playgroundUrl = 'https://play.golang.org'
	} else if (playgroundUrl.charAt(playgroundUrl.length - 1) === '/') {
		playgroundUrl = playgroundUrl.slice(0, -1)
	}

	return {
		playgroundUrl
	}
}

export function activate(context: vscode.ExtensionContext) {
	let config = loadConfig()

	// Reload the configuration if it's changed
	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration(() => {
			config = loadConfig()
		})
	)

	// Create an output channel
	const outputCh = vscode.window.createOutputChannel('Go Playground')
	context.subscriptions.push(outputCh)

	// Handle the run command
	context.subscriptions.push(
		vscode.commands.registerCommand('go-playground.run', runCommandHandler(config, outputCh))
	)

	// Handle the format command
	context.subscriptions.push(
		vscode.commands.registerCommand('go-playground.format', formatCommandHandler(config))
	)
}

export function deactivate() {}
