
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { BannerList } from '../components/BannerList';
import { AddBannerForm } from '../components/AddBannerForm';
import { EditBannerForm } from '../components/EditBannerForm';
import type { Banner } from '@/types/banner';
import { getAllBanners, deleteBanner as removeBannerService } from '@/services/banners';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';

export const BannerManagementSection: React.FC = () => {
  const [allBanners, setAllBanners] = useState<Banner[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [bannersFetchError, setBannersFetchError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [bannerToEdit, setBannerToEdit] = useState<Banner | null>(null);
  const { toast: displayToast } = useToast();

  const fetchBannerList = useCallback(async () => {
    setLoadingBanners(true);
    setBannersFetchError(null);
    try {
      const data = await getAllBanners();
      setAllBanners(data);
    } catch (error) {
      setBannersFetchError("Не удалось загрузить список баннеров.");
      displayToast({
        title: "Ошибка загрузки баннеров",
        description: "Не удалось загрузить список баннеров. Попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setLoadingBanners(false);
    }
  }, [displayToast]);

  useEffect(() => {
    fetchBannerList();
  }, [fetchBannerList]);

  const openEditForm = (bannerItem: Banner) => {
    setBannerToEdit(bannerItem);
    setShowEditModal(true);
    setShowAddModal(false);
  };

  const closeEditForm = () => {
    setShowEditModal(false);
    setBannerToEdit(null);
  };

  const openAddForm = () => {
    setShowAddModal(true);
    setShowEditModal(false);
    setBannerToEdit(null);
  };

  const closeAddForm = () => {
    setShowAddModal(false);
  };

  const onBannerListChanged = useCallback(() => {
    fetchBannerList();
  }, [fetchBannerList]);

  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот баннер?')) return;
    try {
      await removeBannerService(bannerId);
      displayToast({
        title: "Баннер удален!",
        description: "Баннер успешно удален.",
      });
      onBannerListChanged();
    } catch (error: any) {
      displayToast({
        title: "Ошибка удаления",
        description: error.message || "Не удалось удалить баннер.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8 mt-6">
      <div className="flex justify-end mb-4">
        <Button onClick={openAddForm}>Добавить новый баннер</Button>
      </div>
      <BannerList
        bannersData={allBanners}
        isLoadingData={loadingBanners}
        fetchError={bannersFetchError}
        onEditClick={openEditForm}
        onDeleteClick={handleDeleteBanner}
      />
      <AddBannerForm
        isFormOpen={showAddModal}
        closeForm={closeAddForm}
        onBannerSave={onBannerListChanged}
      />
      <EditBannerForm
        bannerData={bannerToEdit}
        isFormOpen={showEditModal}
        closeForm={closeEditForm}
        onBannerSave={onBannerListChanged}
      />
    </div>
  );
};
