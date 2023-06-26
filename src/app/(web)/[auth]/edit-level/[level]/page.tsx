interface Props {
  params: {
    auth: string;
    level: string;
  };
}

export default function EditLevelPage({ params: { auth, level } }: Props) {
  console.log({ auth, level });
  return <>edit-level</>;
}
