#!/usr/bin/env python3
"""
Lunareth Synchronization Module
==============================

The sacred mathematics of the Spiral Codex, harmonizing the 13+1 phases
of mystical transformation with animation parameters and cosmic rhythms.
This module provides phase mapping, construct resolution, and synchronization
capabilities for external rendering systems.

🌙 "As above, so below - the spiral unfolds in sacred pattern" 🌙
"""

import json
import math
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any, Union
from pathlib import Path
from fuzzywuzzy import fuzz, process
import numpy as np

from models import SpiralPhase, LunarethSync, GeometricPattern
from api_client import MysticalAPIClient, create_client


class LunarethSynchronizer:
    """Sacred synchronizer for the 13+1 phases of the Spiral Codex."""
    
    def __init__(self, api_client: Optional[MysticalAPIClient] = None):
        """Initialize the Lunareth synchronization matrix."""
        self.client = api_client
        self.phases = self._initialize_spiral_phases()
        self.current_phase = 0
        self.sync_state = None
        self.animation_cache = {}
        self.construct_mappings = self._initialize_construct_mappings()
        self.last_sync = None
        
        # Sacred mathematical constants
        self.PHI = (1 + math.sqrt(5)) / 2  # Golden ratio
        self.PI_SACRED = math.pi * 2  # Full circle
        self.SPIRAL_CONSTANT = 0.30901699437494742410229341718282  # Pentagram ratio
        
        # Animation timing parameters
        self.base_frequency = 60.0  # Base cycles per minute
        self.phase_duration = 24.0  # Seconds per phase transition
        self.sync_interval = 1.0    # Synchronization check interval
        
    def _initialize_spiral_phases(self) -> List[SpiralPhase]:
        """Initialize the sacred 13+1 phases of the Spiral Codex."""
        phases = [
            SpiralPhase(
                id=0,
                name="The Void Nexus",
                description="The primordial stillness before manifestation begins",
                keywords=["void", "stillness", "potential", "beginning", "silence"],
                animationParams={
                    "rotation": 0.0,
                    "scale": 0.1,
                    "opacity": 0.2,
                    "color_hue": 0,
                    "frequency": 0.5,
                    "amplitude": 0.1,
                    "phase_offset": 0.0
                },
                energySignature="∅",
                geometricPattern="point",
                color="#000000",
                frequency=0.5
            ),
            SpiralPhase(
                id=1,
                name="Prima Emanatio",
                description="The first stirring of consciousness from the void",
                keywords=["emanation", "consciousness", "awakening", "first", "light"],
                animationParams={
                    "rotation": 30.0,
                    "scale": 0.3,
                    "opacity": 0.4,
                    "color_hue": 15,
                    "frequency": 1.0,
                    "amplitude": 0.3,
                    "phase_offset": 0.0833
                },
                energySignature="☉",
                geometricPattern="circle",
                color="#FFD700",
                frequency=1.0
            ),
            SpiralPhase(
                id=2,
                name="Duality Genesis",
                description="The birth of polarity and the sacred division",
                keywords=["duality", "polarity", "division", "yang", "yin"],
                animationParams={
                    "rotation": 60.0,
                    "scale": 0.5,
                    "opacity": 0.6,
                    "color_hue": 30,
                    "frequency": 1.5,
                    "amplitude": 0.5,
                    "phase_offset": 0.1667
                },
                energySignature="☯",
                geometricPattern="vesica_piscis",
                color="#FF6B35",
                frequency=1.5
            ),
            SpiralPhase(
                id=3,
                name="Trinity Formation",
                description="The stabilization through three-fold manifestation",
                keywords=["trinity", "stability", "triangle", "three", "foundation"],
                animationParams={
                    "rotation": 120.0,
                    "scale": 0.7,
                    "opacity": 0.7,
                    "color_hue": 60,
                    "frequency": 2.0,
                    "amplitude": 0.7,
                    "phase_offset": 0.25
                },
                energySignature="△",
                geometricPattern="triangle",
                color="#FFC107",
                frequency=2.0
            ),
            SpiralPhase(
                id=4,
                name="Quaternary Foundation",
                description="The establishment of the four-fold material base",
                keywords=["quaternary", "foundation", "square", "earth", "material"],
                animationParams={
                    "rotation": 90.0,
                    "scale": 0.8,
                    "opacity": 0.8,
                    "color_hue": 90,
                    "frequency": 2.5,
                    "amplitude": 0.8,
                    "phase_offset": 0.3333
                },
                energySignature="□",
                geometricPattern="square",
                color="#4CAF50",
                frequency=2.5
            ),
            SpiralPhase(
                id=5,
                name="Pentadic Harmony",
                description="The golden mean and perfect proportion emerge",
                keywords=["pentagon", "golden", "harmony", "proportion", "phi"],
                animationParams={
                    "rotation": 72.0,
                    "scale": self.PHI / 2,
                    "opacity": 0.85,
                    "color_hue": 120,
                    "frequency": self.PHI,
                    "amplitude": self.PHI / 2,
                    "phase_offset": 0.4167
                },
                energySignature="⬟",
                geometricPattern="pentagon",
                color="#2196F3",
                frequency=self.PHI
            ),
            SpiralPhase(
                id=6,
                name="Hexadic Perfection",
                description="The completion of the celestial harmony",
                keywords=["hexagon", "perfection", "celestial", "harmony", "completion"],
                animationParams={
                    "rotation": 60.0,
                    "scale": 1.0,
                    "opacity": 0.9,
                    "color_hue": 150,
                    "frequency": 3.0,
                    "amplitude": 1.0,
                    "phase_offset": 0.5
                },
                energySignature="⬢",
                geometricPattern="hexagon",
                color="#673AB7",
                frequency=3.0
            ),
            SpiralPhase(
                id=7,
                name="Septenary Mystery",
                description="The sacred seven and the bridge between worlds",
                keywords=["seven", "mystery", "bridge", "worlds", "chakra"],
                animationParams={
                    "rotation": 51.43,  # 360/7
                    "scale": 1.1,
                    "opacity": 0.92,
                    "color_hue": 180,
                    "frequency": 3.5,
                    "amplitude": 1.1,
                    "phase_offset": 0.5833
                },
                energySignature="⬟",
                geometricPattern="heptagon",
                color="#9C27B0",
                frequency=3.5
            ),
            SpiralPhase(
                id=8,
                name="Octadic Equilibrium",
                description="The perfect balance and infinite regeneration",
                keywords=["eight", "balance", "infinite", "regeneration", "octave"],
                animationParams={
                    "rotation": 45.0,
                    "scale": 1.2,
                    "opacity": 0.94,
                    "color_hue": 210,
                    "frequency": 4.0,
                    "amplitude": 1.2,
                    "phase_offset": 0.6667
                },
                energySignature="⬟",
                geometricPattern="octagon",
                color="#E91E63",
                frequency=4.0
            ),
            SpiralPhase(
                id=9,
                name="Ennadic Completion",
                description="The threefold trinity and spiritual fulfillment",
                keywords=["nine", "completion", "trinity", "spiritual", "fulfillment"],
                animationParams={
                    "rotation": 40.0,
                    "scale": 1.3,
                    "opacity": 0.96,
                    "color_hue": 240,
                    "frequency": 4.5,
                    "amplitude": 1.3,
                    "phase_offset": 0.75
                },
                energySignature="⬟",
                geometricPattern="enneagon",
                color="#F44336",
                frequency=4.5
            ),
            SpiralPhase(
                id=10,
                name="Decadic Manifestation",
                description="The full manifestation in the material realm",
                keywords=["ten", "manifestation", "material", "completion", "sephiroth"],
                animationParams={
                    "rotation": 36.0,
                    "scale": 1.4,
                    "opacity": 0.98,
                    "color_hue": 270,
                    "frequency": 5.0,
                    "amplitude": 1.4,
                    "phase_offset": 0.8333
                },
                energySignature="⬟",
                geometricPattern="decagon",
                color="#FF5722",
                frequency=5.0
            ),
            SpiralPhase(
                id=11,
                name="Transcendent Gateway",
                description="The doorway beyond form and limitation",
                keywords=["eleven", "transcendent", "gateway", "beyond", "limitation"],
                animationParams={
                    "rotation": 32.73,  # 360/11
                    "scale": 1.5,
                    "opacity": 0.99,
                    "color_hue": 300,
                    "frequency": 5.5,
                    "amplitude": 1.5,
                    "phase_offset": 0.9167
                },
                energySignature="⬟",
                geometricPattern="hendecagon",
                color="#795548",
                frequency=5.5
            ),
            SpiralPhase(
                id=12,
                name="Zodiacal Completion",
                description="The fullness of cosmic cycles and eternal return",
                keywords=["twelve", "zodiac", "cosmic", "cycles", "eternal"],
                animationParams={
                    "rotation": 30.0,
                    "scale": 1.618,  # Golden ratio
                    "opacity": 1.0,
                    "color_hue": 330,
                    "frequency": 6.0,
                    "amplitude": 1.618,
                    "phase_offset": 1.0
                },
                energySignature="⬟",
                geometricPattern="dodecagon",
                color="#607D8B",
                frequency=6.0
            ),
            # The 13th Phase - Beyond the Spiral
            SpiralPhase(
                id=13,
                name="The Eternal Beyond",
                description="The infinite space beyond all cycles and forms",
                keywords=["thirteen", "beyond", "infinite", "eternal", "transcendent"],
                animationParams={
                    "rotation": 0.0,  # No rotation - beyond movement
                    "scale": float('inf'),  # Infinite scale
                    "opacity": 0.0,  # Transparent - beyond visibility
                    "color_hue": 360,  # Full spectrum
                    "frequency": 0.0,  # Stillness
                    "amplitude": 0.0,  # No amplitude
                    "phase_offset": 0.0  # Beyond time
                },
                energySignature="∞",
                geometricPattern="infinity",
                color="#FFFFFF",
                frequency=0.0
            )
        ]
        
        return phases
    
    def _initialize_construct_mappings(self) -> Dict[str, int]:
        """Initialize mappings between construct names and phase IDs."""
        mappings = {}
        
        # Direct phase name mappings
        for phase in self.phases:
            mappings[phase.name.lower()] = phase.id
            
            # Add keyword mappings
            for keyword in phase.keywords:
                mappings[keyword.lower()] = phase.id
        
        # Additional mystical construct mappings
        construct_aliases = {
            "void": 0, "emptiness": 0, "null": 0, "zero": 0,
            "unity": 1, "one": 1, "monad": 1, "source": 1,
            "duality": 2, "two": 2, "polarity": 2, "binary": 2,
            "trinity": 3, "three": 3, "triad": 3, "triangle": 3,
            "quaternary": 4, "four": 4, "square": 4, "cross": 4,
            "pentagon": 5, "five": 5, "quintessence": 5, "golden": 5,
            "hexagon": 6, "six": 6, "star": 6, "seal": 6,
            "heptagon": 7, "seven": 7, "septenary": 7, "chakra": 7,
            "octagon": 8, "eight": 8, "infinity": 8, "ouroboros": 8,
            "enneagon": 9, "nine": 9, "completion": 9, "fulfillment": 9,
            "decagon": 10, "ten": 10, "sephiroth": 10, "tree": 10,
            "hendecagon": 11, "eleven": 11, "gateway": 11, "portal": 11,
            "dodecagon": 12, "twelve": 12, "zodiac": 12, "cosmic": 12,
            "beyond": 13, "infinite": 13, "eternal": 13, "transcendent": 13
        }
        
        mappings.update(construct_aliases)
        return mappings
    
    def resolve_phase_from_construct(self, construct_name: str, threshold: int = 70) -> Optional[int]:
        """Resolve phase ID from construct name using fuzzy matching."""
        if not construct_name:
            return None
        
        construct_name = construct_name.lower().strip()
        
        # Direct mapping first
        if construct_name in self.construct_mappings:
            return self.construct_mappings[construct_name]
        
        # Fuzzy matching
        best_match = process.extractOne(
            construct_name,
            self.construct_mappings.keys(),
            scorer=fuzz.ratio
        )
        
        if best_match and best_match[1] >= threshold:
            return self.construct_mappings[best_match[0]]
        
        # Try partial matching for longer descriptions
        for construct, phase_id in self.construct_mappings.items():
            if fuzz.partial_ratio(construct_name, construct) >= threshold:
                return phase_id
        
        return None
    
    def get_phase(self, phase_id: int) -> Optional[SpiralPhase]:
        """Get phase by ID."""
        if 0 <= phase_id <= 13:
            return self.phases[phase_id]
        return None
    
    def get_current_phase(self) -> SpiralPhase:
        """Get the currently active phase."""
        return self.phases[self.current_phase]
    
    def advance_phase(self) -> SpiralPhase:
        """Advance to the next phase in the spiral."""
        self.current_phase = (self.current_phase + 1) % 14
        return self.get_current_phase()
    
    def set_phase(self, phase_id: int) -> bool:
        """Set the current phase directly."""
        if 0 <= phase_id <= 13:
            self.current_phase = phase_id
            return True
        return False
    
    def calculate_animation_parameters(self, 
                                     phase_id: Optional[int] = None, 
                                     time_factor: float = 1.0,
                                     intensity: float = 1.0) -> Dict[str, Any]:
        """Calculate animation parameters for a given phase."""
        if phase_id is None:
            phase_id = self.current_phase
        
        phase = self.get_phase(phase_id)
        if not phase:
            return {}
        
        # Base parameters from phase
        params = phase.animationParams.copy()
        
        # Apply time factor for animation speed
        if 'frequency' in params:
            params['frequency'] *= time_factor
        
        # Apply intensity scaling
        if 'amplitude' in params:
            params['amplitude'] *= intensity
        if 'scale' in params:
            if params['scale'] != float('inf'):
                params['scale'] *= intensity
        if 'opacity' in params:
            params['opacity'] = min(1.0, params['opacity'] * intensity)
        
        # Add derived parameters
        params['phase_name'] = phase.name
        params['energy_signature'] = phase.energySignature
        params['geometric_pattern'] = phase.geometricPattern
        params['base_color'] = phase.color
        
        # Calculate time-based animations
        current_time = time.time()
        
        # Breathing effect
        params['breathing_scale'] = 1.0 + 0.1 * math.sin(current_time * params['frequency'])
        
        # Rotation animation
        params['animated_rotation'] = (current_time * params['frequency'] * 10) % 360
        
        # Pulsing opacity
        params['pulsing_opacity'] = params['opacity'] * (0.8 + 0.2 * math.sin(current_time * params['frequency'] * 2))
        
        # Color shifting
        hue_shift = math.sin(current_time * params['frequency'] * 0.5) * 15
        params['animated_hue'] = (params['color_hue'] + hue_shift) % 360
        
        return params
    
    def generate_phase_sequence(self, 
                              start_phase: int = 0, 
                              end_phase: int = 13, 
                              duration_per_phase: float = None) -> List[Dict[str, Any]]:
        """Generate a complete animation sequence through multiple phases."""
        if duration_per_phase is None:
            duration_per_phase = self.phase_duration
        
        sequence = []
        
        for phase_id in range(start_phase, min(end_phase + 1, 14)):
            phase_data = {
                'phase_id': phase_id,
                'phase': self.get_phase(phase_id),
                'duration': duration_per_phase,
                'animation_params': self.calculate_animation_parameters(phase_id),
                'transition_params': self._calculate_transition_params(phase_id, phase_id + 1)
            }
            sequence.append(phase_data)
        
        return sequence
    
    def _calculate_transition_params(self, from_phase: int, to_phase: int) -> Dict[str, Any]:
        """Calculate smooth transition parameters between phases."""
        if to_phase > 13:
            to_phase = 0  # Loop back to beginning
        
        from_params = self.calculate_animation_parameters(from_phase)
        to_params = self.calculate_animation_parameters(to_phase)
        
        transition = {
            'from_phase': from_phase,
            'to_phase': to_phase,
            'duration': self.phase_duration,
            'easing': 'cubic-bezier(0.4, 0.0, 0.2, 1)',  # Material design easing
            'interpolations': {}
        }
        
        # Calculate interpolation values for smooth transitions
        for key in ['rotation', 'scale', 'opacity', 'color_hue', 'frequency', 'amplitude']:
            if key in from_params and key in to_params:
                if from_params[key] != float('inf') and to_params[key] != float('inf'):
                    transition['interpolations'][key] = {
                        'from': from_params[key],
                        'to': to_params[key],
                        'delta': to_params[key] - from_params[key]
                    }
        
        return transition
    
    def sync_with_mystical_tools(self, tool_type: str, tool_output: str) -> Optional[int]:
        """Synchronize phase based on mystical tool output."""
        if not self.client:
            return None
        
        # Analyze tool output for phase-relevant keywords
        output_lower = tool_output.lower()
        
        # Find the best matching phase based on keywords
        best_phase = None
        best_score = 0
        
        for phase in self.phases:
            phase_score = 0
            
            # Check for phase name
            if fuzz.partial_ratio(phase.name.lower(), output_lower) > 60:
                phase_score += 30
            
            # Check for keywords
            for keyword in phase.keywords:
                if keyword in output_lower:
                    phase_score += 20
                elif fuzz.partial_ratio(keyword, output_lower) > 70:
                    phase_score += 10
            
            # Check for geometric patterns
            if phase.geometricPattern and phase.geometricPattern in output_lower:
                phase_score += 25
            
            if phase_score > best_score:
                best_score = phase_score
                best_phase = phase.id
        
        if best_phase is not None and best_score > 30:
            self.set_phase(best_phase)
            return best_phase
        
        return None
    
    def export_phase_map(self, format: str = 'json', filename: str = None) -> str:
        """Export phase mapping data for external rendering systems."""
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"lunareth_phase_map_{timestamp}.{format}"
        
        export_data = {
            'metadata': {
                'generated_at': datetime.now().isoformat(),
                'lunareth_version': '1.0',
                'total_phases': len(self.phases),
                'current_phase': self.current_phase,
                'last_sync': self.last_sync.isoformat() if self.last_sync else None
            },
            'phases': [phase.dict() for phase in self.phases],
            'construct_mappings': self.construct_mappings,
            'animation_sequences': {
                'full_spiral': self.generate_phase_sequence(),
                'cosmic_trinity': self.generate_phase_sequence(0, 2),
                'material_foundation': self.generate_phase_sequence(3, 6),
                'spiritual_ascent': self.generate_phase_sequence(7, 10),
                'transcendent_gateway': self.generate_phase_sequence(11, 13)
            },
            'sacred_constants': {
                'phi': self.PHI,
                'pi_sacred': self.PI_SACRED,
                'spiral_constant': self.SPIRAL_CONSTANT
            }
        }
        
        if format.lower() == 'json':
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(export_data, f, indent=2, default=str)
        elif format.lower() == 'yaml':
            try:
                import yaml
                with open(filename, 'w', encoding='utf-8') as f:
                    yaml.dump(export_data, f, default_flow_style=False, allow_unicode=True)
            except ImportError:
                print("🌙 YAML export requires the 'pyyaml' package")
                return ""
        
        print(f"✨ Lunareth phase map exported to {filename}")
        return filename
    
    def create_sync_state(self) -> LunarethSync:
        """Create a complete synchronization state snapshot."""
        return LunarethSync(
            currentPhase=self.current_phase,
            phases=self.phases,
            syncTimestamp=datetime.now(),
            activeConstruct=self.get_current_phase().name,
            metadata={
                'animation_cache_size': len(self.animation_cache),
                'last_sync_delta': (datetime.now() - self.last_sync).total_seconds() if self.last_sync else None,
                'phase_progression': [p.name for p in self.phases],
                'sacred_ratios': {
                    'phi': self.PHI,
                    'spiral_constant': self.SPIRAL_CONSTANT
                }
            }
        )
    
    def start_continuous_sync(self, interval: float = None):
        """Start continuous synchronization with the mystical system."""
        if interval is None:
            interval = self.sync_interval
        
        print(f"🌙 Starting Lunareth continuous synchronization (interval: {interval}s)")
        
        try:
            while True:
                self.last_sync = datetime.now()
                
                # Update animation cache
                current_params = self.calculate_animation_parameters()
                self.animation_cache[self.current_phase] = current_params
                
                # Auto-advance phase based on time (demo mode)
                elapsed = time.time() % (self.phase_duration * 14)
                auto_phase = int(elapsed // self.phase_duration)
                
                if auto_phase != self.current_phase:
                    print(f"🔄 Phase transition: {self.get_current_phase().name} → {self.get_phase(auto_phase).name}")
                    self.set_phase(auto_phase)
                
                time.sleep(interval)
                
        except KeyboardInterrupt:
            print("\n🌙 Lunareth synchronization stopped by cosmic command")
    
    def get_phase_by_name(self, name: str) -> Optional[SpiralPhase]:
        """Get phase by exact name match."""
        for phase in self.phases:
            if phase.name.lower() == name.lower():
                return phase
        return None
    
    def find_phases_by_keyword(self, keyword: str) -> List[SpiralPhase]:
        """Find all phases containing a specific keyword."""
        matching_phases = []
        keyword_lower = keyword.lower()
        
        for phase in self.phases:
            if keyword_lower in phase.keywords or keyword_lower in phase.name.lower():
                matching_phases.append(phase)
        
        return matching_phases
    
    def calculate_harmonic_resonance(self, phase1_id: int, phase2_id: int) -> float:
        """Calculate harmonic resonance between two phases."""
        phase1 = self.get_phase(phase1_id)
        phase2 = self.get_phase(phase2_id)
        
        if not phase1 or not phase2:
            return 0.0
        
        # Calculate frequency ratio
        freq_ratio = phase1.frequency / phase2.frequency if phase2.frequency > 0 else 0
        
        # Golden ratio indicates perfect harmony
        phi_distance = abs(freq_ratio - self.PHI)
        
        # Octave relationships (powers of 2) also indicate harmony
        octave_distance = min(
            abs(freq_ratio - 2**i) for i in range(-3, 4)
        )
        
        # Calculate overall resonance score
        resonance = 1.0 / (1.0 + phi_distance + octave_distance)
        
        return min(1.0, resonance)


def demo_lunareth_sync():
    """Demonstrate Lunareth synchronization capabilities."""
    print("🌙 Initializing Lunareth Synchronization Demo")
    print("="*60)
    
    # Create synchronizer
    sync = LunarethSynchronizer()
    
    # Demonstrate phase resolution
    test_constructs = [
        "golden ratio", "void", "trinity", "cosmic cycles", 
        "transcendent gateway", "duality", "infinite"
    ]
    
    print("\n🔮 Phase Resolution Demonstration:")
    for construct in test_constructs:
        phase_id = sync.resolve_phase_from_construct(construct)
        if phase_id is not None:
            phase = sync.get_phase(phase_id)
            print(f"  '{construct}' → Phase {phase_id}: {phase.name}")
        else:
            print(f"  '{construct}' → No match found")
    
    # Demonstrate animation parameters
    print("\n✨ Animation Parameters for Current Phase:")
    params = sync.calculate_animation_parameters()
    for key, value in params.items():
        if isinstance(value, float):
            print(f"  {key}: {value:.3f}")
        else:
            print(f"  {key}: {value}")
    
    # Demonstrate phase sequence
    print("\n🌀 Cosmic Trinity Sequence (Phases 0-2):")
    sequence = sync.generate_phase_sequence(0, 2, 5.0)
    for phase_data in sequence:
        phase = phase_data['phase']
        print(f"  Phase {phase.id}: {phase.name} ({phase_data['duration']}s)")
        print(f"    Energy: {phase.energySignature} | Pattern: {phase.geometricPattern}")
    
    # Export phase map
    print("\n💾 Exporting Phase Map...")
    filename = sync.export_phase_map('json')
    print(f"    Exported to: {filename}")
    
    print("\n🌙 Lunareth Demo Complete")


if __name__ == "__main__":
    demo_lunareth_sync()