import {
  PageGetContinentsComp,
  ssrGetContinents,
} from "../generated/page";

import { withApollo, getApollo } from "../withApollo";

const ContinentPage: PageGetContinentsComp = (props) => {
  return <div>Welcome to Next.js! {props.data?.continents?.[0]?.name}</div>;
};

export const getServerSideProps = async () => {
  return await ssrGetContinents.getServerPage({}, getApollo());
};

export default withApollo(ssrGetContinents.withPage(() => ({}))(ContinentPage));
