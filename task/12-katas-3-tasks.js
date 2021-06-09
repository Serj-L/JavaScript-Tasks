'use strict';

/**
 * Returns true if word occurrs in the specified word snaking puzzle.
 * Each words can be constructed using "snake" path inside a grid with top, left, right and bottom directions.
 * Each char can be used only once ("snake" should not cross itself).
 *
 * @param {array} puzzle
 * @param {array} searchStr
 * @return {bool}
 *
 * @example
 *   var puzzle = [
 *      'ANGULAR',
 *      'REDNCAE',
 *      'RFIDTCL',
 *      'AGNEGSA',
 *      'YTIRTSP',
 *   ];
 *   'ANGULAR'   => true   (first row)
 *   'REACT'     => true   (starting from the top-right R adn follow the ↓ ← ← ↓ )
 *   'UNDEFINED' => true
 *   'RED'       => true
 *   'STRING'    => true
 *   'CLASS'     => true
 *   'ARRAY'     => true   (first column)
 *   'FUNCTION'  => false
 *   'NULL'      => false
 */
function findStringInSnakingPuzzle(puzzle, searchStr) {
    const analizePuzz = [...puzzle];
    const rowsLength = puzzle.length;
    const currPosition = {r: 0, c: 0};
    let counter = null;
    let indexOfSearchingSymb = 0;
    let isConditionsChecked = false;

    function snakeFindSymb (arr, currPosition, indexOfSearchingSymb) {
        if (!isConditionsChecked && arr[currPosition.r][currPosition.c-1] && arr[currPosition.r][currPosition.c-1] === searchStr[indexOfSearchingSymb].toUpperCase()) {
            counter++;
            indexOfSearchingSymb++;
            currPosition.c--;
            replaceSymb(arr, currPosition.r, currPosition.c);
            isConditionsChecked = true;
        }
        if (!isConditionsChecked && arr[currPosition.r][currPosition.c+1] && arr[currPosition.r][currPosition.c+1] === searchStr[indexOfSearchingSymb].toUpperCase()) {
            counter++;
            indexOfSearchingSymb++;
            currPosition.c++;
            replaceSymb(arr, currPosition.r, currPosition.c);
            isConditionsChecked = true;
        }
        if (!isConditionsChecked && arr[currPosition.r-1] && arr[currPosition.r-1][currPosition.c] && arr[currPosition.r-1][currPosition.c] === searchStr[indexOfSearchingSymb].toUpperCase()) {
            counter++;
            indexOfSearchingSymb++;
            currPosition.r--;
            replaceSymb(arr, currPosition.r, currPosition.c);
            isConditionsChecked = true;
        }
        if (!isConditionsChecked && arr[currPosition.r+1] && arr[currPosition.r+1][currPosition.c] && arr[currPosition.r+1][currPosition.c] === searchStr[indexOfSearchingSymb].toUpperCase()) {
            counter++;
            indexOfSearchingSymb++;
            currPosition.r++;
            replaceSymb(arr, currPosition.r, currPosition.c);
            isConditionsChecked = true;
        }

        if (!isConditionsChecked || (indexOfSearchingSymb === searchStr.length)) {
            return;
        } else {
            isConditionsChecked = false;
            snakeFindSymb(arr, currPosition, indexOfSearchingSymb)
        }
    }

    function replaceSymb (arr, r, c, replacer = '-') {
        arr[r] = arr[r].split('');
        arr[r][c] = replacer;
        arr[r] = arr[r].join('');
    }

    for (let r = 0; r < rowsLength; r++) {
        let colsLength = puzzle[r].length;
        if (counter < searchStr.length) {
            if (counter) {
                counter = 0;
                indexOfSearchingSymb = 0;
                analizePuzz.length = 0;
                analizePuzz.push(...puzzle);
            }
            for (let c = 0; c < colsLength; c++) {
                if (counter < searchStr.length) {
                    if (counter) {
                        counter = 0;
                        indexOfSearchingSymb = 0;
                        analizePuzz.length = 0;
                        analizePuzz.push(...puzzle);
                    }
                    if (analizePuzz[r][c] === searchStr[indexOfSearchingSymb].toUpperCase()) {
                        replaceSymb(analizePuzz, r, c);
                        counter++;
                        indexOfSearchingSymb++;
                        currPosition.r = r;
                        currPosition.c = c;
                        snakeFindSymb (analizePuzz, currPosition, indexOfSearchingSymb);
                    }
                } else {
                    break;
                }
                continue;
            }
        } else {
            break;
        }
        continue;
    }

    return counter === searchStr.length ? true : false;

}


/**
 * Returns all permutations of the specified string.
 * Assume all chars in the specified string are different.
 * The order of permutations does not matter.
 *
 * @param {string} chars
 * @return {Iterable.<string>} all posible strings constructed with the chars from the specfied string
 *
 * @example
 *    'ab'  => 'ab','ba'
 *    'abc' => 'abc','acb','bac','bca','cab','cba'
 */
function* getPermutations(chars) {
    const charsArr = chars.split('');
    const result = [charsArr.join('')];
    const acc = new Array(charsArr.length).fill(0);
    let i = 1;
    let j = null;

    while (i < charsArr.length) {
        if (acc[i] < i) {
            j = i % 2 && acc[i];
            [charsArr[i], charsArr[j]] = [charsArr[j], charsArr[i]]
            ++acc[i];
            i = 1;
            result.push(charsArr.join(''));
        } else {
            acc[i] = 0;
            ++i;
        }
    }

    for (let i = 0; i < result.length; i++) {
        yield result[i]
    }
}


/**
 * Returns the most profit from stock quotes.
 * Stock quotes are stores in an array in order of date.
 * The stock profit is the difference in prices in buying and selling stock.
 * Each day, you can either buy one unit of stock, sell any number of stock units you have already bought, or do nothing.
 * Therefore, the most profit is the maximum difference of all pairs in a sequence of stock prices.
 *
 * @param {array} quotes
 * @return {number} max profit
 *
 * @example
 *    [ 1, 2, 3, 4, 5, 6]   => 15  (buy at 1,2,3,4,5 and then sell all at 6)
 *    [ 6, 5, 4, 3, 2, 1]   => 0   (nothing to buy)
 *    [ 1, 6, 5, 10, 8, 7 ] => 18  (buy at 1,6,5 and sell all at 10)
 */
function getMostProfitFromStockQuotes(quotes) {
    const sortQuotes = [...quotes].sort((a, b) => {
        return a - b;
    });
    let profit = 0;

    function getProfit (quotes, maxValue) {
        let indOfMaxValue = quotes.indexOf(maxValue);

        if (quotes.length === 0 || indOfMaxValue === 0) {
            return;
        }
        if (indOfMaxValue > quotes.length - 3) {
            quotes.slice(0, indOfMaxValue).forEach(el => {
                profit = profit + maxValue - el;
            });
            return;
        }

        if (indOfMaxValue === -1 && sortQuotes.length > 0) {
            maxValue = sortQuotes.pop();
            getProfit(quotes, maxValue);
        }
        if (indOfMaxValue !== -1) {
            let quotesBeforeMaxValue = quotes.slice(0, indOfMaxValue);
            let quotesAfterMaxValue = quotes.slice(indOfMaxValue + 1);
            quotesBeforeMaxValue.forEach(el => {
                profit = profit + maxValue - el;
            });
            maxValue = sortQuotes.pop();
            getProfit(quotesAfterMaxValue, maxValue);
        }

    }

    getProfit(quotes, sortQuotes.pop());

    return profit;
}


/**
 * Class representing the url shorting helper.
 * Feel free to implement any algorithm, but do not store link in the key\value stores.
 * The short link can be at least 1.5 times shorter than the original url.
 *
 * @class
 *
 * @example
 *
 *     var urlShortener = new UrlShortener();
 *     var shortLink = urlShortener.encode('https://en.wikipedia.org/wiki/URL_shortening');
 *     var original  = urlShortener.decode(shortLink); // => 'https://en.wikipedia.org/wiki/URL_shortening'
 *
 */
function UrlShortener() {
    this.urlAllowedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"+
                           "abcdefghijklmnopqrstuvwxyz"+
                           "0123456789-_.~!*'();:@&=+$,/?#[]";
}

UrlShortener.prototype = {

    encode: function(url) {
        throw new Error('Not implemented');
    },

    decode: function(code) {
        throw new Error('Not implemented');
    }
}


module.exports = {
    findStringInSnakingPuzzle: findStringInSnakingPuzzle,
    getPermutations: getPermutations,
    getMostProfitFromStockQuotes: getMostProfitFromStockQuotes,
    UrlShortener: UrlShortener
};
