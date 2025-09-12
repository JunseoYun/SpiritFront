import {createNavigationContainerRef} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

// Flexible reset helper
// - Form A: resetTo('StackName', 'ScreenName', params?)
// - Form B: resetTo(stateObject) where stateObject is a full reset state
export function resetTo(arg1, arg2, arg3) {
  if (!navigationRef.isReady()) return;

  // If full state object is provided
  if (typeof arg1 === 'object' && arg1 && Array.isArray(arg1.routes)) {
    // React Navigation v6: prefer resetRoot for top-level
    if (typeof navigationRef.resetRoot === 'function') {
      navigationRef.resetRoot(arg1);
    } else {
      navigationRef.reset(arg1);
    }
    return;
  }

  // Legacy 2-arg form
  const stackName = arg1;
  const screenName = arg2;
  const params = arg3;
  if (typeof stackName === 'string' && typeof screenName === 'string') {
    const state = {
      index: 0,
      routes: [
        {
          name: stackName,
          state: {
            index: 0,
            routes: [{name: screenName, params}],
          },
        },
      ],
    };
    if (typeof navigationRef.resetRoot === 'function') {
      navigationRef.resetRoot(state);
    } else {
      navigationRef.reset(state);
    }
  }
}
