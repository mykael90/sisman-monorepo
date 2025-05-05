// export const dynamic = 'force-dynamic';

interface todoInterface {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}
async function getTodos(): Promise<todoInterface[]> {
  const response = await fetch('https://jsonplaceholder.typicode.com/todos', {
    // cache: 'no-store'
    // next: { revalidate: 10 }
  });

  if (!response.ok) throw new Error('Failed to fetch todos');

  const data = await response.json();
  return data;
}

export default async function Todos() {
  const todos = await getTodos();

  return (
    <section className='flex justify-center'>
      <div className='flex w-md flex-col'>
        <h1 className='flex text-2xl font-bold'>Todos</h1>
        <ul className='mt-6 flex flex-col gap-3'>
          {todos.slice(0, 10).map(todo => (
            <li key={todo.id}>{todo.title}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
