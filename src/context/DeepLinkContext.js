import {createContext, useContext, useState} from 'react';

const DeepLinkContext = createContext();

let globalSetPendingStoreId = null;
let globalPendingStoreId = null;

let globalSetPendingStoreInviteId = null;
let globalPendingStoreInviteId = null;

let globalSetAppLinkHandling = null;
let globalIsAppLinkHandling = false;

export const DeepLinkProvider = ({children}) => {
  const [pendingStoreId, setPendingStoreId] = useState(null);
  const [pendingStoreInviteId, setPendingStoreInviteId] = useState(null);
  const [isAppLinkHandling, setIsAppLinkHandling] = useState(false);

  globalSetPendingStoreId = setPendingStoreId;
  globalPendingStoreId = pendingStoreId;

  globalSetPendingStoreInviteId = setPendingStoreInviteId;
  globalPendingStoreInviteId = pendingStoreInviteId;

  globalSetAppLinkHandling = setIsAppLinkHandling;
  globalIsAppLinkHandling = isAppLinkHandling;

  return (
    <DeepLinkContext.Provider
      value={{
        pendingStoreId,
        setPendingStoreId,
        pendingStoreInviteId,
        setPendingStoreInviteId,
        isAppLinkHandling,
        setIsAppLinkHandling,
      }}>
      {children}
    </DeepLinkContext.Provider>
  );
};

export const useDeepLink = () => useContext(DeepLinkContext);

// ✅ 전역 접근용 함수들
export const setGlobalPendingStoreId = id => {
  globalPendingStoreId = id;
  globalSetPendingStoreId?.(id);
};

export const setGlobalPendingStoreInviteId = id => {
  globalPendingStoreInviteId = id;
  globalSetPendingStoreInviteId?.(id);
};

export const getGlobalPendingStoreId = () => globalPendingStoreId;

export const getGlobalPendingStoreInviteId = () => globalPendingStoreInviteId;

// ✅ 앱링크 처리 상태 전역 접근
export const setGlobalAppLinkHandling = bool => {
  globalIsAppLinkHandling = bool;
  globalSetAppLinkHandling?.(bool);
};

export const getGlobalAppLinkHandling = () => globalIsAppLinkHandling;
