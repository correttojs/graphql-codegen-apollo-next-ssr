# graphql-codegen-apollo-next-ssr
Generate apollo code for nextjs ssr

## Motivations

Nextjs recently introduced `getServerSideProps` which breaks the HOC pattern used by the official apollo graphql plugin. At the same time the SSR method offered by apollo client (`getDataFromTree` ) enforces the react app to render multiple times in order to collect and fetch all the relevant queries.
By declaring a top level query we can save rendering time and provide a simpler pattern which works with `getServerSideProps `. This plugin generates a typesafe version of `getServerSideProps ` for each server query, and the corresponding HOC to wrap the react component returning the cache result. The limitation/advantage of this solution is that all the queries embedded into inner react components are ignored, unless covered by the top level cache.

## Configuration
- `excludePatterns` (default: null): regexp to exclude operation names
- `excludePatternsOptions` (default: ''): regexp flags to exclude operation names
- `apolloVersion` (default: 2): apollo client version
- `apolloCacheImportFrom` (default: apollo-cache-inmemory): apollo-cache-inmemory dependency
- `apolloImportFrom` (default: apollo-client v2 or @apollo/client v3): apollo client dependency
- `customImports` (default: ''): full custom import declaration
- `pre` (default: ''): custom code before each function
- `post` (default: ''):  custom code after each function

## Example config

```
overwrite: true
schema:
    - 'https://myschema/graphql'
documents:
    - 'src/**/*.graphql'
generates:
    src/@types/codegen/graphql.tsx:
        plugins:
            - 'typescript'
            - 'typescript-operations'
            - 'typescript-react-apollo'
    src/@types/codegen/cache.tsx:
        config:
            documentMode: external
            importDocumentNodeExternallyFrom: ./graphql
        preset: import-types
        presetConfig:
            typesPath: ./graphql
        plugins:
            - ./build/src/index.js
hooks:
    afterAllFileWrite:
        - prettier --write

```
