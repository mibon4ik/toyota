import React from 'react';

const ContactsPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Контакты</h1>
      <div className="bg-white shadow-md rounded-md p-8">
        <h2 className="text-2xl font-semibold mb-4">Toyota</h2>
        <p className="text-gray-700 mb-2">
          <strong>Адрес:</strong> пр-т. Шакарим Кудайбердиулы 6, Астана 010000
        </p>
        {/* Google Maps Embed */}
        <div className="map-responsive">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1769.2255870400402!2d71.48380544895878!3d51.162631248800054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x42458172b2474f81%3A0x97568c826f427d2a!2z0KLQvtC50L7RgtCwINCm0LXQvdGC0YAg0JDRgdGC0LDQvdCw!5e0!3m2!1sru!2skz!4v1745910033312!5m2!1sru!2skz"
            width="400"
            height="350"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-48"
          ></iframe>
        </div>
        <p className="text-gray-700 mb-2">
          <strong>Контакты для связи:</strong> <strong>Техническая поддержка 8 (7172) 27 02 00</strong>
        </p>
        <p className="text-gray-700 mb-2">
          <strong>Часы работы:</strong> ПН-ВС: 8:00-20:00
        </p>
      </div>
    </div>
  );
};

export default ContactsPage;
