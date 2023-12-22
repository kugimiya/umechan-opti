// @ts-nocheck
function generateSiteMap() {
  return `User-agent: *
Disallow:
  
 `;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

// eslint-disable-next-line @typescript-eslint/require-await
export async function getServerSideProps({ res }) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  res.setHeader('Content-Type', 'text/plain');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  res.write(generateSiteMap());
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  res.end();

  return {
    props: {},
  };
}

export default SiteMap;
