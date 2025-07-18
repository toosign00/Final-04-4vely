export default function Loading() {
  return (
    <div className='flex h-screen flex-col items-center justify-center'>
      <div className='border-t-status-info mb-6 h-10 w-10 animate-spin rounded-full border-4 border-gray-300' />
      <p className='text-secondary text-center text-xl font-semibold'>Loading</p>
    </div>
  );
}
