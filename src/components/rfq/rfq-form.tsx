import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "~/components/ui/dialog";
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
import { Icons } from "../icons";
import type { ChatMessage } from "~/server/api/routers/chat";
import { toast } from "sonner";

import { type RfqLineItem } from "@prisma/client";

import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/router";

type PartialRfqLineItem = Omit<RfqLineItem, "fileNames" | "requestForQuoteId">;

interface Part extends PartialRfqLineItem {
  files: FileObject[];
}

interface FileObject {
  id: number;
  file: File;
  isUploading: boolean;
  fileKey: string;
}

export function RFQFormDialog({
  open,
  setOpen,
  clerkUserId,
  refetchTrigger
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  clerkUserId: string;
  refetchTrigger: () => void;
}) {
  const router = useRouter();
  const [parts, setParts] = useState<Part[]>([
    { id: 1, description: "", quantity: 1, files: [] }
  ]);
  const [sendingRFQ, setSendingRFQ] = useState<boolean>(false);
  const [selectedSuppliers, setSelectedSuppliers] = useState<Option[]>([]);
  const [emailSubject, setEmailSubject] = useState<string>("Request for Quote");
  const [emailBody, setEmailBody] = useState<string>("");
  const emailBodyRef = useRef<HTMLTextAreaElement>(null);
  const rfqMutation = api.rfq.createRequestForQuote.useMutation();
  const sendMessage = api.chat.sendEmail.useMutation();

  // s3 file handling
  const getUploadUrlMutation = api.s3.generateUploadUrl.useMutation();
  const deleteFile = api.s3.deleteFile.useMutation();

  // Fetch all suppliers
  const { data: supplierData } = api.supplier.getAllSuppliers.useQuery({
    clerkUserId
  });

  // Fetch Email Provider
  const { data: emailProvider } = api.user.getEmailProvider.useQuery();

  // Convert supplier data to options for MultipleSelector
  const supplierOptions: Option[] = supplierData
    ? supplierData.map((supplier) => ({
        label: supplier.name,
        value: supplier.id.toString()
      }))
    : [];

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
  }, [parts]);

  const updateEmailBody = () => {
    const defaultMessage =
      "Hi,\n\nPlease send me a quote for the following parts:\n\n";

    const partsList = parts
      .filter((part) => part.description && part.quantity)
      .map((part) => {
        let partDetails = `- Part: ${part.description} - Quantity: ${part.quantity}`;
        if (part.files.length > 0) {
          partDetails += "\n   Attachments:";
          part.files.forEach((fileObj) => {
            partDetails += `\n   - ${fileObj.file.name}`;
          });
        }
        return partDetails;
      })
      .join("\n\n");

    const closingMessage = "\n\nBest regards,\nBerni";

    setEmailBody(partsList ? defaultMessage + partsList + closingMessage : "");
  };

  const handleAddPart = () => {
    const newId = Math.max(...parts.map((p) => p.id), 0) + 1;
    setParts([
      ...parts,
      { id: newId, description: "", quantity: 1, files: [] }
    ]);
  };

  const handleDeletePart = (id: number) => {
    if (parts.length > 1) {
      const newParts = parts.filter((part) => part.id !== id);
      setParts(newParts);
    }
  };

  const handlePartChange = (
    id: number,
    field: keyof Part,
    value: string | number
  ) => {
    const newParts = parts.map((part) =>
      part.id === id ? { ...part, [field]: value } : part
    );
    setParts(newParts);
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

    // Add files to the part immediately to show loading state
    setParts((prevParts) =>
      prevParts.map((part) =>
        part.id === id
          ? { ...part, files: [...part.files, ...updatedFiles] }
          : part
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
        setParts((prevParts) =>
          prevParts.map((part) =>
            part.id === id
              ? {
                  ...part,
                  files: part.files.map((file) =>
                    file.id === fileObj.id
                      ? {
                          ...file,
                          isUploading: false
                        }
                      : file
                  )
                }
              : part
          )
        );
      } catch (error) {
        console.error("Error uploading file:", error);
        // Handle error (e.g., show a notification to the user)
        setParts((prevParts) =>
          prevParts.map((part) =>
            part.id === id
              ? {
                  ...part,
                  files: part.files.filter((file) => file.id !== fileObj.id)
                }
              : part
          )
        );
      }
    }
  };

  const handleDeleteFile = async (partId: number, fileId: number) => {
    const newParts = parts.map((part) =>
      part.id === partId
        ? {
            ...part,
            files: part.files.filter((f) => f.id !== fileId)
          }
        : part
    );
    // delete files from s3
    let fileKeyToDelete: string | undefined;
    outerLoop: for (const part of parts) {
      if (part.id === partId) {
        for (const file of part.files) {
          fileKeyToDelete = file.fileKey;
          break outerLoop;
        }
      }
    }
    if (fileKeyToDelete) {
      void deleteFile.mutateAsync({ fileKey: fileKeyToDelete });
    }
    setParts(newParts);
  };

  const getCurrentDateTime = () => {
    return new Date().toLocaleString();
  };

  const handleSendRFQs = async () => {
    setSendingRFQ(true);
    const validParts = parts.filter(
      (part) => part.description && part.quantity
    );
    if (validParts.length === 0) {
      alert(
        "Please provide at least one part with a description and quantity."
      );
      return;
    }
    if (selectedSuppliers.length === 0) {
      alert("Please select at least one supplier.");
      return;
    }

    try {
      // Create RFQ with toast
      const rfqCreationPromise = rfqMutation.mutateAsync({
        supplierIds: selectedSuppliers.map((supplier) =>
          parseInt(supplier.value)
        ),
        messageBody: emailBody,
        rfqLineItems: validParts.map((part) => ({
          description: part.description!,
          quantity: part.quantity!,
          fileNames: part.files.map((file) => file.fileKey).filter(Boolean)
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
          const newChatMessage: ChatMessage = {
            id: 0,
            chatId: chatToSupplierMap[parseInt(supplier.value)]!,
            content: emailBody,
            fileNames: validParts
              .map((part) => part.files.map((file) => file.fileKey))
              .flat()
              .filter(Boolean),
            createdAt: new Date(),
            updatedAt: new Date(),
            chatParticipantId:
              userChatParticipantToSupplierMap[parseInt(supplier.value)]!
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

      refetchTrigger();
      setOpen(false);
      await router.push(`/rfqs/${rfqId}`);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex max-h-[calc(100vh-2rem)] min-h-[50vh] flex-col overflow-hidden sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Create New RFQ</DialogTitle>
        </DialogHeader>
        <div className="flex flex-grow flex-col gap-6 overflow-y-auto py-4">
          <div className="space-y-4">
            <Label>Parts List</Label>
            <div
              className="overflow-y-auto rounded-md border"
              style={{ maxHeight: "30vh" }}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky top-0 bg-white">
                      Description*
                    </TableHead>
                    <TableHead className="sticky top-0 bg-white">
                      Quantity*
                    </TableHead>
                    <TableHead className="sticky top-0 w-48 bg-white">
                      Files
                    </TableHead>
                    <TableHead className="sticky top-0 bg-white"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {parts.map((part, index) => (
                      <React.Fragment key={part.id}>
                        <motion.tr
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <TableCell>
                            <Input
                              value={part.description ?? ""}
                              onChange={(e) =>
                                handlePartChange(
                                  part.id,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Enter description"
                              required
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={part.quantity ?? ""}
                              onChange={(e) =>
                                handlePartChange(
                                  part.id,
                                  "quantity",
                                  parseInt(e.target.value, 10)
                                )
                              }
                              placeholder="Enter quantity"
                              required
                              min="1"
                            />
                          </TableCell>
                          <TableCell className="w-48">
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center">
                                <Input
                                  id={`part-files-${part.id}`}
                                  type="file"
                                  onChange={(e) => handleFileChange(part.id, e)}
                                  className="hidden"
                                  multiple
                                />
                                <Label
                                  htmlFor={`part-files-${part.id}`}
                                  className="inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-input px-4 py-2 text-sm font-normal ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                                >
                                  <Icons.paperClip className="mr-2 h-4 w-4" />
                                  Attach Files
                                </Label>
                              </div>
                              <AnimatePresence>
                                {part.files.length > 0 && (
                                  <motion.ul
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-2 space-y-1 text-sm"
                                  >
                                    {part.files.map((fileObj) => (
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
                                              part.id,
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
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeletePart(part.id)}
                              disabled={parts.length === 1}
                              className="hover:text-red-600"
                            >
                              <Icons.trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </motion.tr>
                        {index < parts.length - 1 && (
                          <tr>
                            <td colSpan={4} className="p-0">
                              <hr className="border-t border-gray-200" />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
            <motion.div
              whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
              transition={{ duration: 0.2 }}
              className="rounded-md"
            >
              <Button
                variant="ghost"
                className="w-full rounded-xl py-2 text-blue-500 hover:text-blue-700"
                onClick={handleAddPart}
              >
                <Icons.add className="mr-2 h-4 w-4" />
                Add New Part
              </Button>
            </motion.div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="suppliers">Suppliers</Label>
            <div className="w-full p-1">
              <MultipleSelector
                defaultOptions={supplierOptions}
                placeholder="Select Suppliers..."
                emptyIndicator={
                  <p className="text-center leading-10 text-gray-600 dark:text-gray-400">
                    No more suppliers found... :)
                  </p>
                }
                onChange={(value) => setSelectedSuppliers(value)}
                hideClearAllButton={true}
              />
            </div>
          </div>
          <div className="flex-grow space-y-2">
            <Label htmlFor="email">Email Draft</Label>
            <div className="flex h-full min-h-[200px] flex-col overflow-hidden rounded-md border">
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Subject"
                className="rounded-none border-0 border-b focus:ring-0"
                style={{
                  fontFamily: "inherit",
                  fontSize: "0.75rem",
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
                  fontSize: "0.75rem",
                  lineHeight: "1rem"
                }}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <div className="flex items-center">
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RFQFormDialog;