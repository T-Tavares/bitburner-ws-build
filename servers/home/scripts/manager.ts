import {NS} from '@ns';
// import {getServersRootAccess} from '../lib/servers/root-access';
// import {hackLogic} from '../lib/servers/hack-logic';
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
            delay: timeToMS({time: 1, unit: 'min'}),
            timecount: Date.now(),
            fn: ns => ns.print('getServersRootAccess(ns)'),
            // fn: ns => getServersRootAccess(ns),
        },
        {
            description: 'Best Target and Hacking',
            delay: timeToMS({time: 1, unit: 'min'}),
            timecount: Date.now(),
            fn: ns => ns.print('hackLogic(ns)'),
            // fn: ns => hackLogic(ns),
        },
    ];

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
        await ns.sleep(20000);
    }
}
