#!/usr/bin/env python3
"""
Mystical Python Integration - Install and Run Script
===================================================

One-command setup and execution script for the mystical Python integration.
This script installs all dependencies and runs the complete test suite.

🚀 "One command to rule them all" 🚀
"""

import sys
import subprocess
import os
from pathlib import Path

def run_command(command, description="", check=True):
    """Run a command with error handling."""
    print(f"🔧 {description}")
    print(f"   Command: {command}")
    
    try:
        result = subprocess.run(command, shell=True, check=check, capture_output=True, text=True)
        if result.stdout:
            print(f"   Output: {result.stdout.strip()}")
        return result.returncode == 0
    except subprocess.CalledProcessError as e:
        print(f"   ❌ Error: {e}")
        if e.stderr:
            print(f"   Stderr: {e.stderr.strip()}")
        return False

def check_python_version():
    """Check if Python version is compatible."""
    python_version = sys.version_info
    if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
        print("❌ Python 3.8+ is required")
        return False
    
    print(f"✅ Python {python_version.major}.{python_version.minor}.{python_version.micro} detected")
    return True

def install_dependencies():
    """Install Python dependencies."""
    print("\n📦 Installing Python Dependencies...")
    
    # Check if pip is available
    if not run_command("pip --version", "Checking pip availability", check=False):
        print("❌ pip is not available")
        return False
    
    # Install requirements
    requirements_file = Path(__file__).parent / "requirements.txt"
    if requirements_file.exists():
        success = run_command(f"pip install -r {requirements_file}", "Installing requirements")
        if not success:
            print("⚠️  Some dependencies may have failed to install")
    else:
        print("⚠️  requirements.txt not found, installing core dependencies")
        core_deps = [
            "requests>=2.31.0",
            "pydantic>=2.5.0", 
            "fuzzywuzzy[speedup]>=0.18.0",
            "python-levenshtein>=0.21.1",
            "numpy>=1.24.0",
            "matplotlib>=3.7.0",
            "pillow>=10.0.0",
            "pyyaml>=6.0.1"
        ]
        for dep in core_deps:
            run_command(f"pip install {dep}", f"Installing {dep}", check=False)
    
    return True

def check_server_connectivity():
    """Check if the React/Express server is running."""
    print("\n🌐 Checking Server Connectivity...")
    
    try:
        import requests
        response = requests.get("http://localhost:5000/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ Server is running and accessible")
            return True
        else:
            print(f"⚠️  Server responded with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Server not accessible: {e}")
        print("   Please ensure the React/Express server is running on port 5000")
        return False

def run_smoke_tests():
    """Run smoke tests."""
    print("\n🧪 Running Smoke Tests...")
    return run_command("python smoke_test.py", "Executing smoke tests", check=False)

def run_e2e_tests():
    """Run E2E tests."""
    print("\n🔬 Running End-to-End Tests...")
    return run_command("python e2e_validation.py", "Executing E2E validation", check=False)

def run_integration_tests():
    """Run full integration test suite."""
    print("\n🧪 Running Integration Test Suite...")
    return run_command("python test_integration.py", "Executing integration tests", check=False)

def main():
    """Main execution flow."""
    print("🌟 Mystical Python Integration - Install and Run")
    print("="*55)
    
    # Change to script directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    print(f"📁 Working directory: {script_dir}")
    
    # Check prerequisites
    if not check_python_version():
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies():
        print("❌ Failed to install dependencies")
        sys.exit(1)
    
    # Check server connectivity
    server_available = check_server_connectivity()
    
    # Run tests
    print("\n🧪 Running Test Suite...")
    print("-" * 30)
    
    # Always run smoke tests (they work offline)
    smoke_success = run_smoke_tests()
    
    # Run E2E tests (they handle API quota gracefully now)
    e2e_success = run_e2e_tests()
    
    # Run integration tests if everything looks good
    integration_success = True
    if smoke_success and e2e_success:
        integration_success = run_integration_tests()
    
    # Summary
    print("\n📊 Test Results Summary:")
    print("-" * 30)
    print(f"✅ Smoke Tests:      {'PASSED' if smoke_success else 'FAILED'}")
    print(f"✅ E2E Tests:        {'PASSED' if e2e_success else 'FAILED'}")
    print(f"✅ Integration Tests: {'PASSED' if integration_success else 'FAILED'}")
    print(f"✅ Server Available:  {'YES' if server_available else 'NO'}")
    
    # Overall status
    all_passed = smoke_success and e2e_success and integration_success
    if all_passed:
        print("\n🎉 ALL TESTS PASSED - Integration is production ready!")
        print("🚀 The mystical Python integration is fully operational.")
    else:
        print("\n⚠️  Some tests failed - Review the output above")
        print("🔧 The integration may still work with graceful degradation")
    
    # Usage instructions
    print("\n📖 Usage Instructions:")
    print("   python mystical_main.py --help          # View all options")
    print("   python mystical_main.py demo            # Run system demo")
    print("   python mystical_main.py test --mode both # Run all tests")
    print("   python mystical_main.py grimoire        # Launch grimoire viewer")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print("\n🌙 Installation interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)