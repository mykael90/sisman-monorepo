'use client';

import { mergeForm, useForm, useTransform } from '@tanstack/react-form';
import { useStore } from '@tanstack/react-store';
import { FC, useActionState } from 'react';
import {
  FormInputField,
  FormInputFile
} from '@/components/form-tanstack/form-input-fields';
import { Button } from '@/components/ui/button';
import { Save, Plus } from 'lucide-react';
import { IActionResultForm } from '@/types/types-server-actions';
import { FormSuccessDisplay } from '@/components/form-tanstack/form-success-display';
import { ErrorServerForm } from '@/components/form-tanstack/error-server-form';
import { IAttachment, IAttachmentAdd } from '../../attachment-types';
import { useState, useCallback, useEffect } from 'react';
import { IMediaFile } from '@/types/media';
import MediaGallery from '@/components/media/card-media-gallery';
import MediaCarouselViewer from '@/components/media/media-carousel-viewer';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function AttachmentForm({
  mode,
  defaultData,
  formActionProp,
  initialServerState = {
    isSubmitSuccessful: false,
    message: ''
  },
  fieldLabels,
  formSchema,
  onCancel,
  onClean,
  submitButtonText,
  SubmitButtonIcon,
  isInDialog = false
}: {
  mode: 'add' | 'edit';
  defaultData: IAttachmentAdd;
  formActionProp: (
    prevState: IActionResultForm<IAttachmentAdd, IAttachment>,
    data: FormData
  ) => Promise<IActionResultForm<IAttachmentAdd, IAttachment>>;
  initialServerState?: IActionResultForm<IAttachmentAdd, IAttachment>;
  fieldLabels: {
    [k: string]: string;
  };
  formSchema?: any;
  onCancel?: () => void;
  onClean?: () => void;
  submitButtonText?: string;
  SubmitButtonIcon?: FC<{ className?: string }>;
  isInDialog?: boolean;
}) {
  const [serverState, dispatchFormAction, isPending] = useActionState(
    formActionProp,
    initialServerState
  );

  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [initialViewerIndex, setInitialViewerIndex] = useState(0);
  const [viewerFiles, setViewerFiles] = useState<IMediaFile[]>([]);
  const [previewFiles, setPreviewFiles] = useState<IMediaFile[]>([]);

  const form = useForm({
    defaultValues: defaultData,
    transform: useTransform(
      (baseForm) => mergeForm(baseForm, serverState ?? {}),
      [serverState]
    ),
    validators: formSchema ? { onChange: formSchema } : undefined,
    onSubmit: async ({ value }: { value: IAttachmentAdd }) => {
      const formData = new FormData();
      formData.append('relatedId', String(value.relatedId));
      formData.append('relatedModel', value.relatedModel);
      if (value.file) {
        formData.append('file', value.file);
      }
      await dispatchFormAction(formData);
    }
  });

  const handleReset = onClean
    ? () => {
        form.reset();
        onClean && onClean();
      }
    : undefined;

  const handleCancel = () => {
    onCancel && onCancel();
  };

  const formFile = useStore(form.store, (state) => state.values.file);

  useEffect(() => {
    if (!formFile) {
      setPreviewFiles([]);
      return;
    }

    const extension = formFile.name.split('.').pop() || '';
    const newPreviewFile: IMediaFile = {
      url: URL.createObjectURL(formFile),
      extension: extension,
      fileName: formFile.name,
      description: ''
    };

    setPreviewFiles([newPreviewFile]);

    // Cleanup Blob URL
    return () => {
      URL.revokeObjectURL(newPreviewFile.url);
    };
  }, [formFile]);

  const handleThumbnailClick = useCallback(
    (file: IMediaFile) => {
      const playableExtensions = [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'webp',
        'avif',
        'mp4',
        'webm',
        'ogg',
        'mov',
        'avi',
        'mkv'
      ];

      const playableFiles = previewFiles.filter((f) =>
        playableExtensions.includes(f.extension.toLowerCase())
      );

      const clickedIndex = playableFiles.findIndex((f) => f.url === file.url);

      if (clickedIndex !== -1) {
        setViewerFiles(playableFiles);
        setInitialViewerIndex(clickedIndex);
        setIsViewerOpen(true);
      }
    },
    [previewFiles]
  );

  useStore(form.store, (formState) => formState.errorsServer);

  if (serverState?.isSubmitSuccessful && serverState.responseData) {
    return (
      <FormSuccessDisplay<IAttachmentAdd, IAttachment>
        serverState={serverState}
        handleActions={{
          handleResetForm: handleReset,
          handleCancelForm: handleCancel
        }}
        dataAddLabel={fieldLabels}
        messageActions={{
          handleResetForm: 'Adicionar novo anexo',
          handleCancel: 'Voltar para a lista'
        }}
        isInDialog={isInDialog}
      />
    );
  }

  const currentSubmitButtonText =
    submitButtonText ||
    (mode === 'add' ? 'Adicionar Anexo' : 'Salvar Alterações');

  const CurrentSubmitButtonIcon =
    (SubmitButtonIcon && <SubmitButtonIcon className='mr-2 h-5 w-5' />) ||
    (mode === 'add' ? (
      <Plus className='mr-2 h-5 w-5' />
    ) : (
      <Save className='mr-2 h-5 w-5' />
    ));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      onReset={(e) => {
        e.preventDefault();
        handleReset && handleReset();
      }}
      className='rounded-lg bg-white p-6 shadow-md'
    >
      <ErrorServerForm<IAttachmentAdd> serverState={serverState} />

      <form.Field name='relatedModel'>
        {(field) => (
          <FormInputField
            field={field}
            label={fieldLabels.relatedModel}
            placeholder='Ex: User, Contract, etc'
            className='mb-4'
          />
        )}
      </form.Field>

      <form.Field name='relatedId'>
        {(field) => (
          <FormInputField
            field={field}
            label={fieldLabels.relatedId}
            placeholder='ID do registro relacionado'
            className='mb-4'
          />
        )}
      </form.Field>

      <form.Field
        name='file'
        children={(field) => (
          <FormInputFile
            field={field}
            label={fieldLabels.file}
            placeholder='Selecionar arquivo'
            className='mb-4'
          />
        )}
      />

      {previewFiles.length > 0 && (
        <div className='mt-4'>
          <MediaGallery
            files={previewFiles}
            getPublicFileUrl={(url) => url}
            galleryTitle='Pré-visualização do Anexo'
            onThumbnailClick={handleThumbnailClick}
          />
        </div>
      )}

      {/* Componente Modal para o MediaCarouselViewer */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className='max-w-screen-lg border-none bg-transparent p-0'>
          <MediaCarouselViewer
            files={viewerFiles}
            getPublicFileUrl={(url) => url}
            initialIndex={initialViewerIndex}
            onClose={() => setIsViewerOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <div className='mt-8 flex justify-end gap-3'>
        {mode === 'add' && (
          <Button type='button' variant='outline' onClick={handleReset}>
            Limpar
          </Button>
        )}
        <form.Subscribe
          selector={(state) => [
            state.canSubmit,
            state.isTouched,
            state.isValidating
          ]}
        >
          {([canSubmit, isTouched, isValidating]) => (
            <Button
              type='submit'
              disabled={
                !canSubmit ||
                isPending ||
                isValidating ||
                (mode === 'add' && !isTouched)
              }
            >
              {isPending || isValidating
                ? 'Processando...'
                : CurrentSubmitButtonIcon}
              {isPending || isValidating ? '' : currentSubmitButtonText}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
