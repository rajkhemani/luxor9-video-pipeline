// App Router - GoRouter with auth guards
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:openmontage_mobile/core/providers/global_providers.dart';
import 'package:openmontage_mobile/features/auth/pages/login_page.dart';
import 'package:openmontage_mobile/features/auth/pages/register_page.dart';
import 'package:openmontage_mobile/features/dashboard/pages/dashboard_page.dart';
import 'package:openmontage_mobile/features/projects/pages/projects_page.dart';
import 'package:openmontage_mobile/features/projects/pages/project_detail_page.dart';
import 'package:openmontage_mobile/features/projects/pages/create_project_page.dart';
import 'package:openmontage_mobile/features/generation/pages/generation_page.dart';
import 'package:openmontage_mobile/features/templates/pages/templates_page.dart';
import 'package:openmontage_mobile/features/templates/pages/template_detail_page.dart';
import 'package:openmontage_mobile/features/soul_ids/pages/soul_ids_page.dart';
import 'package:openmontage_mobile/features/soul_ids/pages/create_soul_id_page.dart';
import 'package:openmontage_mobile/features/credits/pages/credits_page.dart';
import 'package:openmontage_mobile/features/settings/pages/settings_page.dart';
import 'package:openmontage_mobile/features/onboarding/pages/onboarding_page.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);
  return createAppRouter(authState);
});

GoRouter createAppRouter(AuthState authState) {
  return GoRouter(
    initialLocation: '/',
    debugLogDiagnostics: true,
    redirect: (context, state) {
      final isAuthenticated = authState.isAuthenticated;
      final isOnboardingComplete = authState.isOnboardingComplete;
      final isAuthRoute = state.matchedLocation.startsWith('/auth');
      final isOnboardingRoute = state.matchedLocation == '/onboarding';

      // Redirect unauthenticated users to login
      if (!isAuthenticated && !isAuthRoute && !isOnboardingRoute) {
        return '/auth/login';
      }

      // Redirect authenticated users away from auth routes
      if (isAuthenticated && isAuthRoute) {
        return '/';
      }

      // Redirect to onboarding if not complete
      if (isAuthenticated && !isOnboardingComplete && !isOnboardingRoute) {
        return '/onboarding';
      }

      return null;
    },
    routes: [
      // Auth routes (no auth required)
      GoRoute(
        path: '/auth/login',
        name: 'login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/auth/register',
        name: 'register',
        builder: (context, state) => const RegisterPage(),
      ),

      // Onboarding
      GoRoute(
        path: '/onboarding',
        name: 'onboarding',
        builder: (context, state) => const OnboardingPage(),
      ),

      // Main app shell with bottom navigation
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) => MainShell(navigationShell: navigationShell),
        branches: [
          // Home / Dashboard
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/',
                name: 'home',
                builder: (context, state) => const DashboardPage(),
              ),
            ],
          ),

          // Projects
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/projects',
                name: 'projects',
                builder: (context, state) => const ProjectsPage(),
                routes: [
                  GoRoute(
                    path: 'create',
                    name: 'create-project',
                    builder: (context, state) => const CreateProjectPage(),
                  ),
                  GoRoute(
                    path: ':projectId',
                    name: 'project-detail',
                    builder: (context, state) => ProjectDetailPage(
                      projectId: state.pathParameters['projectId']!,
                    ),
                    routes: [
                      GoRoute(
                        path: 'generate',
                        name: 'generation',
                        builder: (context, state) => GenerationPage(
                          projectId: state.pathParameters['projectId']!,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),

          // Templates
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/templates',
                name: 'templates',
                builder: (context, state) => const TemplatesPage(),
                routes: [
                  GoRoute(
                    path: ':templateId',
                    name: 'template-detail',
                    builder: (context, state) => TemplateDetailPage(
                      templateId: state.pathParameters['templateId']!,
                    ),
                  ),
                ],
              ),
            ],
          ),

          // Soul IDs
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/soul-ids',
                name: 'soul-ids',
                builder: (context, state) => const SoulIdsPage(),
                routes: [
                  GoRoute(
                    path: 'create',
                    name: 'create-soul-id',
                    builder: (context, state) => const CreateSoulIdPage(),
                  ),
                ],
              ),
            ],
          ),

          // Profile / Settings
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/profile',
                name: 'profile',
                builder: (context, state) => const SettingsPage(),
                routes: [
                  GoRoute(
                    path: 'credits',
                    name: 'credits',
                    builder: (context, state) => const CreditsPage(),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text('Page not found', style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 8),
            Text(state.error.toString(), style: Theme.of(context).textTheme.bodyMedium),
            const SizedBox(height: 24),
            FilledButton(
              onPressed: () => context.go('/'),
              child: const Text('Go Home'),
            ),
          ],
        ),
      ),
    ),
  );
}

// ─── Main Shell with Bottom Navigation ────────────────────────
class MainShell extends ConsumerWidget {
  const MainShell({super.key, required this.navigationShell});
  final StatefulNavigationShell navigationShell;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        onDestinationSelected: (index) => navigationShell.goBranch(index),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.video_library_outlined),
            selectedIcon: Icon(Icons.video_library),
            label: 'Projects',
          ),
          NavigationDestination(
            icon: Icon(Icons.template_outlined),
            selectedIcon: Icon(Icons.template),
            label: 'Templates',
          ),
          NavigationDestination(
            icon: Icon(Icons.psychology_outlined),
            selectedIcon: Icon(Icons.psychology),
            label: 'Characters',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}