declare interface Option{
  name?: string,
  cwd?: string
}

export function find(option?: Option): Promise<string>;
export function load(bindings: string): unknown;
export function dlopen(option?: Option): Promise<unknown>;