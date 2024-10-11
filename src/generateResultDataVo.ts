import { mkFile } from "./utils/mkFile";

const templateVo = `
import { ApiProperty } from "@nestjs/swagger";
import { type Type, applyDecorators } from "@nestjs/common";
import { ApiOkResponse, getSchemaPath } from "@nestjs/swagger";

export class ResultDataVo {
	constructor(resultData: { code?: number; message?: string; data?: any }) {
		const { code = 200, message, data } = resultData;
		this.code = code;
		this.message = message ?? "ok";
		this.data = data ?? null;
	}

	@ApiProperty({
		description: "结果码, 200 表示成功",
		type: "number",
		default: 200,
	})
	code: number;

	@ApiProperty({
		description: "结果描述, ok 表示成功",
		type: "string",
		default: "ok",
	})
	message?: string;

	data?: any;

	static ok(resultData: {
		code?: number;
		message?: string;
		data?: any;
	}): ResultDataVo {
		const { code = 200, message = "ok", data } = resultData;
		return new ResultDataVo({ code, message, data });
	}

	static fail(resultData: {
		code?: number;
		message?: string;
		data?: any;
	}): ResultDataVo {
		const { code = 200, message = "fail", data } = resultData;
		return new ResultDataVo({ code, message, data });
	}
}

const baseTypeNames = ["String", "Number", "Boolean"];
export const ApiResult = <TModel extends Type<any>>(
	model?: TModel,
	isArray?: boolean,
	isPager?: boolean,
) => {
	let items: Record<string, any>;
	if (model && baseTypeNames.includes(model.name)) {
		items = { type: model.name.toLocaleLowerCase() };
	} else {
		items = { $ref: getSchemaPath(model ?? "") };
	}
	let prop: Record<string, any>;
	if (isArray && isPager) {
		prop = {
			type: "object",
			properties: {
				list: {
					type: "array",
					items,
				},
				total: {
					type: "number",
					default: 0,
				},
				page: {
					type: "number",
					default: 1,
				},
				pageSize: {
					type: "number",
					default: 10,
				},
			},
		};
	} else if (isArray) {
		prop = {
			type: "array",
			items,
		};
	} else if (model) {
		prop = items;
	} else {
		prop = { type: "null", default: null };
	}
	return applyDecorators(
		ApiOkResponse({
			schema: {
				allOf: [
					{ $ref: getSchemaPath(ResultDataVo) },
					{
						properties: {
							data: prop,
						},
					},
				],
			},
		}),
	);
};
`;

export function generateResultDataVo() {
	return templateVo;
}

export function generateResultDataVoFile(outputPath: string, dryRun: boolean) {
	const result = generateResultDataVo();
	mkFile(outputPath, "resultDataVo.ts", result, dryRun);
}
