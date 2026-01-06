import { useForm, useField, FieldApi } from '@tanstack/react-form';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import {
  FormDropdown,
  FormInputCheckbox,
  FormInputField,
  FormInputTextArea
} from '@/components/form-tanstack/form-input-fields';
import { FormSuccessDisplay } from '@/components/form-tanstack/form-success-display';
import { ErrorServerForm } from '@/components/form-tanstack/error-server-form';
import { IActionResultForm } from '@/types/types-server-actions';
import { ISurveyAdd } from '../../survey-types';
import { addSurvey } from '../../survey-actions';
import { FilePlus, Plus, Save, Trash2 } from 'lucide-react';

const questionTypes = [
  { value: 'TEXT', label: 'Texto' },
  { value: 'RATING', label: 'Avaliação (1-5)' },
  { value: 'SINGLE', label: 'Escolha Única' },
  { value: 'MULTIPLE', label: 'Múltipla Escolha' }
];

function QuestionOptions({
  form,
  questionIndex
}: {
  form: FieldApi<any, any, any, any>;
  questionIndex: number;
}) {
  const questionField = useField({
    form,
    name: `questions[${questionIndex}]`
  });

  const optionsField = useField({
    form,
    name: `questions[${questionIndex}].surveyQuestionOptions`,
    mode: 'array'
  });

  const questionType = questionField.state.value.type;

  if (questionType !== 'SINGLE' && questionType !== 'MULTIPLE') {
    return null;
  }

  return (
    <div className='mt-4 border-l pl-6'>
      <h4 className='text-md font-medium'>Opções da Questão</h4>
      {optionsField.state.value.map((_, i) => (
        <div key={i} className='relative mt-2 rounded-md border p-3'>
          <div className='grid grid-cols-1 gap-2 md:grid-cols-3'>
            <form.Field
              name={`questions[${questionIndex}].surveyQuestionOptions[${i}].label`}
              children={(field) => (
                <FormInputField
                  field={field}
                  label='Rótulo'
                  placeholder='Ex: Opção 1'
                />
              )}
            />
            <form.Field
              name={`questions[${questionIndex}].surveyQuestionOptions[${i}].value`}
              children={(field) => (
                <FormInputField
                  field={field}
                  label='Valor'
                  placeholder='Ex: option1'
                />
              )}
            />
            <form.Field
              name={`questions[${questionIndex}].surveyQuestionOptions[${i}].order`}
              children={(field) => (
                <FormInputField
                  field={field}
                  label='Ordem'
                  type='number'
                  placeholder='0'
                />
              )}
            />
          </div>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='absolute top-1 right-1'
            onClick={() => optionsField.removeValue(i)}
          >
            <Trash2 className='h-3 w-3 text-red-500' />
          </Button>
        </div>
      ))}
      <Button
        type='button'
        variant='outline'
        size='sm'
        className='mt-2'
        onClick={() =>
          optionsField.pushValue({
            label: '',
            value: '',
            order: optionsField.state.value.length + 1
          })
        }
      >
        <Plus className='mr-2 h-4 w-4' /> Adicionar Opção
      </Button>
    </div>
  );
}

export default function SurveyForm({ onCancel }: { onCancel: () => void }) {
  const [serverState, dispatchFormAction, isPending] = useActionState(
    addSurvey,
    { isSubmitSuccessful: false, message: '' }
  );

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      uniqueAnswerByUser: false,
      questions: []
    } as ISurveyAdd,
    onSubmit: async ({ value }) => {
      await dispatchFormAction(value);
    }
  });

  const questionsField = useField({
    form,
    name: 'questions',
    mode: 'array'
  });

  if (serverState?.isSubmitSuccessful) {
    return (
      <FormSuccessDisplay
        serverState={serverState}
        handleActions={{
          handleCancelForm: onCancel
        }}
        messageActions={{
          handleCancel: 'Voltar para a lista'
        }}
      />
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className='rounded-lg bg-white p-6 shadow-md'
    >
      <ErrorServerForm serverState={serverState} />

      <div className='mb-4 grid grid-cols-1 gap-4'>
        <form.Field
          name='title'
          children={(field) => (
            <FormInputField
              field={field}
              label='Título da Pesquisa'
              placeholder='Ex: Pesquisa de Satisfação'
            />
          )}
        />
        <form.Field
          name='description'
          children={(field) => (
            <FormInputTextArea
              field={field}
              label='Descrição'
              placeholder='Uma breve descrição sobre a pesquisa'
            />
          )}
        />
      </div>
      <form.Field
        name='uniqueAnswerByUser'
        children={(field) => (
          <FormInputCheckbox
            field={field}
            label='Permitir apenas uma resposta por usuário'
          />
        )}
      />

      <div className='mt-6'>
        <h3 className='text-lg font-medium'>Questões</h3>
        {questionsField.state.value.map((_, i) => (
          <div key={i} className='relative mt-4 rounded-md border p-4'>
            <div className='flex flex-col gap-4'>
              <div className='flex items-center gap-4'>
                <form.Field
                  name={`questions[${i}].order`}
                  children={(field) => (
                    <FormInputField
                      field={field}
                      label='Ordem'
                      type='number'
                      placeholder='0'
                      className='w-15'
                    />
                  )}
                />
                <form.Field
                  name={`questions[${i}].type`}
                  children={(field) => (
                    <FormDropdown
                      field={field}
                      label='Tipo da Questão'
                      placeholder='Selecione um tipo'
                      options={questionTypes}
                      className='w-50'
                    />
                  )}
                />
                <form.Field
                  name={`questions[${i}].required`}
                  children={(field) => (
                    <FormInputCheckbox field={field} label='Obrigatória' />
                  )}
                />
              </div>
              <div>
                <form.Field
                  name={`questions[${i}].text`}
                  children={(field) => (
                    <FormInputField
                      field={field}
                      label='Texto da Questão'
                      placeholder='Ex: Qual o seu nível de satisfação?'
                    />
                  )}
                />
              </div>
              <QuestionOptions form={form as any} questionIndex={i} />
            </div>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='absolute top-2 right-2'
              onClick={() => questionsField.removeValue(i)}
            >
              <Trash2 className='h-4 w-4 text-red-500' />
            </Button>
          </div>
        ))}

        <Button
          type='button'
          variant='outline'
          className='mt-4'
          onClick={() =>
            questionsField.pushValue({
              text: '',
              type: 'TEXT',
              order: questionsField.state.value.length + 1,
              required: false,
              surveyQuestionOptions: []
            })
          }
        >
          <Plus className='mr-2 h-4 w-4' /> Adicionar Questão
        </Button>
      </div>

      <div className='mt-8 flex justify-end gap-3'>
        <Button type='button' variant='ghost' onClick={onCancel}>
          Cancelar
        </Button>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isTouched]}
        >
          {([canSubmit, isTouched]) => (
            <Button
              type='submit'
              disabled={!canSubmit || isPending || !isTouched}
            >
              {isPending ? (
                'Processando...'
              ) : (
                <>
                  <Save className='mr-2 h-5 w-5' /> Salvar Pesquisa
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
