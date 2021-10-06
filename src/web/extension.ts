import * as vscode from 'vscode'
import axios from 'axios'

export function activate(context: vscode.ExtensionContext) {

	let outputCh = vscode.window.createOutputChannel('Go Playground')
	context.subscriptions.push(outputCh)

	let runCommand = vscode.commands.registerCommand('go-playground.run', async () => {
		// Get the active text editor
		const editor = vscode.window.activeTextEditor
		if (!editor) {
			return
		}

		// Clear and show the output channel
		outputCh.clear()
		outputCh.show()

		try {
			// Get the full text
			const text = editor.document.getText()
			if (!text) {
				throw Error('Cannot run an empty file!')
			}

			// Request body
			const body = new URLSearchParams({
				version: "2",
				withVet: "true",
				body: text,
			})

			// Make the request
			const res = await axios({
				url: 'https://play.golang.org/compile',
				method: 'POST',
				responseType: 'json',
				data: body
			})
			const data = res.data as RunResponse
			if (!data || data.Errors) {
				throw Error(data?.Errors || 'Unknown error')
			}
			console.log(data.Events)
			for (let i = 0; i < data.Events.length; i++) {
				const event = data.Events[i]

				// Delay if needed
				if (event.Delay > 0) {
					await timeoutPromise(event.Delay / 1000000)
				}

				// This doesn't seem to be supported in VS Code for now, the "clear" doesn't work like we need it to and only the last message survives
				/*// If the message starts with \x0C, clear the screen
				if (event.Message.length && event.Message.charAt(0) === '\x0C') {
					outputCh.clear()
					event.Message = event.Message.slice(1)
				}*/

				outputCh.append(event.Message)
			}
		}
		catch (err) {
			vscode.window.showErrorMessage('Error while running the code:\n' + err)
		}
	})
	context.subscriptions.push(runCommand)

	let formatCommand = vscode.commands.registerCommand('go-playground.format', async () => {
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
				url: 'https://play.golang.org/fmt',
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
	})
	context.subscriptions.push(formatCommand)
}

export function deactivate() {}

function timeoutPromise(delay: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, delay)
	})
}

/* eslint-disable @typescript-eslint/naming-convention */
interface RunResponse {
	Errors: string
	Events: RunResponseEvent[]
	Status: number
	VetOK: boolean
}
interface RunResponseEvent {
	Delay: number
	Kind: 'stdout'|'stderr'
	Message: string
}
interface FormatResponse {
	Error: string
	Body: string
}
/* eslint-enable @typescript-eslint/naming-convention */
