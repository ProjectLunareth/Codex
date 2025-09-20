#!/usr/bin/env python3
"""
Mystical Python Integration - Main Entry Point
==============================================

The sacred gateway to the mystical codex system. This script provides
a unified entry point for all Python-based mystical tools, integrations,
and workflows.

🌟 "All paths converge in the center of the sacred wheel" 🌟
"""

import sys
import argparse
from pathlib import Path
from datetime import datetime

# Add mystical_python to Python path
sys.path.insert(0, str(Path(__file__).parent))

def main():
    """Main entry point for the mystical system."""
    parser = argparse.ArgumentParser(
        description="🌙 Mystical Python Integration - Gateway to Sacred Knowledge",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Available Commands:
  grimoire      🔮 Launch the interactive Grimoire Viewer
  lunareth      🌙 Run Lunareth phase synchronization
  geometry      🌟 Create sacred geometry patterns
  tools         ⚡ Access mystical tools (Oracle, Sigil, Sonic Echo)
  bridge        🌉 Manage React-Python integration bridge
  config        ⚙️  Configuration and session management
  test          🧪 Run integration tests
  demo          ✨ Run complete system demonstration

Examples:
  python mystical_main.py grimoire --offline
  python mystical_main.py lunareth --demo
  python mystical_main.py geometry --pattern golden_spiral
  python mystical_main.py tools --oracle "What is wisdom?"
  python mystical_main.py test --mode both
        """
    )
    
    parser.add_argument('command', 
                       choices=['grimoire', 'lunareth', 'geometry', 'tools', 'bridge', 'config', 'test', 'demo'],
                       help='Command to execute')
    
    # Common arguments
    parser.add_argument('--verbose', '-v', action='store_true', 
                       help='Enable verbose output')
    parser.add_argument('--offline', action='store_true',
                       help='Run in offline mode (no API calls)')
    
    # Grimoire arguments
    parser.add_argument('--interactive', action='store_true', default=True,
                       help='Run grimoire in interactive mode')
    
    # Lunareth arguments  
    parser.add_argument('--phase', type=int, choices=range(0, 14),
                       help='Set specific Lunareth phase (0-13)')
    parser.add_argument('--construct', type=str,
                       help='Resolve phase from construct name')
    
    # Geometry arguments
    parser.add_argument('--pattern', type=str,
                       choices=['golden_spiral', 'flower_of_life', 'vesica_piscis', 'mandala', 'sri_yantra', 'fractal_tree', 'koch_snowflake', 'fibonacci_spiral'],
                       help='Sacred geometry pattern to render')
    parser.add_argument('--size', type=int, default=800,
                       help='Canvas size for geometry rendering')
    
    # Tools arguments
    parser.add_argument('--oracle', type=str,
                       help='Query for Oracle consultation')
    parser.add_argument('--sigil', type=str,
                       help='Intention for sigil generation')
    parser.add_argument('--sonic', type=str,
                       help='Intention for sonic echo creation')
    parser.add_argument('--context', type=str, default='general',
                       help='Context for Oracle consultation')
    
    # Test arguments
    parser.add_argument('--mode', choices=['test', 'demo', 'both'], default='both',
                       help='Test mode: tests only, demo only, or both')
    parser.add_argument('--save-report', action='store_true', default=True,
                       help='Save test report to file')
    
    args = parser.parse_args()
    
    # Print mystical header
    print_mystical_header()
    
    try:
        if args.command == 'grimoire':
            run_grimoire_viewer(args)
        elif args.command == 'lunareth':
            run_lunareth_sync(args)
        elif args.command == 'geometry':
            run_sacred_geometry(args)
        elif args.command == 'tools':
            run_mystical_tools(args)
        elif args.command == 'bridge':
            run_integration_bridge(args)
        elif args.command == 'config':
            run_config_management(args)
        elif args.command == 'test':
            run_integration_tests_command(args)
        elif args.command == 'demo':
            run_system_demo(args)
            
    except KeyboardInterrupt:
        print("\n🌙 Interrupted by cosmic forces. May the wisdom guide your path!")
    except Exception as e:
        print(f"\n❌ Mystical error: {e}")
        if args.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(1)


def print_mystical_header():
    """Print the mystical system header."""
    header = """
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    🌟 THE MYSTICAL PYTHON INTEGRATION 🌟                     ║
║                         Gateway to Sacred Knowledge                          ║
╚═══════════════════════════════════════════════════════════════════════════════╝

🔮 Codex of Hidden Knowing - Python Integration Suite
🌙 Bridging React and Python realms through sacred mathematics
✨ Empowering mystical exploration through computational wisdom
"""
    print(header)


def run_grimoire_viewer(args):
    """Run the Grimoire Viewer."""
    from grimoire_viewer import GrimoireViewer
    
    print("📚 Launching the Sacred Grimoire Viewer...")
    
    viewer = GrimoireViewer(
        use_api=not args.offline,
        offline_mode=args.offline
    )
    
    if args.interactive:
        viewer.run_interactive()
    else:
        # Non-interactive mode - load and show summary
        if viewer.load_entries():
            print(f"✨ Loaded {len(viewer.entries)} sacred entries")
            viewer.display_stats()


def run_lunareth_sync(args):
    """Run Lunareth synchronization."""
    from lunareth_sync import LunarethSynchronizer, demo_lunareth_sync
    
    print("🌙 Initializing Lunareth Synchronization...")
    
    if args.construct or args.phase is not None:
        sync = LunarethSynchronizer()
        
        if args.construct:
            phase_id = sync.resolve_phase_from_construct(args.construct)
            if phase_id is not None:
                phase = sync.get_phase(phase_id)
                if phase is not None:
                    print(f"🔮 '{args.construct}' resolved to Phase {phase_id}: {phase.name}")
                else:
                    print(f"❌ Could not retrieve phase {phase_id}")
                    return
                
                # Show animation parameters
                params = sync.calculate_animation_parameters(phase_id)
                print(f"✨ Animation Parameters:")
                for key, value in params.items():
                    if isinstance(value, (int, float)):
                        print(f"   {key}: {value:.3f}")
                    else:
                        print(f"   {key}: {value}")
            else:
                print(f"❌ Could not resolve '{args.construct}' to a phase")
        
        elif args.phase is not None:
            sync.set_phase(args.phase)
            phase = sync.get_current_phase()
            print(f"🌙 Set to Phase {args.phase}: {phase.name}")
            print(f"📝 Description: {phase.description}")
            
    else:
        # Run demo
        demo_lunareth_sync()


def run_sacred_geometry(args):
    """Run sacred geometry rendering."""
    from sacred_geometry import SacredGeometry, create_sacred_pattern, demo_sacred_geometry
    
    print("🌟 Initializing Sacred Geometry Engine...")
    
    if args.pattern:
        geometry = SacredGeometry()
        
        print(f"🎨 Creating {args.pattern} pattern...")
        pattern = create_sacred_pattern(args.pattern)
        
        # Update size if specified
        if args.size != 800:
            pattern.parameters['canvas_size'] = args.size
        
        # Render the pattern
        output_file = geometry.render_pattern(
            pattern, 
            width=args.size, 
            height=args.size,
            show_plot=not args.offline  # Don't show plot in offline mode
        )
        
        print(f"✨ Sacred geometry rendered to: {output_file}")
        
    else:
        # Run demo
        demo_sacred_geometry()


def run_mystical_tools(args):
    """Run mystical tools."""
    from mystical_tools_client import MysticalToolsClient, demo_mystical_tools
    
    if args.oracle or args.sigil or args.sonic:
        print("🔮 Accessing Mystical Tools...")
        
        try:
            client = MysticalToolsClient()
            
            if args.oracle:
                print(f"🔮 Consulting Oracle: {args.oracle}")
                response = client.consult_oracle(
                    query=args.oracle,
                    context=args.context
                )
                print(f"🌟 Oracle Response:\n{response.response}")
            
            if args.sigil:
                print(f"🔯 Generating Sigil for: {args.sigil}")
                response = client.generate_sigil(
                    intention=args.sigil,
                    style='cosmic'
                )
                print(f"✨ Sigil Created:\n{response.symbolicMeaning}")
            
            if args.sonic:
                print(f"🎵 Creating Sonic Echo for: {args.sonic}")
                response = client.client.generate_sonic_echo(
                    text=args.sonic,
                    voice='mystical',
                    style='healing'
                )
                print(f"🎶 Sonic Echo:\n{response.title}")
                
        except Exception as e:
            print(f"⚡ Tools access failed: {e}")
            if not args.offline:
                print("💡 Try running with --offline flag for demo mode")
    else:
        # Run demo
        demo_mystical_tools()


def run_integration_bridge(args):
    """Run integration bridge."""
    from integration_bridge import create_bridge, demo_bridge_functionality
    
    print("🌉 Initializing Integration Bridge...")
    
    if not args.offline:
        try:
            bridge = create_bridge(auto_start=False)
            status = bridge.get_bridge_status()
            
            print("📊 Bridge Status:")
            health = status['bridge_health']
            print(f"   Status: {health['status']}")
            print(f"   Uptime: {health.get('uptime', 0):.2f} seconds")
            
            data_summary = status['data_summary']
            print(f"   Entries: {data_summary['total_entries']}")
            print(f"   Collections: {data_summary['total_collections']}")
            print(f"   Bookmarks: {data_summary['bookmarked_entries']}")
            
        except Exception as e:
            print(f"⚡ Bridge initialization failed: {e}")
            print("📜 Running bridge demo instead...")
            demo_bridge_functionality()
    else:
        demo_bridge_functionality()


def run_config_management(args):
    """Run configuration management."""
    from shared_config import get_config_manager, demo_config_management
    
    print("⚙️ Configuration Management...")
    
    config_mgr = get_config_manager()
    
    # Show current configuration summary
    config = config_mgr.config
    session = config_mgr.session
    
    print("📋 Current Configuration:")
    print(f"   API URL: {config.api_base_url}")
    print(f"   Mystical Theme: {config.mystical_theme}")
    print(f"   Bridge Enabled: {config.bridge_enabled}")
    print(f"   Debug Mode: {config.debug_mode}")
    
    print(f"\n📊 Session State:")
    print(f"   Session ID: {session.session_id}")
    print(f"   Current Phase: {session.current_phase}")
    print(f"   Tools Used: {session.tools_used}")
    print(f"   API Calls: {session.total_api_calls}")
    
    # Show full demo if requested
    if args.verbose:
        demo_config_management()


def run_integration_tests_command(args):
    """Run integration tests."""
    from test_integration import run_integration_tests, demo_complete_integration
    
    print("🧪 Running Integration Tests...")
    
    if args.mode in ['test', 'both']:
        report = run_integration_tests(
            verbose=args.verbose,
            save_report=args.save_report
        )
        
        if args.mode == 'both':
            print("\n" + "="*60 + "\n")
    
    if args.mode in ['demo', 'both']:
        demo_complete_integration()


def run_system_demo(args):
    """Run complete system demonstration."""
    from test_integration import demo_complete_integration
    from lunareth_sync import demo_lunareth_sync  
    from sacred_geometry import demo_sacred_geometry
    from mystical_tools_client import demo_mystical_tools
    from shared_config import demo_config_management
    
    print("✨ Complete Mystical System Demonstration")
    print("="*60)
    
    demos = [
        ("Configuration Management", demo_config_management),
        ("Lunareth Synchronization", demo_lunareth_sync),
        ("Sacred Geometry", demo_sacred_geometry),
        ("Mystical Tools", demo_mystical_tools),
        ("Complete Integration", demo_complete_integration)
    ]
    
    for i, (name, demo_func) in enumerate(demos, 1):
        print(f"\n{i}/5 - {name}")
        print("-" * 40)
        
        try:
            demo_func()
        except Exception as e:
            print(f"❌ {name} demo failed: {e}")
            if args.verbose:
                import traceback
                traceback.print_exc()
        
        if i < len(demos):
            print("\nPress Enter to continue to next demo...")
            input()
    
    print("\n✨ Complete system demonstration finished!")


if __name__ == "__main__":
    main()