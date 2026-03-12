export const defaultPackage = '@tony.ganchev/eslint-plugin-header';

export const packageColors = [
    '#f472b6', // Pink
    '#60a5fa', // Blue (Fixed hue)
    '#4ade80', // Green (Brightened)
    '#f59e0b', // Yellow (Restored)
    '#a78bfa', // Purple (Brightened)
    '#f87171', // Red
    '#2dd4bf', // Teal
    '#fb923c'  // Orange
];

export interface PackageConfig {
    id: string; // unique identifier
    name: string;
    visible: boolean;
}
