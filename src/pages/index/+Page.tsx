import {usePageContext} from "vike-react/usePageContext";

export default function Page() {
  const context = usePageContext();

  if (context.isClientSide) {
    console.log(context.data);
  }

  return (
    <>
      <span>Hello, world!</span>
    </>
  );
}
