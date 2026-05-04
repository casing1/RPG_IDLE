export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
export function randomBetween(min, max) {
    return min + Math.random() * (max - min);
}
export function choose(list) {
    return list[Math.floor(Math.random() * list.length)];
}
export function formatNumber(value) {
    if (value >= 1000000000)
        return `${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000)
        return `${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000)
        return `${(value / 1000).toFixed(1)}K`;
    return Math.floor(value).toLocaleString("ko-KR");
}
export function formatPercent(value) {
    return `${(value * 100).toFixed(value >= 0.1 ? 0 : 1)}%`;
}
export function formatMultiplier(value) {
    return `x${value.toFixed(2)}`;
}
