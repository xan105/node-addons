declare interface IOption{
  name?: string,
  dir?: string,
  prebuild?: boolean
}

export function find(option?: IOption): Promise<string>;
export function load(bindings: string, flag?: string): any;