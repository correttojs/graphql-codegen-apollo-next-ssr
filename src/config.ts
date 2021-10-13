import { RawClientSideBasePluginConfig } from "@graphql-codegen/visitor-plugin-common";

/**
 * @description This plugin generates React Apollo components and HOC with TypeScript typings.
 *
 * It extends the basic TypeScript plugins: `@graphql-codegen/typescript`, `@graphql-codegen/typescript-operations` - and thus shares a similar configuration.
 */
export type ApolloNextSSRRawPluginConfig = Omit<RawClientSideBasePluginConfig, 'importDocumentNodeExternallyFrom'> &
  Config;

export type Config = {
  /**
   * @description Customize the package where apollo-react common lib is loaded from.
   * @default "@apollo/react-common"
   */
  apolloReactCommonImportFrom?: string;

  /**
   * @description Customize the package where apollo-client lib is loaded from.
   * @default "apollo-client"
   */
  apolloImportFrom?: string;

  /**
   * @description Customize the package where apollo-react hooks lib is loaded from.
   * @default "@apollo/react-hooks"
   */
  apolloReactHooksImportFrom?: string;

  /**
   * @description Customize the package where apollo-cache-inmemory lib is loaded from.
   * @default "apollo-cache-inmemory"
   */
  apolloCacheImportFrom?: string;

  /**
   * @description Customized the output by enabling/disabling the HOC.
   * @default true
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *    - typescript-react-apollo
   *  config:
   *    withHOC: false
   * ```
   */
  withHOC?: boolean;
  /**
   * @description Customized the output by enabling/disabling the generated React Hooks.
   * @default false
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *    - typescript-react-apollo
   *  config:
   *    withHooks: false
   * ```
   */
  withHooks?: boolean;

  /**
   * @description Sets the version of react-apollo.
   * @default 2
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *    - typescript-react-apollo
   *  config:
   *    reactApolloVersion: 3
   * ```
   */
  reactApolloVersion?: 2 | 3;
  /**
   * @description Regexp to exclude a certain operation name
   */
  excludePatterns?: string;
  /**
   * @description Regexp options to exclude a certain operation name
   */
  excludePatternsOptions?: string;

  /**
   * @description Replace "page" keyword inside the generated operations
   */
  replacePage?: boolean;

  /**
   * @description Replace "query" keyword inside the generated operations
   */
  replaceQuery?: boolean;

  /**
   * @description Add custom code before each operation
   */
  pre?: string;
  /**
   * @description Add custom code after each operation
   */
  post?: string;
  /**
   * @description Add custom imports needed by pre/post
   */
  customImports?: string;

  /**
   * @description Add custom typing to context paramter
   */
  contextType?: string

  /**
   * @description Whether the caller is required to pass a context
   */
  contextTypeRequired?: boolean;

  /**
   * @description Add apolloClient instance imports
   */
  apolloClientInstanceImport?: string;

  /**
   * @description Key used for storing Apollo state
   * @default "apolloState"
   */
  apolloStateKey?: string;

  /**
   * @description Custom React import
   */
  reactImport?: string;

  /**
   * @default ""
   * @description This config should be used if `documentMode` is `external`. This has 3 usage:
   * - any string: This would be the path to import document nodes from. This can be used if we want to manually create the document nodes e.g. Use `graphql-tag` in a separate file and export the generated document
   * - 'near-operation-file': This is a special mode that is intended to be used with `near-operation-file` preset to import document nodes from those files. If these files are `.graphql` files, we make use of webpack loader.
   * - 'same-file': This is a special mode that is intended to be used with the `typescript-operations` & `typescript-react-apollo` plugins to generate document nodes in the same files.
   *
   * @exampleMarkdown
   * ```yml
   * config:
   *   documentMode: external
   *   importDocumentNodeExternallyFrom: path/to/document-node-file
   * ```
   *
   * ```yml
   * config:
   *   documentMode: external
   *   importDocumentNodeExternallyFrom: near-operation-file
   * ```
   * 
   * ```yml
   * config:
   *   documentMode: external
   *   importDocumentNodeExternallyFrom: same-file
   * ```
   */
  importDocumentNodeExternallyFrom?: string;
};
