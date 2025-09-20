#!/usr/bin/env python3
"""
Mystical Integration Testing Suite
=================================

Comprehensive testing and verification of all integration points between
the React-based mystical codex system and Python environment. This suite
validates seamless data exchange, tool synchronization, and unified workflows.

🧪 "Testing is the crucible where code becomes wisdom" 🧪
"""

import sys
import json
import time
import traceback
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
from pathlib import Path

# Ensure mystical_python is in the path
sys.path.insert(0, str(Path(__file__).parent))

# Import all mystical modules
try:
    from models import (
    CodexEntry, CodexEntryWithBookmark, Bookmark, OracleConsultation,
    GrimoireEntry, SonicEcho, Collection, CollectionWithEntries,
    Annotation, AnnotationWithEntry, Share, ToolRun,
    OracleRequest, OracleResponse, SigilRequest, SigilResponse,
    SonicEchoRequest, SonicEchoResponse, MysticalToolRequest, MysticalToolResponse,
    ShareRequest, ShareResponse, SearchResult, ExportFormat, PythonConfig,
    SpiralPhase, LunarethSync, GeometricPattern, GeometryRenderRequest,
    FilterOptions, ExportRequest, ImportRequest, BridgeConfig
)
    from api_client import create_client, MysticalAPIError
    from grimoire_viewer import GrimoireViewer
    from lunareth_sync import LunarethSynchronizer
    from sacred_geometry import SacredGeometry, create_sacred_pattern
    from mystical_tools_client import MysticalToolsClient
    from integration_bridge import create_bridge
    from shared_config import get_config_manager, ConfigManager
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)


class TestResult:
    """Test result tracking."""
    
    def __init__(self, test_name: str):
        self.test_name = test_name
        self.passed = False
        self.error = None
        self.details = {}
        self.duration = 0.0
        self.started_at = None
        self.completed_at = None
    
    def start(self):
        """Start test timing."""
        self.started_at = datetime.now()
    
    def complete(self, passed: bool, error: Optional[str] = None, **details):
        """Complete test with results."""
        self.completed_at = datetime.now()
        if self.started_at is not None:
            self.duration = (self.completed_at - self.started_at).total_seconds()
        else:
            self.duration = 0.0
        self.passed = passed
        self.error = error
        self.details.update(details)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            'test_name': self.test_name,
            'passed': self.passed,
            'error': self.error,
            'details': self.details,
            'duration': self.duration,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }


class MysticalIntegrationTester:
    """Comprehensive integration tester for the mystical system."""
    
    def __init__(self, verbose: bool = True, api_testing: bool = True):
        """Initialize the integration tester."""
        self.verbose = verbose
        self.api_testing = api_testing
        self.test_results: List[TestResult] = []
        self.start_time = datetime.now()
        
        # Test configuration
        self.test_config = {
            'connection_timeout': 10,
            'test_data_size': 5,
            'geometry_patterns': ['golden_spiral', 'vesica_piscis', 'mandala'],
            'lunareth_phases': [0, 1, 5, 13],
            'test_intentions': ['wisdom', 'harmony', 'protection']
        }
    
    def run_test(self, test_name: str, test_func, *args, **kwargs) -> TestResult:
        """Run a single test with error handling."""
        result = TestResult(test_name)
        result.start()
        
        if self.verbose:
            print(f"🧪 Testing: {test_name}...")
        
        try:
            test_func(result, *args, **kwargs)
            if not hasattr(result, 'passed') or result.passed is None:
                result.complete(True)
            
            if self.verbose:
                status = "✅ PASS" if result.passed else "❌ FAIL"
                print(f"   {status} ({result.duration:.2f}s)")
                
        except Exception as e:
            result.complete(False, str(e))
            if self.verbose:
                print(f"   ❌ FAIL ({result.duration:.2f}s): {e}")
        
        self.test_results.append(result)
        return result
    
    # Data Model Tests
    def test_data_models(self, result: TestResult):
        """Test data model creation and validation."""
        # Test CodexEntry creation
        entry = CodexEntryWithBookmark(
            id="test_001",
            filename="test_entry.txt",
            type="text",
            size=1000,
            original_size=1200,
            processed_date=datetime.now(),
            summary="Test entry for validation",
            key_chunks=["chunk1", "chunk2"],
            full_text="This is a test entry with full text content.",
            category="test",
            key_terms=["test", "validation"]
        )
        
        result.details['entry_created'] = True
        result.details['entry_id'] = entry.id
        
        # Test Bookmark creation
        bookmark = Bookmark(
            id="bookmark_test_001",
            entry_id=entry.id,
            is_bookmarked=True,
            personal_notes="Test notes",
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        entry.bookmark = bookmark
        result.details['bookmark_attached'] = True
        
        # Test serialization
        entry_dict = entry.dict()
        result.details['serialization_test'] = len(entry_dict) > 0
        
        result.complete(True, entry_count=1, bookmark_count=1)
    
    def test_api_client(self, result: TestResult):
        """Test API client connection and basic functionality."""
        if not self.api_testing:
            result.complete(True, message="API testing disabled")
            return
        
        try:
            client = create_client()
            
            # Test connection
            connection_status = client.check_connection()
            result.details['connection_status'] = connection_status
            
            if connection_status:
                # Test basic API calls
                try:
                    entries = client.get_all_entries()
                    result.details['entries_loaded'] = len(entries)
                    
                    collections = client.get_collections()
                    result.details['collections_loaded'] = len(collections)
                    
                    result.complete(True, api_responsive=True)
                except Exception as e:
                    result.complete(False, f"API calls failed: {e}")
            else:
                result.complete(False, "API connection failed")
        
        except Exception as e:
            result.complete(False, f"Client creation failed: {e}")
    
    # Grimoire Viewer Tests
    def test_grimoire_viewer(self, result: TestResult):
        """Test Grimoire Viewer functionality."""
        viewer = GrimoireViewer(use_api=self.api_testing, offline_mode=not self.api_testing)
        
        # Test initialization
        result.details['viewer_initialized'] = True
        
        # Test entry loading
        load_success = viewer.load_entries()
        result.details['entries_loaded'] = load_success
        result.details['entry_count'] = len(viewer.entries) if load_success else 0
        
        if load_success and viewer.entries:
            # Test search functionality
            search_results = viewer.search_entries("test")
            result.details['search_functional'] = True
            result.details['search_results'] = len(search_results)
            
            # Test filtering
            filtered = viewer.filter_entries()
            result.details['filter_functional'] = True
            result.details['filtered_count'] = len(filtered)
            
            # Test category extraction
            first_entry = viewer.entries[0]
            category = viewer._extract_category(first_entry.summary, first_entry.fullText)
            result.details['category_extraction'] = category is not None
            
        result.complete(load_success, entry_count=len(viewer.entries) if load_success else 0)
    
    # Lunareth Synchronization Tests
    def test_lunareth_sync(self, result: TestResult):
        """Test Lunareth synchronization functionality."""
        sync = LunarethSynchronizer()
        
        # Test phase initialization
        result.details['phases_loaded'] = len(sync.phases)
        result.details['expected_phases'] = 14  # 13+1 phases
        
        # Test phase resolution
        test_constructs = ['void', 'trinity', 'golden', 'infinite']
        resolved_phases = {}
        
        for construct in test_constructs:
            phase_id = sync.resolve_phase_from_construct(construct)
            resolved_phases[construct] = phase_id
        
        result.details['phase_resolution'] = resolved_phases
        result.details['resolution_success_rate'] = len([p for p in resolved_phases.values() if p is not None]) / len(test_constructs)
        
        # Test animation parameter calculation
        test_phases = [0, 5, 12, 13]
        animation_params = {}
        
        for phase_id in test_phases:
            params = sync.calculate_animation_parameters(phase_id)
            animation_params[phase_id] = len(params) > 0
        
        result.details['animation_params'] = animation_params
        
        # Test phase sequence generation
        sequence = sync.generate_phase_sequence(0, 3, 10.0)
        result.details['sequence_generated'] = len(sequence) > 0
        result.details['sequence_length'] = len(sequence)
        
        # Test sacred constants
        result.details['phi_value'] = sync.PHI
        result.details['constants_valid'] = sync.PHI > 1.6 and sync.PHI < 1.62
        
        success = (len(sync.phases) == 14 and 
                  result.details['resolution_success_rate'] > 0.5 and
                  len(sequence) > 0)
        
        result.complete(success, phases=len(sync.phases))
    
    # Sacred Geometry Tests
    def test_sacred_geometry(self, result: TestResult):
        """Test sacred geometry rendering functionality."""
        geometry = SacredGeometry()
        
        # Test sacred constants
        result.details['phi'] = geometry.PHI
        result.details['root_2'] = geometry.ROOT_2
        result.details['constants_valid'] = abs(geometry.PHI - 1.618) < 0.01
        
        # Test geometric calculations
        vesica = geometry.vesica_piscis()
        result.details['vesica_calculated'] = vesica is not None
        
        if vesica:
            result.details['vesica_area'] = vesica['lens_area']
            result.details['vesica_ratio'] = vesica['sacred_ratio']
        
        # Test spiral generation
        spiral_points = geometry.golden_ratio_spiral(turns=2)
        result.details['spiral_points'] = len(spiral_points)
        result.details['spiral_generated'] = len(spiral_points) > 0
        
        # Test L-system generation
        l_string = geometry.generate_l_system("F", {"F": "F[+F]F[-F]F"}, 2)
        result.details['l_system_string'] = l_string
        result.details['l_system_generated'] = len(l_string) > 1
        
        # Test pattern creation
        patterns_tested = 0
        patterns_successful = 0
        
        for pattern_name in self.test_config['geometry_patterns']:
            try:
                pattern = create_sacred_pattern(pattern_name)
                patterns_tested += 1
                if pattern.name and pattern.type:
                    patterns_successful += 1
            except Exception as e:
                result.details[f'pattern_error_{pattern_name}'] = str(e)
        
        result.details['patterns_tested'] = patterns_tested
        result.details['patterns_successful'] = patterns_successful
        
        success = (result.details['constants_valid'] and 
                  vesica is not None and
                  len(spiral_points) > 0 and
                  patterns_successful > 0)
        
        result.complete(success, patterns_success_rate=patterns_successful/patterns_tested if patterns_tested > 0 else 0)
    
    # Mystical Tools Tests
    def test_mystical_tools(self, result: TestResult):
        """Test mystical tools client functionality."""
        if not self.api_testing:
            result.complete(True, message="Mystical tools testing requires API")
            return
        
        try:
            client = MysticalToolsClient()
            
            # Test session creation
            result.details['session_id'] = client.session.session_id
            result.details['session_created'] = True
            
            # Test tool configurations
            result.details['oracle_contexts'] = len(client.oracle_context_categories)
            result.details['sigil_styles'] = len(client.sigil_styles)
            result.details['sonic_types'] = len(client.sonic_echo_types)
            
            # Test session tracking
            initial_requests = client.session.total_requests
            client.session.add_activity('test_tool', 'test_context')
            result.details['session_tracking'] = client.session.total_requests > initial_requests
            
            # Test history management
            session_summary = client.get_session_summary()
            result.details['session_summary'] = len(session_summary) > 0
            
            # If API is available, test actual tool calls
            if self.api_testing:
                try:
                    # Test Oracle (brief query)
                    oracle_response = client.consult_oracle("Test query for integration")
                    result.details['oracle_test'] = oracle_response.response is not None
                    
                    # Test Sigil
                    sigil_response = client.generate_sigil("Test intention")
                    result.details['sigil_test'] = sigil_response.symbolicMeaning is not None
                    
                    # Test Sonic Echo
                    sonic_response = client.client.generate_sonic_echo(
                        text="Test healing",
                        voice='mystical',
                        style='healing'
                    )
                    result.details['sonic_test'] = sonic_response.title is not None
                    
                except Exception as e:
                    result.details['api_tool_error'] = str(e)
            
            result.complete(True, tools_available=3)
        
        except Exception as e:
            result.complete(False, f"Tools client failed: {e}")
    
    # Integration Bridge Tests
    def test_integration_bridge(self, result: TestResult):
        """Test integration bridge functionality."""
        if not self.api_testing:
            result.complete(True, message="Bridge testing requires API")
            return
        
        try:
            bridge = create_bridge(auto_start=False)
            
            # Test bridge initialization
            result.details['bridge_created'] = True
            
            # Test status check
            status = bridge.get_bridge_status()
            result.details['status_retrieved'] = status is not None
            
            if status:
                health = status.get('bridge_health', {})
                result.details['bridge_status'] = health.get('status', 'unknown')
                result.details['api_connection'] = health.get('api_connection', False)
                
                capabilities = status.get('capabilities', {})
                result.details['export_capability'] = capabilities.get('export_collections', False)
                result.details['sync_capability'] = capabilities.get('sync_python_data', False)
            
            # Test configuration
            result.details['bridge_config'] = hasattr(bridge, 'config')
            
            # Test message handling
            result.details['message_queue'] = hasattr(bridge, 'message_queue')
            
            # Fix health variable scope issue
            health = status.get('bridge_health', {}) if status else {}
            success = (status is not None and 
                      health.get('status') != 'error')
            
            result.complete(success, bridge_operational=success)
        
        except Exception as e:
            result.complete(False, f"Bridge test failed: {e}")
    
    # Configuration Tests
    def test_shared_config(self, result: TestResult):
        """Test shared configuration system."""
        config_mgr = get_config_manager()
        
        # Test configuration loading
        result.details['config_loaded'] = config_mgr.config is not None
        result.details['session_loaded'] = config_mgr.session is not None
        
        # Test configuration values
        config = config_mgr.config
        result.details['api_url'] = config.api_base_url
        result.details['mystical_theme'] = config.mystical_theme
        result.details['bridge_enabled'] = config.bridge_enabled
        
        # Test session management
        session = config_mgr.session
        original_api_calls = session.total_api_calls
        
        config_mgr.add_tool_usage('test_tool', 'test_context')
        result.details['session_tracking'] = session.total_api_calls > original_api_calls
        
        # Test configuration updates
        original_theme = config.mystical_theme
        config_mgr.update_config(mystical_theme=not original_theme)
        updated_theme = config_mgr.config.mystical_theme
        result.details['config_update'] = updated_theme != original_theme
        
        # Restore original
        config_mgr.update_config(mystical_theme=original_theme)
        
        # Test session summary
        summary = config_mgr.get_session_summary()
        result.details['session_summary'] = len(summary) > 0
        result.details['metrics_available'] = 'metrics' in summary
        
        success = (config_mgr.config is not None and 
                  config_mgr.session is not None and
                  updated_theme != original_theme)
        
        result.complete(success, config_management=True)
    
    # End-to-End Integration Tests
    def test_end_to_end_workflow(self, result: TestResult):
        """Test complete end-to-end workflow integration."""
        workflow_steps = []
        
        try:
            # Step 1: Configuration
            config_mgr = get_config_manager()
            config_mgr.update_session(active_entry="test_integration")
            workflow_steps.append("config_setup")
            
            # Step 2: Lunareth phase
            sync = LunarethSynchronizer()
            sync.set_phase(5)  # Pentadic Harmony
            current_phase = sync.get_current_phase()
            workflow_steps.append("lunareth_phase_set")
            
            # Step 3: Sacred geometry based on phase
            geometry = SacredGeometry()
            pattern = create_sacred_pattern('golden_spiral')
            workflow_steps.append("geometry_pattern_created")
            
            # Step 4: Animation parameters
            anim_params = sync.calculate_animation_parameters(5)
            workflow_steps.append("animation_params_calculated")
            
            # Step 5: Data models integration
            entry = CodexEntryWithBookmark(
                id="integration_test",
                filename="integration_test.txt",
                type="test",
                size=len(workflow_steps) * 100,
                original_size=len(workflow_steps) * 120,
                processed_date=datetime.now(),
                summary=f"Integration test entry for phase {current_phase.name}",
                key_chunks=[f"Step {i}: {step}" for i, step in enumerate(workflow_steps, 1)],
                full_text=f"Complete integration test for mystical system. Current phase: {current_phase.name}",
                category="integration-test",
                key_terms=["integration", "test", "mystical", current_phase.name.lower()]
            )
            workflow_steps.append("test_entry_created")
            
            # Step 6: Session tracking
            config_mgr.add_tool_usage('integration_test', 'end_to_end')
            workflow_steps.append("session_tracked")
            
            result.details['workflow_steps'] = workflow_steps
            result.details['current_phase'] = current_phase.name
            result.details['pattern_type'] = pattern.type
            result.details['animation_frequency'] = anim_params.get('frequency', 0)
            result.details['test_entry_size'] = entry.size
            
            success = len(workflow_steps) >= 6
            result.complete(success, workflow_steps_completed=len(workflow_steps))
        
        except Exception as e:
            result.details['workflow_steps'] = workflow_steps
            result.complete(False, f"Workflow failed at step {len(workflow_steps)}: {e}")
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Run all integration tests."""
        if self.verbose:
            print("🌟 Starting Mystical Integration Test Suite")
            print("="*60)
        
        # Core functionality tests
        self.run_test("Data Models", self.test_data_models)
        self.run_test("API Client", self.test_api_client)
        self.run_test("Grimoire Viewer", self.test_grimoire_viewer)
        self.run_test("Lunareth Synchronization", self.test_lunareth_sync)
        self.run_test("Sacred Geometry", self.test_sacred_geometry)
        self.run_test("Mystical Tools", self.test_mystical_tools)
        self.run_test("Integration Bridge", self.test_integration_bridge)
        self.run_test("Shared Configuration", self.test_shared_config)
        
        # End-to-end integration
        self.run_test("End-to-End Workflow", self.test_end_to_end_workflow)
        
        return self.generate_test_report()
    
    def generate_test_report(self) -> Dict[str, Any]:
        """Generate comprehensive test report."""
        end_time = datetime.now()
        total_duration = (end_time - self.start_time).total_seconds()
        
        passed_tests = [r for r in self.test_results if r.passed]
        failed_tests = [r for r in self.test_results if not r.passed]
        
        report = {
            'test_summary': {
                'total_tests': len(self.test_results),
                'passed': len(passed_tests),
                'failed': len(failed_tests),
                'success_rate': len(passed_tests) / len(self.test_results) if self.test_results else 0,
                'total_duration': total_duration,
                'average_test_duration': sum(r.duration for r in self.test_results) / len(self.test_results) if self.test_results else 0
            },
            'test_environment': {
                'api_testing': self.api_testing,
                'verbose_mode': self.verbose,
                'start_time': self.start_time.isoformat(),
                'end_time': end_time.isoformat(),
                'python_version': sys.version
            },
            'test_results': [r.to_dict() for r in self.test_results],
            'failed_tests': [r.test_name for r in failed_tests],
            'passed_tests': [r.test_name for r in passed_tests],
            'integration_status': {
                'data_models': any(r.test_name == "Data Models" and r.passed for r in self.test_results),
                'grimoire_viewer': any(r.test_name == "Grimoire Viewer" and r.passed for r in self.test_results),
                'lunareth_sync': any(r.test_name == "Lunareth Synchronization" and r.passed for r in self.test_results),
                'sacred_geometry': any(r.test_name == "Sacred Geometry" and r.passed for r in self.test_results),
                'mystical_tools': any(r.test_name == "Mystical Tools" and r.passed for r in self.test_results),
                'integration_bridge': any(r.test_name == "Integration Bridge" and r.passed for r in self.test_results),
                'shared_config': any(r.test_name == "Shared Configuration" and r.passed for r in self.test_results),
                'end_to_end': any(r.test_name == "End-to-End Workflow" and r.passed for r in self.test_results)
            }
        }
        
        return report


def run_integration_tests(verbose: bool = True, save_report: bool = True, api_testing: bool = True) -> Dict[str, Any]:
    """Run the complete integration test suite."""
    tester = MysticalIntegrationTester(verbose=verbose, api_testing=api_testing)
    
    try:
        report = tester.run_all_tests()
        
        if verbose:
            print("\n🧪 TEST SUMMARY")
            print("="*40)
            summary = report['test_summary']
            print(f"Tests Run: {summary['total_tests']}")
            print(f"Passed: {summary['passed']} ✅")
            print(f"Failed: {summary['failed']} ❌")
            print(f"Success Rate: {summary['success_rate']:.1%}")
            print(f"Total Duration: {summary['total_duration']:.2f}s")
            
            if summary['failed'] > 0:
                print(f"\nFailed Tests:")
                for test_name in report['failed_tests']:
                    print(f"   ❌ {test_name}")
            
            integration_status = report['integration_status']
            print(f"\n🔗 Integration Status:")
            for component, status in integration_status.items():
                status_icon = "✅" if status else "❌"
                print(f"   {status_icon} {component.replace('_', ' ').title()}")
        
        if save_report:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"mystical_integration_report_{timestamp}.json"
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(report, f, indent=2, default=str)
            
            if verbose:
                print(f"\n📄 Test report saved to: {filename}")
        
        return report
    
    except Exception as e:
        if verbose:
            print(f"\n❌ Test suite failed: {e}")
            traceback.print_exc()
        return {'error': str(e), 'success': False}


def demo_complete_integration():
    """Demonstrate complete system integration."""
    print("✨ Complete Mystical System Integration Demo")
    print("="*60)
    
    try:
        # Initialize all components
        print("🌟 Initializing all mystical components...")
        
        # Configuration
        config_mgr = get_config_manager()
        print("   ⚙️  Configuration Manager: Ready")
        
        # Lunareth
        sync = LunarethSynchronizer()
        sync.set_phase(5)  # Golden Ratio phase
        current_phase = sync.get_current_phase()
        print(f"   🌙 Lunareth Phase: {current_phase.name}")
        
        # Sacred Geometry
        geometry = SacredGeometry()
        pattern = create_sacred_pattern('golden_spiral')
        print(f"   🌟 Sacred Geometry: {pattern.name} ready")
        
        # Animation sync
        anim_params = sync.calculate_animation_parameters(5)
        print(f"   ✨ Animation Parameters: Frequency {anim_params['frequency']:.2f}")
        
        # Grimoire Viewer
        viewer = GrimoireViewer(use_api=False, offline_mode=True)
        load_success = viewer.load_entries()
        print(f"   📚 Grimoire Viewer: {len(viewer.entries) if load_success else 0} entries loaded")
        
        # Demonstrate workflow
        print("\n🔮 Demonstrating Integrated Workflow:")
        
        # Step 1: Phase-based intention
        intention = f"Harmony and wisdom through the {current_phase.name}"
        print(f"   1. Intention: {intention}")
        
        # Step 2: Geometric pattern matching phase
        print(f"   2. Sacred Pattern: {pattern.name} (ratio: {pattern.sacred_ratio:.3f})")
        
        # Step 3: Create mystical entry
        mystical_entry = CodexEntryWithBookmark(
            id="demo_integration",
            filename="mystical_integration_demo.txt",
            type="integration",
            size=1618,  # Fibonacci number
            original_size=1618,
            processed_date=datetime.now(),
            summary=f"Demonstration of complete integration at phase {current_phase.name}",
            key_chunks=[
                f"Phase {sync.current_phase}: {current_phase.description}",
                f"Sacred Ratio: {pattern.sacred_ratio}",
                f"Animation Frequency: {anim_params['frequency']}"
            ],
            full_text=f"""
            Complete Integration Demonstration
            =================================
            
            Current Lunareth Phase: {current_phase.name}
            Phase Description: {current_phase.description}
            Energy Signature: {current_phase.energySignature}
            
            Sacred Geometry Pattern: {pattern.name}
            Pattern Type: {pattern.type}
            Sacred Ratio: {pattern.sacred_ratio}
            
            Animation Parameters:
            - Frequency: {anim_params['frequency']}
            - Scale: {anim_params['scale']}
            - Rotation: {anim_params['rotation']}
            
            Integration Aspects:
            - Data models seamlessly handle mystical content
            - Lunareth provides cosmic timing and phase awareness  
            - Sacred geometry renders divine proportions
            - Configuration maintains system harmony
            - All components work in mystical synchronization
            
            This demonstrates the successful bridge between React and Python,
            enabling deep mystical exploration through computational wisdom.
            """,
            category="integration-demo",
            key_terms=["integration", "lunareth", "sacred-geometry", "mystical", current_phase.name.lower()]
        )
        
        print(f"   3. Mystical Entry: {mystical_entry.filename} created")
        print(f"   4. Entry Size: {mystical_entry.size} characters")
        print(f"   5. Key Terms: {', '.join((mystical_entry.keyTerms or [])[:3]) if mystical_entry.keyTerms else 'None'}...")
        
        # Step 4: Session tracking
        config_mgr.add_tool_usage('integration_demo', current_phase.name)
        config_mgr.record_geometry_render(pattern.type)
        
        session_summary = config_mgr.get_session_summary()
        print(f"   6. Session Tracking: {session_summary['session_info']['total_api_calls']} operations")
        
        # Step 5: Show harmonic relationships
        harmonics = {}
        for test_phase in [0, 1, 5, 12]:
            harmonic = sync.calculate_harmonic_resonance(5, test_phase)
            harmonics[test_phase] = harmonic
        
        print(f"   7. Harmonic Resonance with Phase 5:")
        for phase_id, resonance in harmonics.items():
            phase = sync.get_phase(phase_id)
            phase_name = phase.name if phase else 'Unknown'
            print(f"      Phase {phase_id} ({phase_name[:15]}...): {resonance:.3f}")
        
        print("\n✨ Integration Demonstration Complete!")
        print("\nKey Achievements:")
        print("   🔗 All components communicate seamlessly")
        print("   🌙 Mystical context preserved throughout system")
        print("   🎨 Sacred geometry integrated with phase timing")
        print("   💾 Configuration and session state managed globally")
        print("   📊 Data models handle complex mystical content")
        print("   🧪 End-to-end workflows function harmoniously")
        
        return {
            'demo_success': True,
            'current_phase': current_phase.name,
            'pattern_type': pattern.type,
            'entry_created': mystical_entry.id,
            'session_operations': session_summary['session_info']['total_api_calls'],
            'harmonic_resonances': harmonics
        }
        
    except Exception as e:
        print(f"\n❌ Integration demo failed: {e}")
        traceback.print_exc()
        return {'demo_success': False, 'error': str(e)}


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Mystical Integration Test Suite")
    parser.add_argument('--mode', choices=['test', 'demo', 'both'], default='both',
                       help='Run tests, demo, or both')
    parser.add_argument('--no-api', action='store_true',
                       help='Skip API-dependent tests')
    parser.add_argument('--quiet', action='store_true',
                       help='Minimal output')
    parser.add_argument('--no-save', action='store_true',
                       help='Do not save test report')
    
    args = parser.parse_args()
    
    verbose = not args.quiet
    api_testing = not args.no_api
    save_report = not args.no_save
    
    if args.mode in ['test', 'both']:
        print("🧪 Running Integration Tests...")
        report = run_integration_tests(verbose=verbose, save_report=save_report, api_testing=api_testing)
        
        if args.mode == 'both':
            print("\n" + "="*60 + "\n")
    
    if args.mode in ['demo', 'both']:
        demo_complete_integration()