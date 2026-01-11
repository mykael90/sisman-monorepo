// src/app/(main)/attachment/attachment-types.ts

export interface IAttachment {
  id: number;
  relatedId: number;
  relatedModel: string;
  originalName: string;
  fileName: string;
  mimetype: string;
  size: number;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface IAttachmentAdd {
  relatedId: number | string;
  relatedModel: string;
  file: File;
}

export interface IAttachmentAddBatch {
    relatedId: number | string;
    relatedModel: string;
    files: File[];
}