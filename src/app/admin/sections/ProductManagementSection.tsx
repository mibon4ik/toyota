
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ProductList } from '../components/ProductList';
import { AddProductForm } from '../components/AddProductForm';
import { EditProductForm } from '../components/EditProductForm';
import type { AutoPart } from '@/types/autopart';
import { getAllAutoParts } from '@/services/autoparts';
import { useToast } from "@/hooks/use-toast";

export const ProductManagementSection: React.FC = () => {
  const [products, setProducts] = useState<AutoPart[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<AutoPart | null>(null);
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    setErrorProducts(null);
    try {
      const fetchedProducts = await getAllAutoParts();
      setProducts(fetchedProducts);
    } catch (fetchError) {
      console.error("ProductManagementSection: Failed to fetch products:", fetchError);
      setErrorProducts("Не удалось загрузить список товаров.");
      toast({
        title: "Ошибка загрузки товаров",
        description: "Не удалось загрузить список товаров. Попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProducts(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleEditProduct = (product: AutoPart) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };

  const handleProductUpdated = useCallback(() => {
    fetchProducts(); // Refetch products after update or addition
  }, [fetchProducts]);

  return (
    <div className="space-y-8 mt-6">
      <ProductList
        products={products}
        isLoading={isLoadingProducts}
        error={errorProducts}
        onEdit={handleEditProduct}
      />
      <AddProductForm />
      <EditProductForm
        product={selectedProduct}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onProductUpdated={handleProductUpdated}
      />
    </div>
  );
};
