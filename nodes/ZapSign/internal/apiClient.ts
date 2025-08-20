import type { IExecuteFunctions, IRequestOptions, IDataObject } from 'n8n-workflow';

/**
 * Thin wrapper around n8n authenticated requests that returns JSON (object or array).
 */
export async function requestJson(
    ctx: IExecuteFunctions,
    options: IRequestOptions,
): Promise<IDataObject | IDataObject[]> {
    const res = await ctx.helpers.requestWithAuthentication.call(ctx, 'zapSignApi', options);
    if (typeof res === 'string') {
        try {
            return JSON.parse(res as string) as IDataObject | IDataObject[];
        } catch {
            return { raw: res } as unknown as IDataObject;
        }
    }
    return res as IDataObject | IDataObject[];
}

/**
 * Push result helper that accepts single object or array and appends to accumulator.
 */
export function pushResult(
    accumulator: IDataObject[],
    data: IDataObject | IDataObject[],
): void {
    if (Array.isArray(data)) {
        accumulator.push(...(data as IDataObject[]));
    } else {
        accumulator.push(data as IDataObject);
    }
}

