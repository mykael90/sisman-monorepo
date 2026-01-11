'use client';

import {
  mergeForm,
  useForm,
  useTransform,
  type DeepValue
} from '@tanstack/react-form';
import { useStore } from '@tanstack/react-store';
import { FC, useActionState } from 'react';
import {
  FormDropdownModal,
  FormInputField,
  FormInputFile
} from '@/components/form-tanstack/form-input-fields';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { UserPlus, Save } from 'lucide-react'; // TODO: Change to WorkerPlus, Save
import { IActionResultForm } from '@/types/types-server-actions';
import { FormSuccessDisplay } from '@/components/form-tanstack/form-success-display';
import { ErrorServerForm } from '@/components/form-tanstack/error-server-form';
import { useState, useCallback, useEffect } from 'react';
import { IMediaFile } from '@/types/media';
import MediaGallery from '@/components/media/card-media-gallery';
import MediaCarouselViewer from '@/components/media/media-carousel-viewer';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  IWorker,
  IWorkerAdd,
  IWorkerEdit,
  IWorkerRelatedData
} from '../../worker-types';
import {
  maskDateInput,
  normalizeDate,
  maskPhoneInput,
  maskCpfInput
} from '../../../../../lib/utils';

// Helper type for form data based on mode
type WorkerFormData<TMode extends 'add' | 'edit'> = TMode extends 'add'
  ? IWorkerAdd
  : IWorkerEdit;

// Componente genérico WorkerForm
export default function WorkerForm<TMode extends 'add' | 'edit'>({
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
  relatedData,
  isInDialog = false
}: {
  mode: TMode;
  defaultData: WorkerFormData<TMode>;
  formActionProp: (
    prevState: IActionResultForm<WorkerFormData<TMode>, IWorker>,
    data: FormData
  ) => Promise<IActionResultForm<WorkerFormData<TMode>, IWorker>>;
  initialServerState?: IActionResultForm<WorkerFormData<TMode>, IWorker>;
  fieldLabels: {
    [k: string]: string;
  };
  formSchema?: any;
  onCancel?: () => void;
  onClean?: () => void;
  submitButtonText?: string;
  SubmitButtonIcon?: FC<{ className?: string }>;
  relatedData: IWorkerRelatedData;
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

  const {
    listContracts,
    listWorkerSpecialties,
    listMaintenanceInstances,
    listSipacUnidades
  } = relatedData;

  const form = useForm({
    defaultValues: defaultData,
    transform: useTransform(
      (baseForm) => mergeForm(baseForm, serverState ?? {}),
      [serverState]
    ),
    validators: formSchema ? { onChange: formSchema } : undefined,
    onSubmit: async ({ value }: { value: WorkerFormData<TMode> }) => {
      const formData = new FormData();
      Object.entries(value).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          if (val instanceof File) {
            formData.append(key, val);
          } else if (Array.isArray(val)) {
            // Para arrays (ex: workerContracts), enviamos como JSON string ou tratamos conforme necessário
            // Para simplificar e manter a compatibilidade com formDataToObject, vamos enviar como múltiplos campos se forem Files, ou JSON se forem objetos
            formData.append(key, JSON.stringify(val));
          } else {
            formData.append(key, String(val));
          }
        }
      });
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
    if (!formFile || !(formFile instanceof File)) {
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
      const playableExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'];

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
      <FormSuccessDisplay<WorkerFormData<TMode>, IWorker>
        serverState={serverState}
        handleActions={{
          handleResetForm: handleReset,
          handleCancelForm: handleCancel
        }}
        dataAddLabel={fieldLabels}
        messageActions={{
          handleResetForm: 'Cadastrar novo colaborador',
          handleCancel: 'Voltar para a lista'
        }}
        isInDialog={isInDialog}
      />
    );
  }

  const currentSubmitButtonText =
    submitButtonText ||
    (mode === 'add' ? 'Criar colaborador' : 'Salvar Alterações');

  const CurrentSubmitButtonIcon =
    (SubmitButtonIcon && <SubmitButtonIcon className='mr-2 h-5 w-5' />) ||
    (mode === 'add' ? (
      <UserPlus className='mr-2 h-5 w-5' /> // TODO: Change to WorkerPlus icon
    ) : (
      <Save className='mr-2 h-5 w-5' />
    ));

  return (
    <form
      action={() => form.handleSubmit()}
      onReset={(e) => {
        e.preventDefault();
        handleReset && handleReset();
      }}
      className='rounded-lg bg-white p-6 shadow-md'
    >
      <ErrorServerForm<WorkerFormData<TMode>> serverState={serverState} />

      {mode === 'edit' && 'id' in defaultData && defaultData.id && (
        <form.Field
          name='id'
          children={(field) => (
            <input
              type='hidden'
              value={field.state.value as any}
              name={field.name}
            />
          )}
        />
      )}

      <div className='flex items-center justify-baseline gap-4'>
        <div className='flex-1'>
          <form.Field name='name'>
            {(field) => (
              <FormInputField
                field={field}
                label={fieldLabels.name}
                placeholder='Digite o nome completo'
                className='mb-4'
                onValueBlurParser={(val: string) => val.toUpperCase()}
              />
            )}
          </form.Field>
        </div>
        {mode === 'edit' && 'isActive' in defaultData && (
          <div className='flex'>
            <form.Field name='isActive'>
              {(field) => (
                <div className='flex items-center space-x-2'>
                  <Switch
                    id='isActive'
                    checked={field.state.value === true}
                    onCheckedChange={(checked) =>
                      field.handleChange(
                        (checked ? true : false) as DeepValue<
                          WorkerFormData<TMode>,
                          'isActive'
                        >
                      )
                    }
                  />
                  <Label htmlFor='isActive'>
                    {field.state.value === true ? 'Ativo' : 'Inativo'}
                  </Label>
                </div>
              )}
            </form.Field>
          </div>
        )}
      </div>

      <div className='flex items-center justify-baseline gap-4'>
        <div className='flex-1'>
          <form.Field name='cpf'>
            {(field) => (
              <FormInputField
                field={field}
                label={fieldLabels.cpf}
                placeholder='Digite o CPF'
                className='mb-4'
                onValueBlurParser={maskCpfInput}
              />
            )}
          </form.Field>
        </div>
        <div className='flex-1'>
          <form.Field name='birthdate'>
            {(field) => {
              const handleDateInput = (rawValue: string) => {
                const masked = maskDateInput(rawValue); // Aplica a máscara visual
                const normalized = normalizeDate(masked); // Converte para ISO (yyyy-MM-dd)

                // Aqui você pode decidir o que salvar no estado:
                // - masked: para exibir no input
                // - normalized: para enviar ao backend
                // Neste exemplo, vamos retornar o masked para manter a experiência visual
                return masked;
              };

              return (
                <FormInputField
                  type='date'
                  field={field}
                  label={fieldLabels.birthdate}
                  placeholder='dd/MM/yyyy'
                  className='mb-4'
                  // onValueBlurParser={handleDateInput}
                />
              );
            }}
          </form.Field>
        </div>
      </div>

      <form.Field name='email'>
        {(field) => (
          <FormInputField
            field={field}
            label={fieldLabels.email}
            type='email'
            placeholder='Digite o email'
            className='mb-4'
          />
        )}
      </form.Field>

      <form.Field name='phone'>
        {(field) => (
          <FormInputField
            field={field}
            label={fieldLabels.phone}
            placeholder='(xx) x xxxx-xxxx'
            className='mb-4'
            onValueBlurParser={maskPhoneInput}
          />
        )}
      </form.Field>

      <form.Field
        name='maintenanceInstanceId'
        children={(field: any) => (
          <FormDropdownModal
            field={field}
            label={fieldLabels.maintenanceInstanceId}
            placeholder={fieldLabels.maintenanceInstanceId}
            className='mb-4'
            options={listMaintenanceInstances.map((instance) => ({
              value: String(instance.id),
              label: `${instance.name} (${instance.sipacId})`
            }))}
            onValueChange={(value) => field.handleChange(Number(value))}
          />
        )}
      />

      <form.Field
        name='file'
        children={(field) => (
          <FormInputFile
            field={field}
            label={fieldLabels.file || 'Foto do Colaborador'}
            placeholder='Selecionar foto'
            className='mb-4'
          />
        )}
      />

      {previewFiles.length > 0 && (
        <div className='mt-4'>
          <MediaGallery
            files={previewFiles}
            getPublicFileUrl={(url) => url}
            galleryTitle='Pré-visualização da Foto'
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
        {/* <Button type='button' variant='outline' onClick={handleCancel}>
          Cancelar
        </Button> */}

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
