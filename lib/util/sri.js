/*
Copyright (c) Anthony Beaumont
This source code is licensed under the MIT License
found in the LICENSE file in the root directory of this source tree.
*/

import { basename } from "node:path";
import { hashFile } from "@xan105/fs";
import { Failure } from "@xan105/error";

export async function verify(filePath, integrity){
  const [ algo, expected ] = integrity.split("-");
  const hash = await hashFile(filePath, { algo, base64: true });
  if(hash !== expected){
    throw new Failure("The file's hash does not match the provided Subresource Integrity", {
      code: "ERR_INTEGRITY",
      info : { path: basename(filePath), algo, hash }
    });
  }  
}