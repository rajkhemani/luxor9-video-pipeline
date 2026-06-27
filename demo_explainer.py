import json
import os
from pathlib import Path
# Simple demonstration of OpenMontage zero-cost trial
print("="*60)
print("OpenMontage Zero-Cost Trial Demonstration")
print("Prompt: 'Make a 45-second animated explainer about why the sky is blue'")
print("="*60)
# Check environment
env_path = Path(".env")
if env_path.exists():
    print(f"\n✓ .env file exists at: {env_path.absolute()}")
    # Read first few lines to show structure
    with open(env_path, 'r') as f:
        lines = f.readlines()[:10]
        print("  Sample content:")
        for line in lines:
            if line.strip() and not line.strip().startswith("#"):
                print(f"    {line.strip()}")
else:
    print("\n✗ .env file not found")
    print("  Creating minimal .env for zero-cost trial...")
    env_content = """# OpenMontage - Minimal .env for zero-cost trial
# Add API keys as needed for additional capabilities
# Free TTS (Piper) - already installed
# No key needed
# Free stock media (optional free developer keys)
# PEXELS_API_KEY=your-key-here
# PIXABAY_API_KEY=your-key-here  
# UNSPLASH_ACCESS_KEY=your-key-here
# Cloud providers (optional - add if you have keys)
# FAL_KEY=your-key-here
# OPENAI_API_KEY=your-key-here
# ELEVENLABS_API_KEY=your-key-here
# SUNO_API_KEY=your-key-here
"""
    with open(env_path, 'w') as f:
        f.write(env_content)
    print(f"  ✓ Created minimal .env at: {env_path.absolute()}")
# Check available tools
print("\n🔧 Checking available tools...")
try:
    from tools.tool_registry import registry
    registry.discover()
    provider_menu = registry.provider_menu()
    print("✓ Tool registry initialized")
    
    # Count available providers by category
    categories = {}
    for category, providers in provider_menu.items():
        categories[category] = len(providers)
    
    print(f"  Available tool categories: {len(categories)}")
    for category, count in categories.items():
        print(f"    - {category}: {count} providers")
    
    # Check for free/local providers
    free_providers = []
    for category, providers in provider_menu.items():
        for provider in providers:
            if provider.get('tier') == 'free' or provider.get('provider') == 'local':
                free_providers.append(f"{category}: {provider.get('name')}")
    
    if free_providers:
        print(f"\n  Free/Local providers available:")
        for provider in free_providers[:5]:  # Show first 5
            print(f"    ✓ {provider}")
        if len(free_providers) > 5:
            print(f"    ... and {len(free_providers) - 5} more")
    
except ImportError as e:
    print(f"✗ Could not import tool registry: {e}")
    print("  Make sure you're in the OpenMontage directory")
except Exception as e:
    print(f"✗ Error checking tools: {e}")
# Pipeline demonstration
print("\n🎬 Available Pipelines for Zero-Cost Trial:")
pipelines = [
    ("animated-explainer", "AI-generated explainer with narration & visuals"),
    ("documentary-montage", "Real footage from free archives"),
    ("animation", "Motion graphics & kinetic typography"),
    ("character-animation", "Local SVG character animation"),
]
for pipeline_name, description in pipelines:
    pipeline_path = Path(f"pipeline_defs/{pipeline_name}.yaml")
    if pipeline_path.exists():
        print(f"  ✓ {pipeline_name}: {description}")
    else:
        print(f"  ✗ {pipeline_name}: Pipeline definition not found")
# Next steps
print("\n🚀 Next Steps for Zero-Cost Trial:")
print("1. Open this project in your AI coding assistant (Claude Code, Cursor, etc.)")
print("2. Use this exact prompt:")
print('   "Make a 45-second animated explainer about why the sky is blue"')
print("3. The agent will:")
print("   - Research the topic using free web search")
print("   - Write a script with narration cues")
print("   - Generate visuals using free image sources")
print("   - Use Piper TTS for free narration")
print("   - Compose the video using Remotion")
print("4. No API keys needed for this workflow!")
print("\n📝 Alternative prompts to try:")
print('   - "Create a 60-second video about the history of the internet"')
print('   - "Make a data-driven explainer about coffee consumption worldwide"')
print('   - "Make a 90-second documentary montage about city life at 4am"')
print("="*60)