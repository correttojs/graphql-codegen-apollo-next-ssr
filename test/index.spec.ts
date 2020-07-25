import { validateTs } from "@graphql-codegen/testing";
import { plugin } from "../src/index";
import { parse, GraphQLSchema, buildClientSchema } from "graphql";
import { Types, mergeOutputs } from "@graphql-codegen/plugin-helpers";
import { plugin as tsPlugin } from "@graphql-codegen/typescript";
import { plugin as tsDocumentsPlugin } from "@graphql-codegen/typescript-operations";

describe("Apollo Next SSr", () => {
  let spyConsoleError: jest.SpyInstance;
  beforeEach(() => {
    spyConsoleError = jest.spyOn(console, "warn");
    spyConsoleError.mockImplementation();
  });

  afterEach(() => {
    spyConsoleError.mockRestore();
  });

  const schema = buildClientSchema(require("./schema.json"));
  const basicDoc = parse(/* GraphQL */ `
    query test {
      feed {
        id
        commentCount
        repository {
          full_name
          html_url
          owner {
            avatar_url
          }
        }
      }
    }
  `);

  const validateTypeScript = async (
    output: Types.PluginOutput,
    testSchema: GraphQLSchema,
    documents: Types.DocumentFile[],
    config: any,
    playground = false
  ) => {
    const tsOutput = await tsPlugin(testSchema, documents, config, {
      outputFile: "",
    });
    const tsDocumentsOutput = await tsDocumentsPlugin(
      testSchema,
      documents,
      config,
      { outputFile: "" }
    );
    const merged = mergeOutputs([tsOutput, tsDocumentsOutput, output]);
    validateTs(merged, undefined, true, false, playground);

    return merged;
  };

  describe("Imports", () => {
    it("should import nextjs dependencies", async () => {
      const docs = [{ location: "", document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: "graphql.tsx",
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain("import { NextPage } from 'next';");

      expect(content.prepend).toContain(
        "import { NextRouter, useRouter } from 'next/router'"
      );
      await validateTypeScript(content, schema, docs, {});
    });

    it("should import apollo v2 dependencies", async () => {
      const docs = [{ location: "", document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: "graphql.tsx",
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain("import gql from 'graphql-tag';");

      expect(content.prepend).toContain(
        "import { QueryHookOptions, useQuery } from '@apollo/react-hooks';"
      );

      expect(content.prepend).toContain(
        "import * as Apollo from 'apollo-client';"
      );
      await validateTypeScript(content, schema, docs, {});
    });

    it("should import custom apollo  dependencies", async () => {
      const docs = [{ location: "", document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {
          apolloImportFrom: "client",
        },
        {
          outputFile: "graphql.tsx",
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain("import gql from 'graphql-tag';");

      expect(content.prepend).toContain("import * as Apollo from 'client';");
      await validateTypeScript(content, schema, docs, {});
    });

    it("should import custom  apollo-client v3 dependencies", async () => {
      const docs = [{ location: "", document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {
          reactApolloVersion: 3,
        },
        {
          outputFile: "graphql.tsx",
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(
        "import * as Apollo from '@apollo/client';"
      );
      expect(content.prepend).not.toContain(
        "import { QueryHookOptions, useQuery } from '@apollo/react-hooks';"
      );
      await validateTypeScript(content, schema, docs, {});
    });

    it("should import DocumentNode when using noGraphQLTag", async () => {
      const docs = [{ location: "", document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {
          noGraphQLTag: true,
        },
        {
          outputFile: "graphql.tsx",
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(
        `import { DocumentNode } from 'graphql';`
      );
      expect(content.prepend).not.toContain(`import gql from 'graphql-tag';`);
      await validateTypeScript(content, schema, docs, {});
    });

    it(`should use gql import from gqlImport config option`, async () => {
      const docs = [{ location: "", document: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        { gqlImport: "graphql.macro#gql" },
        {
          outputFile: "graphql.tsx",
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import { gql } from 'graphql.macro';`);
      await validateTypeScript(content, schema, docs, {});
    });
  });

  describe("Next Apollo ssr", () => {
    it("Should generate getServerPage and withPage for query", async () => {
      const documents = parse(/* GraphQL */ `
        query feed {
          feed {
            id
            commentCount
            repository {
              full_name
              html_url
              owner {
                avatar_url
              }
            }
          }
        }

        mutation submitRepository($name: String) {
          submitRepository(repoFullName: $name) {
            id
          }
        }
      `);
      const docs = [{ location: "", document: documents }];

      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: "graphql.tsx",
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`
export async function getServerPageSubmitRepository<T extends true | false>(options: Omit<Apollo.QueryOptions<SubmitRepositoryMutationVariables>, 'query'>, apolloClient: Apollo.ApolloClient<NormalizedCacheObject>
         , rawQueryResult?: T): Promise<{props: T extends true ? Apollo.ApolloQueryResult<SubmitRepositoryMutation> : {apolloState: NormalizedCacheObject} }>  {
             
             
             const data = await apolloClient.query<SubmitRepositoryMutation>({ ...options, query:Operations.SubmitRepositoryDocument });
             if(rawQueryResult){
               return {
                  props: data,
               } as any;
             }
             const apolloState = apolloClient.cache.extract();
             return {
                 props: {
                     apolloState,
                 },
             } as any;
             
             
           }`);
      expect(content.content).toBeSimilarStringTo(
        `export type PageFeedComp = React.FC<{data: FeedQuery, error: Apollo.ApolloError}>;`
      );
      expect(content.content).toBeSimilarStringTo(`
    export const withPageFeed = (optionsFunc?: (router: NextRouter)=> QueryHookOptions<FeedQuery, FeedQueryVariables>) => (WrappedComponent:PageFeedComp) : NextPage  => (props) => {
                     const router = useRouter()
                     const {data, error } = useQuery(Operations.FeedDocument, optionsFunc(router))    
                     return <WrappedComponent {...props} data={data} error={error} /> ;
                        
                 }; `);
      expect(content.content).not.toBeSimilarStringTo(`
    export const useFeed`);
      await validateTypeScript(content, schema, docs, {});
    });
  });

  it("Should generate getServerPage and usePage for query", async () => {
    const documents = parse(/* GraphQL */ `
      query feed {
        feed {
          id
          commentCount
          repository {
            full_name
            html_url
            owner {
              avatar_url
            }
          }
        }
      }

      mutation submitRepository($name: String) {
        submitRepository(repoFullName: $name) {
          id
        }
      }
    `);
    const docs = [{ location: "", document: documents }];

    const content = (await plugin(
      schema,
      docs,
      {
        withHooks: true,
        withHOC: false,
      },
      {
        outputFile: "graphql.tsx",
      }
    )) as Types.ComplexPluginOutput;

    expect(content.content).toBeSimilarStringTo(`
export async function getServerPageSubmitRepository<T extends true | false>(options: Omit<Apollo.QueryOptions<SubmitRepositoryMutationVariables>, 'query'>, apolloClient: Apollo.ApolloClient<NormalizedCacheObject>
         , rawQueryResult?: T): Promise<{props: T extends true ? Apollo.ApolloQueryResult<SubmitRepositoryMutation> : {apolloState: NormalizedCacheObject} }>  {
             
             
             const data = await apolloClient.query<SubmitRepositoryMutation>({ ...options, query:Operations.SubmitRepositoryDocument });
             if(rawQueryResult){
               return {
                  props: data,
               } as any;
             }
             const apolloState = apolloClient.cache.extract();
             return {
                 props: {
                     apolloState,
                 },
             } as any;
             
             
           }`);
    expect(content.content).toBeSimilarStringTo(
      `export type PageFeedComp = React.FC<{data: FeedQuery, error: Apollo.ApolloError}>;`
    );
    expect(content.content).toBeSimilarStringTo(`
  export const useFeed = (
       optionsFunc?: (router: NextRouter)=> QueryHookOptions<FeedQuery, FeedQueryVariables>) => {
       const router = useRouter();
       const options = optionsFunc ? optionsFunc(router) : {};
       return useQuery(Operations.FeedDocument, options);
     };`);
    await validateTypeScript(content, schema, docs, {});
  });

  it("Should generate getServerPage with raw query response", async () => {
    const documents = parse(/* GraphQL */ `
      query feed {
        feed {
          id
          commentCount
          repository {
            full_name
            html_url
            owner {
              avatar_url
            }
          }
        }
      }

      mutation submitRepository($name: String) {
        submitRepository(repoFullName: $name) {
          id
        }
      }
    `);
    const docs = [{ location: "", document: documents }];

    const content = (await plugin(
      schema,
      docs,
      {
        withHooks: true,
        withHOC: false,
        returnRawQuery: true,
      },
      {
        outputFile: "graphql.tsx",
      }
    )) as Types.ComplexPluginOutput;

    expect(content.content).toBeSimilarStringTo(`
    export async function getServerPageSubmitRepository(options: Omit<Apollo.QueryOptions<SubmitRepositoryMutationVariables>, 'query'>, apolloClient: Apollo.ApolloClient<NormalizedCacheObject>) {
             
             
               const props = await apolloClient.query<SubmitRepositoryMutation>({ ...options, query:Operations.SubmitRepositoryDocument });
               return {
                 props,
               };
             
             
           }`);

    await validateTypeScript(content, schema, docs, {});
  });
});
