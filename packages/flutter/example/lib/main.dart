import 'package:flutter/material.dart';
import 'package:slatico_icons/slatico_icons.dart';

void main() {
  runApp(const SlaticoShowcaseApp());
}

class SlaticoShowcaseApp extends StatelessWidget {
  const SlaticoShowcaseApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Slatico Icons — Tier 1 Flutter Showcase',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF4F46E5)),
        useMaterial3: true,
      ),
      home: const SlaticoCatalogScreen(),
    );
  }
}

class SlaticoCatalogScreen extends StatefulWidget {
  const SlaticoCatalogScreen({super.key});

  @override
  State<SlaticoCatalogScreen> createState() => _SlaticoCatalogScreenState();
}

class _SlaticoCatalogScreenState extends State<SlaticoCatalogScreen> {
  SlaticoStyle _selectedStyle = SlaticoStyle.regular;
  SlaticoIconName _selectedIcon = SlaticoIconName.house;
  String _searchQuery = '';
  double _iconSize = 28.0;
  Color _primaryColor = const Color(0xFF09090B);
  final Color _secondaryColor = const Color(0xFF4F46E5);
  final double _secondaryOpacity = 0.25;

  static const List<Color> _colorPresets = <Color>[
    Color(0xFF09090B),
    Color(0xFF4F46E5),
    Color(0xFF10B981),
    Color(0xFFF59E0B),
    Color(0xFFE11D48),
  ];

  List<SlaticoIconName> get _filteredIcons {
    final String q = _searchQuery.trim().toLowerCase();
    if (q.isEmpty) {
      return SlaticoIconName.values;
    }
    return SlaticoIconName.values
        .where((icon) => icon.kebabName.contains(q))
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    final List<SlaticoIconName> icons = _filteredIcons;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Slatico Icons — 23 Families × 7 Styles'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(56),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
            child: TextField(
              onChanged: (value) => setState(() => _searchQuery = value),
              decoration: InputDecoration(
                hintText:
                    'Search 23 Tier 1 icons (e.g. house, bell, shield-check)...',
                prefixIcon:
                    const Icon(SlaticoIcons.magnifyingGlassRegular, size: 20),
                isDense: true,
                filled: true,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
          ),
        ),
      ),
      body: Column(
        children: [
          // Style selector & size/color controls
          Padding(
            padding: const EdgeInsets.all(12),
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                for (final style in SlaticoStyle.values)
                  ChoiceChip(
                    label: Text(style.name.toUpperCase()),
                    selected: _selectedStyle == style,
                    onSelected: (_) => setState(() => _selectedStyle = style),
                  ),
                const SizedBox(width: 12),
                for (final size in const <double>[20, 24, 28, 36])
                  ActionChip(
                    label: Text('${size.toInt()}px'),
                    onPressed: () => setState(() => _iconSize = size),
                  ),
                for (final color in _colorPresets)
                  GestureDetector(
                    onTap: () => setState(() => _primaryColor = color),
                    child: Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color: color,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: _primaryColor == color
                              ? Colors.indigoAccent
                              : Colors.black26,
                          width: 2,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),

          // 7-Style comparison bar for the currently selected icon
          Card(
            margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Selected Family: ${_selectedIcon.kebabName} — All 7 Official Styles',
                    style: Theme.of(context).textTheme.titleSmall,
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 18,
                    runSpacing: 10,
                    children: [
                      for (final style in SlaticoStyle.values)
                        Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            SlaticoIcon(
                              name: _selectedIcon,
                              style: style,
                              size: 28,
                              color: _primaryColor,
                              secondaryColor: _secondaryColor,
                              secondaryOpacity: _secondaryOpacity,
                              semanticLabel:
                                  '${_selectedIcon.kebabName} ${style.name}',
                            ),
                            const SizedBox(height: 4),
                            Text(
                              style.name,
                              style: Theme.of(context).textTheme.labelSmall,
                            ),
                          ],
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Searchable Grid of Tier 1 Icons
          Expanded(
            child: GridView.builder(
              padding: const EdgeInsets.all(12),
              gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                maxCrossAxisExtent: 140,
                mainAxisSpacing: 10,
                crossAxisSpacing: 10,
                childAspectRatio: 1.15,
              ),
              itemCount: icons.length,
              itemBuilder: (context, index) {
                final SlaticoIconName iconName = icons[index];
                final bool isSelected = iconName == _selectedIcon;
                return InkWell(
                  onTap: () => setState(() => _selectedIcon = iconName),
                  borderRadius: BorderRadius.circular(12),
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isSelected
                            ? Theme.of(context).colorScheme.primary
                            : Colors.black12,
                        width: isSelected ? 2 : 1,
                      ),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        SlaticoIcon(
                          name: iconName,
                          style: _selectedStyle,
                          size: _iconSize,
                          color: _primaryColor,
                          secondaryColor: _secondaryColor,
                          secondaryOpacity: _secondaryOpacity,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          iconName.kebabName,
                          style: Theme.of(context).textTheme.bodySmall,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
