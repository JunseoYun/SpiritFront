import React, {createContext, useState, useRef} from 'react';

export const AlcoholFilterContext = createContext();

export const AlcoholFilterProvider = ({children}) => {
  const [drinkType, setDrinkType] = useState(null);
  const [priceOrder, setPriceOrder] = useState('');
  const filterScrollX = useRef(0);

  const toggleAlcohol = value => {
    setDrinkType(prev => {
      if (prev === value) {
        setPriceOrder(''); // alcohol 해제 시 priceOrder 초기화
        return null;
      }
      return value;
    });
  };

  const togglepriceOrder = value => {
    setPriceOrder(prev => (prev === value ? '' : value));
  };

  return (
    <AlcoholFilterContext.Provider
      value={{
        drinkType,
        toggleAlcohol,
        togglepriceOrder,
        filterScrollX,
        priceOrder,
      }}>
      {children}
    </AlcoholFilterContext.Provider>
  );
};
