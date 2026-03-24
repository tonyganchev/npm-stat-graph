/**
 * @copyright 2026 Tony Ganchev
 * @license MIT
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

import { CSSProperties, FC, useState } from 'react';
import { Plus, Eye, EyeOff, X, ArrowUpDown } from 'lucide-react';
import { PackageConfig } from '../types';
import { packageColors } from '../utils';
import { AutocompleteInput } from './AutocompleteInput';

interface PackageSelectorProps {
    packages: PackageConfig[];
    setPackages: (pkgs: PackageConfig[]) => void;
    isLoading: boolean;
}

export const PackageSelector: FC<PackageSelectorProps> = ({
    packages,
    setPackages,
    isLoading
}) => {
    const [hoveredSwapIndex, setHoveredSwapIndex] = useState<number | null>(null);

    const addPackage = () => {
        setPackages([...packages, { name: '', visible: true }]);
    };

    const removePackage = (index: number) => {
        const newPkgs = [...packages];
        newPkgs.splice(index, 1);
        setPackages(newPkgs);
    };

    const toggleVisibility = (index: number) => {
        const newPkgs = [...packages];
        newPkgs[index].visible = !newPkgs[index].visible;
        setPackages(newPkgs);
    };

    const movePackage = (index: number, direction: -1 | 1) => {
        if (index + direction < 0 || index + direction >= packages.length) {
            return;
        }
        const newPkgs = [...packages];
        const temp = newPkgs[index];
        newPkgs[index] = newPkgs[index + direction];
        newPkgs[index + direction] = temp;
        setPackages(newPkgs);
    };

    const updatePackageName = (index: number, val: string) => {
        const newPkgs = [...packages];
        newPkgs[index].name = val;
        setPackages(newPkgs);
    };

    return (
        <div className="package-list">
            {packages.map((pkg, i) => (
                <div key={i} className="package-input-row">
                    {i < packages.length - 1 && (
                        <div className={`swap-hint ${hoveredSwapIndex === i ? 'visible' : ''}`} />
                    )}
                    <div
                        className="package-color-indicator"
                        style={{ background: packageColors[i % packageColors.length] }}
                    />

                    <AutocompleteInput
                        value={pkg.name}
                        onChange={(val: string) => updatePackageName(i, val)}
                        placeholder={`Package ${i + 1} name`}
                        disabled={false}
                        style={{
                            '--pkg-color': packageColors[i % packageColors.length],
                            opacity: pkg.visible ? 1 : 0.5
                        } as CSSProperties}
                    />

                    <button type="button" className="btn-icon" onClick={() => toggleVisibility(i)} title="Toggle Visibility">
                        {pkg.visible ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>

                    <button type="button" className="btn-icon error" onClick={() => removePackage(i)} title="Remove Package">
                        <X size={20} />
                    </button>

                    <div className="swap-button-wrapper">
                        {i < packages.length - 1 && (
                            <button
                                type="button"
                                className="btn-icon btn-swap"
                                onMouseEnter={() => setHoveredSwapIndex(i)}
                                onMouseLeave={() => setHoveredSwapIndex(null)}
                                onClick={() => movePackage(i, 1)}
                                title="Swap with below"
                            >
                                <ArrowUpDown size={14} />
                            </button>
                        )}
                    </div>
                </div>
            ))}

            <div className="search-actions">
                <button type="button" className="btn" onClick={addPackage} disabled={isLoading}>
                    <Plus size={16} /> Add Package
                </button>
            </div>
        </div>
    );
};
