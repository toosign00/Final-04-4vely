export default function Loading() {
  return (
    <div className='flex h-screen flex-col items-center justify-center'>
      <div className='border-primary mb-3 h-9 w-9 animate-spin rounded-full border-2 border-t-transparent' />
      <p className='t-h4 text-secondary pl-2.5'>Loading...</p>
    </div>
  );
}
