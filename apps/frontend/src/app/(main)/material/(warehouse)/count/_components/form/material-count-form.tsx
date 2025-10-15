import { useForm } from '@tanstack/react-form';

export default function MaterialCountForm() {
  const form = useForm({
    defaultValues: {
      firstName: '',
      lastName: ''
    },
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log(value);
    }
  });

  return (
    <div>
      <h1>Simple Form Example</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <>
              <button type='submit' disabled={!canSubmit}>
                {isSubmitting ? '...' : 'Submit'}
              </button>
              <button
                type='reset'
                onClick={(e) => {
                  // Avoid unexpected resets of form elements (especially <select> elements)
                  e.preventDefault();
                  form.reset();
                }}
              >
                Reset
              </button>
            </>
          )}
        />
      </form>
    </div>
  );
}
