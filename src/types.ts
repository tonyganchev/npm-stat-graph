import { DateRangeType } from './api/npmApi';

export type { DateRangeType };

export interface PackageConfig {
    id: string;
    name: string;
    visible: boolean;
}

export interface CombinedData {
    day: string;
    packages: { [pkgId: string]: number };
}

export type GroupBy = "day" | "week" | "month" | "year";

export interface AppState {
    packages: PackageConfig[];
    range: DateRangeType;
    customStart: string;
    customEnd: string;
    enabledDays: number[];
}
