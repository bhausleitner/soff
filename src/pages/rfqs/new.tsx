import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "~/components/ui/table";
import MultipleSelector, { type Option } from "~/components/ui/multi-select";
import { api } from "~/utils/api";
import { Icons } from "~/components/icons";
import type { ChatMessage } from "~/server/api/routers/chat";
import { toast } from "sonner";

import { type RfqLineItem } from "@prisma/client";

import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/router";
import { useUser } from "@clerk/nextjs";
import EmailMultiSelector, {
  type EmailOption
} from "~/components/ui/email-multi-select";
import { Switch } from "~/components/ui/switch";
import { getLastValueOfCommaString } from "~/utils/string-format";
import ErpProductSelect from "~/components/rfq/erp-product-select";
import BreadCrumbWrapper from "~/components/common/breadcrumb-wrapper";

type PartialRfqLineItem = Omit<RfqLineItem, "fileNames" | "requestForQuoteId">;

interface RfqProduct extends PartialRfqLineItem {
  quantityTiers: number[];
  files: FileObject[];
  erpProductCode: string;
  erpProductId: number;
}

interface FileObject {
  id: number;
  file: File;
  isUploading: boolean;
  fileKey: string;
}

export default function NewRFQForm() {
  const { user } = useUser();
  const clerkUserId = user?.id;
  const router = useRouter();
  const [rfqProducts, setRfqProducts] = useState<RfqProduct[]>([
    {
      id: 1,
      description: "",
      quantityTiers: [1],
      quantity: 1,
      files: [],
      erpProductCode: "",
      erpProductId: 0
    }
  ]);
  const [sendingRFQ, setSendingRFQ] = useState<boolean>(false);
  const [selectedSuppliers, setSelectedSuppliers] = useState<Option[]>([]);
  const [emailSubject, setEmailSubject] = useState<string>("Request for Quote");
  const [emailBody, setEmailBody] = useState<string>("");
  const emailBodyRef = useRef<HTMLTextAreaElement>(null);
  const rfqMutation = api.rfq.createRequestForQuote.useMutation();
  const sendMessage = api.chat.sendEmail.useMutation();
  const [ccEnabled, setCcEnabled] = useState(false);
  const [ccEmails, setCcEmails] = useState<EmailOption[]>([]);
  const [enableTieredPrices, setEnableTieredPrices] = useState(false);
  const [supplierOptions, setSupplierOptions] = useState<Option[]>([]);

  // s3 file handling
  const getUploadUrlMutation = api.s3.generateUploadUrl.useMutation();
  const deleteFile = api.s3.deleteFile.useMutation();

  // Fetch all suppliers
  const { data: supplierData } = api.supplier.getAllSuppliers.useQuery({
    clerkUserId: clerkUserId ?? ""
  });

  // Fetch all erp products
  const { data: erpProducts } = api.product.getAllErpProducts.useQuery({
    clerkUserId: clerkUserId ?? ""
  });

  // Fetch Email Provider
  const { data: emailProvider } = api.user.getEmailProvider.useQuery();

  // Create Supplier
  const createSupplierMutation = api.supplier.createSupplier.useMutation();

  // Convert supplier data to options for MultipleSelector
  useEffect(() => {
    if (supplierData) {
      const newSupplierOptions = supplierData
        .filter((supplier) => supplier.email)
        .map((supplier) => ({
          label: `${supplier.name} (${supplier.email})`,
          value: `${supplier.name},${supplier.email},${supplier.id}`
        }));
      setSupplierOptions(newSupplierOptions);
    }
  }, [supplierData]);

  useEffect(() => {
    if (emailBodyRef.current) {
      const textArea = emailBodyRef.current;
      const resizeTextArea = () => {
        textArea.style.height = "auto";
        textArea.style.height = textArea.scrollHeight + "px";
      };
      resizeTextArea();
      textArea.addEventListener("input", resizeTextArea);
      return () => {
        if (textArea) {
          textArea.removeEventListener("input", resizeTextArea);
        }
      };
    }
  }, []);

  useEffect(() => {
    updateEmailBody();
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rfqProducts]);

  const updateEmailBody = () => {
    const defaultMessage =
      "Hi {{first_name}},\n\nPlease send me a quote for the following products:\n\n";

    const productList = rfqProducts
      .filter(
        (rfqProduct) =>
          rfqProduct.description && rfqProduct.quantityTiers.length > 0
      )
      .map((rfqProduct) => {
        let productDetails = `- Product: [${rfqProduct.erpProductCode}] ${rfqProduct.description}\n`;

        if (rfqProduct.quantityTiers.length === 1) {
          productDetails += `   Quantity: ${rfqProduct.quantityTiers[0]}\n`;
        } else {
          productDetails += `   Quantities: ${rfqProduct.quantityTiers?.map((tier) => tier).join(" - ")}\n`;
        }

        if (rfqProduct.files && rfqProduct.files.length > 0) {
          productDetails += "   Attachments:";
          rfqProduct.files.forEach((fileObj) => {
            productDetails += `\n   - ${fileObj.file.name}`;
          });
        }

        return productDetails;
      })
      .join("\n\n");

    const closingMessage = `\n\nBest regards,\n${user?.firstName}`;

    setEmailBody(
      productList ? defaultMessage + productList + closingMessage : ""
    );
  };

  const handleAddProduct = () => {
    const newId = Math.max(...rfqProducts.map((p) => p.id), 0) + 1;
    setRfqProducts([
      ...rfqProducts,
      {
        id: newId,
        description: "",
        quantityTiers: [1],
        quantity: 1,
        files: [],
        erpProductCode: "",
        erpProductId: 0
      }
    ]);
  };

  const handleDeleteProduct = (id: number) => {
    if (rfqProducts.length > 1) {
      const newProducts = rfqProducts.filter(
        (rfqProduct) => rfqProduct.id !== id
      );
      setRfqProducts(newProducts);
    }
  };

  const handleProductChange = (id: number, changes: Partial<RfqProduct>) => {
    const newRfqProducts = rfqProducts.map((rfqProduct) =>
      rfqProduct.id === id ? { ...rfqProduct, ...changes } : rfqProduct
    );

    setRfqProducts(newRfqProducts);
  };

  const handleTierChange = (
    productId: number,
    tierIndex: number,
    value: number
  ) => {
    setRfqProducts((prevRfqProducts) =>
      prevRfqProducts.map((rfqProduct) =>
        rfqProduct.id === productId
          ? {
              ...rfqProduct,
              quantityTiers: rfqProduct.quantityTiers.map((tier, index) =>
                index === tierIndex ? value : tier
              )
            }
          : rfqProduct
      )
    );
  };

  const handleAddTier = (productId: number) => {
    setRfqProducts((prevRfqProducts) =>
      prevRfqProducts.map((rfqProduct) =>
        rfqProduct.id === productId
          ? {
              ...rfqProduct,
              quantityTiers: [...rfqProduct.quantityTiers, 1]
            }
          : rfqProduct
      )
    );
  };

  const handleDeleteTier = (productId: number, tierIndex: number) => {
    setRfqProducts((prevRfqProducts) =>
      prevRfqProducts.map((rfqProduct) =>
        rfqProduct.id === productId
          ? {
              ...rfqProduct,
              quantityTiers: rfqProduct.quantityTiers.filter(
                (_, index) => index !== tierIndex
              )
            }
          : rfqProduct
      )
    );
  };

  const handleFileChange = async (
    id: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newFiles = Array.from(e.target.files ?? []);
    const updatedFiles: FileObject[] = newFiles.map((file) => ({
      id: Date.now(),
      file: file,
      isUploading: true,
      fileKey: `rfqModal/${uuidv4()}/${file.name}`
    }));

    // Add files to the product immediately to show loading state
    setRfqProducts((prevRfqProducts) =>
      prevRfqProducts.map((rfqProduct) =>
        rfqProduct.id === id
          ? { ...rfqProduct, files: [...rfqProduct.files, ...updatedFiles] }
          : rfqProduct
      )
    );

    for (const fileObj of updatedFiles) {
      try {
        // Get S3 upload URL
        const { uploadUrl } = await getUploadUrlMutation.mutateAsync({
          fileKey: fileObj.fileKey,
          fileType: fileObj.file.type
        });

        // Upload file to S3
        await fetch(uploadUrl, {
          method: "PUT",
          body: fileObj.file,
          headers: {
            "Content-Type": fileObj.file.type
          }
        });

        // Update file object with S3 URL and set isUploading to false
        setRfqProducts((prevRfqProducts) =>
          prevRfqProducts.map((rfqProduct) =>
            rfqProduct.id === id
              ? {
                  ...rfqProduct,
                  files: rfqProduct.files.map((file) =>
                    file.id === fileObj.id
                      ? {
                          ...file,
                          isUploading: false
                        }
                      : file
                  )
                }
              : rfqProduct
          )
        );
      } catch (error) {
        console.error("Error uploading file:", error);
        // Handle error (e.g., show a notification to the user)
        setRfqProducts((prevRfqProducts) =>
          prevRfqProducts.map((rfqProduct) =>
            rfqProduct.id === id
              ? {
                  ...rfqProduct,
                  files: rfqProduct.files.filter(
                    (file) => file.id !== fileObj.id
                  )
                }
              : rfqProduct
          )
        );
      }
    }
  };

  const handleDeleteFile = async (productId: number, fileId: number) => {
    const newRfqProducts = rfqProducts.map((rfqProduct) =>
      rfqProduct.id === productId
        ? {
            ...rfqProduct,
            files: rfqProduct.files.filter((f) => f.id !== fileId)
          }
        : rfqProduct
    );
    // delete files from s3
    let fileKeyToDelete: string | undefined;
    outerLoop: for (const rfqProduct of rfqProducts) {
      if (rfqProduct.id === productId) {
        for (const file of rfqProduct.files) {
          fileKeyToDelete = file.fileKey;
          break outerLoop;
        }
      }
    }
    if (fileKeyToDelete) {
      void deleteFile.mutateAsync({ fileKey: fileKeyToDelete });
    }
    setRfqProducts(newRfqProducts);
  };

  const getCurrentDateTime = () => {
    return new Date().toLocaleString();
  };

  const handleSupplierChange = async (value: Option[]) => {
    const newSuppliers = value.filter(
      (supplier) => !selectedSuppliers.find((s) => s.value === supplier.value)
    );

    for (const newSupplier of newSuppliers) {
      if (!newSupplier.value.includes(",")) {
        // This is a newly created supplier
        try {
          const createdSupplier = await createSupplierMutation.mutateAsync({
            email: newSupplier.value
          });

          // Update the newly created supplier with the correct format
          const updatedSupplier: Option = {
            label: `${createdSupplier.name} (${createdSupplier.email})`,
            value: `${createdSupplier.name},${createdSupplier.email},${createdSupplier.id}`
          };

          // Replace the temporary supplier with the updated one
          value = value.map((s) =>
            s.value === newSupplier.value ? updatedSupplier : s
          );

          toast.success(`Added new Supplier: ${createdSupplier.email}`);
        } catch (error) {
          console.error("Error creating supplier:", error);
          toast.error(
            `Failed to create supplier ${newSupplier.value}. Please try again.`
          );
          // Remove the failed supplier from the list
          value = value.filter((s) => s.value !== newSupplier.value);
        }
      }
    }

    setSelectedSuppliers(value);
  };

  const handleSendRFQs = async () => {
    setSendingRFQ(true);
    const validProducts = rfqProducts.filter(
      (rfqProduct) =>
        rfqProduct.description && rfqProduct.quantityTiers.length > 0
    );
    if (validProducts.length === 0) {
      toast.error(
        "Please provide at least one product with a description and quantity."
      );
      return;
    }
    if (selectedSuppliers.length === 0) {
      toast.error("Please select at least one supplier.");
      return;
    }

    try {
      // Create RFQ with toast
      const rfqCreationPromise = rfqMutation.mutateAsync({
        supplierIds: selectedSuppliers.map((supplier) =>
          parseInt(getLastValueOfCommaString(supplier.value))
        ),
        subject: emailSubject,
        rfqLineItems: validProducts.map((validProduct) => ({
          description: validProduct.description!,
          quantity: validProduct.quantityTiers[0]!,
          fileNames: validProduct.files
            .map((file) => file.fileKey)
            .filter(Boolean)
        }))
      });

      toast.promise(rfqCreationPromise, {
        loading: "Creating RFQ Package...",
        success: "RFQ Package created successfully!",
        error: "Failed to create RFQ Package. Please try again.",
        description: getCurrentDateTime()
      });

      const { userChatParticipantToSupplierMap, chatToSupplierMap, rfqId } =
        await rfqCreationPromise;

      // send message to each selected supplier
      await Promise.all(
        selectedSuppliers.map(async (supplier) => {
          const supplierId = parseInt(
            getLastValueOfCommaString(supplier.value ?? "")
          );

          const newChatMessage: ChatMessage = {
            id: 0,
            chatId: chatToSupplierMap[supplierId]!,
            content: emailBody,
            subject: emailSubject,
            fileNames: validProducts
              .map((validProduct) =>
                validProduct.files.map((file) => file.fileKey)
              )
              .flat()
              .filter(Boolean),
            createdAt: new Date(),
            updatedAt: new Date(),
            chatParticipantId: userChatParticipantToSupplierMap[supplierId]!,
            ccRecipients: ccEmails.map((email) => ({
              email: email.value
            }))
          };

          const sendMessagePromise = sendMessage.mutateAsync({
            chatMessage: newChatMessage,
            emailProvider: emailProvider!
          });

          toast.promise(sendMessagePromise, {
            loading: `Sending E-Mail to ${supplier.label}...`,
            success: `E-Mail sent to ${supplier.label}!`,
            error: `Failed sending E-Mail to ${supplier.label}. Please try again.`,
            description: getCurrentDateTime()
          });

          return sendMessagePromise;
        })
      );

      void router.push(`/rfqs/${rfqId}`);
    } catch (error) {
      console.error("Error in RFQ process:", error);
      toast.error("An error occurred in the RFQ process. Please try again.", {
        duration: 5000,
        icon: "❌"
      });
    } finally {
      setSendingRFQ(false);
    }
  };

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex items-center justify-between">
        <BreadCrumbWrapper
          items={[
            { label: "RFQs", href: "/rfqs" },
            { label: "New RFQ", href: "/rfqs/new" }
          ]}
        />
        <div className="flex items-center space-x-2 pr-6">
          <Switch
            checked={enableTieredPrices}
            onCheckedChange={setEnableTieredPrices}
          />
          <Label htmlFor="enable-tiered-prices">Enable Tiered Pricing</Label>
        </div>
      </div>
      <div className="flex h-full flex-1 flex-grow space-x-4 overflow-hidden pt-4">
        {/* Left Half: rfqProducts List */}
        <div className="w-full space-y-4 md:w-1/2 md:pr-4">
          <div className="h-full overflow-y-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky top-0 bg-white text-center">
                    Product Description
                  </TableHead>
                  <TableHead className="sticky top-0 w-28 bg-white text-center">
                    Quantity
                  </TableHead>
                  <TableHead className="sticky top-0 w-48 bg-white text-center">
                    Files
                  </TableHead>
                  <TableHead className="sticky top-0 bg-white"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {rfqProducts.map((rfqProduct, index) => (
                    <React.Fragment key={index}>
                      <motion.tr
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <TableCell className="pt-4 align-top">
                          <ErpProductSelect
                            erpProducts={erpProducts ?? []}
                            selectedErpProductId={rfqProduct.erpProductId ?? 0}
                            onErpProductSelect={(
                              erpProductName,
                              erpProductCode,
                              erpProductId
                            ) => {
                              handleProductChange(rfqProduct.id, {
                                description: `${erpProductCode} ${erpProductName}`,
                                erpProductCode: erpProductCode ?? undefined,
                                erpProductId
                              });
                            }}
                          />
                        </TableCell>
                        <TableCell className="pt-4 align-top">
                          <div className="space-y-2">
                            {rfqProduct.quantityTiers.map((tier, tierIndex) => (
                              <div
                                key={tierIndex}
                                className="flex items-center space-x-2"
                              >
                                <Input
                                  type="number"
                                  value={tier}
                                  onChange={(e) =>
                                    handleTierChange(
                                      rfqProduct.id,
                                      tierIndex,
                                      parseInt(e.target.value, 10)
                                    )
                                  }
                                  placeholder="Quantity"
                                  min="1"
                                />
                                {enableTieredPrices && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleDeleteTier(rfqProduct.id, tierIndex)
                                    }
                                    className="hover:text-red-600"
                                  >
                                    <Icons.trash className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            {enableTieredPrices && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAddTier(rfqProduct.id)}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <Icons.add className="mr-1 h-4 w-4" />
                                Add Tier
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="w-48 items-center pt-4 align-top">
                          <div className="flex flex-col space-y-2">
                            <div className="flex w-full">
                              <Input
                                id={`product-files-${rfqProduct.id}`}
                                type="file"
                                onChange={(e) =>
                                  handleFileChange(rfqProduct.id, e)
                                }
                                className="hidden"
                                multiple
                              />
                              <Label
                                htmlFor={`product-files-${rfqProduct.id}`}
                                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-input px-4 py-2 text-sm font-normal ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                              >
                                <Icons.paperClip className="mr-2 h-4 w-4" />
                                Attach Files
                              </Label>
                            </div>
                            <AnimatePresence>
                              {rfqProduct.files.length > 0 && (
                                <motion.ul
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-2 space-y-1 text-sm"
                                >
                                  {rfqProduct.files.map((fileObj) => (
                                    <motion.li
                                      key={fileObj.id}
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{ opacity: 0, x: -20 }}
                                      transition={{ duration: 0.2 }}
                                      className="flex items-center justify-between rounded-md bg-blue-50 px-2 py-1"
                                    >
                                      <span className="max-w-[120px] truncate">
                                        {fileObj.file.name}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleDeleteFile(
                                            rfqProduct.id,
                                            fileObj.id
                                          )
                                        }
                                      >
                                        {fileObj.isUploading ? (
                                          <Icons.loaderCircle className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Icons.close className="h-4 w-4 hover:text-red-600" />
                                        )}
                                      </Button>
                                    </motion.li>
                                  ))}
                                </motion.ul>
                              )}
                            </AnimatePresence>
                          </div>
                        </TableCell>
                        <TableCell className="pt-4 align-top">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteProduct(rfqProduct.id)}
                            disabled={rfqProducts.length === 1}
                            className="hover:text-red-600"
                          >
                            <Icons.trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                      <tr>
                        <td colSpan={4} className="p-0">
                          <hr className="border-t border-gray-200" />
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>

            <motion.div
              whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
              transition={{ duration: 0.2 }}
              className="m-2 rounded-md"
            >
              <Button
                variant="ghost"
                className="w-full rounded-xl py-2 text-blue-500 hover:text-blue-700"
                onClick={handleAddProduct}
              >
                <Icons.add className="mr-2 h-4 w-4" />
                Add New Product
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Right Half: Suppliers and Email Draft */}
        <div className="flex w-full flex-col space-y-4 md:w-1/2 md:pl-4">
          <div className="flex items-center space-x-2 pr-1">
            <Label
              htmlFor="supplier-selector"
              className="w-8 text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Bcc
            </Label>
            <MultipleSelector
              options={supplierOptions}
              placeholder="Select Suppliers..."
              emptyIndicator={
                <p className="text-center leading-10 text-gray-600 dark:text-gray-400">
                  No more suppliers found... :)
                </p>
              }
              onChange={handleSupplierChange}
              hideClearAllButton={true}
              creatable={true}
            />
            {!ccEnabled && (
              <Label
                onClick={() => setCcEnabled(!ccEnabled)}
                className="ml-2 w-8 cursor-pointer text-sm font-medium text-gray-700 hover:underline dark:text-gray-200"
              >
                Cc
              </Label>
            )}
          </div>
          {ccEnabled && (
            <div className="flex items-center space-x-2 pr-1">
              <Label
                onClick={() => setCcEnabled(!ccEnabled)}
                htmlFor="cc-input"
                className="w-8 cursor-pointer text-sm font-medium text-gray-700 hover:underline dark:text-gray-200"
              >
                Cc
              </Label>
              <EmailMultiSelector
                value={ccEmails}
                onChange={(newValue) => setCcEmails(newValue)}
                placeholder="Enter email addresses..."
                maxSelected={5}
                onMaxSelected={(max) =>
                  toast.error(
                    `You can only select up to ${max} email addresses.`
                  )
                }
              />
            </div>
          )}
          <div className="flex h-full flex-col overflow-hidden rounded-md border">
            <Input
              id="email-subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Subject"
              className="rounded-none border-0 border-b focus:ring-0"
              style={{
                fontFamily: "inherit",
                fontSize: "0.9rem",
                lineHeight: "1rem"
              }}
            />
            <textarea
              ref={emailBodyRef}
              id="email-body"
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Compose email"
              className="w-full flex-grow resize-none border-0 p-2 focus:outline-none"
              style={{
                fontFamily: "inherit",
                fontSize: "0.9rem",
                lineHeight: "1.2rem"
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end">
        <Button
          className="w-32"
          variant="soff"
          onClick={handleSendRFQs}
          disabled={sendingRFQ}
        >
          {sendingRFQ ? (
            <Icons.loaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Send RFQ
              <Icons.sendHorizontal className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
