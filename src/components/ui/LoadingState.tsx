export function Loading() {
  return (
    <div className="skeletons" aria-label="Cargando" aria-busy="true">
      {[1, 2, 3, 4].map((i) => (
        <div className="skeleton" key={i} />
      ))}
    </div>
  );
}
