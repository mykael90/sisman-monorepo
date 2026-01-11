// src/app/(main)/attachment/attachment-types.ts

import { Attachment } from '@sisman/prisma';

export interface IAttachment extends Attachment {}

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
