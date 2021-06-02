'use strict';

/**
 * Returns the array of 32 compass points and heading.
 * See details here:
 * https://en.wikipedia.org/wiki/Points_of_the_compass#32_cardinal_points
 *
 * @return {array}
 *
 * Example of return :
 *  [
 *     { abbreviation : 'N',     azimuth : 0.00 ,
 *     { abbreviation : 'NbE',   azimuth : 11.25 },
 *     { abbreviation : 'NNE',   azimuth : 22.50 },
 *       ...
 *     { abbreviation : 'NbW',   azimuth : 348.75 }
 *  ]
 */
function createCompassPoints() {
    let result = [];

    const compassPointsGenerator = (function* pointsGenerator() {
        let point = 0;
        let abbreviation = ['N','NbE','NNE','NEbN','NE', 'NEbE','ENE','EbN','E','EbS','ESE','SEbE','SE','SEbS','SSE','SbE','S','SbW','SSW','SWbS','SW','SWbW','WSW','WbS','W','WbN','WNW','NWbW','NW', 'NWbN','NNW','NbW'];
        let currentAzimut = (function* azimutGenerator() {
            let azimut = 0;
            while (azimut < 350) {
                yield azimut
                azimut += 11.25;
            }
        })();

        while (point < abbreviation.length) {
            yield {abbreviation : abbreviation[point], azimuth : currentAzimut.next().value}
            point++;
        }
    })();

    let currentPoint = compassPointsGenerator.next();
    while (!currentPoint.done) {
        result.push(currentPoint.value);
        currentPoint = compassPointsGenerator.next();
    }

    return result;
}


/**
 * Expand the braces of the specified string.
 * See https://en.wikipedia.org/wiki/Bash_(Unix_shell)#Brace_expansion
 *
 * In the input string, balanced pairs of braces containing comma-separated substrings
 * represent alternations that specify multiple alternatives which are to appear at that position in the output.
 *
 * @param {string} str
 * @return {Iterable.<string>}
 *
 * NOTE: The order of output string does not matter.
 *
 * Example:
 *   '~/{Downloads,Pictures}/*.{jpg,gif,png}'  => '~/Downloads/*.jpg',
 *                                                '~/Downloads/*.gif'
 *                                                '~/Downloads/*.png',
 *                                                '~/Pictures/*.jpg',
 *                                                '~/Pictures/*.gif',
 *                                                '~/Pictures/*.png'
 *
 *   'It{{em,alic}iz,erat}e{d,}, please.'  => 'Itemized, please.',
 *                                            'Itemize, please.',
 *                                            'Italicized, please.',
 *                                            'Italicize, please.',
 *                                            'Iterated, please.',
 *                                            'Iterate, please.'
 *
 *   'thumbnail.{png,jp{e,}g}'  => 'thumbnail.png'
 *                                 'thumbnail.jpeg'
 *                                 'thumbnail.jpg'
 *
 *   'nothing to do' => 'nothing to do'
 */
function* expandBraces(str) {
    if (str.includes('{') && str.includes('}') && str.includes(',')) {
        const stack = [];
        let i = 0;

        function getCombaineItems(a, b) {
            if (a.length === 0) {
                return b;
            }
            if (b.length === 0) {
                return a;
            }
            const combaineItems = [];

            for (let i = 0; i < a.length; i++) {
                for (let j = 0; j < b.length; j++) {
                    combaineItems.push(a[i] + b[j]);
                }
            }
            return combaineItems;
        }

        while (i < str.length) {
            if (str[i] === '}') {
                let prevItem = [];
                let currentItem = stack.pop();

                while (currentItem !== '{') {
                    if (Array.isArray(currentItem)) {
                        prevItem = getCombaineItems(currentItem, prevItem);
                    } else if (currentItem === ',') {
                        prevItem = stack.pop().concat(prevItem);
                    }
                    currentItem = stack.pop();
                }

                while (Array.isArray(stack[stack.length - 1])) {
                    const lastItem = stack.pop();
                    prevItem = getCombaineItems(lastItem, prevItem);
                }
                stack.push(prevItem);
            } else {
                if (str[i] === '{' || str[i] === ',') {
                    if (str[i] === ',' && str[i+1] === '}') {
                        stack.push(str[i], ['']);
                        i++;
                        continue;
                    }
                    if (str[i] === ',' && str[i+1] === ' ') {
                        stack.push([str[i]]);
                        i++;
                        continue;
                    }
                    stack.push(str[i]);
                } else {
                    stack.push([str[i]]);
                    while (stack.length > 1 && stack[stack.length - 2] !== '{' && stack[stack.length - 2] !== ',') {
                        const currentItem = stack.pop();
                        const beforeCurrentItem = stack.pop();
                        stack.push(getCombaineItems(beforeCurrentItem, currentItem));
                    }
                }
            }
            i++;
        }

        for (let i = 0; i < stack[0].length; i++) {
            yield stack[0][i]
        };
    } else {
        yield str
    }
}


/**
 * Returns the ZigZag matrix
 *
 * The fundamental idea in the JPEG compression algorithm is to sort coefficient of given image by zigzag path and encode it.
 * In this task you are asked to implement a simple method to create a zigzag square matrix.
 * See details at https://en.wikipedia.org/wiki/JPEG#Entropy_coding
 * and zigzag path here: https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/JPEG_ZigZag.svg/220px-JPEG_ZigZag.svg.png
 *
 * @param {number} n - matrix dimension
 * @return {array}  n x n array of zigzag path
 *
 * @example
 *   1  => [[0]]
 *
 *   2  => [[ 0, 1 ],
 *          [ 2, 3 ]]
 *
 *         [[ 0, 1, 5 ],
 *   3  =>  [ 2, 4, 6 ],
 *          [ 3, 7, 8 ]]
 *
 *         [[ 0, 1, 5, 6 ],
 *   4 =>   [ 2, 4, 7,12 ],
 *          [ 3, 8,11,13 ],
 *          [ 9,10,14,15 ]]
 *
 */
function getZigZagMatrix(n) {
    let result = new Array(n).fill(0).map(el => new Array(n).fill(0));

    if (n > 1) {
        let currentPosition = {x: 0, y: 0};
        let canStepLeft = true;
        let canStepDown;
        let canStepDiagonalDown;
        let canStepDiagonalUp;
        let counter = 0;

        function stepLeft(currentPosition) {
            if (canStepLeft) {
                ++counter;
                currentPosition.y += 1;
                result[currentPosition.x][currentPosition.y] = counter;
                canStepLeft = false;
                result[currentPosition.x + 1] && result[currentPosition.x + 1][currentPosition.y - 1] !== undefined ? canStepDiagonalDown = true : canStepDiagonalDown = false;
                !canStepDiagonalDown && (result[currentPosition.x - 1] && result[currentPosition.x - 1][currentPosition.y + 1] !== undefined) ? canStepDiagonalUp = true : canStepDiagonalUp = false;
                return;
            } else {
                return;
            }
        }

        function stepDown(currentPosition) {
            if (canStepDown) {
                ++counter;
                currentPosition.x += 1;
                result[currentPosition.x][currentPosition.y] = counter;
                canStepDown = false;
                result[currentPosition.x - 1] && result[currentPosition.x - 1][currentPosition.y + 1] !== undefined ? canStepDiagonalUp = true : canStepDiagonalUp = false;
                !canStepDiagonalUp && (result[currentPosition.x + 1] && result[currentPosition.x + 1][currentPosition.y - 1] !== undefined) ? canStepDiagonalDown = true : canStepDiagonalDown = false;
                return;
            } else {
                return;
            }
        }

        function stepDiagonalDown(currentPosition) {
            if (!result[currentPosition.x + 1] || result[currentPosition.x + 1][currentPosition.y - 1] === undefined) {
                result[currentPosition.x + 1] && result[currentPosition.x + 1][currentPosition.y] !== undefined ? canStepDown = true : canStepDown = false;
                !canStepDown && (result[currentPosition.x] && result[currentPosition.x][currentPosition.y + 1] !== undefined) ? canStepLeft = true : canStepLeft = false;
                canStepDiagonalDown = false;
                return;
            } else {
                ++counter;
                currentPosition.x += 1;
                currentPosition.y -= 1;
                result[currentPosition.x][currentPosition.y] = counter;
                stepDiagonalDown(currentPosition);
            }
        }

        function stepDiagonalUp(currentPosition) {
            if (!result[currentPosition.x - 1] || result[currentPosition.x - 1][currentPosition.y + 1] === undefined) {
                result[currentPosition.x] && result[currentPosition.x][currentPosition.y + 1] !== undefined ? canStepLeft = true : canStepLeft = false;
                !canStepLeft && (result[currentPosition.x + 1] && result[currentPosition.x + 1][currentPosition.y] !== undefined) ? canStepDown = true : canStepDown = false;
                canStepDiagonalUp = false;
                return;
            } else {
                ++counter;
                currentPosition.x -= 1;
                currentPosition.y += 1;
                result[currentPosition.x][currentPosition.y] = counter;
                stepDiagonalUp(currentPosition);
            }
        }

        while ( counter < n * n ) {
           if (canStepLeft) {
            stepLeft(currentPosition);
            continue;
           }
           if (canStepDiagonalDown) {
            stepDiagonalDown(currentPosition);
            continue;
           }
           if (canStepDown) {
            stepDown(currentPosition);
            continue;
           }
           if (canStepDiagonalUp) {
            stepDiagonalUp(currentPosition);
            continue;
           }
           break;
        }
    }

    return result;
}


/**
 * Returns true if specified subset of dominoes can be placed in a row accroding to the game rules.
 * Dominoes details see at: https://en.wikipedia.org/wiki/Dominoes
 *
 * Each domino tile presented as an array [x,y] of tile value.
 * For example, the subset [1, 1], [2, 2], [1, 2] can be arranged in a row (as [1, 1] followed by [1, 2] followed by [2, 2]),
 * while the subset [1, 1], [0, 3], [1, 4] can not be arranged in one row.
 * NOTE that as in usual dominoes playing any pair [i, j] can also be treated as [j, i].
 *
 * @params {array} dominoes
 * @return {bool}
 *
 * @example
 *
 * [[0,1],  [1,1]] => true
 * [[1,1], [2,2], [1,5], [5,6], [6,3]] => false
 * [[1,3], [2,3], [1,4], [2,4], [1,5], [2,5]]  => true
 * [[0,0], [0,1], [1,1], [0,2], [1,2], [2,2], [0,3], [1,3], [2,3], [3,3]] => false
 *
 */
function canDominoesMakeRow(dominoes) {
    let restDominoes = [];
    let sortedDominoes = dominoes
    .map(domino => domino[0] > domino[1] ? domino.reverse() : domino)
    .sort((a, b) => a[0] - b[0]);
    let rowDominoes = sortedDominoes.reduce((acc, domino, ind) => {
        if (ind === 0) {
            acc.push(domino);
            return acc;
        } else {
            if (acc[0][0] === domino[0]) {
                domino.reverse();
                return acc = [domino, ...acc];
            }
            if (acc[0][0] === domino[1]) {
                return acc = [domino, ...acc];
            }
            if (acc[acc.length-1][1] === domino[0]) {
                return acc = [...acc, domino];
            }
            if (acc[acc.length-1][1] === domino[1]) {
                domino.reverse();
                return acc = [...acc, domino];
            }
            restDominoes.push(domino);
            return acc;
        }
    }, []);

    if (restDominoes.length > 0 && dominoes.length > 2) {
        let checkedRestDominoes = false;

        while (!checkedRestDominoes && restDominoes.length) {
            let conditionsPassed = false;

            restDominoes.forEach((domino, ind, arr) => {
                let restDominoRev = [...domino].reverse();

                if (rowDominoes[0][0] === domino[0]) {
                    rowDominoes = [restDominoRev, ...rowDominoes];
                    arr[ind] = 0;
                    conditionsPassed = true;
                    return;
                }
                if (rowDominoes[0][0] === domino[1]) {
                    rowDominoes = [domino, ...rowDominoes];
                    arr[ind] = 0;
                    conditionsPassed = true;
                    return;
                }
                if (rowDominoes[rowDominoes.length-1][1] === domino[0]) {
                    rowDominoes = [...rowDominoes, domino];
                    arr[ind] = 0;
                    conditionsPassed = true;
                    return;
                }
                if (rowDominoes[rowDominoes.length-1][1] === domino[1]) {
                    rowDominoes = [...rowDominoes, restDominoRev];
                    arr[ind] = 0;
                    conditionsPassed = true;
                    return;
                } else {
                   !conditionsPassed && ind === arr.length - 1 ? checkedRestDominoes = true : checkedRestDominoes = false;
                }
            });
            restDominoes = restDominoes.filter(domino => domino !== 0);
        }
    }
    return restDominoes.length === 0 ? true : false;
}


/**
 * Returns the string expression of the specified ordered list of integers.
 *
 * A format for expressing an ordered list of integers is to use a comma separated list of either:
 *   - individual integers
 *   - or a range of integers denoted by the starting integer separated from the end integer in the range by a dash, '-'.
 *     (The range includes all integers in the interval including both endpoints)
 *     The range syntax is to be used only for, and for every range that expands to more than two values.
 *
 * @params {array} nums
 * @return {bool}
 *
 * @example
 *
 * [ 0, 1, 2, 3, 4, 5 ]   => '0-5'
 * [ 1, 4, 5 ]            => '1,4,5'
 * [ 0, 1, 2, 5, 7, 8, 9] => '0-2,5,7-9'
 * [ 1, 2, 4, 5]          => '1,2,4,5'
 */
function extractRanges(nums) {
    let result = nums.map((num, ind, arr) => {
        if (ind === 0 || ind === arr.length - 1 || num !== arr[ind-1] + 1 || num !== arr[ind+1] - 1) {
            return num;
        } else {
            return num = '-';
        }
    }).filter((num, ind, arr) => (num === '-' && arr[ind+1] !== '-') || num !== '-');

    return result.join(',').replace(/,-,/g, '-');
}

module.exports = {
    createCompassPoints : createCompassPoints,
    expandBraces : expandBraces,
    getZigZagMatrix : getZigZagMatrix,
    canDominoesMakeRow : canDominoesMakeRow,
    extractRanges : extractRanges
};
