import { supabase } from "$lib/supabase";
import type { RealtimeChannel, RealtimeChannelOptions } from "@supabase/supabase-js";

// local camelize utilities
function camelize(str: string): string {
    return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

function camelizeKeys<T = any>(input: unknown): T {
    if (input === null || input === undefined) return input as T;
    if (Array.isArray(input)) {
        return (input as any[]).map((v) => camelizeKeys(v)) as unknown as T;
    }
    if (typeof input === "object") {
        const obj = input as Record<string, unknown>;
        const out: Record<string, unknown> = {};
        for (const key of Object.keys(obj)) {
            const camelKey = camelize(key);
            const value = obj[key];
            out[camelKey] = camelizeKeys(value);
        }
        return out as T;
    }
    return input as T;
}

// Create a wrapper around a Supabase Realtime channel that normalizes incoming payload keys (snake_case -> camelCase) automatically before calling event handlers. The wrapper returns a Proxy to maintain API compatibility and keep chaining behavior.
export function createNormalizedChannel(name: string, options?: RealtimeChannelOptions): RealtimeChannel {
    const channel: any = supabase.channel(name, options);
    const proxy = new Proxy(channel, {
        get(target, prop: string | symbol, receiver) {
            if (prop === "on") {
                return (event: string, opts: any, handler: (payload: any) => void) => {
                    const wrapped = (payload: any) => {
                        // Normalize payload keys in-place for convenience
                        if (payload?.new) payload.new = camelizeKeys(payload.new);
                        if (payload?.old) payload.old = camelizeKeys(payload.old);
                        if (payload?.record) payload.record = camelizeKeys(payload.record);
                        return handler(payload);
                    };
                    // Keep chainability by returning the proxy instead of the underlying channel
                    target.on(event, opts, wrapped);
                    return proxy;
                };
            }
            // Default behavior: forward to underlying channel
            const value = (target as any)[prop];
            if (typeof value === "function") return value.bind(target);
            return value;
        },
    });
    return proxy as RealtimeChannel;
}

export default createNormalizedChannel;
