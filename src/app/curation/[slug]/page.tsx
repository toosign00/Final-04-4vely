interface CurationDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CurationDetailPage({ params }: CurationDetailPageProps) {
  const { slug } = await params;

  return (
    <main className='mx-auto max-w-3xl p-10'>
      <h1 className='mb-4 text-3xl font-bold'>큐레이션 상세 페이지</h1>
      <p className='mb-2 text-lg text-gray-600'>
        현재 slug: <strong>{slug}</strong>
      </p>

      <article className='mt-6 space-y-3 text-base leading-relaxed'>
        <p>
          이 페이지는 <strong>{slug}</strong>에 해당하는 큐레이션 콘텐츠를 보여주는 공간입니다.
        </p>
      </article>
    </main>
  );
}
