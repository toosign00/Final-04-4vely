'use client';

import { Button } from '@/components/ui/Button';
import { fetchPostById, updatePostById, uploadFile } from '@/lib/functions/community';
import useUserStore from '@/store/authStore';
import { Plus, X } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ChangeEvent, useEffect, useState } from 'react';

interface PostForm {
  id: string;
  title: string;
  content: string;
  postImage: File | string | null;
  thumbnailImage: File | string | null;
}

const MAX_FORMS = 10;

export default function CommunityEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const token = user?.token?.accessToken;

  const [cover, setCover] = useState<File | string | null>(null);
  const [postForms, setPostForms] = useState<PostForm[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const post = await fetchPostById(id as string);
        setCover(post.coverImage || '');
        const forms = post.contents.map((c) => ({
          id: c.id,
          title: c.title,
          content: c.content,
          postImage: c.postImage || '',
          thumbnailImage: c.thumbnailImage || '',
        }));
        setPostForms(
          forms.length
            ? forms
            : [
                {
                  id: '1',
                  title: post.title,
                  content: post.description,
                  postImage: null,
                  thumbnailImage: null,
                },
              ],
        );
      } catch {
        alert('게시글 정보를 불러오지 못했습니다.');
      }
    })();
  }, [id]);

  const updatePostForm = (formId: string, field: keyof PostForm, value: string | File | null) => {
    setPostForms((prev) => prev.map((f) => (f.id === formId ? { ...f, [field]: value } : f)));
  };

  const addNewForm = () => {
    if (postForms.length >= MAX_FORMS) return;
    setPostForms((prev) => [...prev, { id: Date.now().toString(), title: '', content: '', postImage: null, thumbnailImage: null }]);
  };

  const removePostForm = (formId: string) => {
    if (postForms.length <= 1) return;
    setPostForms((prev) => prev.filter((f) => f.id !== formId));
  };

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setCover(file);
  };

  const handleSubmit = async () => {
    if (!id) return;
    const first = postForms[0];
    if (!first.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    setIsSubmitting(true);
    try {
      const coverUrl = typeof cover === 'string' ? cover : cover ? await uploadFile(cover) : '';
      const contentsPayload = await Promise.all(
        postForms.map(async (f) => {
          const postImageUrl = typeof f.postImage === 'string' ? f.postImage : f.postImage ? await uploadFile(f.postImage) : '';

          return {
            id: f.id,
            content: f.content,
            postImage: postImageUrl,
          };
        }),
      );

      await updatePostById(
        id as string,
        {
          title: first.title,
          content: first.content,
          coverImage: coverUrl,
          extra: {
            contents: contentsPayload,
          },
        },
        token!,
      );

      alert('글이 성공적으로 수정되었습니다!');
      router.push(`/community/${id}`);
    } catch (err) {
      console.error('수정 에러:', err);
      alert(err instanceof Error ? err.message : '수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className='flex flex-col items-center space-y-12 pb-8'>
      <section className='w-full bg-white text-gray-500'>
        <label htmlFor='cover-upload' className='block w-full cursor-pointer'>
          <div className='relative flex h-64 w-full items-center justify-center overflow-hidden bg-white'>
            {cover ? (
              <Image src={typeof cover === 'string' ? cover : URL.createObjectURL(cover)} alt='cover' fill className='object-cover' />
            ) : (
              <div className='flex flex-col items-center gap-1'>
                <h2 className='text-2xl font-semibold'>대문 이미지 추가</h2>
                <Plus size={90} className='text-gray-500' />
              </div>
            )}
          </div>
          <input id='cover-upload' type='file' accept='image/*' onChange={handleCoverChange} className='hidden' disabled={isSubmitting} />
        </label>
      </section>

      <h1 className='w-full max-w-4xl px-4 text-2xl font-bold'>게시글 수정</h1>

      <div className='flex w-full max-w-4xl flex-col gap-6 md:flex-row'>
        <div className='mt-2 ml-4 hidden flex-col items-end gap-4 md:flex'>
          {postForms.map((form) => (
            <div key={form.id}>
              {form.thumbnailImage ? (
                <div className='relative h-20 w-20 overflow-hidden rounded-lg border border-gray-300'>
                  <Image fill src={typeof form.thumbnailImage === 'string' ? form.thumbnailImage : URL.createObjectURL(form.thumbnailImage)} alt='thumb' className='object-cover' />
                </div>
              ) : (
                <div className='flex h-20 w-20 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-400'>
                  <Plus size={24} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className='flex-1 space-y-6'>
          {postForms.map((form, idx) => (
            <section key={form.id} className='rounded-lg border p-4'>
              {idx === 0 ? (
                <div className='mb-6 flex items-center gap-4'>
                  <input type='text' placeholder='제목을 입력해주세요.' value={form.title} onChange={(e) => updatePostForm(form.id, 'title', e.target.value)} className='h-12 flex-1 rounded-lg border border-gray-300 px-4' disabled={isSubmitting} />
                  <Button variant='destructive' onClick={() => removePostForm(form.id)} disabled={isSubmitting || postForms.length === 1}>
                    삭제
                  </Button>
                </div>
              ) : (
                <div className='mb-4 flex justify-end'>
                  <Button variant='destructive' onClick={() => removePostForm(form.id)} disabled={isSubmitting}>
                    삭제
                  </Button>
                </div>
              )}

              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='relative min-h-[200px] overflow-hidden rounded-lg border border-gray-300 bg-gray-100'>
                  <label htmlFor={`post-upload-${form.id}`} className='absolute inset-0 flex cursor-pointer items-center justify-center text-gray-400'>
                    {!form.postImage && (
                      <div className='text-center'>
                        <h1 className='mb-2 text-lg font-medium'>사진 첨부</h1>
                        <Plus size={58} />
                      </div>
                    )}
                  </label>
                  <input
                    id={`post-upload-${form.id}`}
                    type='file'
                    accept='image/*'
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      updatePostForm(form.id, 'postImage', file);
                      updatePostForm(form.id, 'thumbnailImage', file);
                    }}
                    className='hidden'
                    disabled={isSubmitting}
                  />
                  {form.postImage && (
                    <>
                      <Image fill src={typeof form.postImage === 'string' ? form.postImage : URL.createObjectURL(form.postImage)} alt='post' className='object-cover' />
                      <button
                        type='button'
                        onClick={() => {
                          updatePostForm(form.id, 'postImage', null);
                          updatePostForm(form.id, 'thumbnailImage', null);
                        }}
                        className='absolute top-2 right-2 text-gray-400 hover:text-gray-600'
                        disabled={isSubmitting}
                      >
                        <X size={20} />
                      </button>
                    </>
                  )}
                </div>

                <textarea
                  placeholder='내용을 입력해주세요.'
                  value={form.content}
                  onChange={(e) => updatePostForm(form.id, 'content', e.target.value)}
                  className='min-h-[200px] w-full resize-none rounded-lg border border-gray-300 bg-white p-4'
                  disabled={isSubmitting}
                />
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className='flex w-full max-w-4xl justify-between px-4 md:pl-33'>
        <Button onClick={addNewForm} disabled={isSubmitting || postForms.length >= MAX_FORMS}>
          추가하기
        </Button>
        <Button variant='primary' onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? '수정 중...' : '수정하기'}
        </Button>
      </div>
    </main>
  );
}
