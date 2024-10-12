import { strings } from "@angular-devkit/core";
import type { Field, Model, Schema } from "@mrleebo/prisma-ast";
import { createdEnumMap } from "./generateEnum";
import { getRelation } from "./utils/getRelation";
import { importFile, importJsonValue } from "./utils/import";
import { mkFile } from "./utils/mkFile";
import { dtoPropertyMap, paginationDtoPropertyMap } from "./utils/propertyMap";

const dtoTemplate = `
import { ApiProperty, ApiPropertyOptional, IntersectionType, OmitType, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsDate, IsBoolean, IsArray, IsObject, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
{_@imports@_}

export class Pagination{_@modelNameCapitalize@_}Dto {
  @ApiProperty({ description: '分页大小', example: 10, minimum: 1, maximum: 100 })
	@Transform(({ value }) => Number.parseInt(value))
	@IsNumber({
		allowNaN: false,
		allowInfinity: false,
		maxDecimalPlaces: 0,
	}, { message: '分页大小必须是整数' })
	@Min(1, { message: '分页大小必须大于0' })
	@Max(100, { message: '分页大小不能超过100' })
  pageSize: number;

  @ApiProperty({ description: '当前页', example: 1, minimum: 1 })
  @Transform(({ value }) => Number.parseInt(value))
	@IsNumber({
		allowNaN: false,
		allowInfinity: false,
		maxDecimalPlaces: 0,
	}, { message: '当前页必须是整数' })
	@Min(1, { message: '当前页必须大于0' })
  page: number;

{_@PaginationFields@_}
}

export class {_@modelNameCapitalize@_}IdExistDto {
  @ApiProperty({ description: '{_@modelName@_}ID' })
  @IsNotEmpty({ message: '{_@modelName@_}ID不能为空' })
  // @IsUUID('4', { message: '{_@modelName@_}ID类型错误， 正确类型为uuid' })
  @IsString({ message: '{_@modelName@_}ID类型错误， 正确类型为string' })
  // @IsExistInDataBase({_@modelNameCapitalize@_},'id')
  id: string;
}

export class {_@modelNameCapitalize@_}CreateDto {

{_@CreateDtoFields@_}
}

export class {_@modelNameCapitalize@_}UpdateDto extends IntersectionType(
	{_@modelNameCapitalize@_}IdExistDto,
	// OmitType(PartialType({_@modelNameCapitalize@_}CreateDto), []),
	PartialType({_@modelNameCapitalize@_}CreateDto),
) {}
`;

export function generateNestDto(model: Schema) {
	let hasJson = false;
	const fields = model.list
		.filter((field) => field.type === "model")
		.map((v) => {
			const field = v as Model;
			const modelNameCamelize = strings.camelize(field.name);
			const modelNameCapitalize = strings.capitalize(modelNameCamelize);
			const imports = getRelation(field)
				.filter((v) => createdEnumMap.has(v))
				.map((v) => importFile(v, true));
			const createdDtoField = v.properties
				.filter((v) => v.type === "field")
				.map((v, _i, array) => {
					if (v.fieldType === "Json" && !hasJson) {
						hasJson = true;
						imports.push(importJsonValue());
					}
					return dtoPropertyMap(v, array);
				})
				.filter((v) => v !== "")
				.join("\n");
			const paginationFields = v.properties
				.filter((v) => v.type === "field")
				.map((v, _i, array) => paginationDtoPropertyMap(v, array))
				.join("\n");
			return {
				name: `${modelNameCamelize}`,
				content: dtoTemplate
					.replaceAll("{_@modelName@_}", modelNameCamelize)
					.replaceAll("{_@modelNameCapitalize@_}", modelNameCapitalize)
					.replaceAll("{_@CreateDtoFields@_}", createdDtoField)
					.replaceAll("{_@PaginationFields@_}", paginationFields)
					.replaceAll("{_@imports@_}", imports.join("\n")),
			};
		});
	return fields;
}

export function generateNestDtoFile(
	prisma: Schema,
	outputPath: string,
	dryRun: boolean,
) {
	const entityList = generateNestDto(prisma);
	for (const entity of entityList) {
		mkFile(
			`${outputPath}/${entity.name}`,
			`${entity.name}.dtos.ts`,
			entity.content,
			dryRun,
		);
	}
}
