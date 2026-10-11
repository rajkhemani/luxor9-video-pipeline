// API Models - Freezed models matching OpenAPI spec
import 'package:freezed_annotation/freezed_annotation.dart';

part 'api_models.freezed.dart';
part 'api_models.g.dart';

// ─── Auth ─────────────────────────────────────────────────────
@freezed
class AuthRequest with _$AuthRequest {
  const factory AuthRequest({required String email, required String password}) = _AuthRequest;
  factory AuthRequest.fromJson(Map<String, dynamic> json) => _$AuthRequestFromJson(json);
}

@freezed
class AuthResponse with _$AuthResponse {
  const factory AuthResponse({
    required String token,
    required User user,
    required DateTime expires,
  }) = _AuthResponse;
  factory AuthResponse.fromJson(Map<String, dynamic> json) => _$AuthResponseFromJson(json);
}

@freezed
class User with _$User {
  const factory User({
    required String id,
    required String email,
    String? name,
    String? avatar,
    required String tier,
    required int creditsBalance,
    required DateTime created,
    required DateTime updated,
  }) = _User;
  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}

// ─── Projects ─────────────────────────────────────────────────
@freezed
class Project with _$Project {
  const factory Project({
    required String id,
    required String userId,
    required String name,
    String? description,
    required String pipeline,
    required String status,
    String? stylePlaybook,
    String? brandKitId,
    required List<String> targetPlatforms,
    required bool autoPublish,
    DateTime? scheduledAt,
    required int creditsUsed,
    Map<String, dynamic>? metadata,
    required DateTime created,
    required DateTime updated,
  }) = _Project;
  factory Project.fromJson(Map<String, dynamic> json) => _$ProjectFromJson(json);
}

@freezed
class ProjectCreate with _$ProjectCreate {
  const factory ProjectCreate({
    required String name,
    String? description,
    required String pipeline,
    String? stylePlaybook,
    String? brandKitId,
    List<String>? targetPlatforms,
    bool? autoPublish,
    DateTime? scheduledAt,
  }) = _ProjectCreate;
  factory ProjectCreate.fromJson(Map<String, dynamic> json) => _$ProjectCreateFromJson(json);
}

@freezed
class ProjectUpdate with _$ProjectUpdate {
  const factory ProjectUpdate({
    String? name,
    String? description,
    String? status,
    List<String>? targetPlatforms,
    bool? autoPublish,
    DateTime? scheduledAt,
  }) = _ProjectUpdate;
  factory ProjectUpdate.fromJson(Map<String, dynamic> json) => _$ProjectUpdateFromJson(json);
}

@freezed
class ProjectListResponse with _$ProjectListResponse {
  const factory ProjectListResponse({
    required List<Project> items,
    required int totalItems,
    required int page,
    required int perPage,
    required int totalPages,
  }) = _ProjectListResponse;
  factory ProjectListResponse.fromJson(Map<String, dynamic> json) => _$ProjectListResponseFromJson(json);
}

// ─── Generation ───────────────────────────────────────────────
@freezed
class GenerationRequest with _$GenerationRequest {
  const factory GenerationRequest({
    required String projectId,
    required String prompt,
    String? model,
    String? operation,
    String? duration,
    String? aspectRatio,
    String? imageUrl,
    String? soulId,
    String? templateId,
    bool? enhancePrompt,
    bool? qualityGate,
  }) = _GenerationRequest;
  factory GenerationRequest.fromJson(Map<String, dynamic> json) => _$GenerationRequestFromJson(json);
}

@freezed
class GenerationResponse with _$GenerationResponse {
  const factory GenerationResponse({
    required String id,
    required String projectId,
    required String status,
    required String model,
    required String prompt,
    String? videoUrl,
    String? thumbnailUrl,
    required int durationSeconds,
    required int creditsUsed,
    Map<String, dynamic>? metadata,
    String? error,
    required DateTime created,
    DateTime? completedAt,
  }) = _GenerationResponse;
  factory GenerationResponse.fromJson(Map<String, dynamic> json) => _$GenerationResponseFromJson(json);
}

@freezed
class GenerationStatus with _$GenerationStatus {
  const factory GenerationStatus({
    required String id,
    required String status,
    required int progress,
    DateTime? estimatedCompletion,
  }) = _GenerationStatus;
  factory GenerationStatus.fromJson(Map<String, dynamic> json) => _$GenerationStatusFromJson(json);
}

// ─── Templates ────────────────────────────────────────────────
@freezed
class Template with _$Template {
  const factory Template({
    required String id,
    required String name,
    required String description,
    required String pipeline,
    required String model,
    String? previewUrl,
    String? thumbnailUrl,
    required List<String> tags,
    required bool isFeatured,
    required bool isOfficial,
    String? authorId,
    required int usageCount,
    Map<String, dynamic>? config,
    required DateTime created,
  }) = _Template;
  factory Template.fromJson(Map<String, dynamic> json) => _$TemplateFromJson(json);
}

@freezed
class TemplateListResponse with _$TemplateListResponse {
  const factory TemplateListResponse({required List<Template> items}) = _TemplateListResponse;
  factory TemplateListResponse.fromJson(Map<String, dynamic> json) => _$TemplateListResponseFromJson(json);
}

// ─── Soul IDs ─────────────────────────────────────────────────
@freezed
class SoulId with _$SoulId {
  const factory SoulId({
    required String id,
    required String userId,
    required String name,
    String? description,
    required List<String> referenceImages,
    required String model,
    String? poseLibraryId,
    required bool isActive,
    required int usageCount,
    required DateTime created,
    required DateTime updated,
  }) = _SoulId;
  factory SoulId.fromJson(Map<String, dynamic> json) => _$SoulIdFromJson(json);
}

@freezed
class SoulIdCreate with _$SoulIdCreate {
  const factory SoulIdCreate({
    required String name,
    String? description,
    List<String>? referenceImages,
    String? model,
  }) = _SoulIdCreate;
  factory SoulIdCreate.fromJson(Map<String, dynamic> json) => _$SoulIdCreateFromJson(json);
}

@freezed
class SoulIdListResponse with _$SoulIdListResponse {
  const factory SoulIdListResponse({required List<SoulId> items}) = _SoulIdListResponse;
  factory SoulIdListResponse.fromJson(Map<String, dynamic> json) => _$SoulIdListResponseFromJson(json);
}

// ─── Credits ──────────────────────────────────────────────────
@freezed
class CreditBalance with _$CreditBalance {
  const factory CreditBalance({
    required int totalCredits,
    required int usedCredits,
    required int remainingCredits,
    required String tier,
    required DateTime resetDate,
  }) = _CreditBalance;
  factory CreditBalance.fromJson(Map<String, dynamic> json) => _$CreditBalanceFromJson(json);
}

@freezed
class CreditTransaction with _$CreditTransaction {
  const factory CreditTransaction({
    required String id,
    required String userId,
    required String type,
    required int amount,
    required int balanceAfter,
    String? description,
    Map<String, dynamic>? metadata,
    required DateTime created,
  }) = _CreditTransaction;
  factory CreditTransaction.fromJson(Map<String, dynamic> json) => _$CreditTransactionFromJson(json);
}

@freezed
class CreditTransactionListResponse with _$CreditTransactionListResponse {
  const factory CreditTransactionListResponse({required List<CreditTransaction> items}) = _CreditTransactionListResponse;
  factory CreditTransactionListResponse.fromJson(Map<String, dynamic> json) => _$CreditTransactionListResponseFromJson(json);
}

// ─── Publishing ───────────────────────────────────────────────
@freezed
class PublishRequest with _$PublishRequest {
  const factory PublishRequest({
    required String projectId,
    required List<String> platforms,
    Map<String, String>? captions,
    Map<String, List<String>>? hashtags,
    DateTime? scheduleAt,
  }) = _PublishRequest;
  factory PublishRequest.fromJson(Map<String, dynamic> json) => _$PublishRequestFromJson(json);
}

@freezed
class PublishResponse with _$PublishResponse {
  const factory PublishResponse({
    required String id,
    required String projectId,
    required String platform,
    required String status,
    String? platformPostId,
    String? platformUrl,
    String? error,
    DateTime? publishedAt,
  }) = _PublishResponse;
  factory PublishResponse.fromJson(Map<String, dynamic> json) => _$PublishResponseFromJson(json);
}

@freezed
class PublishHistoryResponse with _$PublishHistoryResponse {
  const factory PublishHistoryResponse({required List<PublishResponse> items}) = _PublishHistoryResponse;
  factory PublishHistoryResponse.fromJson(Map<String, dynamic> json) => _$PublishHistoryResponseFromJson(json);
}

// ─── Health ───────────────────────────────────────────────────
@freezed
class HealthResponse with _$HealthResponse {
  const factory HealthResponse({
    required String status,
    required String version,
    required DateTime timestamp,
  }) = _HealthResponse;
  factory HealthResponse.fromJson(Map<String, dynamic> json) => _$HealthResponseFromJson(json);
}

// ─── Auth State ───────────────────────────────────────────────
@freezed
class AuthState with _$AuthState {
  const factory AuthState.unauthenticated() = _Unauthenticated;
  const factory AuthState.authenticated({required User user, required String token}) = _Authenticated;
  const factory AuthState.onboarding({required User user, required String token}) = _Onboarding;

  const AuthState._();

  bool get isAuthenticated => when(
    unauthenticated: () => false,
    authenticated: (_, _) => true,
    onboarding: (_, _) => true,
  );

  bool get isOnboardingComplete => when(
    unauthenticated: () => false,
    authenticated: (_, _) => true,
    onboarding: (_, _) => false,
  );

  User? get user => when(
    unauthenticated: () => null,
    authenticated: (user, _) => user,
    onboarding: (user, _) => user,
  );

  String? get token => when(
    unauthenticated: () => null,
    authenticated: (_, token) => token,
    onboarding: (_, token) => token,
  );
}