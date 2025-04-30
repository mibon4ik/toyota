
import React from 'react';
import Image from 'next/image'; // Import next/image

const OilChangesPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">🔧 Важность регулярной замены масла</h1>
      {/* Consider adding an introductory image */}
      {/* <div className="mb-8 relative h-64">
        <Image
          src="https://picsum.photos/seed/oilmain/1200/400" // Placeholder image
          alt="Замена масла в двигателе"
          layout="fill"
          objectFit="cover"
          className="rounded-md"
        />
      </div> */}
      <div className="bg-card text-card-foreground shadow-md rounded-md p-8">
        <p className="text-muted-foreground mb-4">
          Моторное масло — один из важнейших компонентов, обеспечивающих надёжную и бесперебойную работу двигателя.
          Регулярная замена масла позволяет продлить срок службы двигателя, избежать дорогостоящего ремонта и сохранить
          стабильную работу автомобиля.
        </p>

        <h2 className="text-2xl font-semibold mb-4">Почему это важно?</h2>
        <ul className="list-disc list-inside text-muted-foreground mb-4">
          <li>✅ Защита от износа: Свежая масляная плёнка снижает трение между движущимися деталями двигателя и
            предотвращает их преждевременный износ.</li>
          <li>✅ Охлаждение двигателя: Масло помогает отводить лишнее тепло, защищая двигатель от перегрева. Старое
            масло хуже справляется с этой функцией.</li>
          <li>✅ Удаление загрязнений: Современные масла содержат присадки, которые очищают двигатель от нагара и частиц
            сажи. Но со временем эффективность этих присадок снижается.</li>
          <li>✅ Экономия топлива: Чистое масло снижает сопротивление движению деталей — это улучшает топливную
            экономичность.</li>
          <li>✅ Снижение риска поломок: Своевременная замена масла — это профилактика серьезных неисправностей и
            выходов из строя двигателя.</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4">Как часто менять масло?</h2>
        <p className="text-muted-foreground mb-4">
          🔄 Рекомендуемая периодичность — каждые 8 000–10 000 км пробега или 1 раз в 6–12 месяцев (в зависимости от
          условий эксплуатации и марки автомобиля).
        </p>

        <p className="text-muted-foreground mb-4">
          🚘 Для автомобилей Toyota мы рекомендуем следовать рекомендациям из сервисной книжки. Также не забывайте о замене
          масляного фильтра при каждой замене масла.
        </p>
           <p className="text-muted-foreground mb-4">
             Мы предлагаем <strong>оригинальные</strong> масла Toyota и проверенные аналоги, подходящие именно для вашего автомобиля.
             Переходите в каталог масел и оформите заказ.
           </p>
      </div>

    </div>
  );
};

export default OilChangesPage;
