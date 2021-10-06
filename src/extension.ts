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

	// Create the status bar items to run and format
	const runStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left)
	runStatusBarItem.command = 'go-playground.run'
	runStatusBarItem.text = '$(repl) Go: Run file'
	context.subscriptions.push(runStatusBarItem)
	const formatStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left)
	formatStatusBarItem.command = 'go-playground.format'
	formatStatusBarItem.text = '$(zap) Go: Format'
	context.subscriptions.push(formatStatusBarItem)

	// Show or hide status bar items depending on active editor
	const updateStatusBarItems = (editor?: vscode.TextEditor) => {
		if (editor?.document?.languageId == 'go') {
			runStatusBarItem.show()
			formatStatusBarItem.show()
		} else {
			runStatusBarItem.hide()
			formatStatusBarItem.hide()
		}
	}
	updateStatusBarItems(vscode.window.activeTextEditor)
	context.subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(updateStatusBarItems)
	)
}

export function deactivate() {}
