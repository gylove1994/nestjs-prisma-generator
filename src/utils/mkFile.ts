import fs from "fs-extra";

export function mkFile(path: string, fileName: string, content: string) {
  fs.ensureDirSync(path);
  fs.removeSync(`${path}/${fileName}`);
  fs.writeFileSync(`${path}/${fileName}`, content);
}
