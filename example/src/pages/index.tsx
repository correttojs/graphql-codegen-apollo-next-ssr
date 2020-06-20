import { ssrGetCountries, PageGetCountriesComp } from "../generated/page";
import ApolloClient from "apollo-client";
import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { createHttpLink } from "apollo-link-http";
import fetch from "isomorphic-unfetch";

import { ApolloProvider } from "@apollo/react-hooks";
import { NextPage } from "next";

const getApollo = (initialState?: NormalizedCacheObject) => {
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

const withApollo = (Comp: NextPage) => (props) => {
  return (
    <ApolloProvider client={getApollo(props.apolloState)}>
      <Comp />
    </ApolloProvider>
  );
};

const HomePage: PageGetCountriesComp = (props) => {
  return <div>Welcome to Next.js! {props.data?.countries?.[0]?.name}</div>;
};

export const getServerSideProps = async (ctx) => {
  return await ssrGetCountries.getServerPage({}, getApollo());
};

export default withApollo(ssrGetCountries.withPage(() => ({}))(HomePage));
