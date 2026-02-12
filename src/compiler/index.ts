// src/compiler/index.ts
// Это будущий компилятор. Пока это просто "пропускной пункт" (Pass-through)
export const useCompiler = () => {
  const compile = (rawData: any) => {
    console.log("Шлюз: получены данные", rawData);
    // В будущем здесь будет фильтрация и маппинг
    return rawData; 
  };

  return {
    compile
  };
};