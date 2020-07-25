import {
  ssrGetCountriesByCode,
  PageGetCountriesByCodeComp,
  ssrGetContinents,
} from "../generated/page";

import { withApollo } from "../withApollo";
import { GetServerSideProps, GetStaticPaths } from "next";

const HomePage: PageGetCountriesByCodeComp = (props) => {
  return (
    <div>
      {props.data?.countries?.map((country, k) => (
        <div key={k}>{country.name}</div>
      ))}
    </div>
  );
};

export const getStaticProps: GetServerSideProps = async ({ params }) => {
  return await ssrGetCountriesByCode.getServerPage({
    variables: { code: params.continent.toString().toUpperCase() },
  });
};

export const getStaticPaths: GetStaticPaths = async () => {
  const { props } = await ssrGetContinents.getServerPage({}, null, true);
  const paths = props.data.continents.map((continent) => ({
    params: { continent: continent.code },
  }));

  return {
    paths,
    fallback: false,
  };
};

export default withApollo(
  ssrGetCountriesByCode.withPage((arg) => ({
    variables: { code: arg.query.continent.toString().toUpperCase() },
  }))(HomePage)
);
