import { Suspense } from 'react';
import BookmarkSkeletonUI from '../_components/skeletons/BookmarkSkeletonUI';
import BookmarksNavigation from './_components/BookmarksNavigation';

export default function BookmarksLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <BookmarksNavigation />
      <Suspense fallback={<BookmarkSkeletonUI />}>{children}</Suspense>
    </div>
  );
}
