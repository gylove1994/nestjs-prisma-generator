import * as p from "node:path";
import chalk from "chalk";
import fs from "fs-extra";

export let mkFileCount = 0;

export function mkFile(
	path: string,
	fileName: string,
	content: string,
	dryRun = false,
) {
	if (!dryRun) {
		fs.ensureDirSync(path);
		fs.removeSync(`${path}/${fileName}`);
		fs.writeFileSync(`${path}/${fileName}`, content);
	}
	const currentDir = process.cwd();
	const fullPath = p.join(path, fileName);
	const relativePath = `./${p.relative(currentDir, fullPath)}`;
	console.log(chalk.green("CREATE ") + chalk.blue(relativePath));
	mkFileCount++;
}
