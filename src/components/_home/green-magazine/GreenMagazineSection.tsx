'use client';

import { MagazinePostData } from '@/app/green-magazine/_types/magazine.types';
import { GreenMagazineCarousel } from '@/components/_home/green-magazine/GreenMagazineCarousel';
import { magazineForHome } from '@/lib/functions/home/magazineForHome';
import { useEffect, useState } from 'react';

export default function GreenMagazineSection() {
  const [items, setItems] = useState<MagazinePostData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await magazineForHome('magazine');
      setItems(res);
    };

    fetchData();
  }, []);

  return <GreenMagazineCarousel greenMagazineItems={items} />;
}
