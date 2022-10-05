import { useRouter } from 'next/router';
import { useEffect } from 'react';

const Home = (): JSX.Element => {
  const router = useRouter();

  useEffect(() => {
    router.push('/board/b');
  }, [router]);

  return <p>Sending you to &apos;/b&apos; in progress...</p>;
}

export const getServerSideProps = () => {
  return {
    redirect: {
      destination: '/board/b',
      permanent: false,
    },
  }
};

export default Home;
