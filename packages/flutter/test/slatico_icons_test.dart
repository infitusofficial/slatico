import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:slatico_icons/slatico_icons.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('Slatico Tier 1 Catalog & Monochrome IconData Verification', () {
    test(
      'contains all 27 Tier 1 icon families and 135 monochrome IconData entries',
      () {
        expect(SlaticoIconName.values.length, 27);
        expect(SlaticoIcons.familyCount, 27);
        expect(SlaticoIcons.monochromeGlyphCount, 135);
        expect(SlaticoIcons.allMonochrome.length, 135);

        expect(SlaticoIcons.thinIcons.length, 27);
        expect(SlaticoIcons.lightIcons.length, 27);
        expect(SlaticoIcons.regularIcons.length, 27);
        expect(SlaticoIcons.boldIcons.length, 27);
        expect(SlaticoIcons.fillIcons.length, 27);
      },
    );

    test(
      'maintains exact Unicode PUA codepoints and fontPackage matching @slatico/font',
      () {
        expect(SlaticoIcons.bellRegular.codePoint, 0xe001);
        expect(SlaticoIcons.houseRegular.codePoint, 0xe008);
        expect(SlaticoIcons.userFill.codePoint, 0xe016);
        expect(SlaticoIcons.walletBold.codePoint, 0xe017);
        expect(SlaticoIcons.arrowDownRegular.codePoint, 0xe018);
        expect(SlaticoIcons.arrowUpRegular.codePoint, 0xe019);
        expect(SlaticoIcons.arrowUpLeftRegular.codePoint, 0xe01a);
        expect(SlaticoIcons.arrowUpRightRegular.codePoint, 0xe01b);

        expect(SlaticoIcons.houseThin.fontFamily, 'Slatico Thin');
        expect(SlaticoIcons.houseLight.fontFamily, 'Slatico Light');
        expect(SlaticoIcons.houseRegular.fontFamily, 'Slatico Regular');
        expect(SlaticoIcons.houseBold.fontFamily, 'Slatico Bold');
        expect(SlaticoIcons.houseFill.fontFamily, 'Slatico Fill');

        for (final iconData in SlaticoIcons.allMonochrome.values) {
          expect(iconData.fontPackage, 'slatico_icons');
          expect(iconData.codePoint, inInclusiveRange(0xe001, 0xe01b));
        }
      },
    );

    test('excludes demo icons from SlaticoIconName and SlaticoIcons', () {
      expect(SlaticoIconName.tryFromKebab('cube'), isNull);
      expect(SlaticoIconName.tryFromKebab('sparkle'), isNull);
      expect(SlaticoIcons.allMonochrome.containsKey('cube-regular'), isFalse);
      expect(
        SlaticoIcons.allMonochrome.containsKey('sparkle-regular'),
        isFalse,
      );
    });

    test(
      'throws ArgumentError when requesting monochrome IconData for Duotone or Color',
      () {
        expect(
          () =>
              SlaticoIcons.forIcon(SlaticoIconName.house, SlaticoStyle.duotone),
          throwsArgumentError,
        );
        expect(
          () => SlaticoIcons.forIcon(SlaticoIconName.house, SlaticoStyle.color),
          throwsArgumentError,
        );
      },
    );

    test(
      'resolves Duotone and Color SVG markup with custom primary and secondary colors',
      () {
        final String svg = resolveDuotoneSvgMarkup(
          name: SlaticoIconName.house,
          primaryColor: const Color(0xFF111827),
          secondaryColor: const Color(0xFF3B82F6),
          secondaryOpacity: 0.35,
        );
        expect(svg, contains('#111827'));
        expect(svg, contains('#3B82F6'));
        expect(svg, contains('0.35'));
        expect(svg, isNot(contains('var(--slatico')));

        final String defaultColorSvg = resolveColorSvgMarkup(
          name: SlaticoIconName.bell,
        );
        expect(defaultColorSvg, contains('#FF6040'));
        expect(defaultColorSvg, contains('#000000'));

        final String customColorSvg = resolveColorSvgMarkup(
          name: SlaticoIconName.bell,
          primaryColor: const Color(0xFF2563EB),
          secondaryColor: const Color(0xFF059669),
        );
        expect(customColorSvg, contains('#2563EB'));
        expect(customColorSvg, contains('#059669'));
      },
    );

    test(
      'loads all 5 TTF font files and all 46 Duotone & Color SVG assets via Flutter rootBundle',
      () async {
        const List<String> fontFiles = <String>[
          'packages/slatico_icons/assets/fonts/slatico-thin.ttf',
          'packages/slatico_icons/assets/fonts/slatico-light.ttf',
          'packages/slatico_icons/assets/fonts/slatico-regular.ttf',
          'packages/slatico_icons/assets/fonts/slatico-bold.ttf',
          'packages/slatico_icons/assets/fonts/slatico-fill.ttf',
        ];

        for (final fontAsset in fontFiles) {
          final ByteData data = await rootBundle.load(fontAsset);
          expect(data.lengthInBytes, greaterThan(2000));
        }

        for (final icon in SlaticoIconName.values) {
          final String duotoneSvg = await rootBundle.loadString(
            icon.duotonePackageAssetPath,
          );
          final String colorSvg = await rootBundle.loadString(
            icon.colorPackageAssetPath,
          );

          expect(duotoneSvg, contains('viewBox="0 0 24 24"'));
          expect(duotoneSvg, isNot(contains('var(--slatico')));
          expect(colorSvg, contains('viewBox="0 0 24 24"'));
          expect(colorSvg, contains('#FF6040'));
        }
      },
    );
  });

  group('SlaticoIcon Widget & SlaticoIconTheme Verification', () {
    testWidgets('renders monochrome, duotone, and color styles cleanly', (
      tester,
    ) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SlaticoIconTheme(
              data: SlaticoIconThemeData(
                size: 26,
                color: Color(0xFF1E293B),
                secondaryColor: Color(0xFF6366F1),
                secondaryOpacity: 0.3,
              ),
              child: Column(
                children: [
                  Icon(SlaticoIcons.houseRegular, size: 24, color: Colors.blue),
                  SlaticoIcon(
                    name: SlaticoIconName.bell,
                    style: SlaticoStyle.bold,
                    size: 28,
                    color: Colors.indigo,
                  ),
                  SlaticoIcon(
                    name: SlaticoIconName.house,
                    style: SlaticoStyle.duotone,
                    size: 24,
                    color: Colors.black,
                    secondaryColor: Colors.blue,
                    secondaryOpacity: 0.25,
                  ),
                  SlaticoIcon(
                    name: SlaticoIconName.shieldCheck,
                    style: SlaticoStyle.color,
                    size: 32,
                    semanticLabel: 'Verified Shield',
                  ),
                ],
              ),
            ),
          ),
        ),
      );

      expect(find.byType(Icon), findsNWidgets(2));
      expect(find.byType(SlaticoIcon), findsNWidgets(3));
      expect(find.bySemanticsLabel('Verified Shield'), findsOneWidget);
    });
  });
}
