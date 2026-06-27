.PHONY: setup install install-dev install-gpu test test-contracts lint clean preflight demo demo-list hyperframes-doctor hyperframes-warm remix-setup remix-check remix-demo

# ---- One-command setup ----

setup:
	@echo "==> Installing Python dependencies..."
	pip install -r requirements.txt
	@echo ""
	@echo "==> Installing Remotion composer..."
	cd remotion-composer && npm install
	@echo ""
	@echo "==> Installing free offline TTS (Piper)..."
	pip install piper-tts || echo "  [skip] piper-tts install failed — TTS will use cloud providers instead"
	@echo ""
	@echo "==> Installing HyperFrames runtime (cache-warm via npx)..."
	@echo "    Pulls the 'hyperframes' npm package into the local npx cache so the"
	@echo "    first render doesn't pay a 30-60s cold-fetch penalty. ~20MB of disk."
	@npx --yes hyperframes --version >/dev/null 2>&1 && echo "    HyperFrames CLI cached (npx)" || echo "  [skip] HyperFrames cache-warm failed — offline or npm unavailable; first render will fetch on demand"
	@python -c "from tools.video.hyperframes_compose import HyperFramesCompose; HyperFramesCompose._npm_resolve_cache=None; c=HyperFramesCompose()._runtime_check(); print(f'    HyperFrames runtime_available={c[\"runtime_available\"]}, npm={c.get(\"npm_package_version\") or c.get(\"npm_resolve_error\")}'); [print(f'    note: {r}') for r in c['reasons']]" || echo "  [skip] HyperFrames check failed — runtime can be set up later"
	@echo ""
	python -c "import shutil, os; e=os.path.exists('.env'); shutil.copy('.env.example','.env') if not e else None; print('==> Created .env from .env.example — add your API keys there.' if not e else '==> .env already exists — skipping.')"
	@echo ""
	@echo "Done! Open this project in your AI coding assistant and start creating."
	@echo "  Optional: add API keys to .env to unlock cloud providers."
	@echo "  Optional: run 'make install-gpu' if you have an NVIDIA GPU."
	@echo "  Optional: run 'make hyperframes-doctor' to fully validate the HyperFrames runtime."
	@echo "  Optional: run 'make hyperframes-warm' anytime to refresh the npx cache to the latest hyperframes version."

# ---- Individual installs ----

install:
	pip install -r requirements.txt

install-dev:
	pip install -r requirements-dev.txt

install-gpu:
	pip install -r requirements-gpu.txt
	pip install diffusers transformers accelerate

# ---- Testing ----

test:
	python -m pytest tests/ -v

test-contracts:
	python -m pytest tests/contracts/ -v

# ---- Utilities ----

preflight:
	python -c "from tools.tool_registry import registry; import json; registry.discover(); print(json.dumps(registry.provider_menu(), indent=2))"

hyperframes-doctor:
	@echo "==> Probing HyperFrames runtime (node/ffmpeg/npx + hyperframes doctor)..."
	python -c "from tools.video.hyperframes_compose import HyperFramesCompose; r=HyperFramesCompose().execute({'operation':'doctor'}); import json; print(json.dumps(r.data, indent=2)); print('OK' if r.success else f'FAIL: {r.error}')"

hyperframes-warm:
	@echo "==> Refreshing the HyperFrames npx cache to latest..."
	@echo "    Uses --prefer-online so npx picks up new releases since your last run."
	npx --yes --prefer-online hyperframes --version
	@echo "==> Cache warm complete."

demo:
	@echo "==> Rendering zero-key demo videos (no API keys needed)..."
	@echo "    These use only Remotion components — animated charts, text, data viz."
	@echo ""
	python render_demo.py

demo-list:
	@python render_demo.py --list

lint:
	python -m py_compile tools/base_tool.py
	python -m py_compile tools/tool_registry.py
	python -m py_compile tools/cost_tracker.py
	python -m py_compile tools/composition_validator.py

# ---- Remix: unified stack setup & validation ----

remix-setup:
	@echo "================================"
	@echo "  OpenMontage Remix Setup"
	@echo "  Combined Remotion + HyperFrames"
	@echo "================================"
	@echo ""
	@echo "==> [1/6] Python dependencies..."
	@pip install -r requirements.txt > /dev/null 2>&1 && echo "    OK" || echo "    FAIL"
	@echo ""
	@echo "==> [2/6] Remotion composer (npm install)..."
	@cd remotion-composer && (npm install 2>&1 | tail -1 | grep -q "found 0 vulnerabilities\|up to date\|added" && echo "    OK" || (npx --yes npm install 2>&1 | tail -1 | grep -q "found 0 vulnerabilities\|up to date\|added" && echo "    OK (via npx)" || echo "    WARN — npm install had issues"))
	@echo ""
	@echo "==> [3/6] Free offline TTS (Piper)..."
	@pip install piper-tts > /dev/null 2>&1 && echo "    OK" || echo "    SKIP (cloud TTS will be used instead)"
	@echo ""
	@echo "==> [4/6] HyperFrames runtime (npx cache)..."
	@npx --yes hyperframes --version > /dev/null 2>&1 && echo "    OK" || echo "    SKIP (will fetch on first render)"
	@echo ""
	@echo "==> [5/6] Environment file..."
	@python -c "import shutil, os; e=os.path.exists('.env'); shutil.copy('.env.example','.env') if not e else None; print('    Created .env' if not e else '    .env already exists')"
	@echo ""
	@echo "==> [6/6] Runtime validation..."
	@python scripts/remix-check.py 2>/dev/null || echo "    Run 'make remix-check' after setup for full validation"
	@echo ""
	@echo "================================"
	@echo "  Remix setup complete!"
	@echo "  Next: make remix-check — validate both runtimes"
	@echo "        make remix-demo  — render a combined demo"
	@echo "================================"

remix-check:
	@echo "==> Combined Runtime Validation"
	@python scripts/remix-check.py

remix-demo:
	@echo "==> Remix Demo — rendering combined Remotion + HyperFrames demo"
	@echo ""
	@python scripts/remix-demo.py

clean:
	python -c "import pathlib, shutil; [shutil.rmtree(p) for p in pathlib.Path('.').rglob('__pycache__')]; [p.unlink() for p in pathlib.Path('.').rglob('*.pyc')]"
