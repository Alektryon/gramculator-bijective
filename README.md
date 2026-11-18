# Bijective Gramculator

Open index.html in a browser. No build or server is required.

Alphabet characters have values 1 through base. The entered symbol order is preserved, including a literal 0 if supplied. Duplicate characters and whitespace are rejected. Unicode code points (including supplementary characters) are supported; combining sequences and multi-code-point emoji are not treated as single digits.

Zones have values 1 through base. Syzygies pair outermost zones, summing to b+1; the current is their positive difference. Odd bases leave the middle zone unpaired. This pairing is an explicit extension of the original Numogram convention, not a consequence of bijective notation alone.

Gate values are triangular numbers n(n+1)/2, encoded bijectively. Gate destinations are obtained by repeatedly summing bijective digit values until one digit remains. Zero is the empty numeral and is not a zone. Base 1 has one self-linked gate and no syzygies.

All arithmetic uses BigInt. The original layout, alphabet examples, artwork and license are retained. The original artwork describes the ordinary Numogram and is not used in the updated guide. The page uses an optional external Bulma stylesheet; calculations work without it.

Run arithmetic and rendering checks with: node test.cjs

Entirely based on [Gramculator](https://github.com/VitorGoatman/gramculator) by [VitorGoatman](https://github.com/VitorGoatman).
