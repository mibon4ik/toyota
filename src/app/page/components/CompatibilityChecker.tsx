'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import Autopart from "@/app/components/autopart";
import { getPartsByVin, getPartsByMakeModel } from '@/services/autoparts'; // Corrected import path
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { AutoPart } from '@/types/autopart';

interface CompatibilityCheckerProps {
  onAddToCart: (product: AutoPart) => void;
}

type CompatiblePartsResult = AutoPart[] | null;

export const CompatibilityChecker: React.FC<CompatibilityCheckerProps> = ({ onAddToCart }) => {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [vinCode, setVinCode] = useState('');
  const [compatibleParts, setCompatibleParts] = useState<CompatiblePartsResult>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoadingSuggestions(true);
    setCompatibleParts(null);

    let partsResult: AutoPart[] = [];
    let searchPerformed = false;

    if (vinCode && vinCode.length === 17 && /^[A-HJ-NPR-Z0-9]{17}$/i.test(vinCode)) {
      try {
        console.log(`Searching parts by VIN: ${vinCode}`);
        partsResult = await getPartsByVin(vinCode.toUpperCase());
        searchPerformed = true;
        console.log(`Found ${partsResult.length} parts by VIN.`);
      } catch (error) {
        console.error("Error fetching parts by VIN:", error);
      }
    } else if (vinCode) {
       toast({
         title: "Ошибка",
         description: "VIN-код должен состоять из 17 латинских букв (кроме I, O, Q) и цифр.",
         variant: "destructive",
       });
       setIsLoadingSuggestions(false);
       return;
    }

    if ((!searchPerformed || partsResult.length === 0) && make && model) {
        if (!searchPerformed) console.log("VIN not provided or invalid, searching by Make/Model...");
        else console.log("No parts found by VIN, falling back to Make/Model search...");
      try {
        console.log(`Searching parts by Make: ${make}, Model: ${model}`);
        partsResult = await getPartsByMakeModel(make, model);
        searchPerformed = true;
        console.log(`Found ${partsResult.length} parts by Make/Model.`);
      } catch (error) {
        console.error("Error fetching parts by Make/Model:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось получить совместимые детали. Пожалуйста, попробуйте позже.",
          variant: "destructive",
        });
        setCompatibleParts(null);
        setIsLoadingSuggestions(false);
        return;
      }
    }

    if (!searchPerformed && (!make || !model)) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите Марку и Модель или корректный VIN-код.",
        variant: "destructive",
      });
    } else if (partsResult.length === 0) {
        toast({
            title: "Детали не найдены",
            description: "Не удалось найти совместимые детали для вашего запроса.",
        });
        setCompatibleParts([]);
    } else {
        setCompatibleParts(partsResult);
    }

    setIsLoadingSuggestions(false);
  };

  return (
    <section className="py-12 bg-card border rounded-lg p-6">
      <div className="container mx-auto text-center">
        <h2 className="text-2xl font-bold mb-6">Найти детали для вашего автомобиля</h2>
         <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
           <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Input
                  type="text"
                  placeholder="Марка"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  className="w-full sm:w-auto flex-1"
                  disabled={isLoadingSuggestions}
              />
              <Input
                  type="text"
                  placeholder="Модель"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full sm:w-auto flex-1"
                   disabled={isLoadingSuggestions}
              />
           </div>
            <div className="flex items-center justify-center gap-2">
               <div className="flex-grow border-t border-muted"></div>
               <span className="text-muted-foreground text-sm">или</span>
               <div className="flex-grow border-t border-muted"></div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Input
                  type="text"
                  placeholder="VIN-код (17 символов)"
                  value={vinCode}
                  onChange={(e) => setVinCode(e.target.value.toUpperCase())}
                  className="w-full font-mono tracking-widest uppercase"
                  maxLength={17}
                  pattern="[A-HJ-NPR-Z0-9]{17}"
                  title="VIN должен состоять из 17 латинских букв (кроме I, O, Q) и цифр."
                  disabled={isLoadingSuggestions}
              />
            </div>
             <Button type="submit" className="w-full sm:w-auto bg-[#535353ff] hover:bg-[#535353ff]/90" disabled={isLoadingSuggestions}>
               {isLoadingSuggestions ? <Icons.loader className="mr-2 h-4 w-4 animate-spin" /> : null}
               {isLoadingSuggestions ? 'Поиск...' : 'Найти детали'}
             </Button>
        </form>

         {isLoadingSuggestions && (
              <div className="mt-8 text-center text-muted-foreground">
                 <Icons.loader className="mx-auto h-6 w-6 animate-spin mb-2" />
                 Ищем подходящие детали...
              </div>
          )}
         {!isLoadingSuggestions && compatibleParts && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Предложенные детали:</h3>
            {compatibleParts.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {compatibleParts.map((product) => (
                  <Autopart key={product.id} product={product} onAddToCart={onAddToCart} />
                  ))}
               </div>
             ) : (
               <p className="text-muted-foreground mt-4">Совместимые детали не найдены для вашего запроса.</p>
             )}
          </div>
        )}
      </div>
     </section>
  );
};
