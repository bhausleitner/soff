import * as React from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "~/components/ui/dialog";
import { FileUploader } from "~/components/ui/file-uploader";
import { Icons } from "../icons";
import { api } from "~/utils/api";
import { useRouter } from "next/router";

export function QuoteUploadDialog() {
  const router = useRouter();
  const [uploadProgress, setUploadProgress] = React.useState<
    Record<string, number>
  >({});
  const getUploadUrlMutation = api.s3.generateUploadUrl.useMutation();

  const uploadToS3 = async (file: File) => {
    const fileKey = `drag-drop/${uuidv4()}/${file.name}`;
    try {
      // Get S3 upload URL
      const { uploadUrl } = await getUploadUrlMutation.mutateAsync({
        fileKey,
        fileType: file.type
      });

      // Upload file to S3
      const response = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to upload ${file.name}`);
      }

      return fileKey;
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error);
      throw error;
    }
  };

  const handleUpload = async (filesToUpload: File[]) => {
    const newUploadProgress = { ...uploadProgress };
    let uploadedFileKey = "";
    try {
      for (const file of filesToUpload) {
        newUploadProgress[file.name] = 0;
        setUploadProgress(newUploadProgress);

        uploadedFileKey = await uploadToS3(file);

        newUploadProgress[file.name] = 100;
        setUploadProgress({ ...newUploadProgress });
      }

      await router.push(`/quotes/parsing?fileKey=${uploadedFileKey}`);
    } catch (error) {
      toast.error("An error occurred during file upload");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="soff">
          Upload Quotes
          <Icons.upload className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Upload Quotes</DialogTitle>
        </DialogHeader>
        <FileUploader
          onUpload={handleUpload}
          progresses={uploadProgress}
          accept={{ "application/pdf": [] }}
        />
      </DialogContent>
    </Dialog>
  );
}
