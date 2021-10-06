import * as vscode from 'vscode'
import axios from 'axios'

import {timeoutPromise} from './utils'

/**
 * Returns the handler for the `go-playground.run` command.
 *
 * @param config Configuration object
 * @param outputCh Output channel where to send output
 * @returns Handler for the command
 */
export function runCommandHandler(config: ExtensionConfig, outputCh: vscode.OutputChannel): (() => any) {
    return async () => {
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
				url: config.playgroundUrl + '/compile',
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
	}
}
