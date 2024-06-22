import React, { useState, useEffect } from 'react';

const TokensPage = () => {
  const [tokensInfo, setTokensInfo] = useState<object[]>([]);

  // Асинхронная функция для получения информации о токенах
  const fetchTokensInfo = async () => {
    try {
      const response = await fetch('/api/tokens'); // Пример API-запроса, замените на ваш эндпоинт
      const data = await response.json();
      setTokensInfo(data);
    } catch (error) {
      console.error('Ошибка при получении информации о токенах:', error);
    }
  };

  // Используем useEffect для выполнения запроса при загрузке страницы
  useEffect(() => {
    fetchTokensInfo();
  }, []); // Пустой массив зависимостей означает, что useEffect выполнится только один раз при монтировании компонента

  return (
    <div>
      <h1>Информация о токенах</h1>
      <ul>
        {tokensInfo.map((token, index) => (
          <li key={index}>{JSON.stringify(token)}</li>
        ))}
      </ul>
    </div>
  );
};

export default TokensPage;
