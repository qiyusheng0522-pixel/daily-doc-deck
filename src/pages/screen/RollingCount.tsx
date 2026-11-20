export default function RollingCount({ value }: { value: number }) {
  return <span className="screen-rolling-count" aria-label={String(value)}>
    <span className="screen-rolling-track" aria-hidden="true" key={value}>
      <span>{value}</span><span>{value}</span>
    </span>
  </span>;
}