
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ProductList } from '../components/ProductList';
import { AddProductForm } from '../components/AddProductForm';
import { EditProductForm } from '../components/EditProductForm';
import type { AutoPart } from '@/types/autopart';
import { getAllAutoParts } from '@/services/autoparts';
import { useToast } from "@/hooks/use-toast";

export const ProductManagementSection: React.FC = () => {
  const [allProducts, setAllProducts] = useState<AutoPart[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsFetchError, setProductsFetchError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState<AutoPart | null>(null);
  const { toast: displayToast } = useToast();

  const fetchProductList = useCallback(async () => {
    setLoadingProducts(true);
    setProductsFetchError(null);
    try {
      const data = await getAllAutoParts();
      setAllProducts(data);
    } catch (error) {
      console.error("ProductManagementSection: Failed to fetch products:", error);
      setProductsFetchError("Не удалось загрузить список товаров.");
      displayToast({
        title: "Ошибка загрузки товаров",
        description: "Не удалось загрузить список товаров. Попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setLoadingProducts(false);
    }
  }, [displayToast]);

  useEffect(() => {
    fetchProductList();
  }, [fetchProductList]);

  const openEditForm = (productItem: AutoPart) => {
    setProductToEdit(productItem);
    setShowEditModal(true);
  };

  const closeEditForm = () => {
    setShowEditModal(false);
    setProductToEdit(null);
  };

  const onProductListChanged = useCallback(() => {
    fetchProductList();
  }, [fetchProductList]);

  return (
    <div className="space-y-8 mt-6">
      <ProductList
        productsData={allProducts}
        isLoadingData={loadingProducts}
        fetchError={productsFetchError}
        onEditClick={openEditForm}
      />
      <AddProductForm />
      <EditProductForm
        productData={productToEdit}
        isFormOpen={showEditModal}
        closeForm={closeEditForm}
        onProductSave={onProductListChanged}
      />
    </div>
  );
};
