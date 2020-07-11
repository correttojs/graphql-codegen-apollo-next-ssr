import { ssrGetCountries, PageGetCountriesComp } from "../generated/page";

import { withApollo } from "../withApollo";
import { GetServerSideProps } from "next";

const HomePage: PageGetCountriesComp = (props) => {
  return <div>Welcome to Next.js! {props.data?.countries?.[0]?.name}</div>;
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await ssrGetCountries.getServerPage({});
};

export default withApollo(ssrGetCountries.withPage(() => ({}))(HomePage));
