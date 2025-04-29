import React from 'react';

const ContactsPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Контакты</h1>
      <div className="bg-white shadow-md rounded-md p-8">
        <h2 className="text-2xl font-semibold mb-4">Toyota</h2>
        <p className="text-gray-700">
          <strong>Контакты для связи:</strong> Техническая поддержка 8 707 123 4567
        </p>
      </div>
    </div>
  );
};

export default ContactsPage;
