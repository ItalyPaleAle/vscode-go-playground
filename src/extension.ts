import * as vscode from 'vscode'

import {runCommandHandler} from './run-command'
import {formatCommandHandler} from './format-command'
import config from './config'

export function activate(context: vscode.ExtensionContext) {
	// Init the config
	config.init(context)

	// Create an output channel
	const outputCh = vscode.window.createOutputChannel('Go Playground')
	context.subscriptions.push(outputCh)

	// Handle the run command
	context.subscriptions.push(
		vscode.commands.registerCommand('go-playground.run', runCommandHandler(outputCh))
	)

	// Handle the format command
	context.subscriptions.push(
		vscode.commands.registerCommand('go-playground.format', formatCommandHandler())
	)
}

export function deactivate() {}
