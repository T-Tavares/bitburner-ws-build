import {NS} from '@ns';

// ------------------------------------------------------ //
// ---------------------- CONSTANTS --------------------- //
// ------------------------------------------------------ //

const SCRIPT_PATH = '/scripts/hack.js';

// ----------------- RUN HACK ON SERVERS ---------------- //

export async function hackRootedServers(ns: NS) {
    const target = await getBestTarget(ns);
    const serversRooted = await getAllServersRooted(ns);
    const serversHacked = new Set<string>();
    const noThreadsServers = new Set<string>();

    for (const server of serversRooted) {
        ns.killall(server);
        await updateHackFile({ns, script: SCRIPT_PATH, target: server});

        const threads = await getAvailableThreads({ns, server, script: SCRIPT_PATH});
        if (threads !== 0) {
            const PID = ns.exec(SCRIPT_PATH, server, threads, target);

            if (PID !== 0) {
                ns.print(`Hacking: ${server} - Threads: ${threads}`);
                serversHacked.add(server);
            } else ns.tprint(`Investigaste: 🔴 Could NOT Exec Hack On ${server}`);
        } else noThreadsServers.add(server);
    }

    ns.tprint(` 🔍 Hack Details 🔍 

    No Threads available on servers: 
    ${[...noThreadsServers]}
    
    Servers Rooted: ${serversRooted.length} --- Servers Hacked: ${[...serversHacked].length}
    ${[...serversHacked]}
        
    `);
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

    ns.tprint(` 🔍 Best Target Details 🔍 

    Target Server: ${bestTarget}
    Max Money: ${maxMoney} --- Available Money: ${availableMoney}
    Security Lvl: ${security} --- Growth: ${growth}
        `);

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
    return hasRootFiltered;
}
