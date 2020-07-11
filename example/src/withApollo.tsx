import { NextPage } from "next";
import { ApolloProvider } from "@apollo/react-hooks";
import { NormalizedCacheObject, InMemoryCache } from "apollo-cache-inmemory";
import { createHttpLink } from "apollo-link-http";
import ApolloClient from "apollo-client";

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
