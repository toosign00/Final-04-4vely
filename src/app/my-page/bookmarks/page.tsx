import { redirect } from 'next/navigation';

export default function BookmarksPage() {
  redirect('/my-page/bookmarks/products');
  return null;
}
