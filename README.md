# graphql-codegen-apollo-next-ssr
Generate apollo code for nextjs ssr


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
