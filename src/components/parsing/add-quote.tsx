import { Button } from "~/components/ui/button";
import { Icons } from "~/components/icons";

export default function AddQuote({
  onClick,
  disabled = false
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button variant="soff" onClick={onClick} disabled={disabled}>
      Add Quote
      <Icons.quotes className="ml-2 h-4 w-4" />
    </Button>
  );
}
