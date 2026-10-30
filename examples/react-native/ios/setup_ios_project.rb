require 'xcodeproj'
require 'fileutils'

project_path = File.join(__dir__, 'SlaticoReactNativeExample.xcodeproj')
FileUtils.rm_rf(project_path)

project = Xcodeproj::Project.new(project_path)
target = project.new_target(:application, 'SlaticoReactNativeExample', :ios, '15.1')

group = project.main_group.new_group('SlaticoReactNativeExample', 'SlaticoReactNativeExample')
['AppDelegate.h', 'AppDelegate.mm', 'main.m'].each do |file_name|
  file_ref = group.new_file(file_name)
  target.add_file_references([file_ref]) if file_name.end_with?('.m', '.mm')
end

bundle_rel_path = '../dist/ios/index.ios.bundle'
if File.exist?(File.join(__dir__, bundle_rel_path))
  bundle_ref = project.main_group.new_file(bundle_rel_path)
  target.resources_build_phase.add_file_reference(bundle_ref)
end

target.build_configurations.each do |config|
  config.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = 'com.infitus.slatico.rnexample'
  config.build_settings['INFOPLIST_FILE'] = 'SlaticoReactNativeExample/Info.plist'
  config.build_settings['CLANG_ENABLE_MODULES'] = 'YES'
  config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++20'
  config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] = ['$(inherited)', 'COCOAPODS=1']
  config.build_settings['OTHER_LDFLAGS'] = ['$(inherited)', '-ObjC']
end

project.recreate_user_schemes
Xcodeproj::XCScheme.share_scheme(project_path, 'SlaticoReactNativeExample')
project.save

puts "[Slatico RN iOS] Generated #{project_path}"
