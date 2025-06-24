import {useEffect, useState} from 'react';
import {Versioncheck} from '../api/versioncheckApi';

const useVersionCheck = () => {
  const [isVersionValid, setIsVersionValid] = useState(true);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await Versioncheck();
        const isUpdateRequired = response.data.data.isUpdateRequired;

        if (isUpdateRequired) {
          setIsVersionValid(false);
        }
      } catch (error) {
        console.warn('버전 체크 실패:', error.response);
      }
    };

    checkVersion();
  }, []);

  return isVersionValid;
};

export default useVersionCheck;
