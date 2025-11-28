import { supabase } from "$lib/supabase";
import type { RealtimeChannel, RealtimeChannelOptions } from "@supabase/supabase-js";

function camelize(str: string): string {
    return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

// Only camelize the top-level keys of an object and return values as-is (no deep recursion).
function camelizeKeys<T = any>(input: unknown): T {
    if (input === null || input === undefined) return input as T;
    if (Array.isArray(input) || typeof input !== "object") return input as T;
    const obj = input as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
        const camelKey = camelize(key);
        out[camelKey] = obj[key]; // Do not recurse into values: keep nested objects/arrays as-is.
    }
    return out as T;
}

// Create a wrapper around a Supabase Realtime channel that normalizes incoming payload keys (snake_case -> camelCase) automatically before calling event handlers.
// The wrapper returns a Proxy to maintain API compatibility and keep chaining behavior.
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
