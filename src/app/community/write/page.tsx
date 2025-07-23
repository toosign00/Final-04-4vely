'use client';

import { Button } from '@/components/ui/Button';
import { Plus, X } from 'lucide-react';
import Image from 'next/image';
import { ChangeEvent, useState } from 'react';

interface PostForm {
  id: string;
  title: string;
  content: string;
  postImage: File | null;
  thumbnailImage: File | null;
}

const MAX_FORMS = 10; // 기본 폼 포함 최대 10개

export default function CommunityWritePage() {
  const [cover, setCover] = useState<File | null>(null);
  const [postForms, setPostForms] = useState<PostForm[]>([{ id: '1', title: '', content: '', postImage: null, thumbnailImage: null }]);

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setCover(files[0]);
  };

  const removePostForm = (formId: string) => {
    if (postForms.length > 1) {
      setPostForms((prev) => prev.filter((f) => f.id !== formId));
    }
  };

  const updatePostForm = (formId: string, field: keyof PostForm, value: string | File | null) => {
    setPostForms((prev) => prev.map((form) => (form.id === formId ? { ...form, [field]: value } : form)));
  };

  const addNewForm = () => {
    if (postForms.length >= MAX_FORMS) return; // 제한 10개
    const newForm: PostForm = {
      id: Date.now().toString(),
      title: '',
      content: '',
      postImage: null,
      thumbnailImage: null,
    };
    setPostForms((prev) => [...prev, newForm]);
  };

  const handlePostImageChange = (formId: string, e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    updatePostForm(formId, 'postImage', files[0]);
    updatePostForm(formId, 'thumbnailImage', files[0]);
  };

  return (
    <main className='flex flex-col items-center space-y-12 pb-8'>
      {/* 1) 대문 이미지 추가 */}
      <section className='w-full bg-white text-gray-500'>
        <label htmlFor='cover-upload' className='block w-full cursor-pointer'>
          {!cover && <h2 className='py-4 text-center text-2xl font-semibold'>대문 이미지 추가</h2>}
          <div className='relative flex h-64 w-full items-center justify-center overflow-hidden bg-white'>
            {cover ? <Image src={URL.createObjectURL(cover)} alt='cover' fill className='object-cover' /> : <Plus size={90} className='text-gray-500' />}
          </div>
          <input id='cover-upload' type='file' accept='image/*' onChange={handleCoverChange} className='hidden' />
        </label>
      </section>

      <h1 className='ml-15 w-full max-w-4xl text-2xl font-bold'>글 쓰기</h1>

      {/* 2) 썸네일 섹션(데스크탑 전용) + 글쓰기 폼들 */}
      <div className='flex w-full max-w-4xl flex-col gap-6 md:flex-row'>
        {/* A) 썸네일 섹션 : md 이상에서만 보임 */}
        <div className='mt-2 ml-4 hidden flex-col items-end gap-4 md:flex'>
          {postForms.map((form) => (
            <div key={form.id}>
              {form.thumbnailImage ? (
                <div className='relative h-20 w-20 cursor-default overflow-hidden rounded-lg border border-gray-300'>
                  <Image fill src={URL.createObjectURL(form.thumbnailImage)} alt={`thumb-${form.id}`} className='object-cover' />
                </div>
              ) : (
                <div className={`flex h-20 w-20 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-400 ${postForms.length >= MAX_FORMS ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}>
                  <Plus size={24} />
                </div>
              )}
            </div>
          ))}

          {/* 폼 추가 버튼 (md 이상) */}
          <Button
            onClick={addNewForm}
            disabled={postForms.length >= MAX_FORMS}
            className={`flex h-20 w-20 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-400 ${postForms.length >= MAX_FORMS ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
          >
            <Plus size={24} />
          </Button>
        </div>

        {/* 글쓰기 폼들 */}
        <div className='flex-1 space-y-6'>
          {postForms.map((form) => (
            <section key={form.id} className='rounded-lg p-4'>
              {/* 제목 + 삭제 */}
              <div className='mb-6 flex items-center gap-4'>
                <input type='text' placeholder='제목을 입력해주세요.' value={form.title} onChange={(e) => updatePostForm(form.id, 'title', e.target.value)} className='h-12 flex-1 rounded-lg border border-gray-300 bg-white px-4' />
                <Button variant='destructive' className='h-12' onClick={() => removePostForm(form.id)} disabled={postForms.length === 1}>
                  삭제
                </Button>
              </div>

              {/* 이미지 & 내용 */}
              <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* 이미지 */}
                <div className='relative min-h-[200px] flex-1 overflow-hidden rounded-lg border border-gray-300 bg-gray-100'>
                  <label htmlFor={`post-upload-${form.id}`} className='absolute inset-0 flex cursor-pointer items-center justify-center text-gray-400'>
                    {!form.postImage && (
                      <div className='text-center'>
                        <h1 className='mb-2 text-lg font-medium'>사진 첨부</h1>
                        <Plus size={58} />
                      </div>
                    )}
                  </label>
                  <input id={`post-upload-${form.id}`} type='file' accept='image/*' onChange={(e) => handlePostImageChange(form.id, e)} className='hidden' />
                  {form.postImage && <Image fill src={URL.createObjectURL(form.postImage)} alt='post' className='object-cover' />}
                  {form.postImage && (
                    <button
                      type='button'
                      onClick={() => {
                        updatePostForm(form.id, 'postImage', null);
                        updatePostForm(form.id, 'thumbnailImage', null);
                      }}
                      className='absolute top-2 right-2 text-gray-400 hover:text-gray-600'
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>

                {/* 내용 */}
                <div className='flex w-full flex-col'>
                  <textarea placeholder='내용을 입력해주세요.' value={form.content} onChange={(e) => updatePostForm(form.id, 'content', e.target.value)} className='min-h-[200px] w-full resize-none rounded-lg border border-gray-300 bg-white p-4' />
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* 하단 버튼 영역 */}
      <div className='flex w-full max-w-4xl justify-between px-30 md:justify-end md:px-4'>
        {/* 모바일 전용 추가하기 버튼 (md 이상에서는 숨김) */}
        <Button size='lg' onClick={addNewForm} disabled={postForms.length >= MAX_FORMS} className={`md:hidden ${postForms.length >= MAX_FORMS ? 'cursor-not-allowed opacity-40' : ''}`}>
          추가하기
        </Button>

        {/* 작성하기 버튼 */}
        <Button size='lg' variant='primary'>
          작성하기
        </Button>
      </div>
    </main>
  );
}
