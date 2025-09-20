#!/usr/bin/env python3
"""
Scribe's Geometricum - Sacred Geometry Engine
============================================

A mystical implementation of sacred geometric patterns, mathematical harmony,
and divine proportions. This module renders canvas-based geometric patterns,
implements L-system fractals, and calculates sacred mathematical relationships
found throughout mystical traditions.

🌟 "Geometry is frozen music" - Pythagoras 🌟
"""

import math
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import Circle, Polygon, Arc
from PIL import Image, ImageDraw, ImageFont
import json
from typing import List, Tuple, Dict, Any, Optional, Union
from datetime import datetime
from pathlib import Path
import colorsys

from models import GeometricPattern, GeometryRenderRequest


class SacredGeometry:
    """Sacred geometry calculator and renderer."""
    
    # Sacred mathematical constants
    PHI = (1 + math.sqrt(5)) / 2  # Golden ratio
    PHI_INVERSE = 1 / PHI
    ROOT_2 = math.sqrt(2)
    ROOT_3 = math.sqrt(3)
    ROOT_5 = math.sqrt(5)
    PI_SACRED = math.pi
    TAU = 2 * math.pi
    
    # Sacred ratios and proportions
    VESICA_RATIO = ROOT_3 / 2
    PENTAGON_ANGLE = 72  # degrees
    HEXAGON_ANGLE = 60   # degrees
    OCTAGON_ANGLE = 45   # degrees
    
    def __init__(self):
        """Initialize the sacred geometry engine."""
        self.current_figure = None
        self.current_ax = None
        self.render_history = []
        
        # Color palettes for mystical rendering
        self.color_palettes = {
            'golden': ['#FFD700', '#FFA500', '#FF8C00', '#DAA520'],
            'mystical': ['#4B0082', '#8A2BE2', '#9932CC', '#6A5ACD'],
            'emerald': ['#50C878', '#00FF7F', '#00FA9A', '#90EE90'],
            'cosmic': ['#191970', '#000080', '#0000CD', '#4169E1'],
            'fire': ['#DC143C', '#FF0000', '#FF4500', '#FF6347'],
            'water': ['#0080FF', '#00BFFF', '#87CEEB', '#87CEFA'],
            'earth': ['#8B4513', '#A0522D', '#CD853F', '#DEB887'],
            'air': ['#E6E6FA', '#F0F8FF', '#F5F5DC', '#FFFACD']
        }
    
    # Sacred Ratio Calculations
    def golden_ratio_spiral(self, 
                           center: Tuple[float, float] = (0, 0), 
                           initial_radius: float = 1.0, 
                           turns: int = 4) -> List[Tuple[float, float]]:
        """Generate points for a golden ratio spiral."""
        points = []
        angle = 0
        radius = initial_radius
        
        for i in range(turns * 360):
            angle_rad = math.radians(angle)
            
            x = center[0] + radius * math.cos(angle_rad)
            y = center[1] + radius * math.sin(angle_rad)
            
            points.append((x, y))
            
            # Increase radius by golden ratio scaling
            radius *= math.pow(self.PHI, 1/180)  # Smooth growth
            angle += 1
        
        return points
    
    def fibonacci_spiral_squares(self, n_terms: int = 8) -> List[Dict[str, Any]]:
        """Generate squares for Fibonacci spiral construction."""
        # Generate Fibonacci sequence
        fib = [1, 1]
        for i in range(2, n_terms):
            fib.append(fib[i-1] + fib[i-2])
        
        squares = []
        x, y = 0, 0
        direction = 0  # 0: right, 1: up, 2: left, 3: down
        
        for i, size in enumerate(fib):
            squares.append({
                'x': x,
                'y': y,
                'size': size,
                'number': size,
                'color_index': i % 8
            })
            
            # Move to next position
            if direction == 0:  # right
                x += size
                y -= fib[i-1] if i > 0 else 0
            elif direction == 1:  # up
                y += size
                x -= fib[i-1] if i > 0 else 0
            elif direction == 2:  # left
                x -= size
                y += fib[i-1] if i > 0 else 0
            elif direction == 3:  # down
                y -= size
                x += fib[i-1] if i > 0 else 0
            
            # Change direction clockwise
            direction = (direction + 1) % 4
        
        return squares
    
    def vesica_piscis(self, 
                     center1: Tuple[float, float] = (-0.5, 0), 
                     center2: Tuple[float, float] = (0.5, 0),
                     radius: float = 1.0) -> Dict[str, Any]:
        """Calculate vesica piscis (sacred intersection of two circles)."""
        # Calculate intersection points
        distance = math.sqrt((center2[0] - center1[0])**2 + (center2[1] - center1[1])**2)
        
        if distance > 2 * radius or distance == 0:
            return None
        
        # Intersection geometry
        a = distance / 2
        h = math.sqrt(radius**2 - a**2)
        
        mid_x = (center1[0] + center2[0]) / 2
        mid_y = (center1[1] + center2[1]) / 2
        
        intersection1 = (mid_x, mid_y + h)
        intersection2 = (mid_x, mid_y - h)
        
        # Sacred measurements
        lens_area = 2 * (radius**2 * math.acos(a/radius) - a * h)
        lens_perimeter = 2 * radius * math.acos(a/radius) * 2
        
        return {
            'center1': center1,
            'center2': center2,
            'radius': radius,
            'intersections': [intersection1, intersection2],
            'lens_area': lens_area,
            'lens_perimeter': lens_perimeter,
            'sacred_ratio': h / a,  # Related to sqrt(3)
            'distance': distance
        }
    
    def platonic_solid_projection(self, solid_type: str = 'dodecahedron') -> Dict[str, Any]:
        """Generate 2D projection of Platonic solids."""
        if solid_type == 'tetrahedron':
            # 4 triangular faces
            vertices = [
                (0, 1, 0),
                (-0.866, -0.5, 0),
                (0.866, -0.5, 0),
                (0, 0, 0.816)
            ]
            faces = [(0, 1, 2), (0, 1, 3), (0, 2, 3), (1, 2, 3)]
        
        elif solid_type == 'cube':
            # 6 square faces
            s = 0.5
            vertices = [
                (-s, -s, -s), (s, -s, -s), (s, s, -s), (-s, s, -s),
                (-s, -s, s), (s, -s, s), (s, s, s), (-s, s, s)
            ]
            faces = [
                (0, 1, 2, 3), (4, 5, 6, 7), (0, 1, 5, 4),
                (2, 3, 7, 6), (0, 3, 7, 4), (1, 2, 6, 5)
            ]
        
        elif solid_type == 'octahedron':
            # 8 triangular faces
            vertices = [
                (1, 0, 0), (-1, 0, 0), (0, 1, 0),
                (0, -1, 0), (0, 0, 1), (0, 0, -1)
            ]
            faces = [
                (0, 2, 4), (0, 4, 3), (0, 3, 5), (0, 5, 2),
                (1, 2, 5), (1, 5, 3), (1, 3, 4), (1, 4, 2)
            ]
        
        elif solid_type == 'icosahedron':
            # 20 triangular faces - more complex
            phi = self.PHI
            vertices = [
                (-1, phi, 0), (1, phi, 0), (-1, -phi, 0), (1, -phi, 0),
                (0, -1, phi), (0, 1, phi), (0, -1, -phi), (0, 1, -phi),
                (phi, 0, -1), (phi, 0, 1), (-phi, 0, -1), (-phi, 0, 1)
            ]
            # Simplified face list
            faces = [(0, 1, 5), (0, 5, 11), (0, 11, 10), (1, 8, 9), (1, 9, 5)]
        
        elif solid_type == 'dodecahedron':
            # 12 pentagonal faces - project to pentagon
            phi = self.PHI
            a = 1 / math.sqrt(3)
            b = a / phi
            c = a * phi
            
            vertices = [
                (a, a, a), (a, a, -a), (a, -a, a), (a, -a, -a),
                (-a, a, a), (-a, a, -a), (-a, -a, a), (-a, -a, -a),
                (0, b, c), (0, -b, c), (0, b, -c), (0, -b, -c),
                (b, c, 0), (-b, c, 0), (b, -c, 0), (-b, -c, 0),
                (c, 0, b), (c, 0, -b), (-c, 0, b), (-c, 0, -b)
            ]
            faces = [(0, 8, 9, 2, 16), (0, 16, 17, 1, 12)]  # Sample faces
        
        # Project 3D vertices to 2D (simple orthographic projection)
        projected_vertices = [(v[0], v[1]) for v in vertices]
        
        return {
            'solid_type': solid_type,
            'vertices_3d': vertices,
            'vertices_2d': projected_vertices,
            'faces': faces,
            'face_count': len(faces),
            'vertex_count': len(vertices)
        }
    
    # Geometric Pattern Generators
    def flower_of_life(self, 
                      center: Tuple[float, float] = (0, 0), 
                      radius: float = 1.0, 
                      rings: int = 2) -> List[Tuple[float, float]]:
        """Generate the Flower of Life pattern."""
        circles = [center]  # Central circle
        
        for ring in range(1, rings + 1):
            ring_radius = ring * radius * 2
            circle_count = 6 * ring
            
            for i in range(circle_count):
                angle = (2 * math.pi * i) / circle_count
                x = center[0] + ring_radius * math.cos(angle)
                y = center[1] + ring_radius * math.sin(angle)
                circles.append((x, y))
        
        return circles
    
    def sri_yantra_triangles(self, size: float = 1.0) -> List[List[Tuple[float, float]]]:
        """Generate the triangular structure of Sri Yantra."""
        triangles = []
        
        # Central upward triangle
        central_up = [
            (0, size * 0.6),
            (-size * 0.5, -size * 0.3),
            (size * 0.5, -size * 0.3)
        ]
        triangles.append(central_up)
        
        # Central downward triangle
        central_down = [
            (0, -size * 0.6),
            (-size * 0.5, size * 0.3),
            (size * 0.5, size * 0.3)
        ]
        triangles.append(central_down)
        
        # Additional triangular layers (simplified)
        for layer in range(1, 4):
            scale = 1 + layer * 0.3
            
            # Upward triangles
            for i in range(4):
                angle = (i * math.pi) / 2
                offset_x = math.cos(angle) * layer * 0.2
                offset_y = math.sin(angle) * layer * 0.2
                
                triangle = [
                    (offset_x, offset_y + size * 0.4 * scale),
                    (offset_x - size * 0.3 * scale, offset_y - size * 0.2 * scale),
                    (offset_x + size * 0.3 * scale, offset_y - size * 0.2 * scale)
                ]
                triangles.append(triangle)
        
        return triangles
    
    def mandala_pattern(self, 
                       center: Tuple[float, float] = (0, 0), 
                       layers: int = 5, 
                       symmetry: int = 8) -> Dict[str, Any]:
        """Generate a sacred mandala pattern."""
        mandala_elements = {
            'center': center,
            'circles': [],
            'petals': [],
            'sacred_points': [],
            'symmetry_lines': []
        }
        
        # Central point
        mandala_elements['sacred_points'].append(center)
        
        # Concentric circles
        for layer in range(1, layers + 1):
            radius = layer * 0.5
            mandala_elements['circles'].append({
                'center': center,
                'radius': radius,
                'layer': layer
            })
        
        # Symmetry lines
        for i in range(symmetry):
            angle = (2 * math.pi * i) / symmetry
            end_x = center[0] + layers * 0.5 * math.cos(angle)
            end_y = center[1] + layers * 0.5 * math.sin(angle)
            
            mandala_elements['symmetry_lines'].append({
                'start': center,
                'end': (end_x, end_y),
                'angle': angle
            })
        
        # Petal patterns
        for layer in range(1, layers + 1):
            layer_radius = layer * 0.4
            petal_count = symmetry * layer
            
            for i in range(petal_count):
                angle = (2 * math.pi * i) / petal_count
                petal_x = center[0] + layer_radius * math.cos(angle)
                petal_y = center[1] + layer_radius * math.sin(angle)
                
                mandala_elements['petals'].append({
                    'center': (petal_x, petal_y),
                    'angle': angle,
                    'layer': layer,
                    'radius': 0.1 + layer * 0.05
                })
        
        return mandala_elements
    
    # L-System Fractal Generator
    def generate_l_system(self, 
                         axiom: str, 
                         rules: Dict[str, str], 
                         iterations: int) -> str:
        """Generate L-system string after n iterations."""
        current = axiom
        
        for _ in range(iterations):
            next_gen = ""
            for char in current:
                if char in rules:
                    next_gen += rules[char]
                else:
                    next_gen += char
            current = next_gen
        
        return current
    
    def l_system_to_coordinates(self, 
                              l_string: str, 
                              start_pos: Tuple[float, float] = (0, 0),
                              start_angle: float = 90,
                              step_length: float = 1.0,
                              angle_increment: float = 60) -> List[Tuple[float, float]]:
        """Convert L-system string to drawing coordinates."""
        coordinates = []
        position_stack = []
        angle_stack = []
        
        x, y = start_pos
        angle = start_angle
        
        coordinates.append((x, y))
        
        for char in l_string:
            if char == 'F' or char == 'A' or char == 'B':  # Forward
                new_x = x + step_length * math.cos(math.radians(angle))
                new_y = y + step_length * math.sin(math.radians(angle))
                coordinates.append((new_x, new_y))
                x, y = new_x, new_y
            
            elif char == '+':  # Turn left
                angle += angle_increment
            
            elif char == '-':  # Turn right
                angle -= angle_increment
            
            elif char == '[':  # Save position
                position_stack.append((x, y))
                angle_stack.append(angle)
            
            elif char == ']':  # Restore position
                if position_stack:
                    x, y = position_stack.pop()
                    angle = angle_stack.pop()
                    coordinates.append((x, y))  # Mark branch point
        
        return coordinates
    
    def create_fractal_tree(self, iterations: int = 4) -> List[Tuple[float, float]]:
        """Create a fractal tree using L-systems."""
        axiom = "F"
        rules = {"F": "F[+F]F[-F]F"}
        
        l_string = self.generate_l_system(axiom, rules, iterations)
        coordinates = self.l_system_to_coordinates(
            l_string, 
            start_pos=(0, 0),
            start_angle=90,
            step_length=1.0,
            angle_increment=25
        )
        
        return coordinates
    
    def create_koch_snowflake(self, iterations: int = 3) -> List[Tuple[float, float]]:
        """Create Koch snowflake fractal."""
        axiom = "F--F--F"
        rules = {"F": "F+F--F+F"}
        
        l_string = self.generate_l_system(axiom, rules, iterations)
        coordinates = self.l_system_to_coordinates(
            l_string,
            start_pos=(0, 0),
            start_angle=0,
            step_length=1.0,
            angle_increment=60
        )
        
        return coordinates
    
    def create_dragon_curve(self, iterations: int = 10) -> List[Tuple[float, float]]:
        """Create dragon curve fractal."""
        axiom = "FX"
        rules = {
            "X": "X+YF+",
            "Y": "-FX-Y"
        }
        
        l_string = self.generate_l_system(axiom, rules, iterations)
        coordinates = self.l_system_to_coordinates(
            l_string,
            start_pos=(0, 0),
            start_angle=0,
            step_length=1.0,
            angle_increment=90
        )
        
        return coordinates
    
    # Rendering Functions
    def render_pattern(self, 
                      pattern: GeometricPattern, 
                      width: int = 800, 
                      height: int = 600,
                      output_file: str = None,
                      show_plot: bool = True) -> str:
        """Render a geometric pattern to image."""
        fig, ax = plt.subplots(figsize=(width/100, height/100))
        self.current_figure = fig
        self.current_ax = ax
        
        # Set up the canvas
        ax.set_xlim(-width/200, width/200)
        ax.set_ylim(-height/200, height/200)
        ax.set_aspect('equal')
        ax.axis('off')
        
        # Set background color
        bg_color = pattern.parameters.get('background_color', '#000000')
        fig.patch.set_facecolor(bg_color)
        ax.set_facecolor(bg_color)
        
        # Get color scheme
        color_scheme = pattern.parameters.get('color_scheme', 'golden')
        colors = self.color_palettes.get(color_scheme, self.color_palettes['golden'])
        
        # Render based on pattern type
        if pattern.type == 'golden_spiral':
            self._render_golden_spiral(ax, pattern, colors)
        
        elif pattern.type == 'flower_of_life':
            self._render_flower_of_life(ax, pattern, colors)
        
        elif pattern.type == 'vesica_piscis':
            self._render_vesica_piscis(ax, pattern, colors)
        
        elif pattern.type == 'mandala':
            self._render_mandala(ax, pattern, colors)
        
        elif pattern.type == 'sri_yantra':
            self._render_sri_yantra(ax, pattern, colors)
        
        elif pattern.type == 'platonic_solid':
            self._render_platonic_solid(ax, pattern, colors)
        
        elif pattern.type == 'l_system':
            self._render_l_system(ax, pattern, colors)
        
        elif pattern.type == 'fibonacci_spiral':
            self._render_fibonacci_spiral(ax, pattern, colors)
        
        else:
            # Default geometric pattern
            self._render_basic_geometry(ax, pattern, colors)
        
        # Save or show
        if output_file is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_file = f"sacred_geometry_{pattern.name}_{timestamp}.png"
        
        plt.savefig(output_file, dpi=150, bbox_inches='tight', 
                   facecolor=bg_color, edgecolor='none')
        
        if show_plot:
            plt.show()
        else:
            plt.close()
        
        # Record in history
        self.render_history.append({
            'pattern': pattern.name,
            'file': output_file,
            'timestamp': datetime.now().isoformat(),
            'parameters': pattern.parameters
        })
        
        return output_file
    
    def _render_golden_spiral(self, ax, pattern: GeometricPattern, colors: List[str]):
        """Render golden ratio spiral."""
        turns = pattern.parameters.get('turns', 4)
        radius = pattern.parameters.get('radius', 1.0)
        
        spiral_points = self.golden_ratio_spiral(
            center=(0, 0),
            initial_radius=radius,
            turns=turns
        )
        
        # Draw spiral
        x_coords = [p[0] for p in spiral_points]
        y_coords = [p[1] for p in spiral_points]
        
        ax.plot(x_coords, y_coords, color=colors[0], linewidth=2, alpha=0.8)
        
        # Draw golden rectangles
        if pattern.parameters.get('show_rectangles', True):
            squares = self.fibonacci_spiral_squares(8)
            for i, square in enumerate(squares):
                color = colors[i % len(colors)]
                rect = patches.Rectangle(
                    (square['x'], square['y']), 
                    square['size'], square['size'],
                    linewidth=1, edgecolor=color, facecolor='none', alpha=0.6
                )
                ax.add_patch(rect)
    
    def _render_flower_of_life(self, ax, pattern: GeometricPattern, colors: List[str]):
        """Render Flower of Life pattern."""
        rings = pattern.parameters.get('rings', 2)
        radius = pattern.parameters.get('radius', 1.0)
        
        circles = self.flower_of_life(center=(0, 0), radius=radius, rings=rings)
        
        for i, center in enumerate(circles):
            color = colors[i % len(colors)]
            circle = Circle(center, radius, fill=False, edgecolor=color, 
                          linewidth=1.5, alpha=0.7)
            ax.add_patch(circle)
    
    def _render_vesica_piscis(self, ax, pattern: GeometricPattern, colors: List[str]):
        """Render Vesica Piscis."""
        radius = pattern.parameters.get('radius', 2.0)
        
        vesica = self.vesica_piscis(
            center1=(-radius/2, 0),
            center2=(radius/2, 0),
            radius=radius
        )
        
        if vesica:
            # Draw circles
            circle1 = Circle(vesica['center1'], vesica['radius'], 
                           fill=False, edgecolor=colors[0], linewidth=2, alpha=0.8)
            circle2 = Circle(vesica['center2'], vesica['radius'], 
                           fill=False, edgecolor=colors[1], linewidth=2, alpha=0.8)
            
            ax.add_patch(circle1)
            ax.add_patch(circle2)
            
            # Highlight intersection
            for point in vesica['intersections']:
                ax.plot(point[0], point[1], 'o', color=colors[2], markersize=8)
    
    def _render_mandala(self, ax, pattern: GeometricPattern, colors: List[str]):
        """Render mandala pattern."""
        layers = pattern.parameters.get('layers', 5)
        symmetry = pattern.parameters.get('symmetry', 8)
        
        mandala = self.mandala_pattern(center=(0, 0), layers=layers, symmetry=symmetry)
        
        # Draw circles
        for circle in mandala['circles']:
            color = colors[circle['layer'] % len(colors)]
            circle_patch = Circle(circle['center'], circle['radius'], 
                                fill=False, edgecolor=color, linewidth=1, alpha=0.6)
            ax.add_patch(circle_patch)
        
        # Draw symmetry lines
        for line in mandala['symmetry_lines']:
            ax.plot([line['start'][0], line['end'][0]], 
                   [line['start'][1], line['end'][1]], 
                   color=colors[0], linewidth=0.5, alpha=0.4)
        
        # Draw petals
        for petal in mandala['petals']:
            color = colors[petal['layer'] % len(colors)]
            petal_circle = Circle(petal['center'], petal['radius'], 
                                fill=True, facecolor=color, alpha=0.3, edgecolor='none')
            ax.add_patch(petal_circle)
    
    def _render_sri_yantra(self, ax, pattern: GeometricPattern, colors: List[str]):
        """Render Sri Yantra triangles."""
        size = pattern.parameters.get('size', 3.0)
        
        triangles = self.sri_yantra_triangles(size)
        
        for i, triangle in enumerate(triangles):
            color = colors[i % len(colors)]
            triangle_patch = Polygon(triangle, fill=False, edgecolor=color, 
                                   linewidth=1.5, alpha=0.7)
            ax.add_patch(triangle_patch)
    
    def _render_platonic_solid(self, ax, pattern: GeometricPattern, colors: List[str]):
        """Render Platonic solid projection."""
        solid_type = pattern.parameters.get('solid_type', 'dodecahedron')
        solid = self.platonic_solid_projection(solid_type)
        
        # Draw vertices
        for vertex in solid['vertices_2d']:
            ax.plot(vertex[0], vertex[1], 'o', color=colors[0], markersize=6)
        
        # Draw edges (simplified)
        for face in solid['faces'][:min(6, len(solid['faces']))]:  # Limit for clarity
            face_vertices = [solid['vertices_2d'][i] for i in face]
            if len(face_vertices) >= 3:
                polygon = Polygon(face_vertices, fill=False, 
                                edgecolor=colors[1], linewidth=1, alpha=0.6)
                ax.add_patch(polygon)
    
    def _render_l_system(self, ax, pattern: GeometricPattern, colors: List[str]):
        """Render L-system fractal."""
        fractal_type = pattern.parameters.get('fractal_type', 'tree')
        iterations = pattern.parameters.get('iterations', 4)
        
        if fractal_type == 'tree':
            coordinates = self.create_fractal_tree(iterations)
        elif fractal_type == 'koch':
            coordinates = self.create_koch_snowflake(iterations)
        elif fractal_type == 'dragon':
            coordinates = self.create_dragon_curve(iterations)
        else:
            coordinates = self.create_fractal_tree(iterations)
        
        # Draw the fractal
        if coordinates:
            x_coords = [p[0] for p in coordinates]
            y_coords = [p[1] for p in coordinates]
            
            ax.plot(x_coords, y_coords, color=colors[0], linewidth=1, alpha=0.8)
    
    def _render_fibonacci_spiral(self, ax, pattern: GeometricPattern, colors: List[str]):
        """Render Fibonacci spiral with squares."""
        n_terms = pattern.parameters.get('terms', 8)
        
        squares = self.fibonacci_spiral_squares(n_terms)
        
        for i, square in enumerate(squares):
            color = colors[i % len(colors)]
            
            # Draw square
            rect = patches.Rectangle(
                (square['x'], square['y']), 
                square['size'], square['size'],
                linewidth=2, edgecolor=color, facecolor=color, alpha=0.3
            )
            ax.add_patch(rect)
            
            # Add Fibonacci number
            ax.text(square['x'] + square['size']/2, square['y'] + square['size']/2,
                   str(square['number']), ha='center', va='center',
                   fontsize=max(8, min(20, square['size']*2)), color='white', weight='bold')
    
    def _render_basic_geometry(self, ax, pattern: GeometricPattern, colors: List[str]):
        """Render basic geometric shapes."""
        shape = pattern.parameters.get('shape', 'circle')
        size = pattern.parameters.get('size', 2.0)
        
        if shape == 'circle':
            circle = Circle((0, 0), size, fill=False, edgecolor=colors[0], linewidth=2)
            ax.add_patch(circle)
        elif shape == 'square':
            square = patches.Rectangle((-size/2, -size/2), size, size,
                                     fill=False, edgecolor=colors[0], linewidth=2)
            ax.add_patch(square)
        elif shape == 'triangle':
            triangle = patches.RegularPolygon((0, 0), 3, size,
                                            fill=False, edgecolor=colors[0], linewidth=2)
            ax.add_patch(triangle)


# Utility Functions
def create_sacred_pattern(pattern_name: str, **kwargs) -> GeometricPattern:
    """Create a predefined sacred geometry pattern."""
    patterns = {
        'golden_spiral': GeometricPattern(
            name="Golden Spiral",
            type="golden_spiral",
            parameters={'turns': 4, 'radius': 1.0, 'show_rectangles': True},
            sacred_ratio=SacredGeometry.PHI
        ),
        'flower_of_life': GeometricPattern(
            name="Flower of Life",
            type="flower_of_life", 
            parameters={'rings': 2, 'radius': 1.0},
            sacred_ratio=SacredGeometry.ROOT_3
        ),
        'vesica_piscis': GeometricPattern(
            name="Vesica Piscis",
            type="vesica_piscis",
            parameters={'radius': 2.0},
            sacred_ratio=SacredGeometry.VESICA_RATIO
        ),
        'mandala': GeometricPattern(
            name="Sacred Mandala",
            type="mandala",
            parameters={'layers': 5, 'symmetry': 8},
            sacred_ratio=1.0
        ),
        'sri_yantra': GeometricPattern(
            name="Sri Yantra", 
            type="sri_yantra",
            parameters={'size': 3.0},
            sacred_ratio=SacredGeometry.PHI
        ),
        'fractal_tree': GeometricPattern(
            name="Fractal Tree",
            type="l_system",
            parameters={'fractal_type': 'tree', 'iterations': 4},
            sacred_ratio=SacredGeometry.PHI
        ),
        'koch_snowflake': GeometricPattern(
            name="Koch Snowflake",
            type="l_system", 
            parameters={'fractal_type': 'koch', 'iterations': 3},
            sacred_ratio=SacredGeometry.ROOT_3
        ),
        'fibonacci_spiral': GeometricPattern(
            name="Fibonacci Spiral",
            type="fibonacci_spiral",
            parameters={'terms': 8},
            sacred_ratio=SacredGeometry.PHI
        )
    }
    
    if pattern_name in patterns:
        pattern = patterns[pattern_name]
        # Update with custom parameters
        pattern.parameters.update(kwargs)
        return pattern
    else:
        raise ValueError(f"Unknown pattern: {pattern_name}")


def render_sacred_collection(output_dir: str = "sacred_renders"):
    """Render a collection of sacred geometry patterns."""
    geometry = SacredGeometry()
    Path(output_dir).mkdir(exist_ok=True)
    
    patterns = [
        'golden_spiral', 'flower_of_life', 'vesica_piscis', 
        'mandala', 'sri_yantra', 'fractal_tree', 'koch_snowflake', 'fibonacci_spiral'
    ]
    
    rendered_files = []
    
    for pattern_name in patterns:
        print(f"🌟 Rendering {pattern_name}...")
        pattern = create_sacred_pattern(pattern_name)
        
        output_file = f"{output_dir}/{pattern_name}.png"
        geometry.render_pattern(pattern, output_file=output_file, show_plot=False)
        rendered_files.append(output_file)
    
    print(f"✨ Sacred geometry collection rendered to {output_dir}/")
    return rendered_files


def demo_sacred_geometry():
    """Demonstrate sacred geometry capabilities."""
    print("🌟 Sacred Geometry Demo - Scribe's Geometricum")
    print("="*60)
    
    geometry = SacredGeometry()
    
    # Demonstrate calculations
    print("\n🔢 Sacred Mathematical Constants:")
    print(f"   φ (Phi/Golden Ratio): {geometry.PHI:.6f}")
    print(f"   √2: {geometry.ROOT_2:.6f}")
    print(f"   √3: {geometry.ROOT_3:.6f}")
    print(f"   √5: {geometry.ROOT_5:.6f}")
    
    # Demonstrate vesica piscis
    print("\n🌙 Vesica Piscis Calculation:")
    vesica = geometry.vesica_piscis()
    if vesica:
        print(f"   Lens Area: {vesica['lens_area']:.4f}")
        print(f"   Sacred Ratio (h/a): {vesica['sacred_ratio']:.4f}")
    
    # Demonstrate golden spiral
    print("\n🌀 Golden Spiral (first 10 points):")
    spiral = geometry.golden_ratio_spiral(turns=1)
    for i, point in enumerate(spiral[:10]):
        print(f"   Point {i+1}: ({point[0]:.3f}, {point[1]:.3f})")
    
    # Demonstrate L-system
    print("\n🌳 L-System Generation:")
    l_string = geometry.generate_l_system("F", {"F": "F[+F]F[-F]"}, 2)
    print(f"   Generated string: {l_string}")
    
    # Render a simple pattern
    print("\n🎨 Rendering Golden Spiral...")
    pattern = create_sacred_pattern('golden_spiral')
    output_file = geometry.render_pattern(pattern, show_plot=False)
    print(f"   Rendered to: {output_file}")
    
    print("\n🌟 Sacred Geometry Demo Complete")


if __name__ == "__main__":
    demo_sacred_geometry()