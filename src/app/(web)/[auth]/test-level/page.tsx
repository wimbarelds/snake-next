interface Props {
  params: {
    auth: string;
  };
}

export default function TestLevelPage({ params: { auth } }: Props) {
  console.log({ auth });
  return <>test-level</>;
}
