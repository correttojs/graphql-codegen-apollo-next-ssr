import { NextPage } from "next";
import {
  ApolloClient,
  NormalizedCacheObject,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";

export const withApollo = (Comp: NextPage) => (props) => {
  return (
    <ApolloProvider client={getApolloClient(null, props.apolloState)}>
      <Comp />
    </ApolloProvider>
  );
};

export const getApolloClient = (ctx?, initialState?: NormalizedCacheObject) => {
  const httpLink = createHttpLink({
    uri: "https://countries.trevorblades.com",
    fetch,
  });
  const cache = new InMemoryCache().restore(initialState);
  return new ApolloClient({
    link: httpLink,
    cache,
  });
};
