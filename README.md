About
=====

**Very simple** native module bindings (.node) ESM loader with prebuild support.

Because already existing solutions are either 
- too complex
- involve 3rd party remote download location
- do not support specifying bindings name (multiple targets in binding.gyp)

⚠️ You are probably better off using the battle-tested already existing solutions.
This was for a very specific need and experimenting with package.json "bin" property.

Usage
=====

## Find/Load bindings

```js
import { find, load } from "node-gyp-load";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const bindings = await find({
  name: "target_name", //node-gyp target name (without ext ".node")
  dir: join(dirname(fileURLToPath(import.meta.url)),"../"), //root dir where to search. (default to ".") 
  prebuild: true //search the folder "prebuilds" (see below for more details)
});

const nativeModule = load(bindings);
//or
const { someFn, someFn2 } = load(bindings);

nativeModule.someFn();
//or
someFn();
```

## Prebuild

Add `node-gyp-load` as an install script to your native project

```json
{
  "scripts": {
    "install": "node-gyp-load"
  }
}
```

Prebuild(s) are expected to be found in the `prebuilds` folder.<br />
Organized in subfolders "platform-arch"<br />
Filename should end with ".napi.node".<br />
And as the name suggests be a n-api native addon.<br />

_Example:_
```
MODULE_PATH/
  -prebuilds/
    -win32-x64/
      -targetname.napi.node
      -targetname2.napi.node
    -win32-ia32/
      -targetname.napi.node
      -targetname2.napi.node
```

Install script will check for prebuild(s) before building your project with `node-gyp rebuild`.
But you can force compile by doing `npm install --build-from-source`

API
===

⚠️ This module is only available as an ECMAScript module (ESM).<br />

## Named export

#### `find(option?: obj): Promise<string>`

 Find your native module's .node file (bindings).
 
 options:
 
 |option|type|default|description|
 |------|----|-------|-----------|
 |name|string|"bindings"|.node filename (node-gyp target name)|
 |dir|string|"."|root dir where to search|
 |prebuild|bool|true|search the "prebuilds" folder or not|

#### `load(bindings: string, flag?: string): any`

  Load given bindings path.</br>
  See [os.constants.dlopen](https://nodejs.org/api/os.html#dlopen%20constants) for flag (default "RTLD_LAZY").
  