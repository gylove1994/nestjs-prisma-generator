import type { Model, Property } from "@mrleebo/prisma-ast";
import { typeMap } from "./typeMap";

export function getRelation(model: Model) {
  const relations = model.properties
    .filter((v) => v.type === "field" && v.fieldType === typeMap(v.fieldType))
    .map((v: any) => v.fieldType);
  return relations;
}
