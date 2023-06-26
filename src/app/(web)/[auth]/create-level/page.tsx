interface Props {
  params: {
    auth: string;
  };
}

export default function CreateLevelPage({ params: { auth } }: Props) {
  console.log({ auth });
  return <>create-level</>;
}
