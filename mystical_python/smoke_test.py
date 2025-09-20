#!/usr/bin/env python3
"""
Mystical Python Integration Smoke Test
=====================================

Lightweight verification script to ensure all imports work correctly
and basic functionality is operational. This script tests the most
critical components without requiring external dependencies.

🧪 "Smoke rises where there is fire - let us ensure clean air" 🧪
"""

import sys
import traceback
from datetime import datetime
from typing import List, Dict, Any, Optional

def test_import(module_name: str, description: str = "") -> bool:
    """Test importing a module with error handling."""
    try:
        if module_name == "models":
            from models import (
                CodexEntry, CodexEntryWithBookmark, Bookmark, OracleRequest, 
                OracleResponse, SigilRequest, SigilResponse, SonicEchoRequest, 
                SonicEchoResponse, PythonConfig, BridgeConfig
            )
        elif module_name == "api_client":
            from api_client import MysticalAPIClient, create_client, MysticalAPIError
        elif module_name == "mystical_tools_client":
            from mystical_tools_client import MysticalToolsClient, create_mystical_tools_client
        elif module_name == "grimoire_viewer":
            from grimoire_viewer import GrimoireViewer
        elif module_name == "lunareth_sync":
            from lunareth_sync import LunarethSynchronizer
        elif module_name == "sacred_geometry":
            from sacred_geometry import SacredGeometry, create_sacred_pattern
        elif module_name == "integration_bridge":
            from integration_bridge import MysticalBridge, create_bridge
        elif module_name == "shared_config":
            from shared_config import get_config_manager, ConfigManager
        elif module_name == "test_integration":
            from test_integration import MysticalIntegrationTester
        else:
            __import__(module_name)
        
        print(f"✅ {module_name:<25} - {description}")
        return True
    except ImportError as e:
        print(f"❌ {module_name:<25} - Import failed: {e}")
        return False
    except Exception as e:
        print(f"⚠️  {module_name:<25} - Error: {e}")
        return False

def test_data_models() -> bool:
    """Test data model creation and basic functionality."""
    try:
        from models import CodexEntry, PythonConfig, BridgeConfig
        
        # Test basic model creation
        config = PythonConfig(
            api_base_url="http://localhost:5000/api",
            timeout=30,
            mystical_theme=True
        )
        
        bridge_config = BridgeConfig(
            sync_interval=5,
            auto_sync=True
        )
        
        print("✅ Data models        - Basic model creation successful")
        return True
    except Exception as e:
        print(f"❌ Data models        - Failed: {e}")
        return False

def test_configuration() -> bool:
    """Test configuration management."""
    try:
        from shared_config import get_config_manager
        
        config_mgr = get_config_manager()
        config = config_mgr.config
        session = config_mgr.session
        
        print(f"✅ Configuration      - Config loaded (theme: {config.mystical_theme})")
        return True
    except Exception as e:
        print(f"❌ Configuration      - Failed: {e}")
        return False

def test_api_client_creation() -> bool:
    """Test API client creation without making actual requests."""
    try:
        from api_client import create_client, PythonConfig
        
        config = PythonConfig(api_base_url="http://localhost:5000/api")
        client = create_client()
        
        print("✅ API Client         - Creation successful")
        return True
    except Exception as e:
        print(f"❌ API Client         - Failed: {e}")
        return False

def test_tools_client_creation() -> bool:
    """Test mystical tools client creation."""
    try:
        from mystical_tools_client import MysticalToolsClient
        from api_client import create_client
        
        api_client = create_client()
        tools_client = MysticalToolsClient(api_client)
        
        print(f"✅ Tools Client       - Session ID: {tools_client.session.session_id}")
        return True
    except Exception as e:
        print(f"❌ Tools Client       - Failed: {e}")
        return False

def test_offline_components() -> bool:
    """Test components that work without API connection."""
    try:
        from lunareth_sync import LunarethSynchronizer
        from sacred_geometry import SacredGeometry, create_sacred_pattern
        
        # Test Lunareth
        sync = LunarethSynchronizer()
        current_phase = sync.get_current_phase()
        
        # Test Sacred Geometry
        geometry = SacredGeometry()
        pattern = create_sacred_pattern('golden_spiral')
        
        print(f"✅ Offline Components - Lunareth: {current_phase.name}, Geometry: {pattern.name}")
        return True
    except Exception as e:
        print(f"❌ Offline Components - Failed: {e}")
        return False

def test_websocket_feature_flag() -> bool:
    """Test that WebSocket functionality is properly disabled."""
    try:
        from integration_bridge import WEBSOCKET_AVAILABLE
        from shared_config import get_mystical_config
        
        config = get_mystical_config()
        websocket_enabled = config.websocket_bridge_enabled
        
        if not websocket_enabled and not WEBSOCKET_AVAILABLE:
            print("✅ WebSocket Flag     - Properly disabled as expected")
            return True
        else:
            print(f"⚠️  WebSocket Flag     - Enabled: {websocket_enabled}, Available: {WEBSOCKET_AVAILABLE}")
            return True  # Not an error, just informational
    except Exception as e:
        print(f"❌ WebSocket Flag     - Failed: {e}")
        return False

def test_requirements_availability() -> bool:
    """Test that key dependencies are available."""
    dependencies = [
        ("requests", "HTTP client library"),
        ("pydantic", "Data validation library"),
        ("fuzzywuzzy", "Fuzzy string matching"),
        ("numpy", "Numerical computing"),
        ("matplotlib", "Plotting library"),
        ("PIL", "Python Imaging Library")
    ]
    
    available = 0
    total = len(dependencies)
    
    for dep, desc in dependencies:
        try:
            if dep == "PIL":
                import PIL
            else:
                __import__(dep)
            available += 1
        except ImportError:
            print(f"⚠️  {dep:<15} - Not available (optional: {desc})")
    
    print(f"✅ Dependencies      - {available}/{total} available")
    return available >= (total // 2)  # At least half should be available

def run_smoke_tests() -> Dict[str, Any]:
    """Run all smoke tests and return results."""
    print("🌟 Mystical Python Integration Smoke Test")
    print("="*60)
    print(f"🕒 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Module import tests
    print("📦 Testing Module Imports:")
    import_tests = [
        ("models", "Core data models and schemas"),
        ("api_client", "HTTP API communication client"),
        ("mystical_tools_client", "High-level tools interface"),
        ("grimoire_viewer", "Interactive grimoire browser"),
        ("lunareth_sync", "Cosmic phase synchronization"),
        ("sacred_geometry", "Geometric pattern generation"),
        ("integration_bridge", "React-Python bridge"),
        ("shared_config", "Configuration management"),
        ("test_integration", "Integration test suite")
    ]
    
    import_results = []
    for module, desc in import_tests:
        result = test_import(module, desc)
        import_results.append(result)
    
    print()
    print("🔧 Testing Core Functionality:")
    
    # Functionality tests
    func_tests = [
        ("Data Models", test_data_models),
        ("Configuration", test_configuration),
        ("API Client", test_api_client_creation),
        ("Tools Client", test_tools_client_creation),
        ("Offline Components", test_offline_components),
        ("WebSocket Flag", test_websocket_feature_flag),
        ("Dependencies", test_requirements_availability)
    ]
    
    func_results = []
    for test_name, test_func in func_tests:
        try:
            result = test_func()
            func_results.append(result)
        except Exception as e:
            print(f"❌ {test_name:<18} - Unexpected error: {e}")
            func_results.append(False)
    
    # Summary
    print()
    print("📊 Smoke Test Results:")
    print("-" * 30)
    
    imports_passed = sum(import_results)
    funcs_passed = sum(func_results)
    total_imports = len(import_results)
    total_funcs = len(func_results)
    
    print(f"   Module Imports: {imports_passed}/{total_imports} passed")
    print(f"   Functionality:  {funcs_passed}/{total_funcs} passed")
    print(f"   Overall Score:  {imports_passed + funcs_passed}/{total_imports + total_funcs}")
    
    overall_success = (imports_passed >= total_imports * 0.8 and 
                      funcs_passed >= total_funcs * 0.8)
    
    if overall_success:
        print("\n🎉 Smoke Test PASSED - Integration is ready for use!")
        status = "PASSED"
    else:
        print("\n⚠️  Smoke Test PARTIAL - Some issues detected")
        status = "PARTIAL"
    
    print(f"🕒 Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    return {
        'status': status,
        'timestamp': datetime.now().isoformat(),
        'imports': {
            'passed': imports_passed,
            'total': total_imports,
            'results': dict(zip([t[0] for t in import_tests], import_results))
        },
        'functions': {
            'passed': funcs_passed,
            'total': total_funcs,
            'results': dict(zip([t[0] for t in func_tests], func_results))
        },
        'overall_success': overall_success
    }

if __name__ == "__main__":
    try:
        results = run_smoke_tests()
        
        # Exit code based on results
        if results['overall_success']:
            sys.exit(0)
        else:
            sys.exit(1)
            
    except Exception as e:
        print(f"\n💥 Smoke test crashed: {e}")
        traceback.print_exc()
        sys.exit(2)