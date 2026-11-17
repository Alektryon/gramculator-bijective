const assert = require('node:assert/strict');
const {alphabetDigits, encodeBijective, Convert, bijectiveDigitSum, calculateNumogram, start} = require('./base.js');
assert.equal(Convert('0', 'AB'), '');
assert.equal(Convert('10', '123456789A'), 'A');
assert.equal(Convert('11', '123456789A'), '11');
assert.equal(Convert('26', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 'Z');
assert.equal(Convert('27', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 'AA');
assert.equal(Convert('10', '0123456789'), '9');
assert.equal(Convert('11', '0123456789'), '00');
assert.equal(Convert('3', 'X'), 'XXX');
for (const invalid of ['', 'ABA', 'A B']) assert.throws(() => calculateNumogram(invalid));
// Independent shortlex enumeration verifies encoding and digit sums.
for (let b = 2; b <= 12; b++) {
    const digits = Array.from('ABCDEFGHIJKL').slice(0, b);
    let words = [[]], value = 0;
    for (let length = 1; length <= 3; length++) {
        words = words.flatMap(word => digits.map((_, i) => [...word, i+1]));
        for (const word of words) {
            value++;
            assert.equal(encodeBijective(BigInt(value), digits), word.map(d => digits[d-1]).join(''));
            assert.equal(bijectiveDigitSum(value, b), BigInt(word.reduce((a, d) => a+d, 0)));
        }
    }
}
for (let b = 1; b <= 64; b++) {
    const alphabet = Array.from({length:b}, (_, i) => String.fromCodePoint(0x1F600+i)).join('');
    const r = calculateNumogram(alphabet);
    assert.equal(r.base, b);
    assert.equal(r.zones.length, b);
    const used = new Set();
    for (const p of r.syzygies) {
        assert.equal(p.big + p.small, BigInt(b+1));
        assert.equal(p.current, p.big - p.small);
        assert.ok(p.current >= 1n && p.current <= BigInt(b));
        used.add(p.big); used.add(p.small);
    }
    if (r.unpaired !== null) { assert.ok(!used.has(r.unpaired)); used.add(r.unpaired); }
    assert.equal(used.size, b);
    for (const z of r.zones) {
        assert.equal(z.gate, z.value*(z.value+1n)/2n);
        assert.ok(z.destination >= 1n && z.destination <= BigInt(b));
        // Independently decode and sum the displayed digits to derive the destination.
        let n = z.gate;
        while (n > BigInt(b)) n = Array.from(encodeBijective(n, r.digits)).reduce((s, d) => s+BigInt(r.digits.indexOf(d)+1), 0n);
        assert.equal(z.destination, n);
    }
}
const decimal = calculateNumogram('123456789A');
assert.equal(decimal.zones[3].gate, 10n);
assert.equal(decimal.zones[3].destination, 10n);
assert.equal(decimal.zones[9].destination, 10n);
assert.equal(calculateNumogram('ABC').unpaired, 2n);
const huge = 9007199254740993123456789n;
const hugeDigits = alphabetDigits('AB');
let decoded = 0n;
for (const digit of encodeBijective(huge, hugeDigits)) decoded = decoded*2n+BigInt(hugeDigits.indexOf(digit)+1);
assert.equal(decoded, huge);
// DOM contract: safe text output, live recalculation and removal of stale results.
class Element {
    constructor() { this.children=[]; this.textContent=''; this.value=''; }
    replaceChildren(...children) { this.children=children; }
    appendChild(child) { this.children.push(child); }
    setAttribute(name, value) { this[name]=value; }
}
const elements = Object.fromEntries(['input','error','inputAlphabetLength','zone','gate','syzy'].map(id => [id,new Element()]));
global.document = {getElementById:id=>elements[id],createElement:()=>new Element(),createDocumentFragment:()=>new Element()};
elements.input.value='0123456789'; start();
assert.equal(elements.error.textContent, '');
assert.equal(elements.zone.children[1].children.length,10);
assert.equal(elements.gate.children[1].children[3].textContent, 'Zn-3: Gt-9 => Zn-9');
elements.input.value='<>&'; start();
assert.equal(elements.zone.children[1].children[0].textContent, 'Zn-< (value 1)');
elements.input.value='AA'; start();
assert.match(elements.error.textContent,/unique/);
assert.equal(elements.gate.children.length,0);
elements.input.value='X'; start();
assert.equal(elements.gate.children[1].children[0].textContent,'Zn-X: Gt-X => Zn-X');
console.log('Passed: conversion enumeration, bases 1–64, Unicode, BigInt, gate destinations, Syzygies, validation and DOM rendering.');
