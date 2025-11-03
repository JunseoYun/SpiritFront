import React, {useEffect, useMemo, useRef} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const StoreOrderSection = ({
  ensureArray,
  parsePrice,
  items,
  onChange,
  options = {},
}) => {
  const {
    isAlcohol = false,
    sectionTitle,
    onSectionLayout,
    sectionKey,
  } = options;

  const list = ensureArray(items);
  const handleLayout =
    typeof onSectionLayout === 'function'
      ? event => onSectionLayout(event.nativeEvent.layout.y)
      : undefined;

  return (
    <View key={sectionKey} style={styles.section} onLayout={handleLayout}>
      {sectionTitle && list.length > 0 ? (
        <Text style={styles.sectionTitle}>{sectionTitle}</Text>
      ) : null}
      {list.length === 0 ? (
        <Text style={styles.emptyMessage}>등록된 항목이 없습니다.</Text>
      ) : (
        <View>
          {list.map(item => {
            const unitPrice = parsePrice(item.price);
            const formattedPrice =
              typeof item.price === 'string' &&
              !Number.isNaN(Number(item.price))
                ? `${Number(item.price).toLocaleString()}원`
                : unitPrice > 0
                ? `${unitPrice.toLocaleString()}원`
                : '가격 문의';
            const isSelected = item.quantity > 0;
            let tagLabel;
            if (isAlcohol) {
              null;
            } else {
              const menuType = item.menuType ?? item.type;
              tagLabel = menuType === 'MAIN' ? '대표' : undefined;
            }
            const description = item.description?.trim();
            const hasImage =
              typeof item.imgUrl === 'string' && item.imgUrl.trim().length > 0;
            return (
              <View
                key={item.id}
                style={[
                  styles.itemCard,
                  isSelected && styles.itemCardSelected,
                ]}>
                <View
                  style={[
                    styles.itemCardBody,
                    !hasImage && styles.itemCardBodyCompact,
                  ]}>
                  <View
                    style={[
                      styles.itemMain,
                      hasImage
                        ? styles.itemMainWithImage
                        : styles.itemMainCompact,
                    ]}>
                    <View style={styles.itemNameRow}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      {tagLabel ? (
                        <View style={styles.itemBadge}>
                          <Text style={styles.itemBadgeText}>{tagLabel}</Text>
                        </View>
                      ) : null}
                    </View>
                    {description ? (
                      <Text style={styles.itemDescription} numberOfLines={2}>
                        {description}
                      </Text>
                    ) : null}
                  </View>

                  {hasImage ? (
                    <View
                      style={[
                        styles.itemImageWrapper,
                        isSelected && styles.itemImageWrapperSelected,
                      ]}>
                      <Image
                        source={{uri: item.imgUrl}}
                        style={styles.itemImage}
                        resizeMode="cover"
                      />
                    </View>
                  ) : null}
                </View>

                <View style={styles.itemFooter}>
                  <View style={styles.footerPrice}>
                    <Text style={styles.itemPriceText}>{formattedPrice}</Text>
                  </View>

                  {item.quantity === 0 ? (
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => onChange(item.id, 1)}
                      activeOpacity={0.92}>
                      <Ionicons name="add" size={16} color="#1F2937" />
                      <Text style={styles.addButtonLabel}>담기</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.stepper}>
                      <TouchableOpacity
                        style={[
                          styles.stepperButton,
                          styles.stepperButtonMinus,
                        ]}
                        onPress={() => onChange(item.id, -1)}
                        activeOpacity={0.85}>
                        <Ionicons name="remove" size={16} color="#1F2937" />
                      </TouchableOpacity>
                      <Text style={styles.stepperValue}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={[styles.stepperButton, styles.stepperButtonPlus]}
                        onPress={() => onChange(item.id, 1)}
                        activeOpacity={0.85}>
                        <Ionicons name="add" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
    marginHorizontal: 18,
  },

  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
    color: '#1F2933',
    marginBottom: 10,
    marginLeft: 3,
  },
  emptyMessage: {
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: '#9AA2AE',
  },

  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 10,
  },
  itemCardSelected: {
    borderColor: '#111827',
    backgroundColor: '#F5F6F8',
  },
  itemCardBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  itemCardBodyCompact: {
    alignItems: 'stretch',
  },
  itemImageWrapper: {
    width: 64,
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginLeft: 12,
  },
  itemImageWrapperSelected: {
    borderColor: '#111827',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemMain: {
    flex: 1,
  },
  itemMainWithImage: {
    marginRight: 16,
  },
  itemMainCompact: {
    marginRight: 0,
    marginLeft: 0,
  },
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#1F2A37',
    flexShrink: 1,
  },
  itemBadge: {
    marginLeft: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 3,
    backgroundColor: '#3CBBFF',
  },
  itemBadgeText: {
    fontSize: 10,
    fontFamily: 'Pretendard-Regular',
    color: '#fff',
  },
  itemDescription: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: '#6B7280',
  },
  itemFooter: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerPrice: {
    flex: 1,
  },
  itemPriceText: {
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
    color: '#1F2A37',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1F2937',
    marginLeft: 12,
  },
  addButtonLabel: {
    marginLeft: 6,
    fontSize: 13,
    fontFamily: 'Pretendard-SemiBold',
    color: '#1F2937',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    paddingHorizontal: 4,
    paddingVertical: 4,
    marginLeft: 12,
  },
  stepperButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonMinus: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  stepperButtonPlus: {
    backgroundColor: '#111827',
  },
  stepperValue: {
    marginHorizontal: 8,
    minWidth: 24,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    color: '#1F2A37',
  },
});
export default StoreOrderSection;
