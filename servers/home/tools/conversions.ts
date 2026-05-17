interface TimeToMS {
    time: number;
    unit: 'day' | 'hour' | 'min';
}

export function timeToMS({time, unit}: TimeToMS): number {
    switch (unit) {
        case 'min':
            return time * 60 * 1000;
        case 'hour':
            return time * 60 * 60 * 1000;
        case 'day':
            return time * 24 * 60 * 60 * 1000;
    }
}
