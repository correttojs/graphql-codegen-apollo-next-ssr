import { extname } from "path";

import {
  PluginFunction,
  PluginValidateFn,
  Types,
  oldVisit,
} from "@graphql-codegen/plugin-helpers";
import { LoadedFragment } from "@graphql-codegen/visitor-plugin-common";
import { RawClientSideBasePluginConfig } from "@graphql-codegen/visitor-plugin-common";
import {
  FragmentDefinitionNode,
  GraphQLSchema,
  Kind,
  concatAST,
} from "graphql";

import { ApolloNextSSRVisitor } from "./visitor";
import { ApolloNextSSRRawPluginConfig } from "./config";

export const plugin: PluginFunction<
  ApolloNextSSRRawPluginConfig,
  Types.ComplexPluginOutput
> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: ApolloNextSSRRawPluginConfig
) => {
  const allAst = concatAST(documents.map((v) => v.document));

  const allFragments: LoadedFragment[] = [
    ...(
      allAst.definitions.filter(
        (d) => d.kind === Kind.FRAGMENT_DEFINITION
      ) as FragmentDefinitionNode[]
    ).map((fragmentDef) => ({
      node: fragmentDef,
      name: fragmentDef.name.value,
      onType: fragmentDef.typeCondition.name.value,
      isExternal: false,
    })),
    ...(config.externalFragments || []),
  ];

  const visitor = new ApolloNextSSRVisitor(
    schema,
    allFragments,
    config,
    documents
  );
  let visitorResult = oldVisit(allAst, { leave: visitor });

  return {
    prepend: visitor.getImports(),
    content: [
      ...visitorResult.definitions.filter((t) => typeof t === "string"),
    ].join("\n"),
  };
};

export const validate: PluginValidateFn<any> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: RawClientSideBasePluginConfig,
  outputFile: string
) => {
  if (extname(outputFile) !== ".tsx") {
    throw new Error(
      `Plugin "apollo-next-ssr" requires extension to be ".tsx"!`
    );
  }
};

export { ApolloNextSSRVisitor };
