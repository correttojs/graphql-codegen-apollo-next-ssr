import { ssrGetCountries, PageGetCountriesComp } from "../generated/page";

import { withApollo } from "../withApollo";
import { GetServerSideProps } from "next";

const HomePage: PageGetCountriesComp = (props) => {
  return (
    <div>
      {props.data?.countries?.map((country, k) => (
        <div key={k}>{country.name}</div>
      ))}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await ssrGetCountries.getServerPage({}, ctx);
};

export default withApollo(ssrGetCountries.withPage(() => ({}))(HomePage));
