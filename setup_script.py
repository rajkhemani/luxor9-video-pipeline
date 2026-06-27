import subprocess
import sys
import os
def run_command(cmd, description):
    print(f"\n==> {description}...")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"    ✓ Success")
            if result.stdout.strip():
                print(f"    Output: {result.stdout.strip()}")
        else:
            print(f"    ✗ Failed (code: {result.returncode})")
            if result.stderr.strip():
                print(f"    Error: {result.stderr.strip()}")
        return result.returncode == 0
    except Exception as e:
        print(f"    ✗ Exception: {e}")
        return False
# Change to OpenMontage directory
os.chdir("E:/OpenMontage")
print("Working directory:", os.getcwd())
# Check Python version
print(f"\nPython version: {sys.version}")
# Step 1: Install Python dependencies
run_command("pip install -r requirements.txt", "Installing Python dependencies")
# Step 2: Check if Node.js is available
run_command("node --version", "Checking Node.js")
# Step 3: Install Remotion composer dependencies
run_command("cd remotion-composer && npm install", "Installing Remotion composer")
# Step 4: Install Piper TTS
run_command("pip install piper-tts", "Installing free offline TTS (Piper)")
# Step 5: Create .env file from example
if not os.path.exists(".env"):
    print("\n==> Creating .env from .env.example...")
    try:
        import shutil
        if os.path.exists(".env.example"):
            shutil.copy(".env.example", ".env")
            print("    ✓ Created .env")
        else:
            print("    ✗ .env.example not found")
    except Exception as e:
        print(f"    ✗ Failed to create .env: {e}")
else:
    print("\n==> .env already exists")
print("\n" + "="*50)
print("Setup complete! Next steps:")
print("1. Add API keys to .env file (optional)")
print("2. Open project in your AI coding assistant")
print("3. Try a simple prompt like:")
print('   "Make a 45-second animated explainer about why the sky is blue"')
print("="*50)