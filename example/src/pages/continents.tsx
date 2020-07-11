import { PageGetContinentsComp, ssrGetContinents } from "../generated/page";

import { withApollo } from "../withApollo";

const ContinentPage: PageGetContinentsComp = (props) => {
  const { data } = ssrGetContinents.usePage();
  return <div>Welcome to Next.js! {data?.continents?.[0]?.name}</div>;
};

export const getServerSideProps = async () => {
  return await ssrGetContinents.getServerPage({});
};

export default withApollo(ContinentPage);
