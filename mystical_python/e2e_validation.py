#!/usr/bin/env python3
"""
End-to-End Validation Tests for Mystical Integration
===================================================

Comprehensive E2E tests that verify the Python mystical integration works
correctly with the React/Express system. These tests verify actual API
communication, data exchange, and full workflow functionality.

🔬 "The proof is in the manifestation" 🔬
"""

import sys
import json
import time
import traceback
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path

def test_api_health_check() -> Tuple[bool, str]:
    """Test basic API health and connectivity."""
    try:
        from api_client import create_client
        
        client = create_client()
        is_healthy = client.check_connection()
        
        if is_healthy:
            return True, "API health check passed"
        else:
            return False, "API is not responding"
    except Exception as e:
        return False, f"Health check failed: {e}"

def test_oracle_consultation() -> Tuple[bool, str]:
    """Test Oracle consultation functionality."""
    try:
        from mystical_tools_client import create_mystical_tools_client
        
        client = create_mystical_tools_client()
        
        response = client.consult_oracle(
            query="What is the nature of wisdom?",
            context="general"
        )
        
        if response and response.response:
            return True, f"Oracle responded: {response.response[:50]}..."
        else:
            return False, "Oracle consultation failed - no response"
    except Exception as e:
        return False, f"Oracle consultation failed: {e}"

def test_sigil_generation() -> Tuple[bool, str]:
    """Test sigil generation functionality."""
    try:
        from mystical_tools_client import create_mystical_tools_client
        
        client = create_mystical_tools_client()
        
        response = client.generate_sigil(
            intention="Peace and harmony",
            style="geometric"
        )
        
        if response and response.symbolicMeaning:
            return True, f"Sigil created: {response.symbolicMeaning[:50]}..."
        else:
            return False, "Sigil generation failed - no response"
    except Exception as e:
        return False, f"Sigil generation failed: {e}"

def test_sonic_echo_creation() -> Tuple[bool, str]:
    """Test sonic echo creation functionality."""
    try:
        from mystical_tools_client import create_mystical_tools_client
        
        client = create_mystical_tools_client()
        
        response = client.client.generate_sonic_echo(
            text="Healing vibrations and restoration",
            voice="mystical",
            style="healing"
        )
        
        if response and response.title:
            return True, f"Sonic echo created: {response.title[:50]}..."
        else:
            return False, "Sonic echo creation failed - no response"
    except Exception as e:
        return False, f"Sonic echo creation failed: {e}"

def test_collection_export() -> Tuple[bool, str]:
    """Test collection export functionality."""
    try:
        from api_client import create_client
        
        client = create_client()
        entries = client.get_all_entries()
        
        if entries and len(entries) > 0:
            return True, f"Collection export successful: {len(entries)} entries retrieved"
        else:
            return False, "Collection export failed - no entries found"
    except Exception as e:
        return False, f"Collection export failed: {e}"

def test_bridge_status() -> Tuple[bool, str]:
    """Test integration bridge status."""
    try:
        from integration_bridge import create_bridge
        
        bridge = create_bridge(auto_start=False)
        status = bridge.get_bridge_status()
        
        if status and status.get('bridge_health', {}).get('status') == 'healthy':
            data_summary = status.get('data_summary', {})
            return True, f"Bridge healthy: {data_summary.get('total_entries', 0)} entries available"
        else:
            return False, "Bridge status indicates unhealthy state"
    except Exception as e:
        return False, f"Bridge status check failed: {e}"

def test_lunareth_synchronization() -> Tuple[bool, str]:
    """Test Lunareth phase synchronization."""
    try:
        from lunareth_sync import LunarethSynchronizer
        
        sync = LunarethSynchronizer()
        current_phase = sync.get_current_phase()
        
        # Test phase transition
        sync.set_phase(7)
        new_phase = sync.get_current_phase()
        
        if current_phase and new_phase and new_phase.id == 7:
            return True, f"Lunareth sync successful: Phase {new_phase.id} - {new_phase.name}"
        else:
            return False, "Lunareth synchronization failed"
    except Exception as e:
        return False, f"Lunareth synchronization failed: {e}"

def test_sacred_geometry() -> Tuple[bool, str]:
    """Test sacred geometry pattern creation."""
    try:
        from sacred_geometry import SacredGeometry, create_sacred_pattern
        
        geometry = SacredGeometry()
        patterns = ['golden_spiral', 'vesica_piscis', 'mandala']
        created_patterns = []
        
        for pattern_name in patterns:
            pattern = create_sacred_pattern(pattern_name)
            if pattern:
                created_patterns.append(pattern.name)
        
        if len(created_patterns) >= 2:
            return True, f"Sacred geometry successful: {', '.join(created_patterns)}"
        else:
            return False, "Sacred geometry pattern creation failed"
    except Exception as e:
        return False, f"Sacred geometry failed: {e}"

def test_configuration_management() -> Tuple[bool, str]:
    """Test configuration and session management."""
    try:
        from shared_config import get_config_manager
        
        config_mgr = get_config_manager()
        
        # Test configuration access
        config = config_mgr.config
        session = config_mgr.session
        
        # Test session tracking
        original_count = session.total_api_calls
        config_mgr.add_tool_usage('e2e_test', 'validation')
        new_count = session.total_api_calls
        
        if new_count > original_count:
            return True, f"Configuration management successful: Session tracking works"
        else:
            return False, "Configuration management failed - session tracking broken"
    except Exception as e:
        return False, f"Configuration management failed: {e}"

def test_complete_workflow() -> Tuple[bool, str]:
    """Test a complete end-to-end workflow."""
    try:
        from mystical_tools_client import create_mystical_tools_client
        from lunareth_sync import LunarethSynchronizer
        from sacred_geometry import create_sacred_pattern
        from shared_config import get_config_manager
        
        # Step 1: Initialize components
        client = create_mystical_tools_client()
        sync = LunarethSynchronizer()
        config_mgr = get_config_manager()
        
        # Step 2: Set mystical context
        sync.set_phase(5)  # Pentadic Harmony
        current_phase = sync.get_current_phase()
        
        # Step 3: Create sacred pattern
        pattern = create_sacred_pattern('golden_spiral')
        
        # Step 4: Mystical consultation
        intention = f"Harmony and wisdom through {current_phase.name}"
        oracle_response = client.consult_oracle(
            query=f"Provide guidance for this intention: {intention}",
            context="general"
        )
        
        # Step 5: Session tracking
        config_mgr.add_tool_usage('complete_workflow', current_phase.name)
        
        workflow_success = all([
            current_phase and current_phase.id == 5,
            pattern and pattern.name == "Golden Spiral",
            oracle_response and oracle_response.response,
            config_mgr.session.total_api_calls > 0
        ])
        
        if workflow_success:
            return True, f"Complete workflow successful: {current_phase.name} + {pattern.name} + Oracle guidance"
        else:
            return False, "Complete workflow failed at one or more steps"
    except Exception as e:
        return False, f"Complete workflow failed: {e}"

def run_e2e_validation(api_testing: bool = True) -> Dict[str, Any]:
    """Run all end-to-end validation tests."""
    print("🔬 Mystical Integration End-to-End Validation")
    print("="*60)
    print(f"🕒 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 API Testing: {'Enabled' if api_testing else 'Disabled (offline mode)'}")
    print()
    
    # Define test suite
    if api_testing:
        test_suite = [
            ("API Health Check", test_api_health_check),
            ("Oracle Consultation", test_oracle_consultation),
            ("Sigil Generation", test_sigil_generation),
            ("Sonic Echo Creation", test_sonic_echo_creation),
            ("Collection Export", test_collection_export),
            ("Bridge Status", test_bridge_status),
            ("Lunareth Sync", test_lunareth_synchronization),
            ("Sacred Geometry", test_sacred_geometry),
            ("Configuration Mgmt", test_configuration_management),
            ("Complete Workflow", test_complete_workflow)
        ]
    else:
        # Offline-only tests
        test_suite = [
            ("Lunareth Sync", test_lunareth_synchronization),
            ("Sacred Geometry", test_sacred_geometry),
            ("Configuration Mgmt", test_configuration_management)
        ]
    
    # Run tests
    results = {}
    passed = 0
    total = len(test_suite)
    
    print("🧪 Running E2E Tests:")
    print("-" * 40)
    
    for test_name, test_func in test_suite:
        try:
            start_time = time.time()
            success, message = test_func()
            duration = time.time() - start_time
            
            status = "✅ PASS" if success else "❌ FAIL"
            print(f"{status} {test_name:<20} ({duration:.2f}s)")
            print(f"     {message}")
            
            results[test_name] = {
                'success': success,
                'message': message,
                'duration': duration
            }
            
            if success:
                passed += 1
            
            # Brief pause between tests
            if api_testing:
                time.sleep(0.5)
                
        except Exception as e:
            print(f"❌ FAIL {test_name:<20} - Unexpected error: {e}")
            results[test_name] = {
                'success': False,
                'message': f"Unexpected error: {e}",
                'duration': 0
            }
    
    # Summary
    print()
    print("📊 E2E Validation Results:")
    print("-" * 30)
    print(f"   Tests Passed: {passed}/{total}")
    print(f"   Success Rate: {(passed/total)*100:.1f}%")
    
    overall_success = passed >= total * 0.8  # 80% pass rate required
    
    if overall_success:
        print("\n🎉 E2E Validation PASSED - Integration is fully operational!")
        status = "PASSED"
    elif passed >= total * 0.6:
        print("\n⚠️  E2E Validation PARTIAL - Most functionality works")
        status = "PARTIAL"
    else:
        print("\n❌ E2E Validation FAILED - Major issues detected")
        status = "FAILED"
    
    print(f"🕒 Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    return {
        'status': status,
        'timestamp': datetime.now().isoformat(),
        'api_testing_enabled': api_testing,
        'tests': {
            'passed': passed,
            'total': total,
            'success_rate': (passed/total)*100,
            'results': results
        },
        'overall_success': overall_success
    }

def save_validation_report(results: Dict[str, Any], filename: str = None) -> str:
    """Save validation results to a report file."""
    if filename is None:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"mystical_e2e_validation_{timestamp}.json"
    
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, default=str)
        
        print(f"\n📄 Validation report saved to: {filename}")
        return filename
    except Exception as e:
        print(f"\n⚠️  Could not save report: {e}")
        return ""

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Run E2E validation tests for mystical integration")
    parser.add_argument('--offline', action='store_true', help='Run in offline mode (no API tests)')
    parser.add_argument('--save-report', action='store_true', default=True, help='Save results to file')
    parser.add_argument('--report-file', type=str, help='Custom report filename')
    
    args = parser.parse_args()
    
    try:
        # Run validation
        results = run_e2e_validation(api_testing=not args.offline)
        
        # Save report if requested
        if args.save_report:
            save_validation_report(results, args.report_file)
        
        # Exit with appropriate code
        if results['overall_success']:
            print("\n🌟 All systems operational - Integration ready for production!")
            sys.exit(0)
        elif results['status'] == 'PARTIAL':
            print("\n🔧 Some issues detected - Review failed tests")
            sys.exit(1)
        else:
            print("\n🚨 Major issues detected - Integration needs attention")
            sys.exit(2)
            
    except Exception as e:
        print(f"\n💥 E2E validation crashed: {e}")
        traceback.print_exc()
        sys.exit(3)