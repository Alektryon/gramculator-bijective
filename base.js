/* Bijective Numogram arithmetic. Alphabet positions have values 1 through b. */
"use strict";

function alphabetDigits(alphabet) {
    const digits = Array.from(alphabet);
    if (!digits.length) throw new Error("Enter at least one character.");
    if (new Set(digits).size !== digits.length) {
        throw new Error("Each alphabet character must be unique.");
    }
    if (digits.some(digit => /\s/u.test(digit))) {
        throw new Error("Use visible characters without spaces or line breaks.");
    }
    return digits;
}

function encodeBijective(value, digits) {
    let n = BigInt(value);
    if (n < 0n) throw new Error("Bijective numerals require a non-negative integer.");
    const base = BigInt(digits.length);
    const result = [];
    while (n > 0n) {
        n -= 1n;
        result.push(digits[Number(n % base)]);
        n /= base;
    }
    // Zero is the empty numeral, never the alphabet's first character.
    return result.reverse().join("");
}

function Convert(src, alphabet) {
    return encodeBijective(src, alphabetDigits(alphabet));
}

function bijectiveDigitSum(value, base) {
    let n = BigInt(value);
    const b = BigInt(base);
    if (b === 1n) return n; // Unary: n copies of the sole digit, valued 1.
    let sum = 0n;
    while (n > 0n) {
        const digit = (n - 1n) % b + 1n;
        sum += digit;
        n = (n - digit) / b;
    }
    return sum;
}

function reduceBijective(value, base) {
    let n = BigInt(value);
    const b = BigInt(base);
    while (n > b) n = bijectiveDigitSum(n, b);
    return n;
}

function calculateNumogram(alphabet) {
    const digits = alphabetDigits(alphabet);
    const base = digits.length;
    const zones = digits.map((symbol, index) => {
        const value = BigInt(index + 1);
        const gate = value * (value + 1n) / 2n;
        return {symbol, value, gate, destination: reduceBijective(gate, base)};
    });
    const syzygies = [];
    for (let small = 1; small < base + 1 - small; small++) {
        const big = base + 1 - small;
        syzygies.push({big: BigInt(big), small: BigInt(small), current: BigInt(big - small)});
    }
    return {digits, base, zones, syzygies,
        unpaired: base % 2 ? BigInt((base + 1) / 2) : null};
}

function renderLines(id, title, lines) {
    const target = document.getElementById(id);
    const heading = document.createElement("h3");
    heading.textContent = title;
    target.replaceChildren(heading);
    const fragment = document.createDocumentFragment();
    for (const line of lines) {
        const row = document.createElement("div");
        row.textContent = line;
        row.dir = "ltr";
        fragment.appendChild(row);
    }
    target.appendChild(fragment);
}

function start() {
    const input = document.getElementById("input");
    const error = document.getElementById("error");
    document.getElementById("inputAlphabetLength").textContent =
        "Alphabet Base: " + Array.from(input.value).length;
    try {
        const result = calculateNumogram(input.value);
        const numeral = n => encodeBijective(n, result.digits);
        error.textContent = "";
        input.setAttribute("aria-invalid", "false");
        renderLines("zone", "Zones:", result.zones.map(z => `Zn-${z.symbol} (value ${z.value})`));
        renderLines("gate", "Gates:", result.zones.map(z =>
            `Zn-${z.symbol}: Gt-${numeral(z.gate)} => Zn-${numeral(z.destination)}`));
        const pairs = result.syzygies.map(p =>
            `${numeral(p.big)}::${numeral(p.small)} => ${numeral(p.current)}`);
        if (result.unpaired !== null) pairs.push(`Unpaired: Zn-${numeral(result.unpaired)}`);
        renderLines("syzy", "Syzygies:", pairs);
    } catch (err) {
        error.textContent = err.message;
        input.setAttribute("aria-invalid", "true");
        for (const id of ["zone", "gate", "syzy"]) document.getElementById(id).replaceChildren();
    }
}

if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
        document.getElementById("input").addEventListener("input", start);
        start();
    });
}
if (typeof module !== "undefined") {
    module.exports = {alphabetDigits, encodeBijective, Convert, bijectiveDigitSum,
        reduceBijective, calculateNumogram, start};
}
