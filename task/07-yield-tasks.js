'use strict';

/********************************************************************************************
 *                                                                                          *
 * Plese read the following tutorial before implementing tasks:                             *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield        *
 *                                                                                          *
 ********************************************************************************************/


/**
 * Returns the lines sequence of "99 Bottles of Beer" song:
 *
 *  '99 bottles of beer on the wall, 99 bottles of beer.'
 *  'Take one down and pass it around, 98 bottles of beer on the wall.'
 *  '98 bottles of beer on the wall, 98 bottles of beer.'
 *  'Take one down and pass it around, 97 bottles of beer on the wall.'
 *  ...
 *  '1 bottle of beer on the wall, 1 bottle of beer.'
 *  'Take one down and pass it around, no more bottles of beer on the wall.'
 *  'No more bottles of beer on the wall, no more bottles of beer.'
 *  'Go to the store and buy some more, 99 bottles of beer on the wall.'
 *
 * See the full text at
 * http://99-bottles-of-beer.net/lyrics.html
 *
 * NOTE: Please try to complete this task faster then original song finished:
 * https://www.youtube.com/watch?v=Z7bmyjxJuVY   :)
 *
 *
 * @return {Iterable.<string>}
 *
 */
function* get99BottlesOfBeer() {
    for(let i = 99; i > 1; i--) {
        if(i > 2) {
            yield `${i} bottles of beer on the wall, ${i} bottles of beer.`
            yield `Take one down and pass it around, ${i - 1} bottles of beer on the wall.`
        } else {
            yield `${i} bottles of beer on the wall, ${i} bottles of beer.`
            yield `Take one down and pass it around, ${i - 1} bottle of beer on the wall.`
        }
    }
    yield '1 bottle of beer on the wall, 1 bottle of beer.'
    yield 'Take one down and pass it around, no more bottles of beer on the wall.'
    yield 'No more bottles of beer on the wall, no more bottles of beer.'
    yield 'Go to the store and buy some more, 99 bottles of beer on the wall.'
}


/**
 * Returns the Fibonacci sequence:
 *   0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, ...
 *
 * See more at: https://en.wikipedia.org/wiki/Fibonacci_number
 *
 * @return {Iterable.<number>}
 *
 */
function* getFibonacciSequence() {
    let prev = 0;
    let next = 1;

    yield prev
    yield next

    while (true) {
        const result = next + prev;

        yield result

        prev = next;
        next = result;
    }
}


/**
 * Traverses a tree using the depth-first strategy
 * See details: https://en.wikipedia.org/wiki/Depth-first_search
 *
 * Each node have child nodes in node.children array.
 * The leaf nodes do not have 'children' property.
 *
 * @params {object} root the tree root
 * @return {Iterable.<object>} the sequence of all tree nodes in depth-first order
 * @example
 *
 *   var node1 = { n:1 }, node2 = { n:2 }, node3 = { n:3 }, node4 = { n:4 },
 *       node5 = { n:5 }, node6 = { n:6 }, node7 = { n:7 }, node8 = { n:8 };
 *   node1.children = [ node2, node6, node7 ];
 *   node2.children = [ node3, node4 ];
 *   node4.children = [ node5 ];
 *   node7.children = [ node8 ];
 *
 *     source tree (root = 1):
 *            1
 *          / | \
 *         2  6  7
 *        / \     \            =>    { 1, 2, 3, 4, 5, 6, 7, 8 }
 *       3   4     8
 *           |
 *           5
 *
 *  depthTraversalTree(node1) => node1, node2, node3, node4, node5, node6, node7, node8
 *
 */
function* depthTraversalTree(root) {
    let stack = [];
    let subStack = [];

    stack.push(root);

    while (stack.length > 0) {
        let currentNode = stack.pop();

        if (currentNode.visited) {
            continue;
        }

        currentNode.visited = true;
        yield currentNode;

        if (!currentNode.children) {
            continue;
        }

        currentNode.children.forEach(child => {
            subStack.push(child);
        });

        stack = [...stack, ...subStack.reverse()];
        subStack = [];
    }
}


/**
 * Traverses a tree using the breadth-first strategy
 * See details: https://en.wikipedia.org/wiki/Breadth-first_search
 *
 * Each node have child nodes in node.children array.
 * The leaf nodes do not have 'children' property.
 *
 * @params {object} root the tree root
 * @return {Iterable.<object>} the sequence of all tree nodes in breadth-first order
 * @example
 *     source tree (root = 1):
 *
 *            1
 *          / | \
 *         2  3  4
 *        / \     \            =>    { 1, 2, 3, 4, 5, 6, 7, 8 }
 *       5   6     7
 *           |
 *           8
 *
 */
function* breadthTraversalTree(root) {
    let quene = [];

    quene.push(root);

    for (let i = 0; i < quene.length; i++) {
        let currentNode = quene[i];

        if (currentNode.visited) {
            continue;
        }

        currentNode.visited = true;
        yield currentNode;

        if (!currentNode.children) {
            continue;
        }

        currentNode.children.forEach(child => {
            quene.push(child);
        });
    }
}


/**
 * Merges two yield-style sorted sequences into the one sorted sequence.
 * The result sequence consists of sorted items from source iterators.
 *
 * @params {Iterable.<number>} source1
 * @params {Iterable.<number>} source2
 * @return {Iterable.<number>} the merged sorted sequence
 *
 * @example
 *   [ 1, 3, 5, ... ], [2, 4, 6, ... ]  => [ 1, 2, 3, 4, 5, 6, ... ]
 *   [ 0 ], [ 2, 4, 6, ... ]  => [ 0, 2, 4, 6, ... ]
 *   [ 1, 3, 5, ... ], [ -1 ] => [ -1, 1, 3, 5, ...]
 */
function* mergeSortedSequences(source1, source2) {
    let genNum1 = source1();
    let genNum2 = source2();
    let currValue1 = genNum1.next();
    let currValue2 = genNum2.next();

    while (true) {
        if (!currValue1.done && !currValue2.done) {
            if(currValue1.value < currValue2.value) {
                yield currValue1.value
                yield currValue2.value
                currValue1 = genNum1.next();
                currValue2 = genNum2.next();
            } else {
                yield currValue2.value
                yield currValue1.value
                currValue2 = genNum2.next();
                currValue1 = genNum1.next();
            }
        } else {
            if (!currValue1.done && currValue2.done) {
            yield currValue1.value
            currValue1 = genNum1.next();
            } else if (currValue1.done && !currValue2.done) {
            yield currValue2.value
            currValue2 = genNum2.next();
            } else {
                return;
            }
        }
    }
}


module.exports = {
    get99BottlesOfBeer: get99BottlesOfBeer,
    getFibonacciSequence: getFibonacciSequence,
    depthTraversalTree: depthTraversalTree,
    breadthTraversalTree: breadthTraversalTree,
    mergeSortedSequences: mergeSortedSequences
};
