import {useEffect, useState} from 'react';
import {Versioncheck} from '../api/versioncheckApi';

const useVersionCheck = () => {
  const [isVersionValid, setIsVersionValid] = useState(true);

  const [isTestEnabled, setIsTestEnabled] = useState(false);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await Versioncheck();
        const isUpdateRequired = response.data.data.isUpdateRequired;
        const isTestRequired = response.data.data.isTestEnabled;
        if (isUpdateRequired) {
          setIsVersionValid(false);
        }
        if (isTestRequired) {
          setIsTestEnabled(true);
        }
      } catch (error) {
      }
    };

    checkVersion();
  }, []);

  return {isVersionValid, isTestEnabled};
};

export default useVersionCheck;
