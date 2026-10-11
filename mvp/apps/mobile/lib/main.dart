import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:openmontage_mobile/core/router/app_router.dart';
import 'package:openmontage_mobile/core/theme/app_theme.dart';
import 'package:openmontage_mobile/core/providers/global_providers.dart';

void main() {
  // Initialize Riverpod
  runApp(const ProviderScope(child: OpenMontageApp()));
}

class OpenMontageApp extends ConsumerWidget {
  const OpenMontageApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    final theme = ref.watch(appThemeProvider);

    return MaterialApp.router(
      title: 'OpenMontage Studio',
      debugShowCheckedModeBanner: false,
      theme: theme.lightTheme,
      darkTheme: theme.darkTheme,
      themeMode: ThemeMode.system,
      routerConfig: router,
      builder: (context, child) {
        return MediaQuery(
          data: MediaQuery.of(context).copyWith(
            textScaler: TextScaler.linear(
              MediaQuery.of(context).textScaler.scale(1.0).clamp(0.8, 1.2),
            ),
          ),
          child: child!,
        );
      },
    );
  }
}