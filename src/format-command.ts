import * as vscode from 'vscode'
import axios from 'axios'

import config from './config'

/**
 * Returns the handler for the `go-playground.format` command.
 *
 * Note: [against the recommendations](https://code.visualstudio.com/blogs/2016/11/15/formatters-best-practices), this doesn't use the official formatter APIs and this was a deliberate choice.
 * The formatter APIs have additional benefits such as the ability to perform "format on save", but that is not appropriate for a playground like this: given how every formatting operation involves making an external API call, it's probably best not to enable those behaviors.
 * Additionally, if the official Go extension is available, this extension should not be used to format Go code: a local formatter is absolutely a better option, in all cases. Detect if the Go extension is installed and disable this formatter is not possible: this extension runs in the web extension host so it has no way to know if the Go extension (which runs in the Node.js extension host) is installed (it doesn't appear in the `vscode.extensions.all` array, and hacky things like checking if a command such as `go.gopath` can be invoked are unreliable because they depend on the order extensions are instantiated). Restricting the availability of the formatter to the web platform only doesn't seem right, in case the Go extension eventually gets updated to run on the web, and in case someone wants to use Go Playground on the desktop without having the Go extension installed (which is arguably odd, but not impossible).
 * TL;DR: "Do as I say, not as I do."
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
