import { AlertCircle } from "lucide-react";
import { Button } from "./Button";

export function ErrorBox({
  error,
  retry,
}: {
  error: string;
  retry?: () => void;
}) {
  return (
    <div className="alert danger" role="alert">
      <AlertCircle size={19} />
      <span>{error}</span>
      {retry && (
        <Button className="secondary" onClick={retry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}
