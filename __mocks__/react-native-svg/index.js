import React from 'react';
import { View } from 'react-native';

const createMockSvgElement = (displayName) => {
  const Component = ({ children, ...props }) => 
    React.createElement(View, { ...props }, children);
  Component.displayName = displayName;
  return Component;
};

const Svg = createMockSvgElement('Svg');
const Circle = createMockSvgElement('Circle');
const Path = createMockSvgElement('Path');
const G = createMockSvgElement('G');
const Text = createMockSvgElement('Text');
const Rect = createMockSvgElement('Rect');
const Line = createMockSvgElement('Line');
const Ellipse = createMockSvgElement('Ellipse');
const Polygon = createMockSvgElement('Polygon');
const Polyline = createMockSvgElement('Polyline');
const Image = createMockSvgElement('Image');
const ClipPath = createMockSvgElement('ClipPath');
const Defs = createMockSvgElement('Defs');
const Use = createMockSvgElement('Use');
const Symbol = createMockSvgElement('Symbol');
const Marker = createMockSvgElement('Marker');
const Mask = createMockSvgElement('Mask');
const Pattern = createMockSvgElement('Pattern');
const LinearGradient = createMockSvgElement('LinearGradient');
const RadialGradient = createMockSvgElement('RadialGradient');
const Stop = createMockSvgElement('Stop');
const ForeignObject = createMockSvgElement('ForeignObject');
const Tspan = createMockSvgElement('Tspan');
const TextPath = createMockSvgElement('TextPath');
const A = createMockSvgElement('A');

export {
  Svg,
  Circle,
  Path,
  G,
  Text,
  Rect,
  Line,
  Ellipse,
  Polygon,
  Polyline,
  Image,
  ClipPath,
  Defs,
  Use,
  Symbol,
  Marker,
  Mask,
  Pattern,
  LinearGradient,
  RadialGradient,
  Stop,
  ForeignObject,
  Tspan,
  TextPath,
  A,
};

export default Svg;
