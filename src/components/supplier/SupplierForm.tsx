import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Icons } from "~/components/icons";

interface SupplierFormProps {
  onSubmit: (data: SupplierFormData) => void;
  onGenerateNDA: () => void;
}

interface SupplierFormData {
  companyName: string;
  contactName: string;
  contactRole: string;
  email: string;
}

export function SupplierForm({ onSubmit, onGenerateNDA }: SupplierFormProps) {
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
    // onGenerateNDA();
    setTimeout(() => {
      setIsGeneratingNDA(false);
      setIsNDAGenerated(true);
    }, 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="companyName"
        placeholder="Company Name"
        value={formData.companyName}
        onChange={handleChange}
      />
      <Input
        name="contactName"
        placeholder="Contact Name"
        value={formData.contactName}
        onChange={handleChange}
      />
      <Input
        name="contactRole"
        placeholder="Contact Role"
        value={formData.contactRole}
        onChange={handleChange}
      />
      <Input
        name="email"
        type="email"
        placeholder="Email Address"
        value={formData.email}
        onChange={handleChange}
      />
      <div className="flex flex-col space-y-4">
        <Button
          type="button"
          onClick={handleGenerateNDA}
          variant={isNDAGenerated ? "outline" : "secondary"}
          className={`w-fit ${isNDAGenerated ? "border-green-500" : ""}`}
          disabled={isGeneratingNDA || isNDAGenerated}
        >
          {isGeneratingNDA ? (
            <Icons.loaderCircle className="h-4 w-4 animate-spin" />
          ) : isNDAGenerated ? (
            <>
              NDA Generated
              <Icons.check className="ml-2 h-4 w-4 text-green-500" />
            </>
          ) : (
            "Generate NDA"
          )}
        </Button>
        <Button type="submit" disabled={!isNDAGenerated} className="w-fit">
          Send NDA
        </Button>
      </div>
    </form>
  );
}
