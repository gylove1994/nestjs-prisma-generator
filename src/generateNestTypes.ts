import { strings } from "@angular-devkit/core";
import type { Schema } from "@mrleebo/prisma-ast";
import { mkFile } from "./utils/mkFile";
//{_@modelName@_}FindAllResponse,
//{_@modelName@_}FindOneResponse,
//{_@modelName@_}CreateResponse,
//{_@modelName@_}UpdateResponse,
//{_@modelName@_}DeleteResponse

const typeTemplate = `import { ApiProperty } from '@nestjs/swagger';\n
export class {_@modelNameCapitalize@_}FindAllResponse {}\n
export class {_@modelNameCapitalize@_}FindOneResponse {}\n
export class {_@modelNameCapitalize@_}CreateResponse {}\n
export class {_@modelNameCapitalize@_}UpdateResponse {}\n
export class {_@modelNameCapitalize@_}ListResponse {}\n
export class {_@modelNameCapitalize@_}DeleteResponse {
  @ApiProperty({
    description: "删除结果",
  })
  data = "success"
}\n
`;

export function generateNestTypes(prisma: Schema) {
	const modelList = prisma.list
		.filter((item) => item.type === "model")
		.map((item) => {
			const name = item.name;
			const content = typeTemplate.replaceAll(
				/{_@modelNameCapitalize@_}/g,
				strings.capitalize(name),
			);
			return {
				name: strings.camelize(name),
				content,
			};
		});
	return modelList;
}

export function generateNestTypesFile(
	prisma: Schema,
	outputPath: string,
	dryRun: boolean,
) {
	const modelList = generateNestTypes(prisma);
	for (const model of modelList) {
		const { name, content } = model;
		mkFile(`${outputPath}/${name}`, `${name}.types.ts`, content, dryRun);
	}
}
