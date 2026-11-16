export function Badge({ value }: { value: string }) {
  return (
    <span className={`badge state-${value.toLowerCase()}`}>
      {value.replaceAll("_", " ")}
    </span>
  );
}
