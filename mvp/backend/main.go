package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/security"
)

// Config holds application configuration
type Config struct {
	EncryptionKey   string
	AdminEmail      string
	AdminPassword   string
	HiggsfieldKey   string
	HiggsfieldSecret string
	R2Endpoint      string
	R2AccessKey     string
	R2SecretKey     string
	R2Bucket        string
	ClerkPublishableKey string
	ClerkSecretKey  string
	SiteURL         string
}

func main() {
	app := pocketbase.New()

	// Load config from environment
	config := loadConfig()

	// Set encryption key if provided
	if config.EncryptionKey != "" {
		os.Setenv("PB_ENCRYPTION_KEY", config.EncryptionKey)
	}

	// Create admin user if not exists
	app.OnBootstrap().Add(func(e *core.BootstrapEvent) error {
		if config.AdminEmail != "" && config.AdminPassword != "" {
			admin, err := app.FindFirstRecordByFilter("users", "email = {:email}", map[string]any{"email": config.AdminEmail})
			if err != nil || admin == nil {
				// Create admin
				collection, _ := app.FindCollectionByNameOrId("users")
				record := core.NewRecord(collection)
				record.Set("email", config.AdminEmail)
				record.Set("password", config.AdminPassword)
				record.Set("verified", true)
				if err := app.Save(record); err != nil {
					return err
				}
			}
		}
		return nil
	})

	// Custom API extensions
	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		// Higgsfield generation endpoint
		e.Router.POST("/api/higgsfield/generate", apis.RequireAuth(), func(c *core.RequestEvent) error {
			return handleHiggsfieldGenerate(c, app, config)
		})

		// Soul ID management
		e.Router.POST("/api/higgsfield/soul/create", apis.RequireAuth(), func(c *core.RequestEvent) error {
			return handleSoulCreate(c, app)
		})
		e.Router.GET("/api/higgsfield/soul/list", apis.RequireAuth(), func(c *core.RequestEvent) error {
			return handleSoulList(c, app)
		})
		e.Router.GET("/api/higgsfield/soul/{id}", apis.RequireAuth(), func(c *core.RequestEvent) error {
			return handleSoulGet(c, app)
		})
		e.Router.PATCH("/api/higgsfield/soul/{id}", apis.RequireAuth(), func(c *core.RequestEvent) error {
			return handleSoulUpdate(c, app)
		})
		e.Router.DELETE("/api/higgsfield/soul/{id}", apis.RequireAuth(), func(c *core.RequestEvent) error {
			return handleSoulDelete(c, app)
		})

		// Credit balance
		e.Router.GET("/api/credits/balance", apis.RequireAuth(), func(c *core.RequestEvent) error {
			return handleCreditBalance(c, app)
		})
		e.Router.GET("/api/credits/transactions", apis.RequireAuth(), func(c *core.RequestEvent) error {
			return handleCreditTransactions(c, app)
		})

		// Template gallery
		e.Router.GET("/api/templates", func(c *core.RequestEvent) error {
			return handleTemplateList(c, app)
		})
		e.Router.GET("/api/templates/{id}", func(c *core.RequestEvent) error {
			return handleTemplateGet(c, app)
		})
		e.Router.POST("/api/templates/{id}/use", apis.RequireAuth(), func(c *core.RequestEvent) error {
			return handleTemplateUse(c, app)
		})

		// Publishing
		e.Router.POST("/api/publish", apis.RequireAuth(), func(c *core.RequestEvent) error {
			return handlePublish(c, app, config)
		})
		e.Router.GET("/api/publish/history", apis.RequireAuth(), func(c *core.RequestEvent) error {
			return handlePublishHistory(c, app)
		})

		// Webhooks
		e.Router.POST("/api/webhooks/higgsfield", func(c *core.RequestEvent) error {
			return handleHiggsfieldWebhook(c, app)
		})
		e.Router.POST("/api/webhooks/platform", func(c *core.RequestEvent) error {
			return handlePlatformWebhook(c, app)
		})

		// Health check
		e.Router.GET("/api/health", func(c *core.RequestEvent) error {
			return c.JSON(200, map[string]any{
				"status":    "ok",
				"version":   "1.0.0",
				"timestamp": time.Now().Format(time.RFC3339),
			})
		})

		return nil
	})

	// Record hooks for automatic credit deduction
	app.OnRecordBeforeCreateRequest("generations").Add(func(e *core.RecordCreateEvent) error {
		return deductCreditsForGeneration(e, app)
	})

	app.OnRecordAfterUpdateSuccess("generations").Add(func(e *core.RecordUpdateEvent) error {
		return handleGenerationComplete(e, app)
	})

	// Start the application
	if err := app.Start(); err != nil {
		panic(err)
	}
}

func loadConfig() Config {
	return Config{
		EncryptionKey:       getEnv("PB_ENCRYPTION_KEY", security.RandomString(32)),
		AdminEmail:          getEnv("PB_ADMIN_EMAIL", ""),
		AdminPassword:       getEnv("PB_ADMIN_PASSWORD", ""),
		HiggsfieldKey:       getEnv("HIGGSFIELD_API_KEY", ""),
		HiggsfieldSecret:    getEnv("HIGGSFIELD_API_SECRET", ""),
		R2Endpoint:          getEnv("R2_ENDPOINT", ""),
		R2AccessKey:         getEnv("R2_ACCESS_KEY", ""),
		R2SecretKey:         getEnv("R2_SECRET_KEY", ""),
		R2Bucket:            getEnv("R2_BUCKET", "openmontage-assets"),
		ClerkPublishableKey: getEnv("CLERK_PUBLISHABLE_KEY", ""),
		ClerkSecretKey:      getEnv("CLERK_SECRET_KEY", ""),
		SiteURL:             getEnv("SITE_URL", "http://localhost:3000"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// ─── Higgsfield Generation ──────────────────────────────────────

type GenerationRequest struct {
	ProjectID    string `json:"project_id"`
	Prompt       string `json:"prompt"`
	Model        string `json:"model,omitempty"`
	Operation    string `json:"operation,omitempty"`
	Duration     string `json:"duration,omitempty"`
	AspectRatio  string `json:"aspect_ratio,omitempty"`
	ImageURL     string `json:"image_url,omitempty"`
	SoulID       string `json:"soul_id,omitempty"`
	TemplateID   string `json:"template_id,omitempty"`
	EnhancePrompt bool   `json:"enhance_prompt,omitempty"`
	QualityGate  bool   `json:"quality_gate,omitempty"`
}

func handleHiggsfieldGenerate(c *core.RequestEvent, app *pocketbase.PocketBase, config Config) error {
	user := c.Auth
	if user == nil {
		return apis.NewUnauthorizedError("Authentication required", nil)
	}

	// Parse request
	var req GenerationRequest
	if err := json.NewDecoder(c.Request.Body).Decode(&req); err != nil {
		return apis.NewBadRequestError("Invalid request body", err)
	}

	// Validate required fields
	if req.ProjectID == "" || req.Prompt == "" {
		return apis.NewBadRequestError("project_id and prompt are required", nil)
	}

	// Check credits
	creditsNeeded := estimateCredits(req.Model, req.Duration)
	userCredits := getUserCredits(app, user.Id)
	if userCredits < creditsNeeded {
		return apis.NewApiError(402, "Insufficient credits", nil)
	}

	// Create generation record
	collection, err := app.FindCollectionByNameOrId("generations")
	if err != nil {
		return apis.NewApiError(500, "Generation collection not found", err)
	}

	record := core.NewRecord(collection)
	record.Set("user_id", user.Id)
	record.Set("project_id", req.ProjectID)
	record.Set("prompt", req.Prompt)
	record.Set("model", defaultString(req.Model, "seedance_2.0"))
	record.Set("operation", defaultString(req.Operation, "text_to_video"))
	record.Set("duration", defaultString(req.Duration, "5"))
	record.Set("aspect_ratio", defaultString(req.AspectRatio, "16:9"))
	record.Set("image_url", req.ImageURL)
	record.Set("soul_id", req.SoulID)
	record.Set("template_id", req.TemplateID)
	record.Set("status", "queued")
	record.Set("credits_estimated", creditsNeeded)

	if err := app.Save(record); err != nil {
		return apis.NewApiError(500, "Failed to create generation", err)
	}

	// Queue async generation (in production, push to queue)
	go processGeneration(app, config, record.Id)

	return c.JSON(202, map[string]any{
		"id":               record.Id,
		"status":           "queued",
		"credits_estimated": creditsNeeded,
	})
}

func estimateCredits(model, duration string) int {
	baseCredits := map[string]int{
		"seedance_2.0":      80,
		"seedance_2.0_fast": 50,
		"kling_3.0":         10,
		"veo_3.1":           50,
		"sora_2":            50,
		"wan_2.5":           10,
		"soul_cinema":       15,
	}
	dur := 5
	if d, err := strconv.Atoi(duration); err == nil {
		dur = d
	}
	base := baseCredits[model]
	if base == 0 {
		base = 15
	}
	return base * (dur / 5)
}

func getUserCredits(app *pocketbase.PocketBase, userId string) int {
	// In production, query credits collection
	// For now, return a default based on tier
	return 500 // Placeholder
}

func defaultString(s, def string) string {
	if s == "" {
		return def
	}
	return s
}

func processGeneration(app *pocketbase.PocketBase, config Config, generationId string) {
	// This runs in background - in production use a proper queue (Redis/RabbitMQ)
	// For MVP, we'll simulate with a direct HTTP call to Higgsfield
	
	// Get generation record
	record, err := app.FindRecordById("generations", generationId)
	if err != nil {
		return
	}

	// Update status to processing
	record.Set("status", "processing")
	app.Save(record)

	// Call Higgsfield API
	result, err := callHiggsfieldAPI(config, record)
	
	if err != nil {
		record.Set("status", "failed")
		record.Set("error", err.Error())
		app.Save(record)
		return
	}

	// Success
	record.Set("status", "completed")
	record.Set("video_url", result.VideoURL)
	record.Set("thumbnail_url", result.ThumbnailURL)
	record.Set("duration_seconds", result.Duration)
	record.Set("credits_used", result.CreditsUsed)
	record.Set("completed_at", time.Now().Format(time.RFC3339))
	app.Save(record)
}

type HiggsfieldResult struct {
	VideoURL      string
	ThumbnailURL  string
	Duration      int
	CreditsUsed   int
}

func callHiggsfieldAPI(config Config, record *core.Record) (*HiggsfieldResult, error) {
	if config.HiggsfieldKey == "" || config.HiggsfieldSecret == "" {
		// Mock response for development
		return &HiggsfieldResult{
			VideoURL:     "https://example.com/mock-video.mp4",
			ThumbnailURL: "https://example.com/mock-thumb.jpg",
			Duration:     5,
			CreditsUsed:  record.GetInt("credits_estimated"),
		}, nil
	}

	payload := map[string]any{
		"prompt":      record.GetString("prompt"),
		"model":       record.GetString("model"),
		"task":        record.GetString("operation"),
		"duration":    record.GetString("duration"),
		"aspect_ratio": record.GetString("aspect_ratio"),
	}

	if imgURL := record.GetString("image_url"); imgURL != "" {
		payload["image_url"] = imgURL
	}

	jsonPayload, _ := json.Marshal(payload)

	req, _ := http.NewRequest("POST", "https://platform.higgsfield.ai/v1/generations", 
		io.NopCloser(bytes.NewReader(jsonPayload)))
	req.Header.Set("Authorization", "Bearer "+config.HiggsfieldKey)
	req.Header.Set("X-API-Secret", config.HiggsfieldSecret)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("Higgsfield API error: %s", string(body))
	}

	var genData map[string]any
	json.NewDecoder(resp.Body).Decode(&genData)
	
	generationId := genData["id"].(string)
	statusUrl := fmt.Sprintf("https://platform.higgsfield.ai/v1/generations/%s", generationId)

	// Poll for completion
	for i := 0; i < 72; i++ { // Max 6 minutes
		time.Sleep(5 * time.Second)
		
		pollReq, _ := http.NewRequest("GET", statusUrl, nil)
		pollReq.Header.Set("Authorization", "Bearer "+config.HiggsfieldKey)
		pollReq.Header.Set("X-API-Secret", config.HiggsfieldSecret)
		
		pollResp, err := client.Do(pollReq)
		if err != nil {
			continue
		}
		
		var pollData map[string]any
		json.NewDecoder(pollResp.Body).Decode(&pollData)
		pollResp.Body.Close()
		
		status := pollData["status"]
		if status == "Completed" || status == "COMPLETED" {
			videoURL := pollData["output_url"]
			if videoURL == nil {
				videoURL = pollData["url"]
			}
			return &HiggsfieldResult{
				VideoURL:     videoURL.(string),
				ThumbnailURL: pollData["thumbnail_url"].(string),
				Duration:     5,
				CreditsUsed:  record.GetInt("credits_estimated"),
			}, nil
		}
		if status == "Failed" || status == "FAILED" || status == "NSFW" {
			return nil, fmt.Errorf("generation failed: %v", pollData["error"])
		}
	}

	return nil, fmt.Errorf("generation timed out")
}

// ─── Soul ID Management ────────────────────────────────────────

func handleSoulCreate(c *core.RequestEvent, app *pocketbase.PocketBase) error {
	user := c.Auth
	var req struct {
		Name           string   `json:"name"`
		Description    string   `json:"description"`
		ReferenceImages []string `json:"reference_images"`
		Model          string   `json:"model,omitempty"`
	}
	if err := json.NewDecoder(c.Request.Body).Decode(&req); err != nil {
		return apis.NewBadRequestError("Invalid request", err)
	}

	collection, _ := app.FindCollectionByNameOrId("soul_ids")
	record := core.NewRecord(collection)
	record.Set("user_id", user.Id)
	record.Set("name", req.Name)
	record.Set("description", req.Description)
	record.Set("reference_images", req.ReferenceImages)
	record.Set("model", defaultString(req.Model, "soul_cinema"))
	record.Set("is_active", true)

	if err := app.Save(record); err != nil {
		return apis.NewApiError(500, "Failed to create Soul ID", err)
	}

	return c.JSON(201, record.PublicExport())
}

func handleSoulList(c *core.RequestEvent, app *pocketbase.PocketBase) error {
	user := c.Auth
	records, err := app.FindRecordsByFilter("soul_ids", "user_id = {:userId}", "-created", 50, 0, map[string]any{"userId": user.Id})
	if err != nil {
		return apis.NewApiError(500, "Failed to list Soul IDs", err)
	}

	var items []map[string]any
	for _, r := range records {
		items = append(items, r.PublicExport())
	}
	return c.JSON(200, map[string]any{"items": items})
}

func handleSoulGet(c *core.RequestEvent, app *pocketbase.PocketBase) error {
	id := c.Request.PathValue("id")
	record, err := app.FindRecordById("soul_ids", id)
	if err != nil {
		return apis.NewNotFoundError("Soul ID not found", err)
	}
	// Verify ownership
	if record.GetString("user_id") != c.Auth.Id {
		return apis.NewForbiddenError("Access denied", nil)
	}
	return c.JSON(200, record.PublicExport())
}

func handleSoulUpdate(c *core.RequestEvent, app *pocketbase.PocketBase) error {
	id := c.Request.PathValue("id")
	record, err := app.FindRecordById("soul_ids", id)
	if err != nil {
		return apis.NewNotFoundError("Soul ID not found", err)
	}
	if record.GetString("user_id") != c.Auth.Id {
		return apis.NewForbiddenError("Access denied", nil)
	}

	var req struct {
		Name           string   `json:"name"`
		Description    string   `json:"description"`
		ReferenceImages []string `json:"reference_images"`
		Model          string   `json:"model,omitempty"`
	}
	json.NewDecoder(c.Request.Body).Decode(&req)

	record.Set("name", req.Name)
	record.Set("description", req.Description)
	record.Set("reference_images", req.ReferenceImages)
	record.Set("model", defaultString(req.Model, "soul_cinema"))

	if err := app.Save(record); err != nil {
		return apis.NewApiError(500, "Failed to update", err)
	}
	return c.JSON(200, record.PublicExport())
}

func handleSoulDelete(c *core.RequestEvent, app *pocketbase.PocketBase) error {
	id := c.Request.PathValue("id")
	record, err := app.FindRecordById("soul_ids", id)
	if err != nil {
		return apis.NewNotFoundError("Soul ID not found", err)
	}
	if record.GetString("user_id") != c.Auth.Id {
		return apis.NewForbiddenError("Access denied", nil)
	}
	return app.Delete(record)
}

// ─── Credits ────────────────────────────────────────────────────

func handleCreditBalance(c *core.RequestEvent, app *pocketbase.PocketBase) error {
	user := c.Auth
	// In production, query credits collection
	return c.JSON(200, map[string]any{
		"total_credits":     1000,
		"used_credits":      200,
		"remaining_credits": 800,
		"tier":              "creator",
		"reset_date":        time.Now().AddDate(0, 1, 0).Format(time.RFC3339),
	})
}

func handleCreditTransactions(c *core.RequestEvent, app *pocketbase.PocketBase) error {
	// Return transaction history
	return c.JSON(200, map[string]any{"items": []any{}})
}

func deductCreditsForGeneration(e *core.RecordCreateEvent, app *pocketbase.PocketBase) error {
	credits := e.Record.GetInt("credits_estimated")
	// In production: deduct from user credits balance
	// For now, just log
	app.Logger().Info("Credits reserved", "amount", credits, "user", e.Record.GetString("user_id"))
	return nil
}

func handleGenerationComplete(e *core.RecordUpdateEvent, app *pocketbase.PocketBase) error {
	if e.Record.GetString("status") == "completed" {
		// Finalize credit deduction, send webhook, etc.
		app.Logger().Info("Generation completed", "id", e.Record.Id)
	}
	return nil
}

// ─── Templates ─────────────────────────────────────────────────

func handleTemplateList(c *core.RequestEvent, app *pocketbase.PocketBase) error {
	page := 1
	perPage := 20
	if p := c.Request.URL.Query().Get("page"); p != "" {
		page, _ = strconv.Atoi(p)
	}
	if pp := c.Request.URL.Query().Get("per_page"); pp != "" {
		perPage, _ = strconv.Atoi(pp)
	}

	records, err := app.FindRecordsByFilter("templates", "is_featured = true", "-created", perPage, (page-1)*perPage)
	if err != nil {
		return apis.NewApiError(500, "Failed to list templates", err)
	}

	var items []map[string]any
	for _, r := range records {
		items = append(items, r.PublicExport())
	}
	return c.JSON(200, map[string]any{
		"items":       items,
		"page":        page,
		"per_page":    perPage,
		"total_items": len(items),
	})
}

func handleTemplateGet(c *core.RequestEvent, app *pocketbase.PocketBase) error {
	id := c.Request.PathValue("id")
	record, err := app.FindRecordById("templates", id)
	if err != nil {
		return apis.NewNotFoundError("Template not found", err)
	}
	return c.JSON(200, record.PublicExport())
}

func handleTemplateUse(c *core.RequestEvent, app *pocketbase.PocketBase) error {
	id := c.Request.PathValue("id")
	template, err := app.FindRecordById("templates", id)
	if err != nil {
		return apis.NewNotFoundError("Template not found", err)
	}

	// Create project from template
	user := c.Auth
	collection, _ := app.FindCollectionByNameOrId("projects")
	record := core.NewRecord(collection)
	record.Set("user_id", user.Id)
	record.Set("name", template.GetString("name")+" - "+time.Now().Format("Jan 2, 15:04"))
	record.Set("pipeline", template.GetString("pipeline"))
	record.Set("style_playbook", template.GetString("config.style_playbook"))
	record.Set("template_id", template.Id)

	if err := app.Save(record); err != nil {
		return apis.NewApiError(500, "Failed to create project", err)
	}

	return c.JSON(201, record.PublicExport())
}

// ─── Publishing ────────────────────────────────────────────────

func handlePublish(c *core.RequestEvent, app *pocketbase.PocketBase, config Config) error {
	user := c.Auth
	var req struct {
		ProjectID  string            `json:"project_id"`
		Platforms  []string          `json:"platforms"`
		Captions   map[string]string `json:"captions"`
		Hashtags   map[string][]string `json:"hashtags"`
		ScheduleAt string            `json:"schedule_at"`
	}
	json.NewDecoder(c.Request.Body).Decode(&req)

	if req.ProjectID == "" || len(req.Platforms) == 0 {
		return apis.NewBadRequestError("project_id and platforms required", nil)
	}

	// Create publish records for each platform
	collection, _ := app.FindCollectionByNameOrId("publishes")
	var results []map[string]any

	for _, platform := range req.Platforms {
		record := core.NewRecord(collection)
		record.Set("user_id", user.Id)
		record.Set("project_id", req.ProjectID)
		record.Set("platform", platform)
		record.Set("caption", req.Captions[platform])
		record.Set("hashtags", req.Hashtags[platform])
		record.Set("status", "pending")
		if req.ScheduleAt != "" {
			record.Set("scheduled_at", req.ScheduleAt)
		}
		app.Save(record)
		
		// Queue actual publishing (async)
		go processPublish(app, config, record.Id, platform)
		
		results = append(results, map[string]any{
			"id":       record.Id,
			"platform": platform,
			"status":   "queued",
		})
	}

	return c.JSON(202, map[string]any{"items": results})
}

func processPublish(app *pocketbase.PocketBase, config Config, publishId, platform string) {
	// In production: call platform APIs (YouTube, TikTok, etc.)
	// For MVP: simulate
	time.Sleep(2 * time.Second)
	record, _ := app.FindRecordById("publishes", publishId)
	record.Set("status", "published")
	record.Set("platform_post_id", "mock_"+security.RandomString(10))
	record.Set("platform_url", fmt.Sprintf("https://%s.com/post/mock", platform))
	record.Set("published_at", time.Now().Format(time.RFC3339))
	app.Save(record)
}

func handlePublishHistory(c *core.RequestEvent, app *pocketbase.PocketBase) error {
	user := c.Auth
	page := 1
	if p := c.Request.URL.Query().Get("page"); p != "" {
		page, _ = strconv.Atoi(p)
	}

	records, _ := app.FindRecordsByFilter("publishes", "user_id = {:userId}", "-created", 20, (page-1)*20, map[string]any{"userId": user.Id})
	
	var items []map[string]any
	for _, r := range records {
		items = append(items, r.PublicExport())
	}
	return c.JSON(200, map[string]any{"items": items})
}

// ─── Webhooks ──────────────────────────────────────────────────

func handleHiggsfieldWebhook(c *core.RequestEvent, app *pocketbase.PocketBase) error {
	var webhook struct {
		Event        string `json:"event"`
		GenerationId string `json:"generation_id"`
		Status       string `json:"status"`
		OutputURL    string `json:"output_url"`
		Error        string `json:"error"`
		Progress     int    `json:"progress"`
	}
	json.NewDecoder(c.Request.Body).Decode(&webhook)

	// Find and update generation record
	records, _ := app.FindRecordsByFilter("generations", "external_id = {:id}", "", 1, 0, map[string]any{"id": webhook.GenerationId})
	if len(records) > 0 {
		record := records[0]
		switch webhook.Event {
		case "generation.completed":
			record.Set("status", "completed")
			record.Set("video_url", webhook.OutputURL)
			record.Set("completed_at", time.Now().Format(time.RFC3339))
		case "generation.failed":
			record.Set("status", "failed")
			record.Set("error", webhook.Error)
		case "generation.progress":
			record.Set("progress", webhook.Progress)
		}
		app.Save(record)
	}

	return c.JSON(200, map[string]string{"status": "received"})
}

func handlePlatformWebhook(c *core.RequestEvent, app *pocketbase.PocketBase) error {
	// Handle platform callbacks (YouTube, TikTok, etc.)
	return c.JSON(200, map[string]string{"status": "received"})
}