
'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import Autopart from "@/app/components/autopart";
import { getPartsByVin, getPartsByMakeModel } from '@/services/autopartCompatibility';
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import type { AutoPart } from '@/types/autopart';

interface CompatibilityFormProps {
  onAddToCart: (product: AutoPart) => void;
}

type CompatiblePartsList = AutoPart[] | null;

export const CompatibilityChecker: React.FC<CompatibilityFormProps> = ({ onAddToCart }) => {
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleVin, setVehicleVin] = useState('');
  const [foundParts, setFoundParts] = useState<CompatiblePartsList>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { toast: showMsg } = useToast();

  const findCompatibleParts = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSearching(true);
    setFoundParts(null);

    let searchResults: AutoPart[] = [];
    let didSearch = false;

    if (vehicleVin && vehicleVin.length === 17 && /^[A-HJ-NPR-Z0-9]{17}$/i.test(vehicleVin)) {
      try {
        console.log(`Searching parts by VIN: ${vehicleVin}`);
        searchResults = await getPartsByVin(vehicleVin.toUpperCase());
        didSearch = true;
        console.log(`Found ${searchResults.length} parts by VIN.`);
      } catch (error) {
        console.error("Error fetching parts by VIN:", error);
      }
    } else if (vehicleVin) {
       showMsg({
         title: "Ошибка",
         description: "VIN-код должен состоять из 17 латинских букв (кроме I, O, Q) и цифр.",
         variant: "destructive",
       });
       setIsSearching(false);
       return;
    }

    if ((!didSearch || searchResults.length === 0) && vehicleMake && vehicleModel) {
        if (!didSearch) console.log("VIN not provided or invalid, searching by Make/Model...");
        else console.log("No parts found by VIN, falling back to Make/Model search...");
      try {
        console.log(`Searching parts by Make: ${vehicleMake}, Model: ${vehicleModel}`);
        searchResults = await getPartsByMakeModel(vehicleMake, vehicleModel);
        didSearch = true;
        console.log(`Found ${searchResults.length} parts by Make/Model.`);
      } catch (error) {
        console.error("Error fetching parts by Make/Model:", error);
        showMsg({
          title: "Ошибка",
          description: "Не удалось получить совместимые детали. Пожалуйста, попробуйте позже.",
          variant: "destructive",
        });
        setFoundParts(null);
        setIsSearching(false);
        return;
      }
    }

    if (!didSearch && (!vehicleMake || !vehicleModel)) {
      showMsg({
        title: "Ошибка",
        description: "Пожалуйста, введите Марку и Модель или корректный VIN-код.",
        variant: "destructive",
      });
    } else if (searchResults.length === 0) {
        showMsg({
            title: "Детали не найдены",
            description: "Не удалось найти совместимые детали для вашего запроса.",
        });
        setFoundParts([]);
    } else {
        setFoundParts(searchResults);
    }

    setIsSearching(false);
  };

  return (
    <section className="py-12 bg-card border rounded-lg p-6">
      <div className="container mx-auto text-center">
        <h2 className="text-2xl font-bold mb-6">Найти детали для вашего автомобиля</h2>
         <form onSubmit={findCompatibleParts} className="max-w-2xl mx-auto space-y-4">
           <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Input
                  type="text"
                  placeholder="Марка"
                  value={vehicleMake}
                  onChange={(e) => setVehicleMake(e.target.value)}
                  className="w-full sm:w-auto flex-1"
                  disabled={isSearching}
              />
              <Input
                  type="text"
                  placeholder="Модель"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="w-full sm:w-auto flex-1"
                   disabled={isSearching}
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
                  value={vehicleVin}
                  onChange={(e) => setVehicleVin(e.target.value.toUpperCase())}
                  className="w-full font-mono tracking-widest uppercase"
                  maxLength={17}
                  pattern="[A-HJ-NPR-Z0-9]{17}"
                  title="VIN должен состоять из 17 латинских букв (кроме I, O, Q) и цифр."
                  disabled={isSearching}
              />
            </div>
             <Button type="submit" className="w-full sm:w-auto bg-[#535353ff] hover:bg-[#535353ff]/90" disabled={isSearching}>
               {isSearching ? <Icons.loader className="mr-2 h-4 w-4 animate-spin" /> : null}
               {isSearching ? 'Поиск...' : 'Найти детали'}
             </Button>
        </form>

         {isSearching && (
              <div className="mt-8 text-center text-muted-foreground">
                 <Icons.loader className="mx-auto h-6 w-6 animate-spin mb-2" />
                 Ищем подходящие детали...
              </div>
          )}
         {!isSearching && foundParts && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Предложенные детали:</h3>
            {foundParts.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {foundParts.map((part) => (
                  <Autopart key={part.id} productInfo={part} onAddToCart={onAddToCart} />
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
