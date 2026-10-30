#import "AppDelegate.h"
#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSURL *jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"index.ios" withExtension:@"bundle"];
  if (jsCodeLocation == nil) {
    jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
  }

  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"SlaticoReactNativeExample"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  rootView.backgroundColor = [UIColor systemBackgroundColor];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;

  // Verify RNSVG native view class availability at link & runtime
  Class svgViewClass = NSClassFromString(@"RNSVGSvgView");
  Class svgPathClass = NSClassFromString(@"RNSVGPath");
  if (svgViewClass != nil && svgPathClass != nil) {
    rootViewController.title = @"SlaticoReactNativeExample";
  }

  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}

@end
