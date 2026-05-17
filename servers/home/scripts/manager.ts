import {NS} from '@ns';

import {getServersRootAccess} from '../lib/servers/root-access';
import {hackLogic} from '../lib/servers/hack-logic';
import {timeToMS} from '../tools/conversions';

export async function main(ns: NS): Promise<void> {
    interface TaskDetails {
        description: string;
        delay: number;
        timecount: number;
        fn: (ns: NS) => void;
    }

    const managerTasks: TaskDetails[] = [
        {
            description: 'Get Root Access',
            delay: timeToMS({time: 30, unit: 'min'}),
            timecount: Date.now(),
            // fn: ns => ns.print('getServersRootAccess(ns)'),
            fn: ns => getServersRootAccess(ns),
        },
        {
            description: 'Best Target and Hacking',
            delay: timeToMS({time: 40, unit: 'min'}),
            timecount: Date.now(),
            // fn: ns => ns.print('hackLogic(ns)'),
            fn: ns => hackLogic(ns),
        },
    ];

    for (const task of managerTasks) {
        ns.print(`Initial run: ${task.description}`);
        task.timecount = Date.now() + task.delay;
        await task.fn(ns);
    }

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const now = Date.now();

        for (const task of managerTasks) {
            if (now >= task.timecount) {
                ns.print(`Running: ${task.description}`);
                task.timecount = now + task.delay;
                await task.fn(ns);
            }
        }
        await ns.sleep(timeToMS({time: 25, unit: 'min'}));
    }
}
