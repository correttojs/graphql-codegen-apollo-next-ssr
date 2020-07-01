import { ssrGetCountries, PageGetCountriesComp } from "../generated/page";

import { withApollo, getApollo } from "../withApollo";

const HomePage: PageGetCountriesComp = (props) => {
  return <div>Welcome to Next.js! {props.data?.countries?.[0]?.name}</div>;
};

export const getServerSideProps = async () => {
  return await ssrGetCountries.getServerPage({}, getApollo());
};

export default withApollo(ssrGetCountries.withPage(() => ({}))(HomePage));
