/**
 * Request Queue Manager
 * Controls concurrent thumbnail requests to prevent browser blocking and rate limiting
 */

type QueueItem = {
    task: () => Promise<void>;
    priority: boolean;
};

class RequestQueue {
    private queue: QueueItem[] = [];
    private running = 0;
    private readonly maxConcurrent: number;

    constructor(maxConcurrent: number = 6) {
        // Use 6 concurrent requests (safe for most browsers)
        this.maxConcurrent = maxConcurrent;
    }

    /**
     * Add a request to the queue
     * @param task - The async function to execute
     * @param priority - Whether this request should be prioritized
     */
    async add(task: () => Promise<void>, priority: boolean = false): Promise<void> {
        return new Promise((resolve, reject) => {
            const wrappedTask = async () => {
                try {
                    await task();
                    resolve();
                } catch (error) {
                    reject(error);
                } finally {
                    this.running--;
                    this.processNext();
                }
            };

            const item: QueueItem = {
                task: wrappedTask,
                priority,
            };

            // Priority items go to the front
            if (priority) {
                this.queue.unshift(item);
            } else {
                this.queue.push(item);
            }

            this.processNext();
        });
    }

    private processNext(): void {
        if (this.running >= this.maxConcurrent || this.queue.length === 0) {
            return;
        }

        const item = this.queue.shift();
        if (item) {
            this.running++;
            item.task();
        }
    }

    /**
     * Get current queue status (for debugging)
     */
    getStatus() {
        return {
            queued: this.queue.length,
            running: this.running,
            available: this.maxConcurrent - this.running,
        };
    }
}

// Export a singleton instance
export const requestQueue = new RequestQueue(6);
