'use client';

import React from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from 'next/image'; // Import next/image

const blogPosts = [
  {
    id: 'blog-1',
    title: 'Важность регулярной замены масла',
    imageUrl: 'https://content.onliner.by/news/1100x5616/790c5e93741342eab27803b6488cf355.jpg',
    href: '/blog/oil-changes',
    dataAiHint: "engine oil change"
  },
  {
    id: 'blog-2',
    title: 'Выбор правильных тормозных колодок для вашего автомобиля',
    imageUrl: 'https://content.onliner.by/news/1100x5616/790c5e93741342eab27803b6488cf355.jpg',
    href: '/blog/brake-pads',
    dataAiHint: "brake pads selection"
  },
];

export const MiniBlog: React.FC = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Из нашего блога</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden group">
               <Link href={post.href ?? '#'} passHref legacyBehavior={false} className="block">
                 {/* Use next/image */}
                  <Image
                      src={post.imageUrl}
                      alt={post.title}
                      width={600} // Provide explicit width
                      height={400} // Provide explicit height
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy" // Lazy load blog images
                      onError={(e) => (e.currentTarget.src = 'https://picsum.photos/600/400')} // Fallback
                      data-ai-hint={post.dataAiHint}
                      />
                  <CardContent className="p-4">
                       <CardTitle className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{post.title}</CardTitle>
                       <p className="text-sm text-muted-foreground mb-3">Узнайте больше о...</p>
                       <Button variant="link" className="p-0 h-auto text-primary">Читать далее →</Button>
                  </CardContent>
               </Link>
            </Card>
          ))}
        </div>
      </div>
     </section>
  );
};
