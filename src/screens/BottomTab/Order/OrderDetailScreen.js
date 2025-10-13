import OrderUserDetailScreen from './OrderUserDetailScreen';
import OrderOwnerDetailScreen from './OrderOwnerDetailScreen';

export default function OrderDetailScreen({route, navigation}) {
  const isOwner = !!route.params?.owner;
  if (isOwner) {
    return <OrderOwnerDetailScreen route={route} navigation={navigation} />;
  }
  return <OrderUserDetailScreen route={route} navigation={navigation} />;
}
