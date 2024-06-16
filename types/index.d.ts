declare interface Option{
  name?: string,
  cwd?: string
}

export function find(option?: Option): Promise<string>;
export function load(bindings: string): unknow;
export function dlopen(option?: Option): Promise<unknow>;