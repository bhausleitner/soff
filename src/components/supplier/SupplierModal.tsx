import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "~/components/ui/dialog";

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function SupplierModal({
  isOpen,
  onClose,
  children
}: SupplierModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Onboard Supplier</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
