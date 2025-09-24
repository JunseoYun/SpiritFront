import {useCallback, useMemo, useRef, useState} from 'react';
import {Platform, Dimensions} from 'react-native';

const defaultThreshold = () => {
  const screenHeight = Dimensions.get('window').height;
  const base = Platform.OS === 'ios' ? 0.25 : 0.3;
  return screenHeight * base;
};

const useScrollToTopVisibility = ({
  threshold,
  externalRef,
} = {}) => {
  const resolvedThreshold = useMemo(() => threshold ?? defaultThreshold(), [threshold]);
  const internalRef = useRef(null);
  const targetRef = externalRef ?? internalRef;
  const [visible, setVisible] = useState(false);

  const updateVisibility = useCallback(
    offsetY => {
      setVisible(prevVisible => {
        const shouldShow = offsetY >= resolvedThreshold;
        return prevVisible === shouldShow ? prevVisible : shouldShow;
      });
    },
    [resolvedThreshold],
  );

  const handleScroll = useCallback(
    event => {
      const offsetY = event?.nativeEvent?.contentOffset?.y ?? 0;
      updateVisibility(offsetY);
    },
    [updateVisibility],
  );

  const scrollToTop = useCallback(() => {
    const node = targetRef.current;
    if (!node) return;
    if (typeof node.scrollToOffset === 'function') {
      node.scrollToOffset({offset: 0, animated: true});
      return;
    }
    if (typeof node.scrollTo === 'function') {
      node.scrollTo({x: 0, y: 0, animated: true});
    }
  }, [targetRef]);

  return {
    scrollRef: targetRef,
    visible,
    handleScroll,
    updateVisibility,
    scrollToTop,
  };
};

export default useScrollToTopVisibility;
