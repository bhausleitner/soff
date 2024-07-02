import { useState } from "react";
import { useRouter } from "next/router";
import { userData } from "~/static/data";
import { Chat } from "~/components/chat/chat";
import { api } from "~/utils/api";

export default function Order() {
  const [selectedUser, setSelectedUser] = useState(userData[0]);
  const router = useRouter();
  const { id } = router.query;

  const supplierId = Number(id);

  if (isNaN(supplierId)) {
    // Todo show generic failure page
    return <div>Invalid Supplier ID</div>;
  }

  const { data, isLoading } = api.supplier.getSupplierById.useQuery({
    supplierId
  });

  return (
    <div className="flex h-full flex-col space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Order</h2>
      </div>
      <div>
        <p>This is the Supplier Name: {data?.title}</p>
      </div>
      {selectedUser && (
        <Chat messages={selectedUser.messages} selectedUser={selectedUser} />
      )}
    </div>
  );
}
