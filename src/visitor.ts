import { Types } from "@graphql-codegen/plugin-helpers";
import {
  ClientSideBaseVisitor,
  ClientSideBasePluginConfig,
  getConfigValue,
  LoadedFragment,
  OMIT_TYPE,
  DocumentMode,
} from "@graphql-codegen/visitor-plugin-common";

import autoBind from "auto-bind";
import { GraphQLSchema, OperationDefinitionNode } from "graphql";
import { ApolloNextSSRRawPluginConfig, Config } from "./config";

export type ApolloNextSSRPluginConfig = ClientSideBasePluginConfig & Config;

export class ApolloNextSSRVisitor extends ClientSideBaseVisitor<
  ApolloNextSSRRawPluginConfig,
  ApolloNextSSRPluginConfig
> {
  private _externalImportPrefix: string;
  private imports = new Set<string>();

  constructor(
    schema: GraphQLSchema,
    fragments: LoadedFragment[],
    rawConfig: ApolloNextSSRRawPluginConfig,
    documents: Types.DocumentFile[]
  ) {
    super(schema, fragments, rawConfig, {
      apolloReactCommonImportFrom: getConfigValue(
        rawConfig.apolloReactCommonImportFrom,
        rawConfig.reactApolloVersion === 3
          ? "@apollo/client"
          : "@apollo/react-common"
      ),

      apolloReactHooksImportFrom: getConfigValue(
        rawConfig.apolloReactHooksImportFrom,
        rawConfig.reactApolloVersion === 3
          ? "@apollo/client"
          : "@apollo/react-hooks"
      ),
      apolloImportFrom: getConfigValue(
        rawConfig.apolloImportFrom,
        rawConfig.reactApolloVersion === 3 ? "@apollo/client" : "apollo-client"
      ),

      reactApolloVersion: getConfigValue(rawConfig.reactApolloVersion, 2),
      excludePatterns: getConfigValue(rawConfig.excludePatterns, null),
      excludePatternsOptions: getConfigValue(
        rawConfig.excludePatternsOptions,
        ""
      ),

      pre: getConfigValue(rawConfig.pre, ""),
      post: getConfigValue(rawConfig.post, ""),
      customImports: getConfigValue(rawConfig.customImports, null),
      withHOC: getConfigValue(rawConfig.withHOC, true),
      withHooks: getConfigValue(rawConfig.withHooks, false),

      apolloClientInstanceImport: getConfigValue(
        rawConfig.apolloClientInstanceImport,
        ""
      ),
      apolloCacheImportFrom: getConfigValue(
        rawConfig.apolloCacheImportFrom,
        rawConfig.reactApolloVersion === 3
          ? "@apollo/client"
          : "apollo-cache-inmemory"
      ),
      returnRawQuery: getConfigValue(rawConfig.returnRawQuery, false),
    });

    this._externalImportPrefix = this.config.importOperationTypesFrom
      ? `${this.config.importOperationTypesFrom}.`
      : "";
    this._documents = documents;

    autoBind(this);
  }

  public getImports(): string[] {
    this.imports.add(`import {GraphQLError } from 'graphql'`);
    this.imports.add(`import { NextPage } from 'next';`);
    this.imports.add(`import { NextRouter, useRouter } from 'next/router'`);
    this.imports.add(
      `import { NormalizedCacheObject } from '${this.config.apolloCacheImportFrom}';`
    );
    this.imports.add(
      `import { QueryHookOptions, useQuery } from '${this.config.apolloReactHooksImportFrom}';`
    );
    this.imports.add(
      `import * as Apollo from '${this.config.apolloImportFrom}';`
    );
    this.imports.add(`import React from 'react';`);

    if (this.config.apolloClientInstanceImport) {
      this.imports.add(
        `import { getApolloClient} from '${this.config.apolloClientInstanceImport}';`
      );
    }
    if (this.config.customImports) {
      this.imports.add(this.config.customImports);
    }

    const baseImports = super.getImports();
    const hasOperations = this._collectedOperations.length > 0;

    if (!hasOperations) {
      return baseImports;
    }

    return [...baseImports, ...Array.from(this.imports)];
  }

  private _buildOperationPageQuery(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    const operationName: string = this.convertName(node.name.value, {
      useTypesPrefix: false,
    });

    if (
      this.config.excludePatterns &&
      new RegExp(
        this.config.excludePatterns,
        this.config.excludePatternsOptions
      ).test(operationName)
    ) {
      return "";
    }

    const pageOperation = operationName
      .replace(/page/i, "")
      .replace(/query/i, "");

    const WrappedComp = `export type Page${pageOperation}Comp = React.FC<{data?: ${operationResultType}, error?: Apollo.ApolloError}>;`;

    const pageQueryString = this.config.withHOC
      ? `export const withPage${pageOperation} = (optionsFunc?: (router: NextRouter)=> QueryHookOptions<${operationResultType}, ${operationVariablesTypes}>) => (WrappedComponent:Page${pageOperation}Comp) : NextPage  => (props) => {
                const router = useRouter()
                const options = optionsFunc ? optionsFunc(router) : {};
                const {data, error } = useQuery(Operations.${documentVariableName}, options)    
                return <WrappedComponent {...props} data={data} error={error} /> ;
                   
            }; `
      : "";

    const pageHook = this.config.withHooks
      ? `export const use${pageOperation} = (
  optionsFunc?: (router: NextRouter)=> QueryHookOptions<${operationResultType}, ${operationVariablesTypes}>) => {
  const router = useRouter();
  const options = optionsFunc ? optionsFunc(router) : {};
  return useQuery(Operations.${documentVariableName}, options);
};`
      : "";

    const getSSP = `export async function getServerPage${pageOperation}${
      this.config.returnRawQuery ? "" : "<T extends true | false>"
    }(options: Omit<Apollo.QueryOptions<${operationVariablesTypes}>, 'query'>, ${
      this.config.apolloClientInstanceImport
        ? "ctx? :any"
        : "apolloClient: Apollo.ApolloClient<NormalizedCacheObject>"
    }${
      this.config.returnRawQuery
        ? `)`
        : `
    , rawQueryResult?: T): Promise<{props: T extends true ? Apollo.ApolloQueryResult<${operationResultType}> : {apolloState: NormalizedCacheObject, error: Apollo.ApolloError | GraphQLError | null} }> `
    } {
        ${
          this.config.apolloClientInstanceImport
            ? "const apolloClient = getApolloClient(ctx);"
            : ""
        }
        ${
          this.config.returnRawQuery
            ? `
          const props = await apolloClient.query<${operationResultType}>({ ...options, query:Operations.${documentVariableName}, errorPolicy: "all" });
          return {
            props
          };
        `
            : `
        const data = await apolloClient.query<${operationResultType}>({ ...options, query:Operations.${documentVariableName}, errorPolicy: "all", });
        if(rawQueryResult){
          return {
             props: data
          } as any;
        }
        const apolloState = apolloClient.cache.extract();
        return {
            props: {
                apolloState,
                error: data?.error ?? data?.errors ?? null,
            },
        } as any;
        `
        }
        
      }`;

    const ssr = `export const ssr${pageOperation} = {
      getServerPage: getServerPage${pageOperation},
      ${this.config.withHOC ? `withPage: withPage${pageOperation},` : ""}
      ${this.config.withHooks ? `usePage: use${pageOperation},` : ""}
    }`;
    return [getSSP, pageHook, WrappedComp, pageQueryString, ssr]
      .filter((a) => a)
      .join("\n");
  }

  protected buildOperation(
    node: OperationDefinitionNode,
    documentVariableName: string,
    operationType: string,
    operationResultType: string,
    operationVariablesTypes: string
  ): string {
    operationResultType = this._externalImportPrefix + operationResultType;
    operationVariablesTypes =
      this._externalImportPrefix + operationVariablesTypes;

    const pageOperation = this._buildOperationPageQuery(
      node,
      documentVariableName,
      operationResultType,
      operationVariablesTypes
    );
    return [pageOperation].join("\n");
  }
}
