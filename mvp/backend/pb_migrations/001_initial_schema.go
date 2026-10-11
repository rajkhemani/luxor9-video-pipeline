package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		// ─── Projects ─────────────────────────────────────────
		projects := core.NewBaseCollection("projects")
		projects.Fields.Add(
			&core.TextField{Name: "user_id", Required: true},
			&core.TextField{Name: "name", Required: true, Max: 100},
			&core.TextField{Name: "description", Max: 1000},
			&core.SelectField{Name: "pipeline", Required: true, Values: []string{
				"cinematic", "avatar-spokesperson", "social-creative",
				"animated-explainer", "talking-head", "screen-demo",
				"clip-factory", "podcast-repurpose", "hybrid",
				"character-animation", "localization-dub", "documentary-montage",
				"framework-smoke",
			}},
			&core.TextField{Name: "style_playbook"},
			&core.TextField{Name: "brand_kit_id"},
			&core.JSONField{Name: "target_platforms"},
			&core.BoolField{Name: "auto_publish", Default: false},
			&core.DateField{Name: "scheduled_at"},
			&core.NumberField{Name: "credits_used", Default: 0},
			&core.JSONField{Name: "metadata"},
		)
		projects.ListRule = "user_id = @request.auth.id"
		projects.ViewRule = "user_id = @request.auth.id"
		projects.CreateRule = "@request.auth.id != \"\""
		projects.UpdateRule = "user_id = @request.auth.id"
		projects.DeleteRule = "user_id = @request.auth.id"
		projects.Indexes = []string{"CREATE INDEX idx_projects_user ON projects (user_id)"}
		if err := app.Save(projects); err != nil {
			return err
		}

		// ─── Generations ──────────────────────────────────────
		generations := core.NewBaseCollection("generations")
		generations.Fields.Add(
			&core.TextField{Name: "user_id", Required: true},
			&core.TextField{Name: "project_id", Required: true},
			&core.TextField{Name: "external_id"}, // Higgsfield generation ID
			&core.TextField{Name: "prompt", Required: true, Max: 4000},
			&core.SelectField{Name: "model", Values: []string{
				"seedance_2.0", "seedance_2.0_fast", "kling_3.0",
				"veo_3.1", "sora_2", "wan_2.5", "soul_cinema",
			}, Default: "seedance_2.0"},
			&core.SelectField{Name: "operation", Values: []string{"text_to_video", "image_to_video"}, Default: "text_to_video"},
			&core.TextField{Name: "duration", Default: "5"},
			&core.SelectField{Name: "aspect_ratio", Values: []string{"16:9", "9:16", "1:1", "21:9"}, Default: "16:9"},
			&core.URLField{Name: "image_url"},
			&core.TextField{Name: "soul_id"},
			&core.TextField{Name: "template_id"},
			&core.SelectField{Name: "status", Values: []string{"queued", "processing", "completed", "failed"}, Default: "queued"},
			&core.NumberField{Name: "progress", Default: 0},
			&core.URLField{Name: "video_url"},
			&core.URLField{Name: "thumbnail_url"},
			&core.NumberField{Name: "duration_seconds"},
			&core.NumberField{Name: "credits_estimated"},
			&core.NumberField{Name: "credits_used"},
			&core.TextField{Name: "error"},
			&core.DateField{Name: "completed_at"},
			&core.JSONField{Name: "metadata"},
		)
		generations.ListRule = "user_id = @request.auth.id"
		generations.ViewRule = "user_id = @request.auth.id"
		generations.CreateRule = "@request.auth.id != \"\""
		generations.Indexes = []string{
			"CREATE INDEX idx_generations_user ON generations (user_id)",
			"CREATE INDEX idx_generations_project ON generations (project_id)",
			"CREATE INDEX idx_generations_status ON generations (status)",
		}
		if err := app.Save(generations); err != nil {
			return err
		}

		// ─── Soul IDs ─────────────────────────────────────────
		soulIds := core.NewBaseCollection("soul_ids")
		soulIds.Fields.Add(
			&core.TextField{Name: "user_id", Required: true},
			&core.TextField{Name: "name", Required: true, Max: 50},
			&core.TextField{Name: "description", Max: 500},
			&core.JSONField{Name: "reference_images"},
			&core.SelectField{Name: "model", Values: []string{"soul_cinema", "seedance_2.0"}, Default: "soul_cinema"},
			&core.TextField{Name: "pose_library_id"},
			&core.BoolField{Name: "is_active", Default: true},
			&core.NumberField{Name: "usage_count", Default: 0},
		)
		soulIds.ListRule = "user_id = @request.auth.id"
		soulIds.ViewRule = "user_id = @request.auth.id"
		soulIds.CreateRule = "@request.auth.id != \"\""
		soulIds.UpdateRule = "user_id = @request.auth.id"
		soulIds.DeleteRule = "user_id = @request.auth.id"
		if err := app.Save(soulIds); err != nil {
			return err
		}

		// ─── Templates ────────────────────────────────────────
		templates := core.NewBaseCollection("templates")
		templates.Fields.Add(
			&core.TextField{Name: "name", Required: true, Max: 100},
			&core.TextField{Name: "description", Max: 1000},
			&core.TextField{Name: "pipeline", Required: true},
			&core.TextField{Name: "model"},
			&core.URLField{Name: "preview_url"},
			&core.URLField{Name: "thumbnail_url"},
			&core.JSONField{Name: "tags"},
			&core.BoolField{Name: "is_featured", Default: false},
			&core.BoolField{Name: "is_official", Default: true},
			&core.TextField{Name: "author_id"},
			&core.NumberField{Name: "usage_count", Default: 0},
			&core.JSONField{Name: "config"},
		)
		templates.ListRule = ""
		templates.ViewRule = ""
		templates.CreateRule = "@request.auth.id != \"\" && @request.auth.isAdmin = true"
		templates.UpdateRule = "@request.auth.id != \"\" && @request.auth.isAdmin = true"
		templates.DeleteRule = "@request.auth.id != \"\" && @request.auth.isAdmin = true"
		if err := app.Save(templates); err != nil {
			return err
		}

		// ─── Publishes ────────────────────────────────────────
		publishes := core.NewBaseCollection("publishes")
		publishes.Fields.Add(
			&core.TextField{Name: "user_id", Required: true},
			&core.TextField{Name: "project_id", Required: true},
			&core.SelectField{Name: "platform", Values: []string{
				"youtube", "tiktok", "instagram", "linkedin", "twitter", "threads", "youtube_shorts",
			}, Required: true},
			&core.TextField{Name: "caption", Max: 2000},
			&core.JSONField{Name: "hashtags"},
			&core.SelectField{Name: "status", Values: []string{"pending", "processing", "published", "failed"}, Default: "pending"},
			&core.TextField{Name: "platform_post_id"},
			&core.URLField{Name: "platform_url"},
			&core.TextField{Name: "error"},
			&core.DateField{Name: "scheduled_at"},
			&core.DateField{Name: "published_at"},
		)
		publishes.ListRule = "user_id = @request.auth.id"
		publishes.ViewRule = "user_id = @request.auth.id"
		publishes.CreateRule = "@request.auth.id != \"\""
		publishes.Indexes = []string{
			"CREATE INDEX idx_publishes_user ON publishes (user_id)",
			"CREATE INDEX idx_publishes_project ON publishes (project_id)",
		}
		if err := app.Save(publishes); err != nil {
			return err
		}

		// ─── Credit Transactions ──────────────────────────────
		credits := core.NewBaseCollection("credit_transactions")
		credits.Fields.Add(
			&core.TextField{Name: "user_id", Required: true},
			&core.SelectField{Name: "type", Values: []string{"purchase", "usage", "refund", "bonus", "referral"}, Required: true},
			&core.NumberField{Name: "amount", Required: true},
			&core.NumberField{Name: "balance_after", Required: true},
			&core.TextField{Name: "description"},
			&core.JSONField{Name: "metadata"},
		)
		credits.ListRule = "user_id = @request.auth.id"
		credits.ViewRule = "user_id = @request.auth.id"
		credits.CreateRule = "@request.auth.id != \"\" && @request.auth.isAdmin = true"
		if err := app.Save(credits); err != nil {
			return err
		}

		return nil
	}, func(app core.App) error {
		// Rollback - collections will be deleted automatically
		return nil
	})
}