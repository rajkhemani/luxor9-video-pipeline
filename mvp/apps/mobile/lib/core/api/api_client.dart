// API Client - Dio wrapper with generated types
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:openmontage_mobile/core/models/api_models.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'api_client.g.dart';

@Riverpod(keepAlive: true)
ApiClient apiClient(ApiClientRef ref) {
  return ApiClient(ref.watch(dioProvider));
}

class ApiClient {
  final Dio _dio;

  ApiClient(this._dio);

  // ─── Auth ───────────────────────────────────────────────────
  Future<AuthResponse> login(String email, String password) async {
    final response = await _dio.post('/api/auth/login', data: {'email': email, 'password': password});
    return AuthResponse.fromJson(response.data);
  }

  Future<AuthResponse> register(String email, String password) async {
    final response = await _dio.post('/api/auth/register', data: {'email': email, 'password': password});
    return AuthResponse.fromJson(response.data);
  }

  Future<User> getCurrentUser() async {
    final response = await _dio.get('/api/auth/me');
    return User.fromJson(response.data);
  }

  Future<AuthResponse> refreshToken() async {
    final response = await _dio.post('/api/auth/refresh');
    return AuthResponse.fromJson(response.data);
  }

  // ─── Projects ───────────────────────────────────────────────
  Future<ProjectListResponse> getProjects(String userId, {int page = 1, int perPage = 20}) async {
    final response = await _dio.get('/api/projects', queryParameters: {'page': page, 'per_page': perPage});
    return ProjectListResponse.fromJson(response.data);
  }

  Future<Project> createProject(ProjectCreate request) async {
    final response = await _dio.post('/api/projects', data: request.toJson());
    return Project.fromJson(response.data);
  }

  Future<Project> getProject(String id) async {
    final response = await _dio.get('/api/projects/$id');
    return Project.fromJson(response.data);
  }

  Future<Project> updateProject(String id, ProjectUpdate request) async {
    final response = await _dio.patch('/api/projects/$id', data: request.toJson());
    return Project.fromJson(response.data);
  }

  Future<void> deleteProject(String id) async {
    await _dio.delete('/api/projects/$id');
  }

  // ─── Generation ─────────────────────────────────────────────
  Future<GenerationResponse> generateVideo(GenerationRequest request) async {
    final response = await _dio.post('/api/generation/generate', data: request.toJson());
    return GenerationResponse.fromJson(response.data);
  }

  Future<GenerationStatus> getGenerationStatus(String id) async {
    final response = await _dio.get('/api/generation/$id');
    return GenerationStatus.fromJson(response.data);
  }

  Future<GenerationResponse> retryGeneration(String id) async {
    final response = await _dio.post('/api/generation/$id/retry');
    return GenerationResponse.fromJson(response.data);
  }

  Future<List<GenerationResponse>> getGenerationHistory({String? projectId, int page = 1, int perPage = 20}) async {
    final query = <String, dynamic>{'page': page, 'per_page': perPage};
    if (projectId != null) query['project_id'] = projectId;
    final response = await _dio.get('/api/generation/history', queryParameters: query);
    return (response.data['items'] as List).map((e) => GenerationResponse.fromJson(e)).toList();
  }

  // ─── Templates ──────────────────────────────────────────────
  Future<TemplateListResponse> getTemplates({int page = 1, int perPage = 20, String? pipeline, bool? featured}) async {
    final query = <String, dynamic>{'page': page, 'per_page': perPage};
    if (pipeline != null) query['pipeline'] = pipeline;
    if (featured != null) query['featured'] = featured;
    final response = await _dio.get('/api/templates', queryParameters: query);
    return TemplateListResponse.fromJson(response.data);
  }

  Future<Template> getTemplate(String id) async {
    final response = await _dio.get('/api/templates/$id');
    return Template.fromJson(response.data);
  }

  Future<Project> useTemplate(String id) async {
    final response = await _dio.post('/api/templates/$id/use');
    return Project.fromJson(response.data);
  }

  // ─── Soul IDs ───────────────────────────────────────────────
  Future<SoulIdListResponse> getSoulIds(String userId) async {
    final response = await _dio.get('/api/soul-ids');
    return SoulIdListResponse.fromJson(response.data);
  }

  Future<SoulId> createSoulId(SoulIdCreate request) async {
    final response = await _dio.post('/api/soul-ids', data: request.toJson());
    return SoulId.fromJson(response.data);
  }

  Future<SoulId> getSoulId(String id) async {
    final response = await _dio.get('/api/soul-ids/$id');
    return SoulId.fromJson(response.data);
  }

  Future<SoulId> updateSoulId(String id, SoulIdCreate request) async {
    final response = await _dio.patch('/api/soul-ids/$id', data: request.toJson());
    return SoulId.fromJson(response.data);
  }

  Future<void> deleteSoulId(String id) async {
    await _dio.delete('/api/soul-ids/$id');
  }

  // ─── Credits ────────────────────────────────────────────────
  Future<CreditBalance> getCreditBalance() async {
    final response = await _dio.get('/api/credits/balance');
    return CreditBalance.fromJson(response.data);
  }

  Future<CreditTransactionListResponse> getCreditTransactions({int page = 1}) async {
    final response = await _dio.get('/api/credits/transactions', queryParameters: {'page': page});
    return CreditTransactionListResponse.fromJson(response.data);
  }

  // ─── Publishing ─────────────────────────────────────────────
  Future<PublishResponse> publish(PublishRequest request) async {
    final response = await _dio.post('/api/publish', data: request.toJson());
    return PublishResponse.fromJson(response.data);
  }

  Future<PublishHistoryResponse> getPublishHistory({String? projectId, int page = 1}) async {
    final query = <String, dynamic>{'page': page};
    if (projectId != null) query['project_id'] = projectId;
    final response = await _dio.get('/api/publish/history', queryParameters: query);
    return PublishHistoryResponse.fromJson(response.data);
  }

  // ─── Health ─────────────────────────────────────────────────
  Future<HealthResponse> healthCheck() async {
    final response = await _dio.get('/api/health');
    return HealthResponse.fromJson(response.data);
  }
}