export const defaultPackage = '@tony.ganchev/eslint-plugin-header';

export const packageColors = [
    '#ec4899', // pink
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // yellow
    '#8b5cf6', // purple
    '#ef4444', // red
    '#14b8a6', // teal
    '#f97316'  // orange
];

export interface PackageConfig {
    id: string; // unique identifier
    name: string;
    visible: boolean;
}
