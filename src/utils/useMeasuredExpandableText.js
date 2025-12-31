import React, {useCallback, useLayoutEffect, useMemo, useState} from 'react';
import CustomText from './CustomText';

/**
 * Measures text rendering to collapse after a given number of lines while keeping
 * layout-accurate trimming (character-level) so a suffix can fit on the last line.
 */
const useMeasuredExpandableText = ({
  text,
  maxLines = 2,
  readMoreLabel = '…더보기',
  readMoreStyle,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [collapsedContent, setCollapsedContent] = useState(text ?? '');
  const [isExpandable, setIsExpandable] = useState(false);
  const [hasMeasured, setHasMeasured] = useState(false);

  useLayoutEffect(() => {
    setIsExpanded(false);
    setCollapsedContent(text ?? '');
    setIsExpandable(false);
    setHasMeasured(false);
  }, [text, maxLines]);

  const handleTextLayout = useCallback(
    event => {
      if (isExpanded) {
        return;
      }

      const {lines} = event.nativeEvent;
      if (!lines) {
        return;
      }

      if (!hasMeasured) {
        setHasMeasured(true);

        if (lines.length > maxLines) {
          setIsExpandable(true);
          const initialCollapsed = lines
            .slice(0, maxLines)
            .map(line => line.text)
            .join('')
            .trimEnd();
          setCollapsedContent(initialCollapsed);
        } else {
          setIsExpandable(false);
        }
        return;
      }

      if (isExpandable && lines.length > maxLines) {
        setCollapsedContent(prev =>
          prev.length > 0 ? prev.slice(0, -1).trimEnd() : prev,
        );
      }
    },
    [hasMeasured, isExpandable, isExpanded, maxLines],
  );

  const contentForRender = useMemo(() => {
    if (isExpanded || !isExpandable) {
      return text ?? '';
    }

    return (
      <>
        {collapsedContent}{' '}
        <CustomText style={readMoreStyle}>{readMoreLabel}</CustomText>
      </>
    );
  }, [
    collapsedContent,
    isExpandable,
    isExpanded,
    readMoreLabel,
    readMoreStyle,
    text,
  ]);

  const toggleExpanded = useCallback(() => {
    if (!isExpandable) {
      return;
    }
    setIsExpanded(prev => !prev);
  }, [isExpandable]);

  return {
    contentForRender,
    handleTextLayout,
    isExpanded,
    isExpandable,
    hasMeasured,
    toggleExpanded,
  };
};

export default useMeasuredExpandableText;
