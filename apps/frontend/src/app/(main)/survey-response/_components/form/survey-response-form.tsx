'use client';

import { useForm, useField } from '@tanstack/react-form';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import {
  FormInputField,
  FormInputTextArea
} from '@/components/form-tanstack/form-input-fields';
import { FormSuccessDisplay } from '@/components/form-tanstack/form-success-display';
import { ErrorServerForm } from '@/components/form-tanstack/error-server-form';
import { ISurveyWithRelations } from '../../../survey/survey-types';
import { ISurveyResponseAdd } from '../../survey-response-types';
import { addSurveyResponse } from '../../survey-response-actions';
import { Save } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const AnswerField = ({
  form,
  question,
  index
}: {
  form: any;
  question: ISurveyWithRelations['questions'][0];
  index: number;
}) => {
  const field = useField({
    form,
    name: `answers[${index}].value`
  });

  const renderInput = () => {
    switch (question.type) {
      case 'TEXT':
        return (
          <FormInputTextArea field={field} placeholder='Sua resposta...' />
        );
      case 'RATING':
        return (
          <RadioGroup
            onValueChange={(val) => field.handleChange(parseInt(val, 10))}
            defaultValue={field.state.value?.toString()}
            className='flex'
          >
            {[1, 2, 3, 4, 5].map((v) => (
              <div className='flex items-center space-x-2' key={v}>
                <RadioGroupItem
                  value={v.toString()}
                  id={`${question.id}-${v}`}
                />
                <Label htmlFor={`${question.id}-${v}`}>{v}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      // case 'SINGLE':
      //   return (
      //     <RadioGroup
      //       onValueChange={field.handleChange}
      //       defaultValue={field.state.value}
      //       className='flex flex-col space-y-1'
      //     >
      //       {question.surveyQuestionOptions.map((opt) => (
      //         <div className='flex items-center space-x-2' key={opt.id}>
      //           <RadioGroupItem value={opt.value} id={opt.id} />
      //           <Label htmlFor={opt.id}>{opt.label}</Label>
      //         </div>
      //       ))}
      //     </RadioGroup>
      //   );
      case 'MULTIPLE':
        return (
          <div className='flex flex-col space-y-1'>
            {question.surveyQuestionOptions.map((opt) => (
              <div className='flex items-center space-x-2' key={opt.id}>
                <Checkbox
                  id={opt.id}
                  checked={field.state.value?.includes(opt.value)}
                  onCheckedChange={(checked) => {
                    const current: string[] = field.state.value || [];
                    if (checked) {
                      field.handleChange([...current, opt.value]);
                    } else {
                      field.handleChange(
                        current.filter((v) => v !== opt.value)
                      );
                    }
                  }}
                />
                <Label htmlFor={opt.id}>{opt.label}</Label>
              </div>
            ))}
          </div>
        );
      default:
        return <FormInputField field={field} />;
    }
  };

  return (
    <div className='mt-4 rounded-md border p-4'>
      <Label className='text-base font-semibold'>{question.text}</Label>
      {question.required && <span className='text-red-500'> *</span>}
      <div className='mt-2'>{renderInput()}</div>
      {field.state.meta.errors && (
        <p className='mt-1 text-sm text-red-500'>
          {field.state.meta.errors.join(', ')}
        </p>
      )}
    </div>
  );
};

export default function SurveyResponseForm({
  survey,
  onCancel
}: {
  survey: ISurveyWithRelations;
  onCancel: () => void;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status !== 'loading' && !session?.user?.idSisman) {
    toast.warning('É preciso está autenticado para acessar essa página.');
    router.push('/signin');
  }

  const [serverState, dispatchFormAction, isPending] = useActionState(
    addSurveyResponse,
    {
      isSubmitSuccessful: false,
      message: ''
    }
  );

  const form = useForm({
    defaultValues: {
      userId: session?.user?.idSisman as number,
      surveyId: survey.id,
      answers: survey.questions.map((q) => ({
        questionId: q.id,
        value: q.type === 'MULTIPLE' ? [] : undefined
      }))
    },
    onSubmit: async ({ value }) => {
      console.log(value);
      await dispatchFormAction(value);
    }
  });

  if (serverState?.isSubmitSuccessful) {
    return (
      <FormSuccessDisplay
        serverState={serverState}
        handleActions={{ handleCancelForm: onCancel }}
        messageActions={{ handleCancel: 'Obrigado por responder!' }}
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

      <h2 className='text-2xl font-bold'>{survey.title}</h2>
      <p className='text-muted-foreground'>{survey.description}</p>

      <div className='mt-6'>
        {survey.questions
          .sort((a, b) => a.order - b.order)
          .map((q, i) => (
            <AnswerField key={q.id} form={form} question={q} index={i} />
          ))}
      </div>

      <div className='mt-8 flex justify-end gap-3'>
        <Button type='button' variant='ghost' onClick={onCancel}>
          Cancelar
        </Button>
        <form.Subscribe selector={(state) => [state.canSubmit]}>
          {([canSubmit]) => (
            <Button type='submit' disabled={!canSubmit || isPending}>
              {isPending ? (
                'Enviando...'
              ) : (
                <>
                  <Save className='mr-2 h-5 w-5' /> Enviar Resposta
                </>
              )}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
