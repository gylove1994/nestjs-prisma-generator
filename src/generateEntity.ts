import { strings } from "@angular-devkit/core";
import { classify } from "@angular-devkit/core/src/utils/strings";
import type { Model, Schema } from "@mrleebo/prisma-ast";
import { createdEnumMap } from "./generateEnum";
import { getRelation } from "./utils/getRelation";
import {
	importApiProperty,
	importFile,
	importJsonValue,
	importPickType,
} from "./utils/import";
import { mkFile } from "./utils/mkFile";
import { noRelationPropertyMap, propertyMap } from "./utils/propertyMap";
import { swaggerMap } from "./utils/swaggerMap";

export function generateEntity(model: Model) {
	const propertiesContent = model.properties
		.filter((v) => v.type === "field")
		.map((prop) => {
			return swaggerMap(prop) + propertyMap(prop);
		})
		.join("\n");
	const hasJson = model.properties.some(
		(prop) => prop.type === "field" && prop.fieldType === "Json",
	);
	const imports = getRelation(model)
		.map((v) => importFile(v, false, true))
		.concat(importApiProperty())
		.concat(hasJson ? importJsonValue() : "")
		.join("");
	const content = `${imports}\nexport class ${strings.classify(
		model.name,
	)} {\n${propertiesContent}}\n\n${generateEntityRelationSeparateClass(model)}\n\n${generateEntityRelationSeparateNoRelationClass(model)}\n\n${generateEntityNoRelationClass(model)}`;
	return {
		name: `${strings.camelize(model.name)}Entity.ts`,
		content,
	};
}

export function generateEntityRelationSeparateClass(model: Model) {
	const relationsName = getRelation(model);
	const relations = model.properties
		.filter(
			(v: any) =>
				v.type === "field" &&
				relationsName.includes(v.fieldType) &&
				!createdEnumMap.has(v.fieldType),
		)
		.map(
			(v: any) =>
				`export class ${strings.classify(`${model.name}Relation${v.fieldType}`)}{\n${swaggerMap(v) + propertyMap(v)}}\n`,
		);
	return relations.join("\n");
}

export function generateEntityRelationSeparateNoRelationClass(model: Model) {
	const relationsName = getRelation(model);
	const relations = model.properties
		.filter(
			(v: any) =>
				v.type === "field" &&
				relationsName.includes(v.fieldType) &&
				!createdEnumMap.has(v.fieldType),
		)
		.map(
			(v: any) =>
				`export class ${strings.classify(`${model.name}Relation${v.fieldType}NoRelation`)}{\n${
					swaggerMap(v, {
						setType: `${v.fieldType}NoRelation`,
					}) + noRelationPropertyMap(v)
				}}\n`,
		);
	return relations.join("\n");
}

export function generateEntityNoRelationClass(model: Model) {
	const propertiesContent = model.properties
		.filter(
			(v: any) =>
				v.type === "field" && !getRelation(model, true).includes(v.fieldType),
		)
		.map((prop: any) => swaggerMap(prop) + propertyMap(prop))
		.join("\n");
	return `export class ${strings.classify(model.name)}NoRelation {\n${propertiesContent}}\n`;
}

export function generateEntityFile(
	prisma: Schema,
	outputPath: string,
	dryRun: boolean,
) {
	const entityList = prisma.list.filter((item) => item.type === "model");
	for (const entity of entityList) {
		const { name, content } = generateEntity(entity);
		mkFile(outputPath, name, content, dryRun);
	}
}

export function generatePickEntity(model: Model) {
	// 从模型中提取字段属性的名称
	const properties = model.properties
		.filter((v) => v.type === "field")
		.map((prop) => prop.name);

	// 生成所有可能的属性组合
	function generateCombinations(
		arr: string[],
	): { combination: string; originalNames: string[] }[] {
		const result: { combination: string; originalNames: string[] }[] = [];

		function backtrack(
			start: number,
			current: string[],
			originalCurrent: string[],
		) {
			if (current.length > 0) {
				result.push({
					combination: current.join("_"),
					originalNames: [...originalCurrent],
				});
			}

			for (let i = start; i < arr.length; i++) {
				current.push(classify(arr[i]));
				originalCurrent.push(arr[i]);
				backtrack(i + 1, current, originalCurrent);
				current.pop();
				originalCurrent.pop();
			}
		}

		backtrack(0, [], []);
		return result;
	}

	// 获取所有属性的组合
	const combinations = generateCombinations(properties);

	// 获取实体名称并首字母大写
	const entityName = strings.classify(model.name);

	const imports = importPickType() + importFile(entityName);

	// 为每个组合生成PickType
	const c = combinations
		.map(
			({ combination, originalNames }) =>
				`class ${entityName}Pick_${combination} extends PickType(${entityName}, [${originalNames.map((v) => `"${v}"`).join(", ")}]) {}\n`,
		)
		.join("\n");

	// 添加新的函数，使用泛型来确保返回类型的正确性
	const pickTypeFunction = `
export function ${entityName}PickType<T extends keyof ${entityName}>(keys: T[]):any {
  const sortedKeys = keys.sort().join('_');
  switch (sortedKeys) {
    ${combinations
			.map(
				({ combination, originalNames }) => `
    case '${originalNames.sort().join("_")}':
      return ${entityName}Pick_${combination};`,
			)
			.join("")}
    default:
      throw new Error('未找到匹配的PickType类');
  }
}`;

	const content = `${imports}\n${c}\n${pickTypeFunction}`;

	// 返回生成的文件名和内容
	return {
		name: `${strings.camelize(entityName)}PickTypeEntities.ts`,
		content,
	};
}

export function generatePickEntityFile(
	prisma: Schema,
	outputPath: string,
	dryRun: boolean,
) {
	const entityList = prisma.list.filter((item) => item.type === "model");
	for (const entity of entityList) {
		const { name, content } = generatePickEntity(entity);
		mkFile(outputPath, name, content, dryRun);
	}
}
