import React, {createContext, useState, useRef} from 'react';

export const AlcoholFilterContext = createContext();

export const AlcoholFilterProvider = ({children}) => {
  const [selectedAlcohols, setSelectedAlcohols] = useState([]);
  const filterScrollX = useRef(0); // ← useRef로 변경

  const toggleAlcohol = value => {
    setSelectedAlcohols(prev =>
      prev.includes(value)
        ? prev.filter(item => item !== value)
        : [...prev, value],
    );
  };

  return (
    <AlcoholFilterContext.Provider
      value={{
        selectedAlcohols,
        toggleAlcohol,
        filterScrollX, // ref 객체 그대로 전달
      }}>
      {children}
    </AlcoholFilterContext.Provider>
  );
};
