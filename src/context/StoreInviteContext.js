import React, {createContext, useContext, useState, useEffect} from 'react';
import StoreInviteModal from '../hooks/StoreInviteModal';
import {useDeepLink} from './DeepLinkContext';
import {useAuth} from './AuthContext';

const StoreInviteContext = createContext();
let globalShowStoreInvite = null;

export const StoreInviteProvider = ({children}) => {
  const {pendingStoreInviteId, setPendingStoreInviteId} = useDeepLink();
  const {token} = useAuth(); // token 변화를 감지
  const [storeInviteId, setStoreInviteId] = useState(null);
  const [isShowStoreInvite, setIsShowStoreInvite] = useState(false);

  const showStoreInvite = id => {
    setStoreInviteId(id);
    setIsShowStoreInvite(true);
  };
  globalShowStoreInvite = showStoreInvite;

  // 🔹 pendingStoreInviteId + token 변화 감지
  useEffect(() => {
    if (pendingStoreInviteId && token) {
      showStoreInvite(pendingStoreInviteId);
      setPendingStoreInviteId(null);
    }
  }, [pendingStoreInviteId, token, setPendingStoreInviteId]);

  return (
    <StoreInviteContext.Provider value={{showStoreInvite}}>
      {children}
      <StoreInviteModal
        storeInviteId={storeInviteId}
        isShowStoreInvite={isShowStoreInvite}
        onDismiss={() => setIsShowStoreInvite(false)}
      />
    </StoreInviteContext.Provider>
  );
};

export const useStoreInviteContext = () => useContext(StoreInviteContext);
export const getGlobalShowStoreInvite = () => globalShowStoreInvite;
