import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

interface SupplierFormProps {
  onSubmit: (data: SupplierFormData) => void;
}

interface SupplierFormData {
  name: string;
  email: string;
  phone: string;
}

export function SupplierForm({ onSubmit }: SupplierFormProps) {
  const [formData, setFormData] = useState<SupplierFormData>({
    name: "",
    email: "",
    phone: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* TODO: Add form fields */}
      <Input
        name="name"
        placeholder="Supplier Name"
        value={formData.name}
        onChange={handleChange}
      />
      <Input
        name="email"
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
      />
      <Input
        name="phone"
        placeholder="Phone"
        value={formData.phone}
        onChange={handleChange}
      />
      <Button type="submit">Send Invitation</Button>
    </form>
  );
}
