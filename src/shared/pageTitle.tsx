type Props = {
  title: string;
  subtitle?: string | undefined;
  subtitle2?: string | undefined;
  customStyle?: { [key: string]: string | number };
}

export default function PageTitle(props: Props) {
  return (
    <div
      className="min-h-9 flex flex-col font-semibold border-l-4 border-sunlight pl-2 grow"
      style={props.customStyle}
    >
      <p className="sm:text-lg text-sm">{props.title}</p>
      {
        !!props?.subtitle && <p className="font-medium">{props.subtitle}</p>
      }
      {
        props?.subtitle2 && <p className="font-medium">{props.subtitle2}</p>
      }
    </div>
  );
}
