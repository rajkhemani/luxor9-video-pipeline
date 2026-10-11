// Global Riverpod providers
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:openmontage_mobile/core/api/api_client.dart';
import 'package:openmontage_mobile/core/theme/app_theme.dart';
import 'package:openmontage_mobile/core/storage/local_storage.dart';
import 'package:openmontage_mobile/features/auth/providers/auth_provider.dart';

// ─── App Configuration ──────────────────────────────────────
const String pocketBaseUrl = String.fromEnvironment(
  'POCKETBASE_URL',
  defaultValue: 'http://localhost:8090',
);

const String clerkPublishableKey = String.fromEnvironment(
  'CLERK_PUBLISHABLE_KEY',
  defaultValue: '',
);

// ─── Core Providers ─────────────────────────────────────────
final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);
  return createAppRouter(authState);
});

final appThemeProvider = Provider<AppTheme>((ref) => AppTheme());

final dioProvider = Provider<Dio>((ref) {
  final dio = createDioClient();
  return dio;
});

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(ref.watch(dioProvider));
});

final localStorageProvider = Provider<LocalStorage>((ref) => LocalStorage());

// ─── Auth State (shared across app) ─────────────────────────
final authStateProvider = StateProvider<AuthState>((ref) => AuthState.unauthenticated());

// ─── Feature Providers (lazy-loaded) ────────────────────────
// These will be initialized when first accessed
final projectsProvider = FutureProvider.family<List<Project>, String>((ref, userId) async {
  final api = ref.watch(apiClientProvider);
  return api.getProjects(userId);
});

final generationsProvider = FutureProvider.family<List<Generation>, String>((ref, projectId) async {
  final api = ref.watch(apiClientProvider);
  return api.getGenerations(projectId);
});

final soulIdsProvider = FutureProvider.family<List<SoulId>, String>((ref, userId) async {
  final api = ref.watch(apiClientProvider);
  return api.getSoulIds(userId);
});

final templatesProvider = FutureProvider<List<Template>>((ref) async {
  final api = ref.watch(apiClientProvider);
  return api.getTemplates();
});

final creditBalanceProvider = FutureProvider<CreditBalance>((ref) async {
  final api = ref.watch(apiClientProvider);
  return api.getCreditBalance();
});