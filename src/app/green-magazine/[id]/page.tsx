interface GreenMagazineDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function GreenMagazineDetailPage({ params }: GreenMagazineDetailPageProps) {
  const { id } = await params;

  return (
    <main className='mx-auto max-w-3xl p-10'>
      <h1 className='mb-4 text-3xl font-bold'>Green Magazine 상세 페이지</h1>
      <p className='mb-2 text-lg text-gray-600'>
        현재 [id]: <strong>{id}</strong>
      </p>

      <article className='mt-6 space-y-3 text-base leading-relaxed'>
        <p>
          이 페이지는 <strong>{id}</strong>에 해당하는 Green Magazine 콘텐츠를 보여주는 공간입니다.
        </p>
      </article>
    </main>
  );
}
