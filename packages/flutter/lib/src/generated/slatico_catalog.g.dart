// GENERATED CODE - DO NOT MODIFY BY HAND
// Generated deterministically by scripts/generate-flutter.ts from master SVG sources.

/// Enumeration of all 23 production Slatico icon families.
enum SlaticoIconName {
  /// The `bell` Tier 1 icon family.
  bell('bell'),

  /// The `cloud` Tier 1 icon family.
  cloud('cloud'),

  /// The `cloud-check` Tier 1 icon family.
  cloudCheck('cloud-check'),

  /// The `credit-card` Tier 1 icon family.
  creditCard('credit-card'),

  /// The `envelope` Tier 1 icon family.
  envelope('envelope'),

  /// The `envelope-open` Tier 1 icon family.
  envelopeOpen('envelope-open'),

  /// The `gear` Tier 1 icon family.
  gear('gear'),

  /// The `house` Tier 1 icon family.
  house('house'),

  /// The `layout-dashboard` Tier 1 icon family.
  layoutDashboard('layout-dashboard'),

  /// The `lock` Tier 1 icon family.
  lock('lock'),

  /// The `lock-open` Tier 1 icon family.
  lockOpen('lock-open'),

  /// The `magnifying-glass` Tier 1 icon family.
  magnifyingGlass('magnifying-glass'),

  /// The `minus` Tier 1 icon family.
  minus('minus'),

  /// The `pencil` Tier 1 icon family.
  pencil('pencil'),

  /// The `plus` Tier 1 icon family.
  plus('plus'),

  /// The `shield` Tier 1 icon family.
  shield('shield'),

  /// The `shield-check` Tier 1 icon family.
  shieldCheck('shield-check'),

  /// The `sliders-horizontal` Tier 1 icon family.
  slidersHorizontal('sliders-horizontal'),

  /// The `trash` Tier 1 icon family.
  trash('trash'),

  /// The `trash-x` Tier 1 icon family.
  trashX('trash-x'),

  /// The `trend-up` Tier 1 icon family.
  trendUp('trend-up'),

  /// The `user` Tier 1 icon family.
  user('user'),

  /// The `wallet` Tier 1 icon family.
  wallet('wallet');

  const SlaticoIconName(this.kebabName);

  /// Canonical kebab-case identifier matching `@slatico/core` and SVG filenames.
  final String kebabName;

  /// Relative asset path inside `slatico_icons` for the `duotone` SVG variant.
  String get duotoneAssetPath => 'assets/svg/duotone/$kebabName.svg';

  /// Package-prefixed asset path for the `duotone` SVG variant.
  String get duotonePackageAssetPath =>
      'packages/slatico_icons/assets/svg/duotone/$kebabName.svg';

  /// Relative asset path inside `slatico_icons` for the `color` SVG variant.
  String get colorAssetPath => 'assets/svg/color/$kebabName.svg';

  /// Package-prefixed asset path for the `color` SVG variant.
  String get colorPackageAssetPath =>
      'packages/slatico_icons/assets/svg/color/$kebabName.svg';

  /// Resolves a [SlaticoIconName] from its canonical kebab-case name, or returns `null`.
  static SlaticoIconName? tryFromKebab(String name) {
    for (final value in SlaticoIconName.values) {
      if (value.kebabName == name) {
        return value;
      }
    }
    return null;
  }
}

/// Default authored opacity for the secondary layer of each Duotone icon.
const Map<SlaticoIconName, double> slaticoDuotoneDefaultOpacity =
    <SlaticoIconName, double>{
  SlaticoIconName.bell: 0.2,
  SlaticoIconName.cloud: 0.2,
  SlaticoIconName.cloudCheck: 0.2,
  SlaticoIconName.creditCard: 0.2,
  SlaticoIconName.envelope: 0.2,
  SlaticoIconName.envelopeOpen: 0.2,
  SlaticoIconName.gear: 0.2,
  SlaticoIconName.house: 0.2,
  SlaticoIconName.layoutDashboard: 0.2,
  SlaticoIconName.lock: 0.2,
  SlaticoIconName.lockOpen: 0.2,
  SlaticoIconName.magnifyingGlass: 0.2,
  SlaticoIconName.minus: 0.2,
  SlaticoIconName.pencil: 0.2,
  SlaticoIconName.plus: 0.2,
  SlaticoIconName.shield: 0.2,
  SlaticoIconName.shieldCheck: 0.2,
  SlaticoIconName.slidersHorizontal: 0.2,
  SlaticoIconName.trash: 0.2,
  SlaticoIconName.trashX: 0.2,
  SlaticoIconName.trendUp: 0.2,
  SlaticoIconName.user: 0.2,
  SlaticoIconName.wallet: 0.2,
};

/// Tokenized 24x24 Duotone SVG templates supporting dynamic primary color,
/// secondary color, and secondary opacity injection in `flutter_svg`.
const Map<SlaticoIconName, String> slaticoDuotoneSvgTemplates =
    <SlaticoIconName, String>{
  SlaticoIconName.bell:
      '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="__SLATICO_PRIMARY_COLOR__" d="M9.644 18.575a2.426 2.426 0 0 0 4.712 0zm2.356-13a5.65 5.65 0 0 0-5.647 5.648v1.732a8.6 8.6 0 0 1-1.257 4.47h13.808a8.57 8.57 0 0 1-1.256-4.47v-1.732A5.65 5.65 0 0 0 12 5.575m0-2c-.633 0-1.17.413-1.355.985a6.8 6.8 0 0 1 2.71 0A1.425 1.425 0 0 0 12 3.575m3.53 15a3.576 3.576 0 0 1-7.06 0h-5.6l.906-1.245a7.43 7.43 0 0 0 1.427-4.375v-1.732A6.8 6.8 0 0 1 9.426 4.93a2.576 2.576 0 0 1 5.148 0 6.8 6.8 0 0 1 4.223 6.293v1.732c0 1.573.5 3.105 1.427 4.375l.907 1.245z"/><g fill="__SLATICO_SECONDARY_COLOR__" fill-rule="evenodd" clip-rule="evenodd" opacity="__SLATICO_SECONDARY_OPACITY__"><path d="M17.648 11.223a5.648 5.648 0 0 0-11.295 0v1.732a8.6 8.6 0 0 1-1.257 4.47h13.808a8.57 8.57 0 0 1-1.256-4.47z"/><path d="M12 20.425a2.426 2.426 0 0 1-2.356-1.85h4.712A2.426 2.426 0 0 1 12 20.425"/><path d="M13.356 4.56a6.8 6.8 0 0 0-2.712 0 1.425 1.425 0 0 1 2.711 0"/></g></svg>',
  SlaticoIconName.cloud:
      '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="__SLATICO_SECONDARY_COLOR__" d="M20.425 13.75c0-1.544-.616-2.868-2.05-3.188-.489-.11-1.11-.079-1.518-.079a.58.58 0 0 1-.542-.381c-.736-2.065-2.662-3.527-4.933-3.527a4.904 4.904 0 0 0-4.878 4.357.575.575 0 0 1-.486.505c-1.389.206-2.443 1.42-2.443 2.938 0 1.687 1.317 3.05 2.876 3.05h10.847c1.588 0 2.294-.506 2.654-1.099.401-.66.473-1.569.473-2.576" opacity="__SLATICO_SECONDARY_OPACITY__"/><path fill="__SLATICO_PRIMARY_COLOR__" d="M20.425 13.75c0-1.544-.616-2.868-2.05-3.188-.489-.11-1.11-.079-1.518-.079a.58.58 0 0 1-.542-.381c-.736-2.065-2.662-3.527-4.933-3.527a4.904 4.904 0 0 0-4.878 4.357.575.575 0 0 1-.486.505c-1.389.206-2.443 1.42-2.443 2.938 0 1.687 1.317 3.05 2.876 3.05h10.847c1.588 0 2.294-.506 2.654-1.099.401-.66.473-1.569.473-2.576m1.15 0c0 .993-.053 2.208-.64 3.174-.628 1.032-1.774 1.651-3.637 1.651H6.45c-2.252 0-4.026-1.937-4.026-4.2 0-1.912 1.243-3.528 2.999-3.988a6.054 6.054 0 0 1 5.958-4.962c2.64 0 4.88 1.613 5.865 3.907.385-.003.921.005 1.378.106 2.215.495 2.95 2.543 2.95 4.312"/><path fill="__SLATICO_PRIMARY_COLOR__" d="M15 15.425a.575.575 0 0 1 0 1.15H9a.575.575 0 0 1 0-1.15z"/></svg>',
  SlaticoIconName.cloudCheck:
      '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="__SLATICO_SECONDARY_COLOR__" d="M20.425 13.75c0-1.544-.616-2.868-2.05-3.188-.489-.11-1.11-.079-1.518-.079a.58.58 0 0 1-.542-.381c-.736-2.065-2.662-3.527-4.933-3.527a4.904 4.904 0 0 0-4.878 4.357.575.575 0 0 1-.486.505c-1.389.206-2.443 1.42-2.443 2.938 0 1.687 1.317 3.05 2.876 3.05h10.847c1.588 0 2.294-.506 2.654-1.099.401-.66.473-1.569.473-2.576" opacity="__SLATICO_SECONDARY_OPACITY__"/><path fill="__SLATICO_PRIMARY_COLOR__" d="M13.613 10.574a.576.576 0 0 1 .774.852l-3.728 3.387c-.6.547-1.517.547-2.118 0l-.928-.842a.575.575 0 1 1 .774-.85l.927.842c.163.147.41.147.572 0z"/><path fill="__SLATICO_PRIMARY_COLOR__" fill-rule="evenodd" d="M11.382 5.425c2.64 0 4.88 1.613 5.865 3.907.385-.003.921.005 1.378.106 2.215.495 2.95 2.543 2.95 4.312 0 .993-.053 2.208-.64 3.174-.628 1.032-1.774 1.651-3.637 1.651H6.45c-2.252 0-4.026-1.937-4.026-4.2 0-1.912 1.243-3.528 2.999-3.988a6.054 6.054 0 0 1 5.958-4.962m0 1.15a4.904 4.904 0 0 0-4.878 4.357.575.575 0 0 1-.486.505c-1.389.206-2.443 1.42-2.443 2.938 0 1.687 1.317 3.05 2.876 3.05h10.847c1.588 0 2.294-.506 2.654-1.099.401-.66.473-1.569.473-2.576 0-1.544-.616-2.868-2.05-3.188-.489-.11-1.11-.079-1.518-.079a.58.58 0 0 1-.542-.381c-.736-2.065-2.662-3.527-4.933-3.527" clip-rule="evenodd"/></svg>',
  SlaticoIconName.creditCard:
      '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g fill="__SLATICO_SECONDARY_COLOR__" opacity="__SLATICO_SECONDARY_OPACITY__"><path fill-rule="evenodd" d="M20.25 7c0-.69-.56-1.25-1.25-1.25H5c-.69 0-1.25.56-1.25 1.25v2.25h16.5z" clip-rule="evenodd"/><path d="M20.25 10.75H3.75V17c0 .69.56 1.25 1.25 1.25h14c.69 0 1.25-.56 1.25-1.25zM12 15.25a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1 0-1.5zm6 0a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1 0-1.5z"/></g><path fill="__SLATICO_PRIMARY_COLOR__" fill-rule="evenodd" d="M2.25 17V7A2.75 2.75 0 0 1 5 4.25h14A2.75 2.75 0 0 1 21.75 7v10A2.75 2.75 0 0 1 19 19.75H5A2.75 2.75 0 0 1 2.25 17m18 0c0 .69-.56 1.25-1.25 1.25H5c-.69 0-1.25-.56-1.25-1.25v-6.25h16.5zM12 15.25a.75.75 0 0 1 0 1.5h-1a.75.75 0 0 1 0-1.5zm6 0a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1 0-1.5zm1-9.5c.69 0 1.25.56 1.25 1.25v2.25H3.75V7c0-.69.56-1.25 1.25-1.25z" clip-rule="evenodd"/></svg>',
  SlaticoIconName.envelope:
      '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="__SLATICO_SECONDARY_COLOR__" d="M20.425 8c0-.787-.638-1.425-1.425-1.425H5c-.787 0-1.425.638-1.425 1.425v8c0 .787.638 1.425 1.425 1.425h14c.787 0 1.425-.638 1.425-1.425z" opacity="__SLATICO_SECONDARY_OPACITY__"/><path fill="__SLATICO_PRIMARY_COLOR__" d="M20.425 8c0-.787-.638-1.425-1.425-1.425H5c-.787 0-1.425.638-1.425 1.425v8c0 .787.638 1.425 1.425 1.425h14c.787 0 1.425-.638 1.425-1.425zm1.15 8A2.575 2.575 0 0 1 19 18.575H5A2.575 2.575 0 0 1 2.425 16V8A2.575 2.575 0 0 1 5 5.425h14A2.575 2.575 0 0 1 21.575 8z"/><path fill="__SLATICO_PRIMARY_COLOR__" d="M18.715 7.501a.575.575 0 1 1 .57.998l-6.504 3.717a1.58 1.58 0 0 1-1.562 0L4.715 8.499a.575.575 0 1 1 .57-.998l6.504 3.716c.13.074.291.074.422 0z"/></svg>',
  SlaticoIconName.envelopeOpen:
      '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="__SLATICO_SECONDARY_COLOR__" d="M20.425 10.07c0-.476-.239-.921-.635-1.185l-7-4.667a1.425 1.425 0 0 0-1.58 0l-7 4.667a1.43 1.43 0 0 0-.635 1.185V19c0 .787.638 1.425 1.425 1.425h14c.787 0 1.425-.638 1.425-1.425z" opacity="__SLATICO_SECONDARY_OPACITY__"/><path fill="__SLATICO_PRIMARY_COLOR__" d="M20.425 10.07c0-.476-.239-.921-.635-1.185l-7-4.667a1.425 1.425 0 0 0-1.58 0l-7 4.667a1.43 1.43 0 0 0-.635 1.185V19c0 .787.638 1.425 1.425 1.425h14c.787 0 1.425-.638 1.425-1.425zm1.15 8.93A2.575 2.575 0 0 1 19 21.575H5A2.575 2.575 0 0 1 2.425 19v-8.93c0-.86.43-1.665 1.146-2.142l7-4.667a2.58 2.58 0 0 1 2.858 0l7 4.667a2.58 2.58 0 0 1 1.146 2.142z"/><path fill="__SLATICO_PRIMARY_COLOR__" d="M18.715 9.5a.575.575 0 1 1 .57.999l-6.504 3.717a1.58 1.58 0 0 1-1.562 0l-6.504-3.717a.575.575 0 1 1 .57-.998l6.504 3.716c.13.074.291.074.422 0z"/></svg>',
  SlaticoIconName.gear:
      '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="__SLATICO_PRIMARY_COLOR__" d="M13.225 4a.425.425 0 0 0-.425-.425h-1.6a.425.425 0 0 0-.425.425v1.313c0 .652-.433 1.176-.97 1.398-.54.223-1.21.152-1.67-.307l-.925-.926a.426.426 0 0 0-.602 0l-1.13 1.13a.426.426 0 0 0 0 .602l.926.926c.46.459.53 1.129.308 1.669-.221.537-.746.97-1.399.97H4a.425.425 0 0 0-.425.425v1.6c0 .234.19.425.425.425h1.314c.653 0 1.176.432 1.398.97.223.54.15 1.209-.308 1.667l-.927.928a.426.426 0 0 0 0 .602l1.131 1.13a.425.425 0 0 0 .602 0l.926-.926c.459-.46 1.13-.531 1.67-.308.537.222.97.746.97 1.398V20c0 .235.19.425.424.425h1.6c.234 0 .425-.19.425-.425v-1.314c0-.653.433-1.176.97-1.398.54-.223 1.209-.152 1.667.307l.928.928a.426.426 0 0 0 .602 0l1.13-1.131a.426.426 0 0 0 0-.602l-.927-.928c-.459-.458-.53-1.127-.307-1.668.222-.536.745-.97 1.398-.97H20c.235 0 .425-.19.425-.424v-1.6a.425.425 0 0 0-.425-.425h-1.314c-.652 0-1.176-.433-1.398-.97-.223-.54-.152-1.21.308-1.67l.927-.925a.425.425 0 0 0 0-.602l-1.131-1.131a.426.426 0 0 0-.602 0l-.928.927c-.458.459-1.127.53-1.668.307-.536-.222-.97-.745-.97-1.398zm.9 8a2.125 2.125 0 1 0-4.25 0 2.125 2.125 0 0 0 4.25 0m1.15 0a3.276 3.276 0 1 1-6.551 0 3.276 3.276 0 0 1 6.551 0m-.9-6.687c0 .118.084.263.259.335.171.071.33.03.416-.056l.927-.928a1.574 1.574 0 0 1 2.227 0l1.132 1.13a1.576 1.576 0 0 1-.001 2.23l-.927.925c-.086.086-.127.245-.056.417.072.175.217.259.334.259H20c.87 0 1.575.705 1.575 1.575v1.6c0 .87-.705 1.575-1.575 1.575h-1.314c-.118 0-.263.084-.335.259-.071.171-.03.33.056.416l.929.927a1.576 1.576 0 0 1 0 2.228l-1.13 1.13a1.576 1.576 0 0 1-2.23 0l-.926-.928c-.086-.086-.245-.127-.416-.056-.175.072-.259.217-.259.335V20c0 .87-.705 1.575-1.575 1.575h-1.6c-.87 0-1.575-.705-1.575-1.575v-1.314c0-.117-.084-.262-.259-.334-.172-.071-.33-.03-.417.056l-.926.927a1.576 1.576 0 0 1-2.228 0l-1.13-1.13a1.574 1.574 0 0 1 0-2.227l.927-.928c.086-.086.127-.245.056-.417-.071-.174-.216-.258-.334-.258H4c-.87 0-1.575-.705-1.575-1.575v-1.6c0-.87.705-1.575 1.575-1.575h1.313c.118 0 .264-.083.335-.258.071-.172.029-.332-.057-.418l-.927-.926a1.576 1.576 0 0 1 0-2.228l1.13-1.13a1.576 1.576 0 0 1 2.23 0l.925.926c.086.086.245.127.417.056.175-.072.259-.217.259-.335V4c0-.87.705-1.575 1.575-1.575h1.6c.87 0 1.575.705 1.575 1.575z"/><path fill="__SLATICO_SECONDARY_COLOR__" fill-rule="evenodd" d="M12.8 3.575c.234 0 .425.19.425.425v1.313c0 .653.433 1.176.97 1.398.54.223 1.209.152 1.667-.307l.928-.927a.426.426 0 0 1 .602 0l1.13 1.131a.425.425 0 0 1 0 .602l-.926.926c-.46.459-.531 1.13-.308 1.67.222.537.746.97 1.398.97H20c.235 0 .425.19.425.424v1.6c0 .234-.19.425-.425.425h-1.314c-.653 0-1.176.433-1.398.97-.223.54-.152 1.209.307 1.667l.928.928a.426.426 0 0 1 0 .602l-1.131 1.13a.426.426 0 0 1-.602 0l-.928-.927c-.458-.459-1.127-.53-1.668-.307-.536.222-.97.745-.97 1.398V20c0 .235-.19.425-.424.425h-1.6a.425.425 0 0 1-.425-.425v-1.314c0-.652-.433-1.176-.97-1.398-.54-.223-1.21-.152-1.67.308l-.925.927a.425.425 0 0 1-.602 0l-1.131-1.131a.426.426 0 0 1 0-.602l.927-.928c.459-.458.53-1.128.308-1.668-.222-.537-.745-.97-1.398-.97H4a.425.425 0 0 1-.425-.424v-1.6c0-.234.19-.425.425-.425h1.313c.653 0 1.178-.433 1.399-.97.222-.54.151-1.21-.308-1.67l-.926-.925a.426.426 0 0 1 0-.602l1.13-1.13a.426.426 0 0 1 .602 0l.926.926c.459.46 1.13.53 1.67.307.537-.222.97-.746.97-1.399V4c0-.235.19-.425.424-.425zM15.275 12a3.276 3.276 0 1 1-6.551 0 3.276 3.276 0 0 1 6.551 0" clip-rule="evenodd" opacity="__SLATICO_SECONDARY_OPACITY__"/></svg>',
  SlaticoIconName.house:
      '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="__SLATICO_SECONDARY_COLOR__" d="m18.75 10.81-5.866-5.866a1.25 1.25 0 0 0-1.768 0L5.25 10.811V19c0 .69.56 1.25 1.25 1.25h11c.69 0 1.25-.56 1.25-1.25z" opacity="__SLATICO_SECONDARY_OPACITY__"/><path fill="__SLATICO_PRIMARY_COLOR__" d="m18.75 10.81-5.866-5.866a1.25 1.25 0 0 0-1.768 0L5.25 10.81V19c0 .69.56 1.25 1.25 1.25h11c.69 0 1.25-.56 1.25-1.25zm1.5 8.19a2.75 2.75 0 0 1-2.75 2.75h-11A2.75 2.75 0 0 1 3.75 19v-6.69l-.22.22a.75.75 0 1 1-1.06-1.06l7.586-7.586a2.75 2.75 0 0 1 3.888 0l7.586 7.586a.75.75 0 1 1-1.06 1.06l-.22-.22z"/><path fill="__SLATICO_PRIMARY_COLOR__" d="M15 17.25a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1 0-1.5z"/></svg>',
  SlaticoIconName.layoutDashboard:
      '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="__SLATICO_PRIMARY_COLOR__" fill-rule="evenodd" d="M8.5 20.575H19A2.575 2.575 0 0 0 21.575 18V6A2.575 2.575 0 0 0 19 3.425H5A2.575 2.575 0 0 0 2.425 6v12A2.575 2.575 0 0 0 5 20.575zm-.575-1.15H5A1.425 1.425 0 0 1 3.575 18v-7.925h4.35zm1.15-9.35v9.35H19c.787 0 1.425-.638 1.425-1.425v-7.925zm-5.5-1.15h16.85V6c0-.787-.638-1.425-1.425-1.425H5c-.787 0-1.425.638-1.425 1.425z" clip-rule="evenodd"/><g fill="__SLATICO_SECONDARY_COLOR__" opacity="__SLATICO_SECONDARY_OPACITY__"><path d="M3.575 8.925h16.85V6c0-.787-.638-1.425-1.425-1.425H5c-.787 0-1.425.638-1.425 1.425z"/><path d="M9.075 10.075v9.35H19c.787 0 1.425-.638 1.425-1.425v-7.925z"/><path d="M7.925 19.425H5A1.425 1.425 0 0 1 3.575 18v-7.925h4.35z"/></g></svg>',
  SlaticoIconName.lock:
      '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g fill="__SLATICO_SECONDARY_COLOR__" opacity="__SLATICO_SECONDARY_OPACITY__"><path fill-rule="evenodd" d="M18 9.575c.787 0 1.425.638 1.425 1.425v8c0 .787-.638 1.425-1.425 1.425H6A1.425 1.425 0 0 1 4.575 19v-8c0-.787.638-1.425 1.425-1.425zM13 15a1 1 0 1 1-2 0 1 1 0 0 1 2 0" clip-rule="evenodd"/><path d="M15.425 8.425h-6.85V7a3.425 3.425 0 1 1 6.85 0z"/></g><path fill="__SLATICO_PRIMARY_COLOR__" fill-rule="evenodd" d="M16.575 7v1.425H18A2.575 2.575 0 0 1 20.575 11v8A2.575 2.575 0 0 1 18 21.575H6A2.575 2.575 0 0 1 3.425 19v-8A2.575 2.575 0 0 1 6 8.425h1.425V7a4.575 4.575 0 0 1 9.15 0m-1.15 1.425h-6.85V7a3.425 3.425 0 1 1 6.85 0zm4 2.575c0-.787-.638-1.425-1.425-1.425H6c-.787 0-1.425.638-1.425 1.425v8c0 .787.638 1.425 1.425 1.425h12c.787 0 1.425-.638 1.425-1.425z" clip-rule="evenodd"/><path fill="__SLATICO_PRIMARY_COLOR__" fill-rule="evenodd" d="M13 15a1 1 0 1 1-2 0 1 1 0 0 1 2 0" clip-rule="evenodd"/></svg>',
  SlaticoIconName.lockOpen:
      '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="__SLATICO_SECONDARY_COLOR__" fill-rule="evenodd" d="M6 9.573c-.787 0-1.425.637-1.425 1.424v8c0 .787.638 1.425 1.425 1.425h12c.787 0 1.425-.638 1.425-1.425v-8c0-.787-.638-1.424-1.425-1.424zm7 5.424a1 1 0 1 0-2 0 1 1 0 0 0 2 0" clip-rule="evenodd" opacity="__SLATICO_SECONDARY_OPACITY__"/><path fill="__SLATICO_PRIMARY_COLOR__" d="M12 14a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/><path fill="__SLATICO_PRIMARY_COLOR__" fill-rule="evenodd" d="M12 2.425c2.188 0 4.132 1.508 4.563 3.568a.575.575 0 0 1-1.125.236c-.312-1.49-1.756-2.654-3.438-2.654-.914 0-1.787.353-2.428.977a3.26 3.26 0 0 0-.997 2.337v1.536H18A2.575 2.575 0 0 1 20.575 11v8A2.575 2.575 0 0 1 18 21.575H6A2.575 2.575 0 0 1 3.425 19v-8A2.575 2.575 0 0 1 6 8.425h1.425V6.889A4.4 4.4 0 0 1 8.77 3.727 4.63 4.63 0 0 1 12 2.425m-6 7.15c-.787 0-1.425.638-1.425 1.425v8c0 .787.638 1.425 1.425 1.425h12c.787 0 1.425-.638 1.425-1.425v-8c0-.787-.638-1.425-1.425-1.425z" clip-rule="evenodd"/></svg>',
  SlaticoIconName.magnifyingGlass:
      '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="__SLATICO_SECONDARY_COLOR__" d="M19.425 11.5a7.925 7.925 0 1 0-15.85 0 7.925 7.925 0 0 0 15.85 0" opacity="__SLATICO_SECONDARY_OPACITY__"/><path fill="__SLATICO_PRIMARY_COLOR__" d="M11.5 2.425a9.075 9.075 0 0 1 9.075 9.075 9.04 9.04 0 0 1-2.278 6.01q.058.034.11.084l3 3a.574.574 0 1 1-.813.812l-3-3a.6.6 0 0 1-.084-.11 9.04 9.04 0 0 1-6.01 2.28 9.075 9.075 0 0 1 0-18.151m0 1.15a7.925 7.925 0 1 0 0 15.85 7.925 7.925 0 0 0 0-15.85"/></svg>',
  SlaticoIconName.minus:
      '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="__SLATICO_PRIMARY_COLOR__" d="M21 11.425a.575.575 0 0 1 0 1.15H3a.575.575 0 0 1 0-1.15z"/></svg>',
  SlaticoIconName.pencil:
      '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g fill="__SLATICO_SECONDARY_COLOR__" opacity="__SLATICO_SECONDARY_OPACITY__"><path d="M18.475 8.958a2.435 2.435 0 0 0 .015-3.444 2.435 2.435 0 0 0-3.444.015l-.76.76c.015.128.044.31.107.526.138.467.43 1.103 1.062 1.734.63.63 1.266.924 1.734 1.061.216.064.398.093.526.107z"/><path d="m10.961 16.472 5.788-5.788c-.61-.195-1.374-.576-2.114-1.315a5.25 5.25 0 0 1-1.315-2.114L7.503 13.07c-.16.16-.278.352-.347.563-.32.979-1.05 3.25-1.395 4.532l4.58-1.327c.234-.068.448-.195.62-.367"/></g><path fill="__SLATICO_PRIMARY_COLOR__" d="m11.025 16.408 5.739-5.739c-.608-.197-1.37-.579-2.11-1.319s-1.123-1.502-1.32-2.11l-5.767 5.767a1.4 1.4 0 0 0-.344.56c-.314.973-1.032 3.23-1.369 4.507l4.555-1.303a1.43 1.43 0 0 0 .616-.363m7.45-7.45a2.425 2.425 0 1 0-3.429-3.43l-.753.753c.015.129.045.31.11.525.138.466.432 1.1 1.063 1.731s1.266.926 1.731 1.064c.216.065.397.095.525.11zm-6.637 8.263c-.309.31-.692.535-1.112.656l-4.88 1.395c-.258.074-.629.1-.927-.142-.327-.265-.347-.664-.278-.957.288-1.21 1.147-3.903 1.488-4.96.125-.387.34-.734.625-1.02l7.479-7.478a3.575 3.575 0 0 1 5.056 5.056z"/></svg>',
  SlaticoIconName.plus:
      '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="__SLATICO_PRIMARY_COLOR__" d="M11.425 21v-8.425H3a.575.575 0 0 1 0-1.15h8.425V3a.575.575 0 0 1 1.15 0v8.425H21a.575.575 0 0 1 0 1.15h-8.425V21a.575.575 0 0 1-1.15 0"/></svg>',
  SlaticoIconName.shield:
      '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="__SLATICO_PRIMARY_COLOR__" d="M20.425 6.265c-2.665-.084-4.794-.733-6.287-1.388-.8-.35-1.418-.703-1.84-.97a10 10 0 0 1-.332-.221q-.176.102-.435.243c-.488.26-1.187.607-2.038.954-1.563.636-3.663 1.28-5.918 1.378v2.783c0 4.31 1.961 8.465 5.69 10.392.581.301 1.13.552 1.61.727.491.179.87.262 1.125.262.256 0 .634-.083 1.125-.262.48-.175 1.029-.426 1.61-.727 3.729-1.927 5.69-6.082 5.69-10.392zm1.15 2.779c0 4.621-2.106 9.24-6.312 11.414-.606.313-1.201.588-1.744.786-.534.194-1.062.331-1.519.331s-.985-.137-1.519-.33a15 15 0 0 1-1.744-.787c-4.206-2.174-6.312-6.792-6.312-11.414V5.125H3c2.266 0 4.439-.648 6.06-1.308.807-.328 1.47-.656 1.93-.902a15 15 0 0 0 .661-.375l.033-.02.007-.005.001-.001.35-.221.321.26v.002l.004.002.023.018.101.075c.093.068.235.167.424.287.378.239.945.562 1.685.886 1.48.65 3.65 1.302 6.4 1.302h.575z"/><path fill="__SLATICO_SECONDARY_COLOR__" d="M20.425 6.26c-2.665-.083-4.794-.733-6.287-1.387-.8-.35-1.418-.703-1.84-.97a10 10 0 0 1-.332-.222q-.176.103-.435.244c-.488.26-1.187.607-2.038.954-1.563.636-3.663 1.28-5.918 1.378V9.04c0 4.31 1.961 8.465 5.69 10.392.581.3 1.13.552 1.61.727.491.179.87.262 1.125.262.256 0 .634-.083 1.125-.262.48-.175 1.029-.426 1.61-.727 3.729-1.927 5.69-6.082 5.69-10.392z" opacity="__SLATICO_SECONDARY_OPACITY__"/></svg>',
  SlaticoIconName.shieldCheck:
      '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="__SLATICO_SECONDARY_COLOR__" d="M20.425 6.266c-2.665-.084-4.794-.733-6.287-1.388a14 14 0 0 1-1.84-.97 10 10 0 0 1-.332-.221q-.176.102-.435.243c-.488.26-1.187.607-2.038.954-1.563.636-3.663 1.28-5.918 1.378v2.783c0 4.31 1.961 8.465 5.69 10.393.581.3 1.13.55 1.61.726.491.179.87.262 1.125.262.256 0 .634-.083 1.125-.262.48-.175 1.029-.426 1.61-.727 3.729-1.927 5.69-6.082 5.69-10.392z" opacity="__SLATICO_SECONDARY_OPACITY__"/><path fill="__SLATICO_PRIMARY_COLOR__" d="M20.425 6.265c-2.665-.084-4.794-.733-6.287-1.388-.8-.35-1.418-.703-1.84-.97a10 10 0 0 1-.332-.221q-.176.102-.435.243c-.488.26-1.187.607-2.038.954-1.563.636-3.663 1.28-5.918 1.378v2.783c0 4.31 1.961 8.465 5.69 10.392.581.301 1.13.552 1.61.727.491.179.87.262 1.125.262.256 0 .634-.083 1.125-.262.48-.175 1.029-.426 1.61-.727 3.729-1.927 5.69-6.082 5.69-10.392zm1.15 2.779c0 4.621-2.106 9.24-6.312 11.414-.606.313-1.201.588-1.744.786-.534.194-1.062.331-1.519.331s-.985-.137-1.519-.33a15 15 0 0 1-1.744-.787c-4.206-2.174-6.312-6.792-6.312-11.414V5.125H3c2.266 0 4.439-.648 6.06-1.308.807-.328 1.47-.656 1.93-.902a15 15 0 0 0 .661-.375l.033-.02.007-.005.001-.001.35-.221.321.26v.002l.004.002.023.018.101.075c.093.068.235.167.424.287.378.239.945.562 1.685.886 1.48.65 3.65 1.302 6.4 1.302h.575z"/><path fill="__SLATICO_PRIMARY_COLOR__" d="M15.094 8.594a.574.574 0 1 1 .812.812L11.113 14.2a1.574 1.574 0 0 1-2.226 0l-1.293-1.293a.574.574 0 1 1 .812-.812L9.7 13.387a.426.426 0 0 0 .602 0z"/></svg>',
  SlaticoIconName.slidersHorizontal:
      '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="__SLATICO_PRIMARY_COLOR__" fill-rule="evenodd" d="M5.425 5.85q.035 0 .068.004a3.076 3.076 0 0 1 6.014 0l.068-.004h9.85a.576.576 0 0 1 0 1.15h-9.85l-.04-.001a3.076 3.076 0 0 1-6.07 0L5.425 7h-2.85a.575.575 0 0 1 0-1.15zM8.5 4.575a1.925 1.925 0 1 1 0 3.85 1.925 1.925 0 0 1 0-3.85" clip-rule="evenodd"/><path fill="__SLATICO_PRIMARY_COLOR__" d="M15.5 15.575A3.076 3.076 0 0 0 18.535 13l.04.001h2.85a.575.575 0 0 0 0-1.15h-2.85l-.068.004a3.076 3.076 0 0 0-6.014 0l-.068-.004h-9.85a.575.575 0 0 0 0 1.15h9.85l.04-.001a3.076 3.076 0 0 0 3.035 2.576m0-5a1.925 1.925 0 1 1 0 3.85 1.925 1.925 0 0 1 0-3.85"/><path fill="__SLATICO_PRIMARY_COLOR__" d="M8.5 15.425a3.076 3.076 0 0 0-3.007 2.429l-.068-.004h-2.85a.575.575 0 0 0 0 1.15h2.85l.04-.001a3.076 3.076 0 0 0 6.07 0l.04.001h9.85a.575.575 0 0 0 0-1.15h-9.85l-.068.004a3.076 3.076 0 0 0-3.007-2.43m0 1.15a1.925 1.925 0 1 1 0 3.85 1.925 1.925 0 0 1 0-3.85"/><g fill="__SLATICO_SECONDARY_COLOR__" opacity="__SLATICO_SECONDARY_OPACITY__"><path d="M8.5 4.575a1.925 1.925 0 1 1 0 3.85 1.925 1.925 0 0 1 0-3.85"/><path d="M15.5 10.575a1.925 1.925 0 1 1 0 3.85 1.925 1.925 0 0 1 0-3.85"/><path d="M8.5 16.575a1.925 1.925 0 1 1 0 3.85 1.925 1.925 0 0 1 0-3.85"/></g></svg>',
  SlaticoIconName.trash:
      '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g fill="__SLATICO_SECONDARY_COLOR__" opacity="__SLATICO_SECONDARY_OPACITY__"><path d="M12 3.575A2.425 2.425 0 0 1 14.425 6v.425h-4.85V6A2.425 2.425 0 0 1 12 3.575"/><path d="M6.014 7.575a8.6 8.6 0 0 1 .97 3.48l.478 8.03c.045.753.669 1.34 1.423 1.34h6.23c.754 0 1.378-.587 1.423-1.34l.478-8.03a8.6 8.6 0 0 1 .97-3.48z"/></g><path fill="__SLATICO_PRIMARY_COLOR__" d="M9.425 17v-7a.575.575 0 0 1 1.15 0v7a.575.575 0 0 1-1.15 0m4 0v-7a.575.575 0 0 1 1.15 0v7a.575.575 0 0 1-1.15 0"/><path fill="__SLATICO_PRIMARY_COLOR__" fill-rule="evenodd" d="M12 3.575A2.425 2.425 0 0 1 14.425 6v.425h-4.85V6A2.425 2.425 0 0 1 12 3.575m3.575 2.85V6a3.575 3.575 0 0 0-7.15 0v.425H3.947l.57.886.153.239a7.4 7.4 0 0 1 1.166 3.574l.478 8.03a2.575 2.575 0 0 0 2.57 2.421h6.231a2.575 2.575 0 0 0 2.57-2.422l.48-8.029A7.4 7.4 0 0 1 19.33 7.55l.153-.24.57-.885zm-9.561 1.15a8.6 8.6 0 0 1 .97 3.48l.478 8.03c.045.753.669 1.34 1.423 1.34h6.23c.754 0 1.378-.587 1.423-1.34l.478-8.03a8.6 8.6 0 0 1 .97-3.48z" clip-rule="evenodd"/></svg>',
  SlaticoIconName.trashX:
      '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><g fill="__SLATICO_SECONDARY_COLOR__" opacity="__SLATICO_SECONDARY_OPACITY__"><path fill-rule="evenodd" d="M6.014 7.575a8.6 8.6 0 0 1 .97 3.48l.478 8.03c.045.753.669 1.34 1.423 1.34h6.23c.754 0 1.378-.587 1.423-1.34l.478-8.03a8.6 8.6 0 0 1 .97-3.48z" clip-rule="evenodd"/><path d="M12 3.575A2.425 2.425 0 0 1 14.425 6v.425h-4.85V6A2.425 2.425 0 0 1 12 3.575"/></g><path fill="__SLATICO_PRIMARY_COLOR__" fill-rule="evenodd" d="M12 3.575A2.425 2.425 0 0 1 14.425 6v.425h-4.85V6A2.425 2.425 0 0 1 12 3.575m-3.575 2.85H3.947l.57.886.153.239a7.4 7.4 0 0 1 1.166 3.574l.478 8.03a2.575 2.575 0 0 0 2.57 2.421h6.231a2.575 2.575 0 0 0 2.57-2.422l.48-8.029A7.4 7.4 0 0 1 19.33 7.55l.153-.24.57-.885h-4.478V6a3.575 3.575 0 0 0-7.15 0zm-2.411 1.15a8.6 8.6 0 0 1 .97 3.48l.478 8.03c.045.753.669 1.34 1.423 1.34h6.23c.754 0 1.378-.587 1.423-1.34l.478-8.03a8.6 8.6 0 0 1 .97-3.48zm8.392 4.019a.574.574 0 0 0-.812 0L12 13.188l-1.594-1.594a.574.574 0 1 0-.812.812L11.188 14l-1.594 1.594a.574.574 0 1 0 .812.812L12 14.813l1.594 1.593a.574.574 0 1 0 .812-.812L12.812 14l1.594-1.594a.574.574 0 0 0 0-.812" clip-rule="evenodd"/></svg>',
  SlaticoIconName.trendUp:
      '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="__SLATICO_PRIMARY_COLOR__" d="M20.653 6.63A.75.75 0 0 0 20 6.25h-5a.75.75 0 0 0-.53 1.28l1.993 1.993-3.848 3.908-2.542-2.582a.75.75 0 0 0-1.07 0l-5.537 5.625a.75.75 0 0 0 1.068 1.052l5.004-5.082 2.543 2.582a.75.75 0 0 0 1.068 0l4.374-4.442 1.947 1.946a.75.75 0 0 0 1.28-.53V7a.75.75 0 0 0-.097-.37M19.25 7.75v2.44l-.674-.675-1.06-1.06-.705-.705z"/><path fill="__SLATICO_SECONDARY_COLOR__" d="M19.249 7.748v2.44l-.675-.674-1.06-1.061-.705-.705z" opacity="__SLATICO_SECONDARY_OPACITY__"/></svg>',
  SlaticoIconName.user:
      '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="__SLATICO_PRIMARY_COLOR__" d="M12.412 2.425a4.576 4.576 0 0 1 .923 9.056c1.954.236 3.779 1.214 5.164 2.773a9.7 9.7 0 0 1 1.654 2.626c.288.674.547 1.273.636 1.82.098.605-.007 1.15-.383 1.719-.398.603-.94.897-1.616 1.032-.63.126-1.428.124-2.378.124h-8c-.95 0-1.748.002-2.378-.124-.677-.135-1.217-.429-1.616-1.032-.376-.569-.481-1.113-.383-1.719.089-.547.348-1.146.636-1.82a9.7 9.7 0 0 1 1.654-2.626c1.385-1.558 3.209-2.536 5.162-2.773a4.576 4.576 0 0 1 .925-9.056m0 10.15c-1.946 0-3.828.869-5.228 2.443a8.5 8.5 0 0 0-1.456 2.313c-.309.725-.497 1.177-.558 1.554-.052.318-.01.571.207.9.194.294.437.45.883.54.492.098 1.155.1 2.152.1h8c.997 0 1.66-.003 2.152-.1.445-.09.689-.246.883-.54.217-.329.259-.582.207-.9-.061-.377-.25-.83-.558-1.554a8.5 8.5 0 0 0-1.456-2.313c-1.4-1.574-3.282-2.443-5.228-2.443m0-9a3.425 3.425 0 1 0 0 6.85 3.425 3.425 0 0 0 0-6.85"/><g fill="__SLATICO_SECONDARY_COLOR__" opacity="__SLATICO_SECONDARY_OPACITY__"><path d="M15.836 7a3.425 3.425 0 1 0-6.849 0 3.425 3.425 0 0 0 6.85 0"/><path d="M12.412 12.575c-1.946 0-3.829.869-5.228 2.443a8.5 8.5 0 0 0-1.456 2.313c-.31.725-.497 1.177-.559 1.554-.051.318-.01.571.208.9.194.294.437.45.882.54.492.098 1.155.1 2.153.1h8c.997 0 1.66-.003 2.152-.1.445-.09.689-.246.883-.54.217-.329.259-.582.207-.9-.061-.377-.25-.83-.559-1.554a8.5 8.5 0 0 0-1.456-2.313c-1.399-1.574-3.281-2.443-5.227-2.443"/></g></svg>',
  SlaticoIconName.wallet:
      '<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path fill="__SLATICO_PRIMARY_COLOR__" d="M14 12a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/><path fill="__SLATICO_PRIMARY_COLOR__" fill-rule="evenodd" d="M17 4.425c1.243 0 2.28.88 2.521 2.053A2.576 2.576 0 0 1 21.575 9v8A2.575 2.575 0 0 1 19 19.575H7a2.576 2.576 0 0 1-2.522-2.053A2.576 2.576 0 0 1 2.425 15V7A2.575 2.575 0 0 1 5 4.425zM7 7.575c-.787 0-1.425.638-1.425 1.425v8c0 .787.638 1.425 1.425 1.425h12c.787 0 1.425-.638 1.425-1.425v-.425H14a3.575 3.575 0 0 1 0-7.15h6.425V9c0-.787-.638-1.425-1.425-1.425zm-2-2c-.787 0-1.425.638-1.425 1.425v8c0 .582.35 1.08.85 1.302V9A2.575 2.575 0 0 1 7 6.425h11.303c-.221-.5-.72-.85-1.303-.85zm9 5a2.425 2.425 0 1 0 0 4.85h6.425v-4.85z" clip-rule="evenodd"/><g fill="__SLATICO_SECONDARY_COLOR__" opacity="__SLATICO_SECONDARY_OPACITY__"><path d="M14 12a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/><path d="M7 7.575c-.787 0-1.425.638-1.425 1.425v8c0 .787.638 1.425 1.425 1.425h12c.787 0 1.425-.638 1.425-1.425v-.425H14a3.575 3.575 0 0 1 0-7.15h6.425V9c0-.787-.638-1.425-1.425-1.425z"/><path d="M5 5.575c-.787 0-1.425.638-1.425 1.425v8c0 .582.35 1.08.85 1.302V9A2.575 2.575 0 0 1 7 6.425h11.303c-.221-.5-.72-.85-1.303-.85z"/><path fill-rule="evenodd" d="M14 10.575a2.425 2.425 0 1 0 0 4.85h6.425v-4.85zM15 13a1 1 0 1 0-2 0 1 1 0 0 0 2 0" clip-rule="evenodd"/></g></svg>',
};
