/**
 * Returns a Promise that resolves after a delay.
 * 
 * @param delay Delay, in ms
 * @returns Promise that resolves (with no value) after the delay
 */
export function timeoutPromise(delay: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, delay)
	})
}
