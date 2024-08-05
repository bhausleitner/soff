import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "~/components/ui/dialog";
import { SupplierForm, type SupplierFormData } from "./SupplierForm";

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SupplierFormData) => void;
}

export function SupplierModal({
  isOpen,
  onClose,
  onSubmit
}: SupplierModalProps) {
  const handleSubmit = (data: SupplierFormData) => {
    onSubmit(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Onboard Supplier</DialogTitle>
        </DialogHeader>
        <SupplierForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}
