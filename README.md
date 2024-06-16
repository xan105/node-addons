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

const bindings = await find({
  name: "target_name", //node-gyp target name
  cwd: import.meta.dirname //where to search (default to current working dir).
});

const nativeModule = load(bindings);
nativeModule.someFn();
//or
const { someFn, someFn2 } = load(bindings);
someFn();
```

Same but in a single call:

```js
import { dlopen } from "node-gyp-load";

const { foo } = await dlopen({
  name: "bar",
  cwd: import.meta.dirname
});

foo();
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

Prebuild(s) are expected to be found in the `prebuild` or `prebuilds` folder.<br />
Organized in subfolders "platform-arch"<br />
They should be n-api native addons with the `.node` file extension.

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

Install script will check for prebuild(s) before building your project with `node-gyp rebuild`.
But you can force compile by doing `npm install --build-from-source`

API
===

⚠️ This module is only available as an ECMAScript module (ESM).<br />

## Named export

### `find(option?: object): Promise<string>`

  Find your native module's .node file (bindings).
 
  ⚙️ Options:
 
  |option|type|default|description|
  |------|----|-------|-----------|
  |name|string|"bindings"|filename (node-gyp target name)|
  |cwd|string|current|where to search|

### `load(bindings: string): unknown`

  Load given bindings path.</br>

### `dlopen(option?: object): Promise<unknown>`

  Shorthand to perform `find()` + `load()` in a single call.