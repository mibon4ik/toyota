
'use client';

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Banner } from '@/types/banner';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

interface BannerTableProps {
  bannersData: Banner[];
  isLoadingData: boolean;
  fetchError: string | null;
  onEditClick: (banner: Banner) => void;
  onDeleteClick: (bannerId: string) => void;
}

export const BannerList: React.FC<BannerTableProps> = ({ bannersData, isLoadingData, fetchError, onEditClick, onDeleteClick }) => {

  if (isLoadingData) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Баннеры:</h2>
        <div className="space-y-3">
          <Skeleton className="h-8 w-full rounded-md" />
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-md" />
          ))}
        </div>
        <p className="text-center text-muted-foreground mt-4">Загрузка баннеров...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Баннеры:</h2>
        <p className="text-destructive text-center">{fetchError}</p>
      </div>
    );
  }

  if (bannersData.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Баннеры:</h2>
        <p className="text-center text-muted-foreground">Баннеры не найдены.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Баннеры:</h2>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Изображение</TableHead>
              <TableHead>Заголовок</TableHead>
              <TableHead>Текст кнопки</TableHead>
              <TableHead>Ссылка</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bannersData.map((bannerItem) => (
              <TableRow key={bannerItem.id}>
                <TableCell>
                  <Image
                    src={bannerItem.imageUrl || 'https://placehold.co/100x50.png'}
                    alt={bannerItem.title}
                    width={100}
                    height={50}
                    className="object-cover rounded-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.srcset = 'https://placehold.co/100x50.png';
                      target.src = 'https://placehold.co/100x50.png';
                    }}
                  />
                </TableCell>
                <TableCell className="font-medium">{bannerItem.title}</TableCell>
                <TableCell>{bannerItem.buttonText}</TableCell>
                <TableCell className="text-xs truncate max-w-[150px]" title={bannerItem.link}>{bannerItem.link}</TableCell>
                <TableCell>
                  <Badge variant={bannerItem.isActive ? 'default' : 'secondary'}>
                    {bannerItem.isActive ? 'Активен' : 'Неактивен'}
                  </Badge>
                </TableCell>
                <TableCell className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => onEditClick(bannerItem)}>
                    Изменить
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onDeleteClick(bannerItem.id)}>
                    Удалить
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
