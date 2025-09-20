#!/usr/bin/env python3
"""
Shared Configuration and Synchronization
=======================================

Configuration management and synchronization between React and Python
environments for the mystical codex system. Provides unified settings,
session state management, and seamless integration capabilities.

🌙 "Unity in diversity, harmony in complexity" 🌙
"""

import json
import os
import yaml
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List, Union
from pathlib import Path
from dataclasses import dataclass, field, asdict
import threading
import time

try:
    from .models import PythonConfig, BridgeConfig
except ImportError:
    from models import PythonConfig, BridgeConfig


@dataclass
class MysticalConfig:
    """Comprehensive configuration for the mystical system."""
    
    # API Configuration
    api_base_url: str = "http://localhost:5000/api"
    api_timeout: int = 30
    api_retry_attempts: int = 3
    api_retry_delay: float = 1.0
    
    # Database Configuration
    database_url: Optional[str] = None
    use_local_storage: bool = True
    cache_expiry_hours: int = 24
    
    # Python Integration
    python_scripts_path: str = "mystical_python"
    shared_data_path: str = "shared_mystical_data"
    export_formats: List[str] = field(default_factory=lambda: ["json", "yaml", "txt"])
    
    # Bridge Configuration
    bridge_enabled: bool = True
    auto_sync: bool = True
    sync_interval: float = 30.0
    bidirectional_sync: bool = True
    shared_state_file: str = "shared_mystical_state.json"
    
    # UI/UX Preferences
    mystical_theme: bool = True
    color_scheme: str = "cosmic"
    animation_enabled: bool = True
    sacred_geometry_enabled: bool = True
    
    # Tool Preferences
    default_oracle_context: str = "general"
    default_sigil_style: str = "cosmic"
    default_sonic_frequency: str = "healing"
    tool_session_timeout: int = 3600  # 1 hour
    
    # Lunareth Synchronization
    lunareth_enabled: bool = True
    auto_phase_advance: bool = False
    phase_transition_duration: float = 24.0
    sacred_constants: Dict[str, float] = field(default_factory=lambda: {
        "phi": 1.618033988749,
        "pi_sacred": 6.283185307179586,
        "spiral_constant": 0.30901699437494742
    })
    
    # Sacred Geometry Settings
    geometry_default_size: int = 800
    geometry_render_quality: str = "high"
    geometry_color_palettes: Dict[str, List[str]] = field(default_factory=lambda: {
        "cosmic": ["#191970", "#4B0082", "#8A2BE2", "#9932CC"],
        "golden": ["#FFD700", "#FFA500", "#FF8C00", "#DAA520"],
        "mystical": ["#4B0082", "#8A2BE2", "#9932CC", "#6A5ACD"],
        "nature": ["#228B22", "#32CD32", "#90EE90", "#98FB98"]
    })
    
    # Session Management
    session_persistence: bool = True
    auto_save_interval: int = 300  # 5 minutes
    max_session_history: int = 100
    
    # Security & Privacy
    encrypt_local_data: bool = False
    anonymize_exports: bool = False
    require_auth: bool = False
    
    # Debugging & Logging
    debug_mode: bool = False
    log_level: str = "INFO"
    log_to_file: bool = True
    log_file_path: str = "mystical_system.log"
    
    # Feature Flags
    experimental_features: bool = False
    beta_tools: bool = False
    advanced_analytics: bool = False
    websocket_bridge_enabled: bool = False  # Disabled until WS endpoint implemented


@dataclass 
class SessionState:
    """Shared session state between React and Python."""
    
    session_id: str
    started_at: datetime
    last_activity: datetime
    user_preferences: Dict[str, Any] = field(default_factory=dict)
    
    # Current system state
    current_phase: int = 0
    active_collection: Optional[str] = None
    active_entry: Optional[str] = None
    
    # Tool usage tracking
    tools_used: List[str] = field(default_factory=list)
    oracle_context_stack: List[str] = field(default_factory=list)
    sigil_intentions: List[str] = field(default_factory=list)
    sonic_frequencies: List[str] = field(default_factory=list)
    
    # Bridge state
    react_connected: bool = False
    python_connected: bool = False
    last_sync: Optional[datetime] = None
    pending_sync: List[str] = field(default_factory=list)
    
    # Session metrics
    total_api_calls: int = 0
    total_errors: int = 0
    data_exports: int = 0
    geometry_renders: int = 0


class ConfigManager:
    """Manages configuration and synchronization between environments."""
    
    def __init__(self, config_file: str = "mystical_config.yaml"):
        """Initialize configuration manager."""
        self.config_file = Path(config_file)
        self.session_file = Path("current_session.json")
        self.lock = threading.Lock()
        
        # Load or create configuration
        self.config = self.load_config()
        
        # Load or create session state
        self.session = self.load_session_state()
        
        # Setup directories
        self.ensure_directories()
        
        # Start auto-save if enabled
        if self.config.session_persistence:
            self.start_auto_save()
    
    def load_config(self) -> MysticalConfig:
        """Load configuration from file or create default."""
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    if self.config_file.suffix.lower() == '.yaml':
                        config_data = yaml.safe_load(f)
                    else:
                        config_data = json.load(f)
                
                # Convert to MysticalConfig
                return MysticalConfig(**config_data)
            
            except Exception as e:
                print(f"⚡ Error loading config: {e}")
                print("📜 Using default configuration")
        
        return MysticalConfig()
    
    def save_config(self):
        """Save current configuration to file."""
        try:
            with self.lock:
                config_data = asdict(self.config)
                
                with open(self.config_file, 'w', encoding='utf-8') as f:
                    if self.config_file.suffix.lower() == '.yaml':
                        yaml.dump(config_data, f, default_flow_style=False, allow_unicode=True)
                    else:
                        json.dump(config_data, f, indent=2, default=str)
                
                print(f"✨ Configuration saved to {self.config_file}")
        
        except Exception as e:
            print(f"⚡ Error saving config: {e}")
    
    def load_session_state(self) -> SessionState:
        """Load session state from file or create new."""
        if self.session_file.exists():
            try:
                with open(self.session_file, 'r', encoding='utf-8') as f:
                    session_data = json.load(f)
                
                # Convert datetime strings back to datetime objects
                session_data['started_at'] = datetime.fromisoformat(session_data['started_at'])
                session_data['last_activity'] = datetime.fromisoformat(session_data['last_activity'])
                
                if session_data.get('last_sync'):
                    session_data['last_sync'] = datetime.fromisoformat(session_data['last_sync'])
                
                return SessionState(**session_data)
            
            except Exception as e:
                print(f"⚡ Error loading session: {e}")
                print("🌙 Creating new session")
        
        # Create new session
        return SessionState(
            session_id=f"session_{int(time.time())}",
            started_at=datetime.now(),
            last_activity=datetime.now()
        )
    
    def save_session_state(self):
        """Save current session state to file."""
        try:
            with self.lock:
                session_data = asdict(self.session)
                
                with open(self.session_file, 'w', encoding='utf-8') as f:
                    json.dump(session_data, f, indent=2, default=str)
                
                if self.config.debug_mode:
                    print("💾 Session state saved")
        
        except Exception as e:
            if self.config.debug_mode:
                print(f"⚡ Error saving session: {e}")
    
    def ensure_directories(self):
        """Ensure required directories exist."""
        directories = [
            self.config.python_scripts_path,
            self.config.shared_data_path,
            "exports",
            "logs",
            "cache"
        ]
        
        for directory in directories:
            Path(directory).mkdir(exist_ok=True)
    
    def start_auto_save(self):
        """Start automatic session saving."""
        def auto_save_loop():
            while True:
                time.sleep(self.config.auto_save_interval)
                self.save_session_state()
        
        thread = threading.Thread(target=auto_save_loop, daemon=True)
        thread.start()
    
    # Configuration Management Methods
    def update_config(self, **kwargs):
        """Update configuration values."""
        for key, value in kwargs.items():
            if hasattr(self.config, key):
                setattr(self.config, key, value)
                print(f"⚙️  Updated {key}: {value}")
            else:
                print(f"⚠️  Unknown config key: {key}")
        
        self.save_config()
    
    def reset_config(self):
        """Reset configuration to defaults."""
        self.config = MysticalConfig()
        self.save_config()
        print("🔄 Configuration reset to defaults")
    
    def get_config_value(self, key: str, default: Any = None) -> Any:
        """Get a configuration value."""
        return getattr(self.config, key, default)
    
    # Session Management Methods
    def update_session(self, **kwargs):
        """Update session state values."""
        self.session.last_activity = datetime.now()
        
        for key, value in kwargs.items():
            if hasattr(self.session, key):
                setattr(self.session, key, value)
            else:
                print(f"⚠️  Unknown session key: {key}")
        
        if self.config.session_persistence:
            self.save_session_state()
    
    def add_tool_usage(self, tool_type: str, context: Optional[str] = None):
        """Record tool usage in session."""
        if tool_type not in self.session.tools_used:
            self.session.tools_used.append(tool_type)
        
        if tool_type == 'oracle' and context is not None:
            if context not in self.session.oracle_context_stack:
                self.session.oracle_context_stack.append(context)
        
        self.session.total_api_calls += 1
        self.update_session()
    
    def record_error(self, error_type: str, details: Optional[str] = None):
        """Record an error in session tracking."""
        self.session.total_errors += 1
        
        if self.config.debug_mode:
            print(f"❌ Error recorded: {error_type}")
            if details is not None:
                print(f"   Details: {details}")
        
        self.update_session()
    
    def record_export(self, export_type: str, count: int = 1):
        """Record data export activity."""
        self.session.data_exports += count
        self.update_session()
        
        if self.config.debug_mode:
            print(f"📤 Export recorded: {export_type} ({count} items)")
    
    def record_geometry_render(self, pattern_type: str):
        """Record sacred geometry rendering."""
        self.session.geometry_renders += 1
        self.update_session()
        
        if self.config.debug_mode:
            print(f"🎨 Geometry render recorded: {pattern_type}")
    
    # Synchronization Methods
    def mark_sync_needed(self, sync_type: str):
        """Mark that synchronization is needed."""
        if sync_type not in self.session.pending_sync:
            self.session.pending_sync.append(sync_type)
        
        self.update_session()
    
    def mark_sync_completed(self, sync_type: Optional[str] = None):
        """Mark synchronization as completed."""
        if sync_type is not None and sync_type in self.session.pending_sync:
            self.session.pending_sync.remove(sync_type)
        elif sync_type is None:
            self.session.pending_sync.clear()
        
        self.session.last_sync = datetime.now()
        self.update_session()
    
    def get_sync_status(self) -> Dict[str, Any]:
        """Get current synchronization status."""
        return {
            'last_sync': self.session.last_sync,
            'pending_sync': self.session.pending_sync,
            'react_connected': self.session.react_connected,
            'python_connected': self.session.python_connected,
            'sync_interval': self.config.sync_interval,
            'auto_sync_enabled': self.config.auto_sync
        }
    
    # Utility Methods
    def get_session_summary(self) -> Dict[str, Any]:
        """Get comprehensive session summary."""
        uptime = (datetime.now() - self.session.started_at).total_seconds()
        
        return {
            'session_info': asdict(self.session),
            'config_summary': {
                'mystical_theme': self.config.mystical_theme,
                'bridge_enabled': self.config.bridge_enabled,
                'lunareth_enabled': self.config.lunareth_enabled,
                'debug_mode': self.config.debug_mode
            },
            'metrics': {
                'uptime_seconds': uptime,
                'uptime_formatted': str(timedelta(seconds=int(uptime))),
                'api_calls_per_minute': self.session.total_api_calls / (uptime / 60) if uptime > 0 else 0,
                'error_rate': self.session.total_errors / max(1, self.session.total_api_calls),
                'tools_diversity': len(set(self.session.tools_used))
            }
        }
    
    def export_full_state(self, filename: Optional[str] = None) -> str:
        """Export complete system state."""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"mystical_system_state_{timestamp}.json"
        
        full_state = {
            'export_metadata': {
                'exported_at': datetime.now().isoformat(),
                'export_version': '1.0',
                'system_version': 'Mystical Codex v1.0'
            },
            'configuration': asdict(self.config),
            'session_state': asdict(self.session),
            'session_summary': self.get_session_summary(),
            'sync_status': self.get_sync_status()
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(full_state, f, indent=2, default=str)
        
        self.record_export('full_state')
        print(f"✨ Full system state exported to {filename}")
        return filename
    
    def import_state(self, filename: str):
        """Import system state from file."""
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                state_data = json.load(f)
            
            # Import configuration
            if 'configuration' in state_data:
                self.config = MysticalConfig(**state_data['configuration'])
                self.save_config()
            
            # Import session (carefully)
            if 'session_state' in state_data:
                session_data = state_data['session_state']
                
                # Convert datetime strings
                session_data['started_at'] = datetime.fromisoformat(session_data['started_at'])
                session_data['last_activity'] = datetime.fromisoformat(session_data['last_activity'])
                
                if session_data.get('last_sync'):
                    session_data['last_sync'] = datetime.fromisoformat(session_data['last_sync'])
                
                self.session = SessionState(**session_data)
                self.save_session_state()
            
            print(f"✨ System state imported from {filename}")
        
        except Exception as e:
            print(f"⚡ Error importing state: {e}")


# Global configuration instance
_config_manager = None


def get_config_manager(config_file: str = "mystical_config.yaml") -> ConfigManager:
    """Get the global configuration manager instance."""
    global _config_manager
    
    if _config_manager is None:
        _config_manager = ConfigManager(config_file)
    
    return _config_manager


def get_mystical_config() -> MysticalConfig:
    """Get the current mystical configuration."""
    return get_config_manager().config


def get_session_state() -> SessionState:
    """Get the current session state."""
    return get_config_manager().session


def update_config(**kwargs):
    """Update configuration values."""
    get_config_manager().update_config(**kwargs)


def update_session(**kwargs):
    """Update session state values."""
    get_config_manager().update_session(**kwargs)


# Configuration presets for different use cases
def apply_development_config():
    """Apply configuration optimized for development."""
    update_config(
        debug_mode=True,
        log_level="DEBUG",
        auto_sync=False,
        session_persistence=True,
        experimental_features=True,
        api_timeout=60
    )
    print("🔧 Development configuration applied")


def apply_production_config():
    """Apply configuration optimized for production."""
    update_config(
        debug_mode=False,
        log_level="INFO",
        auto_sync=True,
        session_persistence=True,
        experimental_features=False,
        encrypt_local_data=True,
        api_timeout=30
    )
    print("🚀 Production configuration applied")


def apply_offline_config():
    """Apply configuration for offline operation."""
    update_config(
        use_local_storage=True,
        bridge_enabled=False,
        auto_sync=False,
        cache_expiry_hours=168,  # 1 week
        require_auth=False
    )
    print("📴 Offline configuration applied")


def demo_config_management():
    """Demonstrate configuration management capabilities."""
    print("🌟 Configuration Management Demo")
    print("="*50)
    
    config_mgr = get_config_manager()
    
    # Show current config
    print("\n⚙️  Current Configuration:")
    config = get_mystical_config()
    print(f"   API URL: {config.api_base_url}")
    print(f"   Mystical Theme: {config.mystical_theme}")
    print(f"   Bridge Enabled: {config.bridge_enabled}")
    print(f"   Debug Mode: {config.debug_mode}")
    
    # Show session state
    print(f"\n📊 Session State:")
    session = get_session_state()
    print(f"   Session ID: {session.session_id}")
    print(f"   Started: {session.started_at.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   Tools Used: {session.tools_used}")
    print(f"   API Calls: {session.total_api_calls}")
    
    # Demo config updates
    print(f"\n🔄 Testing Configuration Updates:")
    original_theme = config.mystical_theme
    update_config(mystical_theme=not original_theme)
    print(f"   Theme toggled to: {get_mystical_config().mystical_theme}")
    
    # Restore original
    update_config(mystical_theme=original_theme)
    print(f"   Theme restored to: {get_mystical_config().mystical_theme}")
    
    # Show session summary
    print(f"\n📈 Session Summary:")
    summary = config_mgr.get_session_summary()
    print(f"   Uptime: {summary['metrics']['uptime_formatted']}")
    print(f"   Tools Diversity: {summary['metrics']['tools_diversity']}")
    
    print("\n🌟 Configuration Demo Complete")


if __name__ == "__main__":
    demo_config_management()