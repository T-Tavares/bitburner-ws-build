import {NS} from '@ns';
import {recServerScanAction} from './rec-scan';

// ------------------------------------------------------ //
// ---------------------- CONSTANTS --------------------- //
// ------------------------------------------------------ //

const SCRIPT_PATH = '/scripts/hack.js';

// ----------------- RUN HACK ON SERVERS ---------------- //

export async function hackLogic(ns: NS) {
    const target = await getBestTarget(ns);
    const serversRooted = await getAllServersRooted(ns);

    ns.tprint(`\n\n\nTarget: ${target}\nServers Rooted: ${serversRooted}\n\n\n`);

    for (const s of serversRooted) {
        // const threadsAvailable = await getAvailableThreads({ns, server: s, script: SCRIPT_PATH});
        // ns.exec(SCRIPT_PATH, s, threadsAvailable);
        await hackTarget({ns, host: s, script: SCRIPT_PATH, target});
    }

    // ns.exec();
    // const visited = new Set<string>();
    // await recServerScanAction({ns, server: 'home', visited, action});
}

// ------------------------------------------------------ //
// --------------------- HACK TARGET -------------------- //
// ------------------------------------------------------ //33
interface HackTarget {
    ns: NS;
    host: string;
    script: string;
    target: string;
}

export async function hackTarget({ns, host, script, target}: HackTarget): Promise<void> {
    ns.killall(host); //                                             Clean Up
    await updateHackFile({ns, target, script}); //                       Updating Files

    const availableThreads = await getAvailableThreads({ns, server: host, script});
    if (availableThreads === 0) {
        ns.tprint(`🟡 -- WARNING -- 🟡 : No RAM / Threads available on ${host}`);
    } else {
        const pid = ns.exec(script, host, availableThreads, target);
        pid == 0
            ? ns.tprint(
                  `❌ --   FAIL  -- ❌ : To start script on ${host} targetting ${target} - Threads ${availableThreads}`,
              )
            : ns.tprint(
                  `✅ -- SUCCESS -- ✅ : Started Script on ${host} targetting ${target} - Threads ${availableThreads}`,
              );
    }
}

// ------------------------------------------------------ //
// ------------- UPDATE HACK FILE ON TARGET ------------- //
// ------------------------------------------------------ //
interface UpdateHackFile {
    ns: NS;
    target: string;
    script: string;
}

async function updateHackFile({ns, target, script = SCRIPT_PATH}: UpdateHackFile) {
    // Clean Target Server of Old File
    if (ns.fileExists(script, target)) {
        ns.rm(script, target);
    }

    // Copy New File to Server
    await ns.scp(script, target);
}

// ------------------------------------------------------ //
// ----------------- GET AVAILABLE TREDS ---------------- //
// ------------------------------------------------------ //
interface GetAvailableTreads {
    ns: NS;
    server: string;
    script: string;
}

export async function getAvailableThreads({ns, server, script}: GetAvailableTreads): Promise<number> {
    const scriptRam = ns.getScriptRam(script);
    const serverMaxRam = ns.getServerMaxRam(server);
    const serverUsedRam = ns.getServerUsedRam(server);

    const availableThreads = Math.floor((serverMaxRam - serverUsedRam) / scriptRam);
    return availableThreads;
}

// ------------------------------------------------------ //
// ------------------- CALCULATE SCORE ------------------ //
// ------------------------------------------------------ //

export function calculateScore(ns: NS, server: string): number {
    const maxMoney = ns.getServerMaxMoney(server);
    const growth = ns.getServerGrowth(server);

    const minSecurity = ns.getServerMinSecurityLevel(server);
    const currSecurity = ns.getServerSecurityLevel(server);

    const currMoney = ns.getServerMoneyAvailable(server);

    // Normalisers
    const moneyRatio = currMoney / maxMoney;
    const securityPenalty = currSecurity / minSecurity;

    const score = (maxMoney * growth * moneyRatio) / (minSecurity * securityPenalty);

    return score;
}

// ------------------------------------------------------ //
// ------------------- GET BEST TARGET ------------------ //
// ------------------------------------------------------ //

export async function getBestTarget(ns: NS): Promise<string> {
    const serversRootedArr = await getAllServersRooted(ns);

    const bestTarget = serversRootedArr.reduce((bestServer, currServer): string => {
        if (bestServer === '') return currServer;

        const bestScore = calculateScore(ns, bestServer);
        const currScore = calculateScore(ns, currServer);
        return bestScore > currScore ? bestServer : currServer;
    }, '');

    const maxMoney = ns.getServerMaxMoney(bestTarget);
    const security = ns.getServerMinSecurityLevel(bestTarget);
    const growth = ns.getServerGrowth(bestTarget);
    const availableMoney = ns.getServerMoneyAvailable(bestTarget);

    ns.print(`--- Best Target ---`);
    ns.print(`Server: ${bestTarget}`);
    ns.print(`Max Money: ${maxMoney}`);
    ns.print(`Available Money: ${availableMoney}`);
    ns.print(`Security Lvl: ${security}`);
    ns.print(`Growth: ${growth}`);

    return bestTarget;
}

// ------------------------------------------------------ //
// --------------- GET ALL SERVERS ROOTED --------------- //
// ------------------------------------------------------ //

export async function getAllServersRooted(ns: NS): Promise<string[]> {
    const visited = new Set<string>();
    const hasRoot = new Set<string>();

    async function getServersRecursive(server: string): Promise<void> {
        if (visited.has(server)) return;
        visited.add(server);

        if (ns.hasRootAccess(server)) hasRoot.add(server);
        const serverChilds: string[] = ns.scan(server);

        for (const s of serverChilds) {
            await getServersRecursive(s);
        }
    }

    await getServersRecursive('home');

    const hasRootFiltered = [...hasRoot].filter(s => !s.includes('home'));
    ns.tprint(hasRootFiltered);

    return hasRootFiltered;
}
