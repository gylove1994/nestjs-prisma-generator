import { strings } from "@angular-devkit/core";
import type { Model, Schema } from "@mrleebo/prisma-ast";
import { mkFile } from "./utils/mkFile";

export function generateNestModule(prisma: Schema) {
	const entityList = prisma.list
		.filter((item) => item.type === "model")
		.map((item) => {
			const entity = item as Model;
			return {
				name: strings.camelize(entity.name),
				content: `\n
import { Module } from '@nestjs/common';\n
import { ${entity.name}Controller } from './${strings.camelize(entity.name)}.controller';\n
import { ${entity.name}Service } from './${strings.camelize(entity.name)}.service';\n\n
@Module({
    controllers: [${entity.name}Controller],
    providers: [${entity.name}Service],
})
export class ${entity.name}Module {}\n
`,
			};
		});
	return entityList;
}

export function generateNestModuleFile(
	prisma: Schema,
	outputPath: string,
	dryRun: boolean,
) {
	const entityList = generateNestModule(prisma);
	for (const entity of entityList) {
		mkFile(
			`${outputPath}/${entity.name}`,
			`${entity.name}.module.ts`,
			entity.content,
			dryRun,
		);
	}
}
