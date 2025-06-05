// NotificationContext.js
import React, {createContext, useState, useContext} from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({children}) => {
  const [pendingNotification, setPendingNotification] = useState(null);

  return (
    <NotificationContext.Provider
      value={{pendingNotification, setPendingNotification}}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
