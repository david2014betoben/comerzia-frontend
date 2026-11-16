import { Link } from "react-router-dom";

export function Brand() {
  return (
    <Link className="brand" to="/">
      <img src="/brand.svg" alt="" />
      <span>COMERZIA</span>
    </Link>
  );
}
