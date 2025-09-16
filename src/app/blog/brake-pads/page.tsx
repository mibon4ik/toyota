
import React from 'react';
import Image from 'next/image';

const BrakePadsInfoPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">🛑 Выбор правильных тормозных колодок для вашего автомобиля</h1>
      
      <div className="bg-card text-card-foreground shadow-md rounded-md p-8">
        <p className="text-muted-foreground mb-4">
          Тормозные колодки — это один из ключевых элементов тормозной системы. От их качества и соответствия конкретной модели автомобиля зависит не только эффективность торможения, но и ваша безопасность. Разберёмся, как выбрать правильные колодки и на что стоит обратить внимание.
        </p>

        <h2 className="text-2xl font-semibold mb-4">🔍 Почему важно выбирать подходящие колодки?</h2>
        <ul className="list-disc list-inside text-muted-foreground mb-4">
          <li>Безопасность: неподходящие или изношенные колодки увеличивают тормозной путь и могут привести к аварийной ситуации.</li>
          <li>Износ тормозных дисков: неправильно подобранные колодки могут повредить диски, что приведёт к дорогостоящему ремонту.</li>
          <li>Комфорт: качественные колодки работают тихо, без скрипа и вибраций.</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4">✅ Как выбрать тормозные колодки?</h2>
        <p className="text-muted-foreground mb-4">
          <b>По VIN-коду или марке автомобиля</b>: Это самый точный способ найти совместимые колодки. Введите VIN в каталог — система подберёт подходящий вариант.
        </p>

        <p className="text-muted-foreground mb-4">
          <b>По стилю езды</b>:
        </p>
        <ul className="list-disc list-inside text-muted-foreground mb-4">
          <li>Город: органические или керамические.</li>
          <li>Загород, трасса: полуметаллические.</li>
          <li>Спорт: усиленные полуметаллические или специальные спортивные колодки.</li>
        </ul>

        <p className="text-muted-foreground mb-4">
          <b>Производитель</b>: Оригинальные детали — это надёжность. Но и аналоги от проверенных брендов (TRW, Brembo, Bosch и др.) часто ничем не уступают.
        </p>

        <p className="text-muted-foreground mb-4">
          <b>Сертификация и гарантия</b>: Обязательно проверяйте наличие сертификатов качества и срок гарантии.
        </p>

        <h2 className="text-2xl font-semibold mb-4">📦 Вывод</h2>
        <p className="text-muted-foreground mb-4">
          Выбор тормозных колодок — это не только вопрос цены. Это вопрос безопасности, ресурса автомобиля и комфорта на дороге. Покупайте только проверенные изделия и не забывайте регулярно проверять состояние тормозной системы.
        </p>

        <p className="text-muted-foreground mb-4">
          🔧 Нужна помощь с подбором колодок для вашей Toyota? Переходите в каталог и оформляйте заказ.
        </p>
      </div>
    </div>
  );
};

export default BrakePadsInfoPage;
