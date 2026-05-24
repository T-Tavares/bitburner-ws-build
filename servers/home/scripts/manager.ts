import {NS} from '@ns';

import {getServersRootAccess} from '../lib/servers/root-access';
import {hackRootedServers} from '../lib/servers/hack-logic';
import {timeToMS} from '../tools/conversions';

export async function main(ns: NS): Promise<void> {
    ns.disableLog('ALL');
    interface TaskDetails {
        description: string;
        delay: number;
        timecount: number;
        fn: (ns: NS) => void;
    }

    // ------------------------------------------------------ //
    // ----------------- TASK MANAGER ARRAY ----------------- //
    // ------------------------------------------------------ //

    const managerTasks: TaskDetails[] = [
        {
            description: 'Get Root Access',
            delay: timeToMS({time: 30, unit: 'min'}),
            timecount: Date.now(),
            fn: ns => getServersRootAccess(ns),
        },
        {
            description: 'Get Best Target and Hack Rooted Servers',
            delay: timeToMS({time: 60, unit: 'min'}),
            timecount: Date.now(),
            fn: ns => hackRootedServers(ns),
        },
    ];

    // ----------------- TIME FORMAT OPTIONS ---------------- //

    const timeFormatOptions: Intl.DateTimeFormatOptions = {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    };

    // ------------------------------------------------------ //
    // ------------- INITIAL RUN OF ALL SCRIPTS ------------- //
    // ----------------- WHEN START MANAGER ----------------- //
    // ------------------------------------------------------ //

    for (const task of managerTasks) {
        const timeNow = new Date().toLocaleString('en-NZ', timeFormatOptions);

        ns.tprint(`💙 Initial Run: ${task.description} at ${timeNow} 💙\n\n`);
        task.timecount = Date.now() + task.delay;
        await task.fn(ns);
    }

    // ------------------------------------------------------ //
    // -------------------- MANAGER LOOP -------------------- //
    // ------------------------------------------------------ //

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const now = Date.now();

        for (const task of managerTasks) {
            if (now >= task.timecount) {
                const timeNow = new Date().toLocaleString('en-NZ', timeFormatOptions);

                ns.tprint(`\n\n💙 Running: ${task.description} at ${timeNow} 💙`);
                task.timecount = now + task.delay;
                await task.fn(ns);
            }
        }
        await ns.sleep(5000);
    }
}
