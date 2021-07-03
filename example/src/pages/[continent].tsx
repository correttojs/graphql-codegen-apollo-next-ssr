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

export const getStaticProps: GetServerSideProps = async ({ params, req }) => {
  const res = await ssrGetCountriesByCode.getServerPage({
    variables: { code: params?.continent?.toString().toUpperCase() || "" },
  }, { req });

  if (res.props.error || !res.props.data?.countries?.length) {
    return {
      notFound: true,
    };
  }
  return res;
};

export const getStaticPaths: GetStaticPaths = async () => {
  const { props } = await ssrGetContinents.getServerPage({}, { req: undefined });
  const paths =
    props?.data?.continents.map((continent) => ({
      params: { continent: continent.code },
    })) || [];
  paths.push({ params: { continent: "WWW" } });
  return {
    paths,
    fallback: false,
  };
};

export default withApollo(
  ssrGetCountriesByCode.withPage((arg) => ({
    variables: { code: arg?.query?.continent?.toString().toUpperCase() || "" },
  }))(HomePage)
);
