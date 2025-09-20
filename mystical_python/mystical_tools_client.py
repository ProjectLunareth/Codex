#!/usr/bin/env python3
"""
Mystical Tools Client
====================

Python clients for the existing mystical tools in our React-based system:
- Oracle consultation with contextual wisdom
- Mystical Sigil generation 
- Sonic Echo creation and resonance analysis
- Tool run history and session management

🔮 "Tools are extensions of consciousness" 🔮
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List, Optional, Any, Union, Callable, Tuple
from pathlib import Path
import base64
from dataclasses import dataclass, asdict

from models import (
    OracleRequest, OracleResponse, SigilRequest, SigilResponse, 
    SonicEchoRequest, SonicEchoResponse, MysticalToolRequest, 
    MysticalToolResponse, ToolRun
)
from api_client import MysticalAPIClient, create_client, MysticalAPIError


@dataclass
class ToolSession:
    """Session tracking for mystical tool usage."""
    session_id: str
    started_at: datetime
    tools_used: List[str]
    total_requests: int
    last_activity: datetime
    context_stack: List[str]
    
    def add_activity(self, tool_type: str, context: Optional[str] = None):
        """Add activity to session tracking."""
        if tool_type not in self.tools_used:
            self.tools_used.append(tool_type)
        
        self.total_requests += 1
        self.last_activity = datetime.now()
        
        if context and context not in self.context_stack:
            self.context_stack.append(context)


class MysticalToolsClient:
    """Client for interacting with mystical tools through the API."""
    
    def __init__(self, api_client: Optional[MysticalAPIClient] = None):
        """Initialize the mystical tools client."""
        self.client = api_client or create_client()
        self.session = ToolSession(
            session_id=f"session_{int(time.time())}",
            started_at=datetime.now(),
            tools_used=[],
            total_requests=0,
            last_activity=datetime.now(),
            context_stack=[]
        )
        self.tool_history: List[ToolRun] = []
        
        # Tool-specific configuration
        self.oracle_context_categories = [
            'general', 'cosmogenesis', 'psychogenesis', 'mystagogy',
            'climbing-systems', 'initiation-rites', 'archetypal-structures',
            'psychic-technologies'
        ]
        
        self.sigil_styles = [
            'traditional', 'modern', 'geometric', 'organic', 'cosmic',
            'runic', 'alchemical', 'kabbalistic'
        ]
        
        self.sonic_echo_types = [
            'meditation', 'focus', 'healing', 'protection', 'manifestation',
            'transformation', 'awakening', 'balance'
        ]
    
    # Oracle Consultation Methods
    def consult_oracle(self, 
                      query: str, 
                      context: str = 'general',
                      include_codex_knowledge: bool = True,
                      wisdom_depth: str = 'medium') -> OracleResponse:
        """Consult the Oracle with a mystical query."""
        try:
            # Make API call with simple request format (API expects {query, context})
            response = self.client.consult_oracle(query, context)
            
            # Update session tracking
            self.session.add_activity('oracle', context)
            
            # Store in history
            tool_run = ToolRun(
                id=f"oracle_{int(time.time())}",
                type='oracle',
                input=query,
                output=response.response,
                created_at=datetime.now()
            )
            self.tool_history.append(tool_run)
            
            return response
        
        except Exception as e:
            raise MysticalAPIError(f"Oracle consultation failed: {e}")
    
    def oracle_conversation(self, queries: List[str], context: str = 'general') -> List[OracleResponse]:
        """Conduct a flowing conversation with the Oracle."""
        responses = []
        
        for i, query in enumerate(queries):
            print(f"🔮 Oracle Query {i+1}: {query}")
            
            response = self.consult_oracle(
                query=query,
                context=context,
                include_codex_knowledge=True
            )
            
            responses.append(response)
            print(f"🌟 Oracle Response: {response.response[:100]}...")
            print()
            
            # Brief pause between queries for contemplation
            time.sleep(1)
        
        return responses
    
    def oracle_guided_session(self, topic: str, depth: int = 5) -> Dict[str, Any]:
        """Conduct a guided Oracle session on a specific topic."""
        session_queries = [
            f"What is the essence of {topic}?",
            f"What are the key principles governing {topic}?",
            f"What obstacles might one encounter when exploring {topic}?",
            f"What practices or approaches are most beneficial for {topic}?",
            f"What wisdom should one remember about {topic}?"
        ]
        
        # Take only the requested depth
        queries = session_queries[:depth]
        
        responses = self.oracle_conversation(queries, context='general')
        
        return {
            'topic': topic,
            'session_id': self.session.session_id,
            'queries': queries,
            'responses': [r.response for r in responses],
            'timestamp': datetime.now().isoformat(),
            'depth': depth
        }
    
    # Sigil Generation Methods
    def generate_sigil(self, 
                      intention: str, 
                      style: str = 'traditional',
                      symbolism: str = 'hermetic',
                      energy_type: str = 'balanced') -> SigilResponse:
        """Generate a mystical sigil for an intention."""
        try:
            # Make API call with simple parameters (API expects {intention, style, symbolism, energyType})
            response = self.client.generate_sigil(intention, style, symbolism, energy_type)
            
            # Update session tracking
            self.session.add_activity('sigil', style)
            
            # Store in history
            tool_run = ToolRun(
                id=f"sigil_{int(time.time())}",
                type='sigil',
                input=intention,
                output=response.symbolicMeaning,
                created_at=datetime.now()
            )
            self.tool_history.append(tool_run)
            
            return response
        
        except Exception as e:
            raise MysticalAPIError(f"Sigil generation failed: {e}")
    
    def batch_sigil_generation(self, intentions: List[str], style: str = 'traditional') -> List[SigilResponse]:
        """Generate multiple sigils for a list of intentions."""
        sigils = []
        
        for intention in intentions:
            print(f"🔯 Generating sigil for: {intention}")
            
            sigil = self.generate_sigil(intention, style=style)
            sigils.append(sigil)
            
            print(f"✨ Created: {sigil.symbolicMeaning[:50]}...")
            time.sleep(0.5)  # Brief pause between generations
        
        return sigils
    
    def sigil_meditation_sequence(self, intentions: List[str]) -> Dict[str, Any]:
        """Create a meditation sequence with sigils."""
        sigils = self.batch_sigil_generation(intentions, style='geometric')
        
        return {
            'sequence_type': 'meditation',
            'intentions': intentions,
            'sigils': [s.dict() for s in sigils],
            'session_id': self.session.session_id,
            'created_at': datetime.now().isoformat(),
            'meditation_notes': [
                "Begin with deep breathing and center yourself",
                "Focus on each sigil for 3-5 minutes",
                "Visualize the intention manifesting",
                "Allow the symbols to speak to your subconscious",
                "End with gratitude and grounding"
            ]
        }
    
    # Sonic Echo Methods
    # Note: create_sonic_echo method was replaced by updated method above
    
    def sonic_healing_session(self, healing_intentions: List[str]) -> Dict[str, Any]:
        """Create a complete sonic healing session."""
        sonic_echoes = []
        
        for intention in healing_intentions:
            print(f"🎵 Creating sonic echo for: {intention}")
            
            echo = self.client.generate_sonic_echo(
                text=intention,
                voice='mystical',
                style='healing',
                title=f"Healing Echo: {intention}"
            )
            
            sonic_echoes.append(echo)
            time.sleep(0.5)
        
        return {
            'session_type': 'healing',
            'intentions': healing_intentions,
            'sonic_echoes': [e.dict() for e in sonic_echoes],
            'total_duration': sum(120 for _ in sonic_echoes),  # 2 min each
            'session_id': self.session.session_id,
            'created_at': datetime.now().isoformat(),
            'usage_notes': [
                "Use headphones for optimal experience",
                "Find a quiet, comfortable space",
                "Allow each frequency to resonate fully",
                "Focus on the healing intention",
                "Rest between sessions if needed"
            ]
        }
    
    # Generic Mystical Tool Methods
    def run_mystical_tool(self, 
                         tool_type: str, 
                         tool_input: str,
                         context: Optional[str] = None) -> MysticalToolResponse:
        """Run a generic mystical tool."""
        try:
            # Make API call with simple parameters (API expects {type, input})
            response = self.client.run_mystical_tool(tool_type, tool_input, context or 'general')
            
            # Update session tracking
            self.session.add_activity(tool_type)
            
            # Store in history
            tool_run = ToolRun(
                id=f"{tool_type}_{int(time.time())}",
                type=tool_type,
                input=tool_input,
                output=response.output,
                created_at=datetime.now()
            )
            self.tool_history.append(tool_run)
            
            return response
        
        except Exception as e:
            raise MysticalAPIError(f"Mystical tool '{tool_type}' failed: {e}")
    
    # Session and History Management
    def get_session_summary(self) -> Dict[str, Any]:
        """Get a summary of the current session."""
        return {
            'session_info': asdict(self.session),
            'tools_history': [asdict(run) for run in self.tool_history],
            'session_duration': (datetime.now() - self.session.started_at).total_seconds(),
            'unique_contexts': list(set(self.session.context_stack)),
            'favorite_tools': self._get_most_used_tools()
        }
    
    def _get_most_used_tools(self) -> List[Tuple[str, int]]:
        """Get tools sorted by usage frequency."""
        tool_counts = {}
        for run in self.tool_history:
            tool_counts[run.type] = tool_counts.get(run.type, 0) + 1
        
        return sorted(tool_counts.items(), key=lambda x: x[1], reverse=True)
    
    def export_session(self, filename: Optional[str] = None) -> str:
        """Export session data to file."""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"mystical_session_{timestamp}.json"
        
        session_data = self.get_session_summary()
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(session_data, f, indent=2, default=str)
        
        print(f"✨ Session exported to {filename}")
        return filename
    
    def clear_session(self):
        """Clear current session and start fresh."""
        self.session = ToolSession(
            session_id=f"session_{int(time.time())}",
            started_at=datetime.now(),
            tools_used=[],
            total_requests=0,
            last_activity=datetime.now(),
            context_stack=[]
        )
        self.tool_history.clear()
        print("🌙 Session cleared - starting fresh")
    
    # Combined Mystical Workflows
    def complete_mystical_working(self, 
                                 intention: str,
                                 include_oracle: bool = True,
                                 include_sigil: bool = True,
                                 include_sonic: bool = True) -> Dict[str, Any]:
        """Perform a complete mystical working combining all tools."""
        working_results = {
            'intention': intention,
            'session_id': self.session.session_id,
            'started_at': datetime.now().isoformat(),
            'components': {}
        }
        
        print(f"🌟 Beginning complete mystical working for: {intention}")
        print("="*60)
        
        # Oracle consultation
        if include_oracle:
            print("🔮 Consulting the Oracle...")
            oracle_response = self.consult_oracle(
                query=f"Provide wisdom and guidance for this intention: {intention}",
                context='general'
            )
            working_results['components']['oracle'] = oracle_response.dict()
            print(f"   Oracle Response: {oracle_response.response[:100]}...")
        
        # Sigil generation
        if include_sigil:
            print("🔯 Generating sacred sigil...")
            sigil_response = self.generate_sigil(
                intention=intention,
                style='cosmic',
                symbolism='hermetic',
                energy_type='balanced'
            )
            working_results['components']['sigil'] = sigil_response.dict()
            print(f"   Sigil Created: {sigil_response.symbolicMeaning[:100]}...")
        
        # Sonic echo creation
        if include_sonic:
            print("🎵 Creating sonic echo...")
            sonic_response = self.client.generate_sonic_echo(
                text=intention,
                voice='mystical',
                style='manifestation',
                title=f'Manifestation Echo: {intention}'
            )
            working_results['components']['sonic_echo'] = sonic_response.dict()
            print(f"   Sonic Echo: {sonic_response.title[:100]}...")
        
        working_results['completed_at'] = datetime.now().isoformat()
        working_results['duration'] = (datetime.now() - datetime.fromisoformat(working_results['started_at'])).total_seconds()
        
        print("✨ Complete mystical working finished!")
        return working_results
    
    def daily_mystical_practice(self) -> Dict[str, Any]:
        """Create a daily mystical practice routine."""
        practices = {
            'morning_oracle': self.consult_oracle(
                "What wisdom should guide me today?",
                context='general'
            ),
            'intention_sigil': self.generate_sigil(
                "Clarity, purpose, and divine alignment",
                style='geometric',
                symbolism='hermetic',
                energy_type='balanced'
            ),
            'meditation_echo': self.client.generate_sonic_echo(
                text="Deep inner peace and cosmic connection",
                voice='mystical',
                style='meditation',
                title='Daily Meditation Echo'
            )
        }
        
        return {
            'practice_date': datetime.now().isoformat(),
            'session_id': self.session.session_id,
            'practices': {k: v.dict() for k, v in practices.items()},
            'recommended_schedule': {
                'morning': 'Oracle consultation upon waking',
                'midday': 'Sigil meditation for 10-15 minutes',
                'evening': 'Sonic echo meditation before rest'
            }
        }


# Utility Functions
def create_mystical_tools_client(api_url: str = "http://localhost:5000/api") -> MysticalToolsClient:
    """Create a mystical tools client with API connection."""
    api_client = create_client(api_url)
    return MysticalToolsClient(api_client)


def batch_oracle_consultation(questions: List[str], 
                            context: str = 'general',
                            client: Optional[MysticalToolsClient] = None) -> List[OracleResponse]:
    """Batch process multiple Oracle questions."""
    if client is None:
        client = create_mystical_tools_client()
    
    return client.oracle_conversation(questions, context)


def create_intention_manifestation_kit(intentions: List[str],
                                     client: Optional[MysticalToolsClient] = None) -> Dict[str, Any]:
    """Create a complete manifestation kit for multiple intentions."""
    if client is None:
        client = create_mystical_tools_client()
    
    manifestation_kit = {
        'intentions': intentions,
        'created_at': datetime.now().isoformat(),
        'components': {}
    }
    
    # Oracle wisdom for each intention
    oracle_responses = []
    for intention in intentions:
        response = client.consult_oracle(
            f"How can I best manifest and align with this intention: {intention}?",
            context='general'
        )
        oracle_responses.append(response)
    
    # Sigils for all intentions
    sigils = client.batch_sigil_generation(intentions, style='cosmic')
    
    # Sonic echoes for manifestation
    sonic_echoes = []
    for intention in intentions:
        echo = client.client.generate_sonic_echo(
            text=intention,
            voice='mystical',
            style='manifestation',
            title=f'Manifestation Echo: {intention}'
        )
        sonic_echoes.append(echo)
    
    manifestation_kit['components'] = {
        'oracle_wisdom': [r.dict() for r in oracle_responses],
        'sacred_sigils': [s.dict() for s in sigils],
        'sonic_echoes': [e.dict() for e in sonic_echoes]
    }
    
    return manifestation_kit


def demo_mystical_tools():
    """Demonstrate mystical tools capabilities."""
    print("🌟 Mystical Tools Client Demo")
    print("="*50)
    
    # Create client
    try:
        client = create_mystical_tools_client()
        print("✅ Connected to mystical tools API")
    except Exception as e:
        print(f"❌ Could not connect to API: {e}")
        print("📜 Running in demo mode...")
        return
    
    # Demo Oracle
    print("\n🔮 Oracle Consultation Demo:")
    try:
        oracle_response = client.consult_oracle(
            "What is the nature of wisdom?",
            context='general'
        )
        print(f"   Oracle says: {oracle_response.response[:100]}...")
    except Exception as e:
        print(f"   Oracle demo failed: {e}")
    
    # Demo Sigil
    print("\n🔯 Sigil Generation Demo:")
    try:
        sigil_response = client.generate_sigil(
            "Inner peace and harmony",
            style='geometric'
        )
        print(f"   Sigil created: {sigil_response.symbolicMeaning[:100]}...")
    except Exception as e:
        print(f"   Sigil demo failed: {e}")
    
    # Demo Sonic Echo
    print("\n🎵 Sonic Echo Demo:")
    try:
        sonic_response = client.client.generate_sonic_echo(
            text="Healing and restoration",
            voice='mystical',
            style='healing'
        )
        print(f"   Sonic echo: {sonic_response.title[:100]}...")
    except Exception as e:
        print(f"   Sonic echo demo failed: {e}")
    
    # Session summary
    print(f"\n📊 Session Summary:")
    summary = client.get_session_summary()
    print(f"   Tools used: {summary['session_info']['tools_used']}")
    print(f"   Total requests: {summary['session_info']['total_requests']}")
    
    print("\n🌟 Mystical Tools Demo Complete")


if __name__ == "__main__":
    demo_mystical_tools()