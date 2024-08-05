import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "~/components/ui/dialog";
import { SupplierForm, type SupplierFormData } from "./SupplierForm";
import { toast } from "sonner";
import { api } from "~/utils/api";

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
  const createSupplier = api.supplier.createSupplier.useMutation();

  const handleSubmit = async (data: SupplierFormData) => {
    try {
      await createSupplier.mutateAsync({
        ...data,
        status: "ONBOARDING"
      });

      onSubmit(data);
      toast.success("Supplier Added", {
        description: "The supplier has been added successfully."
      });
      onClose();
    } catch (error) {
      toast.error("Error", {
        description: "Failed to add supplier. Please try again."
      });
    }
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
