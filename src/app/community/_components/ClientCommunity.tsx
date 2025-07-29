'use client';

import BookmarkButton from '@/components/ui/BookmarkButton';
import { Button } from '@/components/ui/Button';
import { Card, CardAvatar, CardContent, CardDescription, CardFooter, CardImage, CardTitle } from '@/components/ui/Card';
import PaginationWrapper from '@/components/ui/PaginationWrapper';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Switch } from '@/components/ui/switch';

import { fetchPosts, fetchPostsByUserId, Pagination } from '@/lib/functions/communityFunctions';
import useUserStore from '@/store/authStore';
import { Post } from '@/types/commnunity.types';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Props {
  initialPosts: Post[];
  initialPagination: Pagination;
}
export default function ClientCommunity({ initialPosts, initialPagination }: Props) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onlyMine, setOnlyMine] = useState(false);
  const [likedIds, setLikedIds] = useState<string[]>(initialPosts.filter((p) => p.myBookmarkId).map((p) => p.id));

  const user = useUserStore((state) => state.user);
  const userId = user?._id ? String(user._id) : '';
  const token = user?.token?.accessToken;

  // 데이터 로드
  useEffect(() => {
    if (onlyMine && !token) return;

    setLoading(true);
    const api = onlyMine ? fetchPostsByUserId(userId, pagination.page, pagination.limit, token) : fetchPosts(pagination.page, pagination.limit, 'community', token);

    api
      .then(({ posts, pagination: pg }) => {
        setPosts(posts);
        setPagination(pg);
        setError(null);
        setLikedIds(posts.filter((p) => p.myBookmarkId).map((p) => p.id));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [onlyMine, userId, pagination.page, pagination.limit, token]);

  const handleToggleLike = (id: string) => {
    setLikedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className='bg-surface mx-auto w-full max-w-[1500px] p-4 md:p-6 lg:p-8'>
      {/* 상단 헤더 */}
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center lg:mb-24'>
          <Button variant='ghost' size='icon' className='mr-2 text-4xl lg:hidden' aria-label='뒤로 가기' onClick={() => window.history.back()}>
            ←
          </Button>
          <h1 className='font-regular flex items-baseline gap-2 text-3xl md:text-4xl lg:flex-col lg:items-start lg:gap-1'>
            <span className='hidden text-base lg:inline-block'>| community</span>
            <span>Community</span>
          </h1>
        </div>
        <div className='flex items-center gap-3 self-end sm:self-auto'>
          <label className='flex h-8 items-center gap-2 self-start'>
            <span className='text-sm font-medium'>내가 쓴 글</span>
            <Switch
              checked={onlyMine}
              onCheckedChange={(checked) => {
                setOnlyMine(checked);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
            />
          </label>
          <div className='flex flex-col gap-2'>
            <Link href='/community/write'>
              <Button variant='primary' fullWidth className='h-8 px-5'>
                글쓰기
              </Button>
            </Link>
            <Select>
              <SelectTrigger className='h-5 w-[100px]'>
                <SelectValue placeholder='최신순' />
              </SelectTrigger>
              <SelectContent align='start'>
                <SelectItem value='recent'>최신순</SelectItem>
                <SelectItem value='old'>오래된순</SelectItem>
                <SelectItem value='popular'>인기순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 콘텐츠 영역: 게시물이 없을 때도 토글/헤더 유지 */}
      {loading && <div className='p-8 text-center'>로딩 중…</div>}
      {error && <div className='p-8 text-center text-red-500'>{error}</div>}

      {!loading && !error && (
        <>
          {posts.length === 0 ? (
            <div className='p-8 text-center text-gray-500'>등록된 글이 없습니다.</div>
          ) : (
            <div className='grid grid-cols-1 justify-items-center gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {posts.map((post) => {
                const idStr = post.id;
                const isLiked = likedIds.includes(idStr);

                return (
                  <div key={idStr} className='relative w-full'>
                    <BookmarkButton
                      type='post'
                      targetId={Number(idStr)}
                      myBookmarkId={post.myBookmarkId ?? undefined}
                      className='absolute top-10 left-73 z-10'
                      onBookmarkChange={(isBookmarked, bookmarkId) => {
                        setPosts((prev) => prev.map((p) => (p.id === idStr ? { ...p, myBookmarkId: isBookmarked ? bookmarkId : undefined } : p)));
                      }}
                    />

                    <Link href={`/community/${idStr}`}>
                      <Card className='cursor-pointer'>
                        <div className='relative'>
                          <CardImage src={post.coverImage || post.contents[0]?.postImage || '/placeholder.png'} alt={post.title} priority />
                        </div>

                        <CardContent>
                          <CardTitle title={post.title} />
                          <CardDescription description={post.description} />
                          <CardAvatar fallback={post.author.username.charAt(0)}>{post.author.username}</CardAvatar>
                          <CardFooter
                            likes={post.stats.likes}
                            isLiked={isLiked}
                            comments={post.repliesCount ?? 0}
                            views={post.stats.views}
                            timeAgo={new Date(post.createdAt).toLocaleDateString('ko-KR')}
                            onLike={() => handleToggleLike(idStr)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          {/* 페이지네이션 */}
          {pagination.totalPages > 1 && (
            <div className='mt-8 hidden lg:flex lg:justify-center'>
              <PaginationWrapper currentPage={pagination.page} totalPages={pagination.totalPages} setCurrentPage={(page) => setPagination((p) => ({ ...p, page }))} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
