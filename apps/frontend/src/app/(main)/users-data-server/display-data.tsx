// pode ser use client aqui

export async function DisplayData({ data }) {
  return (
    <div>
      <p>Current Message: {JSON.stringify(data)}</p>
      {/* <button onClick={handleRefresh} disabled={isPending}>
        {isPending ? 'Refreshing...' : 'Refresh Data (via Server Action)'}
      </button> */}
    </div>
  );
}
