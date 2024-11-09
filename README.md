About
=====

ESM loader to integrate native code into Node.js with prebuild support.

This library helps dealing with finding and loading your bindings when using ESM.

Currently supports:

- [ N-API ] Native addon
- [ WASI ] WebAssembly System Interface

📦 Scoped `@xan105` packages are for my own personal use but feel free to use them.

NB: This library was previously named [node-gyp-load](https://www.npmjs.com/package/node-gyp-load)

Example
=======

```js
import { dlopen } from "@xan105/addons";

const { foo } = await dlopen("bar.node", {
  cwd: import.meta.dirname
});

foo();
```

CLI
===

## Prebuild (node-gyp)

Add `addons` as an install script to your native project:

```json
{
  "scripts": {
    "install": "addons"
  }
}
```

Install script will check for prebuild(s) before building your project with `node-gyp rebuild`.<br />
You can force compile by doing `npm install --build-from-source`

Prebuild(s) are expected to be found in the `prebuild` or `prebuilds` folder;<br />
Organized in subfolders "platform-arch".<br />
They should be N-API native addons with the `.node` file extension.

_Example:_
```
MODULE_PATH/
  -prebuilds/
    -win32-x64/
      -targetname.node
      -targetname2.node
    -win32-ia32/
      -targetname.node
      -targetname2.node
```

NB: Install script is also available with its old name `node-gyp-load` for backward compatibility.

## SRI

This library API has an option to verify hash integrity using Subresource Integrity (SRI) string.

As such there is a convenience script named `addons-sri` to generate hash for every `.node` or `.wasm` files in the current working dir _(excluding node_modules)_.

```json
{
  "scripts": {
    "sri": "addons-sri --algo sha384"
  }
}
```

You can specify the algo hash through the `--algo` argument; if omitted it defaults to `sha384`.

API
===

⚠️ This module is only available as an ECMAScript module (ESM).<br />

## Named export

### `dlopen(filePath: string, option?: object): Promise<unknown>`

Find and load specified addon based on its extention (.node, .wasm, ...).

- When loading NAPI addons, if you only provide the bindings name (basename) this will automatically search the bindings in known locations such as `build/Release`, relative to the current working dir. You can change this directory using the `cwd` option.

- When loading WASI addons, you can specify the WASI version with the option `version`.

⚙️ **Options**

+ `cwd?: string` (current working dir)

  Current working dir where the node bindings is searched for.

+ `version?: string` (preview1)

  WASI version. Currently only `unstable` and `preview1` are available.

+ `integrity?: string` (none)

  Verify the addon hash against specified Subresource Integrity (SRI) string (eg: sha384-base64...).
  
  In case of NAPI gyp compilation _(= no prebuild)_ this check is skipped.

## NAPI Namespace

```js
import {} from "@xan105/addons/napi"
```

### `find(module: string, cwd: string): Promise<{ path:string, isPrebuild: boolean }>`

Find node bindings by searching in known locations such as `build/Release`, relative to the specified current working dir.

### `load(filePath: string): unknown`

Load specified node bindings.

## WASI Namespace

```js
import {} from "@xan105/addons/wasi"
```

### `const VERSION: string[]`

WASI version available.

### `load(filePath: string, version: string): Promise<unknown>`

Load specified WASI addon.