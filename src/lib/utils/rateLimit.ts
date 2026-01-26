interface RateLimitConfig {
    initialConcurrency?: number;
    minConcurrency?: number;
    maxConcurrency?: number;
    retryDelay?: number;
    backoffMultiplier?: number;
}

interface Task<T> {
    fn: () => Promise<T>;
    resolve: (value: T) => void;
    reject: (error: any) => void;
}

export class RateLimitHandler {
    private concurrency: number;
    private minConcurrency: number;
    private maxConcurrency: number;
    private retryDelay: number;
    private backoffMultiplier: number;
    private queue: Task<any>[] = [];
    private running = 0;
    private rateLimitHits = 0;
    private successfulRequests = 0;

    constructor(config: RateLimitConfig = {}) {
        this.concurrency = config.initialConcurrency || 5;
        this.minConcurrency = config.minConcurrency || 1;
        this.maxConcurrency = config.maxConcurrency || 10;
        this.retryDelay = config.retryDelay || 1000;
        this.backoffMultiplier = config.backoffMultiplier || 1.5;
    }

    /**
     * Execute tasks with rate limit handling
     */
    async executeBatch<T>(tasks: (() => Promise<T>)[]): Promise<T[]> {
        const promises = tasks.map((task) => this.execute(task));
        return Promise.all(promises);
    }

    /**
     * Execute a single task with rate limit handling
     */
    private execute<T>(fn: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.queue.push({ fn, resolve, reject });
            this.processQueue();
        });
    }

    private async processQueue(): Promise<void> {
        if (this.running >= this.concurrency || this.queue.length === 0) {
            return;
        }

        const task = this.queue.shift();
        if (!task) return;

        this.running++;

        try {
            const result = await this.executeWithRetry(task.fn);
            this.successfulRequests++;

            // Gradually increase concurrency on success
            if (this.successfulRequests % 10 === 0 && this.concurrency < this.maxConcurrency) {
                this.concurrency = Math.min(this.concurrency + 1, this.maxConcurrency);
            }

            task.resolve(result);
        } catch (error) {
            task.reject(error);
        } finally {
            this.running--;
            this.processQueue();
        }
    }

    private async executeWithRetry<T>(fn: () => Promise<T>, attempt = 1): Promise<T> {
        try {
            return await fn();
        } catch (error: any) {
            const isRateLimit = this.isRateLimitError(error);

            if (isRateLimit) {
                this.rateLimitHits++;
                await this.handleRateLimit(attempt);
                return this.executeWithRetry(fn, attempt + 1);
            }

            throw error;
        }
    }

    private isRateLimitError(error: any): boolean {
        // Check for common rate limit indicators
        if (error?.status === 429) return true;
        if (error?.statusCode === 429) return true;
        if (error?.message?.toLowerCase().includes("rate limit")) return true;
        if (error?.message?.toLowerCase().includes("too many requests")) return true;
        return false;
    }

    private async handleRateLimit(attempt: number): Promise<void> {
        // Reduce concurrency
        this.concurrency = Math.max(Math.floor(this.concurrency / 2), this.minConcurrency);

        // Calculate wait time with exponential backoff
        const waitTime = this.retryDelay * Math.pow(this.backoffMultiplier, attempt - 1);

        console.log(
            `Rate limit hit (attempt ${attempt}). ` + `Reducing concurrency to ${this.concurrency}. ` + `Waiting ${waitTime}ms before retry...`,
        );

        await this.sleep(waitTime);
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    getStats() {
        return {
            currentConcurrency: this.concurrency,
            rateLimitHits: this.rateLimitHits,
            successfulRequests: this.successfulRequests,
            queueLength: this.queue.length,
            running: this.running,
        };
    }
}

/**
 * Execute tasks in batches with rate limit handling
 */
export async function executeWithRateLimit<T, R>(items: T[], processor: (item: T) => Promise<R>, config?: RateLimitConfig): Promise<R[]> {
    const handler = new RateLimitHandler(config);
    const tasks = items.map((item) => () => processor(item));
    return handler.executeBatch(tasks);
}
