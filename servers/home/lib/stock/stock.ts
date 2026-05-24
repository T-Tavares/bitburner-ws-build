import {NS} from '@ns';

// ------------------------------------------------------ //
// ---- TESTING BASIC STOCK LOOP FOR BUYING AND SELL ---- //
// ------------------------------------------------------ //

export async function main(ns: NS) {
    const stocks = ns.stock.getSymbols();

    while (true) {
        for (const sym of stocks) {
            const forecast = ns.stock.getForecast(sym);
            const price = ns.stock.getPrice(sym);

            const [shares] = ns.stock.getPosition(sym);

            // Buy
            if (forecast > 0.55 && shares === 0) {
                const maxShares = ns.stock.getMaxShares(sym);
                const money = ns.getServerMoneyAvailable('home');

                const buyAmount = Math.floor(Math.min(maxShares, (money * 0.1) / price));

                if (buyAmount > 0) {
                    ns.stock.buyStock(sym, buyAmount);
                }
            }

            // Sell
            if (forecast < 0.5 && shares > 0) {
                ns.stock.sellStock(sym, shares);
            }
        }

        await ns.sleep(5000);
    }
}
