'use client';

import BookmarkButton from '@/app/shop/_components/BookmarkButton';
import { Button } from '@/components/ui/Button';
import { Card, CardAvatar, CardContent, CardDescription, CardFooter, CardImage, CardTitle } from '@/components/ui/Card';
import PaginationWrapper from '@/components/ui/PaginationWrapper';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Switch } from '@/components/ui/switch';
import { fetchPosts, fetchPostsByUserId, Pagination } from '@/lib/functions/community';
import useUserStore from '@/store/authStore';
import { Post } from '@/types/commnunity.types';
import Link from 'next/link';

import { useEffect, useState } from 'react';

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 8, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [onlyMine, setOnlyMine] = useState<boolean>(false);

  // 실제 로그인된 사용자 ID 가져오기
  const user = useUserStore((state) => state.user);
  const userId = user?._id ? String(user._id) : '';
  // user가 있을 때만 token 뽑아오고, 없으면 undefined
  const token = user?.token?.accessToken;

  useEffect(() => {
    if (onlyMine && !token) return; // 토큰 없으면 내 글 조회 안 함

    setLoading(true);
    const api = onlyMine ? fetchPostsByUserId(userId, pagination.page, pagination.limit, token) : fetchPosts(pagination.page, pagination.limit, 'community');

    api
      .then(({ posts, pagination }) => {
        setPosts(posts);
        setPagination(pagination);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [onlyMine, userId, pagination.page, pagination.limit, token]);

  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleToggleLike = (id: string) => {
    setLikedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  if (loading) return <div className='p-8 text-center'>로딩 중…</div>;
  if (error) return <div className='p-8 text-center text-red-500'>{error}</div>;
  if (!posts.length) return <div className='p-8 text-center'>등록된 글이 없습니다.</div>;

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

      {/* 카드 그리드 */}
      <div className='grid grid-cols-1 justify-items-center gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {posts.map((post) => {
          const idStr = post.id;
          const isBookmarked = bookmarkedIds.includes(idStr);
          const isLiked = likedIds.includes(idStr);
          return (
            <Link key={idStr} href={`/community/${idStr}`}>
              <Card className='relative cursor-pointer'>
                <div className='relative'>
                  <BookmarkButton productId={idStr} initialBookmarked={isBookmarked} variant='default' className='absolute top-2 right-2 z-10' onToggle={() => handleToggleBookmark(idStr)} />
                  <CardImage src={post.coverImage || post.contents[0]?.postImage || '/placeholder.png'} alt={post.title} priority />
                </div>
                <CardContent>
                  <CardTitle title={post.title} />
                  <CardDescription description={post.description} />
                  <CardAvatar fallback={post.author.username.charAt(0)}>{post.author.username}</CardAvatar>
                  <CardFooter likes={post.stats.likes} isLiked={isLiked} comments={post.repliesCount ?? 0} views={post.stats.views} timeAgo={new Date(post.createdAt).toLocaleDateString('ko-KR')} onLike={() => handleToggleLike(idStr)} />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* 페이지네이션 */}
      <div className='mt-8 hidden lg:flex lg:justify-center'>
        <PaginationWrapper currentPage={pagination.page} totalPages={pagination.totalPages} setCurrentPage={(page) => setPagination((p) => ({ ...p, page }))} />
      </div>
    </div>
  );
}
