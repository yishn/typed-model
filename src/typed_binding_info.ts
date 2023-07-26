import {
  AggregationBindingInfo,
  PropertyBindingInfo,
} from "sap/ui/base/ManagedObject";
import { TypedModel } from "./typed_model.js";

const metadata = Symbol("metadata");

const IC = <T>(): new () => T => class {} as any;

export class TypedPropertyBindingInfo<T> extends IC<PropertyBindingInfo>() {
  constructor(model: TypedModel<any, any>);
  constructor(models: TypedModel<any, any>[]);
  constructor(model: TypedModel<any, any> | TypedModel<any, any>[]) {
    super();

    const models = Array.isArray(model) ? model : [model];

    this[metadata] = {
      typedModels: models,
    };
  }

  [metadata]: {
    _type?: T;
    typedModels: TypedModel<any, any>[];
  };
}

export class TypedAggregationBindingInfo<
  T
> extends IC<AggregationBindingInfo>() {
  constructor(model: TypedModel<any, any>) {
    super();

    this[metadata] = {
      typedModel: model,
    };
  }

  [metadata]: {
    _type?: T;
    typedModel: TypedModel<any, any>;
  };
}

export function expressionBinding<
  const P extends readonly [
    TypedPropertyBindingInfo<unknown>,
    ...TypedPropertyBindingInfo<unknown>[]
  ],
  T
>(
  parts: P,
  formatter: (
    ...values: {
      [K in keyof P]: P[K] extends TypedPropertyBindingInfo<infer T>
        ? T
        : never;
    }
  ) => T,
  opts?: Omit<PropertyBindingInfo, "path" | "model" | "value" | "parts">
): TypedPropertyBindingInfo<T> {
  const result = new TypedPropertyBindingInfo<T>(
    ([] as TypedModel<any, any>[]).concat(
      ...parts.map((info) => info[metadata].typedModels)
    )
  );

  result.parts = parts as any;
  result.formatter = formatter;

  return Object.assign(result, opts);
}
