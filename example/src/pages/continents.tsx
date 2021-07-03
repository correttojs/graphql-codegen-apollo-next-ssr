import { GetServerSideProps } from 'next';
import { PageGetContinentsComp, ssrGetContinents } from "../generated/page";
import Link from "next/link";
import { withApollo } from "../withApollo";

const ContinentPage: PageGetContinentsComp = () => {
  const { data } = ssrGetContinents.usePage();
  return (
    <div>
      {data?.continents?.map((continent, k) => (
        <div key={k}>
          <Link href={`/${continent.code}`}>
            <a>{continent.name}</a>
          </Link>
        </div>
      ))}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await ssrGetContinents.getServerPage({}, ctx);
};

export default withApollo(ContinentPage);
