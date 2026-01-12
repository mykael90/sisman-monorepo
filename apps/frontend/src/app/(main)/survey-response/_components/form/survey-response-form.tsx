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
import { Save, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { createAnswerSchema } from './survey-response-form-validation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

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
    name: `answers[${index}].value`,
    validators: {
      onChange: ({ value }) => {
        const schema = createAnswerSchema(question);
        const result = schema.safeParse(value);
        if (!result.success) {
          return result.error.errors.map((e) => e.message).join(', ');
        }
        return undefined;
      }
    }
  });

  const hasError = !!field.state.meta.errors?.length;
  const value = field.state.value as any;
  const isAnswered =
    value !== undefined &&
    value !== '' &&
    (Array.isArray(value) ? value.length > 0 : true);

  const renderInput = () => {
    switch (question.type) {
      case 'TEXT':
        return (
          <FormInputTextArea
            field={field}
            placeholder='Escreva sua resposta aqui...'
            className='focus-visible:ring-primary min-h-[120px] resize-none'
          />
        );
      case 'RATING':
        return (
          <RadioGroup
            onValueChange={(val) => field.handleChange(parseInt(val, 10))}
            defaultValue={field.state.value?.toString()}
            className='flex flex-wrap gap-4'
          >
            {[1, 2, 3, 4, 5].map((v) => (
              <div key={v} className='relative'>
                <RadioGroupItem
                  value={v.toString()}
                  id={`${question.id}-${v}`}
                  className='peer sr-only'
                />
                <Label
                  htmlFor={`${question.id}-${v}`}
                  className={cn(
                    'border-muted bg-popover hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 text-lg font-medium transition-all',
                    hasError && 'border-destructive/50'
                  )}
                >
                  {v}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'BOOLEAN':
        return (
          <RadioGroup
            onValueChange={(val) => field.handleChange(val === 'true')}
            defaultValue={field.state.value?.toString()}
            className='flex gap-6'
          >
            {[
              { label: 'Sim', value: 'true' },
              { label: 'Não', value: 'false' }
            ].map((opt) => (
              <div key={opt.value} className='flex items-center space-x-3'>
                <RadioGroupItem
                  value={opt.value}
                  id={`${question.id}-${opt.value}`}
                  className='border-primary text-primary ring-offset-background focus-visible:ring-ring h-5 w-5 border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                />
                <Label
                  htmlFor={`${question.id}-${opt.value}`}
                  className='cursor-pointer text-base font-medium'
                >
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'SINGLE':
        return (
          <RadioGroup
            onValueChange={(val) => field.handleChange([val])}
            defaultValue={value?.[0]}
            className='flex flex-col space-y-3'
          >
            {question.surveyQuestionOptions.map((opt) => (
              <div
                className={cn(
                  'hover:bg-accent/50 flex items-center space-x-3 rounded-lg border p-3 transition-colors',
                  value?.[0] === opt.id && 'border-primary bg-primary/5'
                )}
                key={opt.id}
              >
                <RadioGroupItem
                  value={opt.id}
                  id={opt.id}
                  className='h-5 w-5'
                />
                <Label
                  htmlFor={opt.id}
                  className='w-full cursor-pointer text-base'
                >
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
      case 'MULTIPLE':
        return (
          <div className='flex flex-col space-y-3'>
            {question.surveyQuestionOptions.map((opt) => (
              <div
                className={cn(
                  'hover:bg-accent/50 flex items-center space-x-3 rounded-lg border p-3 transition-colors',
                  (value as string[])?.includes(opt.id) &&
                    'border-primary bg-primary/5'
                )}
                key={opt.id}
              >
                <Checkbox
                  id={opt.id}
                  checked={(value as string[])?.includes(opt.id)}
                  className='h-5 w-5 rounded-md'
                  onCheckedChange={(checked) => {
                    const current: string[] = (value as string[]) || [];
                    if (checked) {
                      field.handleChange([...current, opt.id]);
                    } else {
                      field.handleChange(current.filter((v) => v !== opt.id));
                    }
                  }}
                />
                <Label
                  htmlFor={opt.id}
                  className='w-full cursor-pointer text-base'
                >
                  {opt.label}
                </Label>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <FormInputField
            field={field}
            className='focus-visible:ring-primary'
          />
        );
    }
  };

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-200',
        hasError
          ? 'border-destructive ring-destructive/20 ring-1'
          : 'hover:border-primary/30',
        isAnswered && !hasError && 'border-primary/20 bg-primary/[0.01]'
      )}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between gap-4'>
          <div className='space-y-1'>
            <CardTitle className='flex items-center gap-2 text-lg leading-tight font-bold'>
              <span className='bg-muted text-muted-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold'>
                {index + 1}
              </span>
              {question.text}
              {question.required && (
                <span className='text-destructive ml-0.5' title='Obrigatório'>
                  *
                </span>
              )}
            </CardTitle>
            {(question as any).description && (
              <CardDescription className='text-sm'>
                {(question as any).description}
              </CardDescription>
            )}
          </div>
          {isAnswered && !hasError && (
            <CheckCircle2 className='text-primary animate-in fade-in zoom-in h-5 w-5 shrink-0 transition-all' />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className='pt-2'>{renderInput()}</div>
        {hasError && (
          <div className='text-destructive animate-in fade-in slide-in-from-top-1 mt-4 flex items-center gap-2 text-sm font-medium'>
            <AlertCircle className='h-4 w-4' />
            <p>
              {typeof field.state.meta.errors === 'string'
                ? field.state.meta.errors
                : field.state.meta.errors.join(', ')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function SurveyResponseForm({
  survey,
  onCancel,
  isInDialog = false
}: {
  survey: ISurveyWithRelations;
  onCancel: () => void;
  isInDialog?: boolean;
}) {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status !== 'loading' && !session?.user?.idSisman) {
    toast.warning('É preciso estar autenticado para acessar essa página.');
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
      answers: survey.questions
        .sort((a, b) => a.order - b.order)
        .map((q) => ({
          questionId: q.id,
          value: q.type === 'MULTIPLE' ? [] : undefined
        }))
    },
    onSubmit: async ({ value }) => {
      await dispatchFormAction(value);
    }
  });

  if (serverState?.isSubmitSuccessful) {
    return (
      <FormSuccessDisplay
        serverState={serverState}
        handleActions={{ handleCancelForm: onCancel }}
        messageActions={{ handleCancel: 'Obrigado por responder!' }}
        isInDialog={isInDialog}
      />
    );
  }

  return (
    <div className='animate-in fade-in mx-auto max-w-3xl space-y-8 duration-500'>
      <header className='space-y-2 text-center'>
        <h1 className='text-3xl font-extrabold tracking-tight sm:text-4xl'>
          {survey.title}
        </h1>
        {survey.description && (
          <p className='text-muted-foreground text-lg'>{survey.description}</p>
        )}
        <div className='pt-4'>
          <Separator className='bg-primary/20 mx-auto h-1 w-24 rounded-full' />
        </div>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className='space-y-6'
      >
        <ErrorServerForm serverState={serverState} />

        <div className='flex flex-col gap-6'>
          {survey.questions
            .sort((a, b) => a.order - b.order)
            .map((q, i) => (
              <AnswerField key={q.id} form={form} question={q} index={i} />
            ))}
        </div>

        <Card className='border-primary/20 bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky bottom-6 z-10 shadow-lg backdrop-blur'>
          <CardContent className='flex items-center justify-between py-4'>
            <Button type='button' variant='ghost' onClick={onCancel}>
              Cancelar
            </Button>

            <div className='flex items-center gap-4'>
              <form.Subscribe
                selector={(state) => [state.isSubmitting, state.canSubmit]}
              >
                {([isSubmitting, canSubmit]) => (
                  <Button
                    type='submit'
                    size='lg'
                    disabled={!canSubmit || isPending || isSubmitting}
                    className='px-8 font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]'
                  >
                    {isPending || isSubmitting ? (
                      <span className='flex items-center gap-2'>
                        <Circle className='h-4 w-4 animate-pulse fill-current' />
                        Enviando...
                      </span>
                    ) : (
                      <>
                        <Save className='mr-2 h-5 w-5' /> Enviar Resposta
                      </>
                    )}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
