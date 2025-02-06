#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>
#import <RNKakaoLogins.h>
#import <GoogleSignIn/GoogleSignIn.h>
#import "RNSplashScreen.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"SpiritFront";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};
  BOOL ret = [super application:application didFinishLaunchingWithOptions:launchOptions]; if (ret == YES) { [RNSplashScreen show];  } return ret;
}

// openURL 메서드를 하나로 통합하여 카카오와 구글 로그인 처리를 모두 합니다.
- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  // 카카오 로그인 URL 처리
  if ([RNKakaoLogins isKakaoTalkLoginUrl:url]) {
    return [RNKakaoLogins handleOpenUrl:url];
  }
  
  // 구글 로그인 URL 처리
  if ([GIDSignIn.sharedInstance handleURL:url]) {
    return YES;
  }

  return NO;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
