import * as vscode from 'vscode'
import axios from 'axios'

import config from './config'

/**
 * Returns the handler for the `go-playground.format` command.
 *
 * @returns Handler for the command
 */
export function formatCommandHandler(): (() => any) {
    return async () => {
		// Get the active text editor
		const editor = vscode.window.activeTextEditor
		if (!editor) {
			return
		}

		try {
			// Get the full text
			const text = editor.document.getText()
			if (!text) {
				throw Error('Cannot format an empty file!')
			}

			// Request body
			const body = new URLSearchParams({
				body: text,
				imports: "true"
			})
	
			// Make the request
			const res = await axios({
				url: config.config.playgroundUrl + '/fmt',
				method: 'POST',
				responseType: 'json',
				data: body
			})
			const data = res.data as FormatResponse
			if (!data || data.Error) {
				throw Error(data?.Error || 'Unknown error')
			}
			if (data.Body) {
				const ok = await editor.edit((editBuilder) => {
					const firstLine = editor.document.lineAt(0)
					const lastLine = editor.document.lineAt(editor.document.lineCount - 1)
					const range = new vscode.Range(firstLine.range.start, lastLine.range.end)
					editBuilder.replace(range, data.Body)
				})
				if (!ok) {
					throw Error('Failed to edit document')
				}
			}
		}
		catch (err) {
			vscode.window.showErrorMessage('Error while formatting the document:\n' + err)
		}
	}
}
