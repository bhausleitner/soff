import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/icons";

export interface SupplierFormData {
  companyName: string;
  contactName: string;
  contactRole: string;
  email: string;
}

interface SupplierFormProps {
  onSubmit: (data: SupplierFormData) => void;
}

export function SupplierForm({ onSubmit }: SupplierFormProps) {
  const [formData, setFormData] = useState<SupplierFormData>({
    companyName: "",
    contactName: "",
    contactRole: "",
    email: ""
  });
  const [isGeneratingNDA, setIsGeneratingNDA] = useState(false);
  const [isNDAGenerated, setIsNDAGenerated] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleGenerateNDA = () => {
    setIsGeneratingNDA(true);
    // Simulate NDA generation
    setTimeout(() => {
      setIsGeneratingNDA(false);
      setIsNDAGenerated(true);
    }, 1000);
  };

  const isFormValid = Object.values(formData).every(
    (value: string) => value.trim() !== ""
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="companyName"
        placeholder="Company Name"
        value={formData.companyName}
        onChange={handleChange}
        required
      />
      <Input
        name="contactName"
        placeholder="Contact Name"
        value={formData.contactName}
        onChange={handleChange}
        required
      />
      <Input
        name="contactRole"
        placeholder="Contact Role"
        value={formData.contactRole}
        onChange={handleChange}
        required
      />
      <Input
        name="email"
        type="email"
        placeholder="Email Address"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <div className="flex flex-col space-y-4">
        <Button
          type="button"
          onClick={handleGenerateNDA}
          variant={isNDAGenerated ? "outline" : "secondary"}
          className={`w-fit ${isNDAGenerated ? "border-green-500" : ""}`}
          disabled={isGeneratingNDA || isNDAGenerated || !isFormValid}
        >
          <div className="flex w-full items-center justify-start">
            {isGeneratingNDA ? (
              <Icons.loaderCircle className="h-4 w-4 animate-spin" />
            ) : isNDAGenerated ? (
              <>NDA Generated</>
            ) : (
              "Generate NDA"
            )}
          </div>
        </Button>
        <Button
          type="submit"
          variant="soff"
          disabled={!isNDAGenerated}
          className="w-fit"
        >
          Send NDA
        </Button>
      </div>
    </form>
  );
}
