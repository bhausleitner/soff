import { type Supplier } from "@prisma/client";
import { Icons } from "~/components/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

interface ChatMetadataProps {
  supplier: Supplier;
}

export function ChatMetadata({ supplier }: ChatMetadataProps) {
  return (
    <div>
      <div className="border-b pb-4">
        <div className="pl-4">
          <h3 className="mb-4 text-xl font-semibold">{supplier.name}</h3>
          <div className="mb-2 flex items-center">
            <Icons.mapPin className="mr-2 text-gray-600" />
            <span className="text-gray-800">{supplier.contactPerson}</span>
          </div>
          <div className="flex items-center">
            <Icons.phone className="text-gray-6000 mr-2" />
            <span className="text-gray-800">{supplier.email}</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <Tabs defaultValue="account" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="sentFiles">Sent Files</TabsTrigger>
            <TabsTrigger value="receivedFiles">Received Files</TabsTrigger>
          </TabsList>
          <TabsContent value="sentFiles">
            Make changes to your account here.
          </TabsContent>
          <TabsContent value="receivedFiles">
            Change your password here.
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
