About
=====

Integrate native code into Node.js:

- [N-API] Native addon module with prebuild support
- [WASI] WebAssembly System Interface

This library helps dealing with finding and loading your bindings.

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

Prebuild (Node-gyp)
===================

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

API
===

⚠️ This module is only available as an ECMAScript module (ESM).<br />

## Named export

### `dlopen(filePath: string, option?: object): Promise<unknown>`

Find and load specified filePath based on its extention (.node, .wasm, ...).

- When loading NAPI addons, if you only provide the bindings name (basename) this will automatically search the bindings in known locations such as `build/Release`, relative to the current working dir. You can change this directory using the `cwd` option.

- When loading WASI addons, you can specify the WASI version with the option `version`.

** ⚙️ Options **

+ `cwd?: string` (current working dir)

  Current working dir where the node bindings is searched for.

+ `version?: string` (preview1)

  WASI version. Currently only `unstable` and `preview1` are available.

+ `integrity?: string` (none)

  Verify the addon hash against specified Subresource Integrity (SRI) string (eg: sha384-base64...).
  
  In case of NAPI gyp compilation _(= no prebuild)_ this check is skipped.

## NAPI Namespace

### `find(module: string, cwd: string): { path: string, isPrebuild: boolean }`

Find node bindings by searching in known locations such as `build/Release`, relative to the specified current working dir.

### `load(filePath: string): unknown`

Load specified node bindings.

## WASI Namespace

### `const VERSION: string[]`

WASI version available.

### `load(filePath: string, version: string): Promise<unknown>`

Load specified WASI addon.