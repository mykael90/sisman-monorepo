import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ErrorClientValidationFormCardProps {
  errors: any[];
}

export function ErrorClientValidationFormCard({
  errors,
}: ErrorClientValidationFormCardProps) {
  const errorMessages = (errors ?? [])
    .flatMap((errorGroup: any) => Object.values(errorGroup))
    .flat()
    .map((error: any) => error.message)
    .filter(Boolean);

  if (errorMessages.length === 0) return null;

  return (
    <Card className="border-destructive bg-destructive/10 text-destructive">
      <CardHeader>
        <CardTitle>Corrija os seguintes erros:</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 text-sm">
        {errorMessages.map((msg, i) => (
          <p key={i}>- {msg}</p>
        ))}
      </CardContent>
    </Card>
  );
}
