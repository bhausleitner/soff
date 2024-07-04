import { useRouter } from "next/router";

export function SupplierLink({ row }) {
  const supplier = row.original;
  const router = useRouter();

  const handleNavigation = async () => {
    await router.push(`/suppliers/${supplier.id}`);
  };

  return (
    <p
      onClick={handleNavigation}
      className="cursor-pointer text-blue-600 hover:text-blue-800"
    >
      {supplier.title}
    </p>
  );
}
