
export function formatAmount(value: number | string | null | undefined): string {

    // 1. Convert string numbers safely
    let numericValue = typeof value === 'string' ? parseFloat(value) : value;

    // 2. Use Number.isFinite to catch NaN, Infinity, null, and undefined safely!
    if (numericValue === null || numericValue === undefined || !Number.isFinite(numericValue)) {
        numericValue = 0;
    }

    // 3. Apply safe React Native string formatting regex
    const parts = numericValue.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const formattedNumber = parts.join('.');

    // 4. Return result
    return `${formattedNumber} Ks`;

}
