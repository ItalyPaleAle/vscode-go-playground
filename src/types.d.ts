/* eslint-disable @typescript-eslint/naming-convention */

/** Type of the config object containing the extension's configuration */
type ExtensionConfig = {
	// URL of the Go Playground service
	playgroundUrl: string
}

/** Response from the Go Playground run (compile) endpoint */
interface RunResponse {
	Errors: string
	Events: RunResponseEvent[]
	Status: number
	VetOK: boolean
}

/** Interface for the Event property of RunResponse  */
interface RunResponseEvent {
	Delay: number
	Kind: 'stdout'|'stderr'
	Message: string
}

/** Response from the Go Playground format endpoint */
interface FormatResponse {
	Error: string
	Body: string
}
