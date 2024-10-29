export function find(module: string, cwd: string): Promise<{ path:string, isPrebuild: boolean }>;
export function load(filePath: string): unknown;
