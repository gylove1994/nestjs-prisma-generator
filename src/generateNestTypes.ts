import { strings } from "@angular-devkit/core";
import type { Schema } from "@mrleebo/prisma-ast";
import { mkFile } from "./utils/mkFile";

const typeTemplate = `import { ApiProperty } from '@nestjs/swagger';\n
{__@useResultDataVo@__}

export class {_@modelNameCapitalize@_}FindAllResponse extends {_@modelNameCapitalize@_}NoRelation {}

export class {_@modelNameCapitalize@_}FindOneResponse extends {_@modelNameCapitalize@_} {}

export class {_@modelNameCapitalize@_}CreateResponse extends {_@modelNameCapitalize@_}NoRelation {}

export class {_@modelNameCapitalize@_}UpdateResponse extends {_@modelNameCapitalize@_}NoRelation {}

export class {_@modelNameCapitalize@_}ListResponse extends {_@modelNameCapitalize@_}NoRelation {}

export class {_@modelNameCapitalize@_}DeleteResponse {
  @ApiProperty({
    description: "删除结果",
  })
  data = "success"
}\n
`;

export function generateNestTypes(prisma: Schema, useResultDataVo: boolean) {
	const modelList = prisma.list
		.filter((item) => item.type === "model")
		.map((item) => {
			const name = item.name;
			const content = typeTemplate
				.replace(
					/{__@useResultDataVo@__}/g,
					useResultDataVo
						? "import { {_@modelNameCapitalize@_}NoRelation, {_@modelNameCapitalize@_} } from '@entity/{_@modelName@_}Entity';"
						: "",
				)
				.replaceAll(/{_@modelNameCapitalize@_}/g, strings.capitalize(name))
				.replaceAll(/{_@modelName@_}/g, strings.camelize(name));
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
	useResultDataVo: boolean,
) {
	const modelList = generateNestTypes(prisma, useResultDataVo);
	for (const model of modelList) {
		const { name, content } = model;
		mkFile(`${outputPath}/${name}`, `${name}.types.ts`, content, dryRun);
	}
}
