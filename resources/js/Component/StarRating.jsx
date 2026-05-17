
export default function StarRating({
    value = 0,
    size = "text-base",
    color = "text-yellow-400",
    emptyColor = "text-gray-300 dark:text-gray-600",
    showValue = true,
    showCount = false,
    count = 0,
}) {
    const v = Math.max(0, Math.min(5, Number(value) || 0));

    const stars = [];
    for (let i = 1; i <= 5; i++) {
        const diff = v - i + 1; 
        if (diff >= 0.75) {
            stars.push(
                <i key={i} className={`fa-solid fa-star ${color}`} />
            );
        } else if (diff >= 0.25) {
            stars.push(
                <i key={i} className={`fa-solid fa-star-half-stroke ${color}`} />
            );
        } else {
            stars.push(
                <i key={i} className={`fa-regular fa-star ${emptyColor}`} />
            );
        }
    }

    return (
        <span className={`inline-flex items-center gap-1 ${size}`}>
            <span className="inline-flex gap-0.5">{stars}</span>
            {showValue && (
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                    {v.toFixed(1)}
                </span>
            )}
            {showCount && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({count})
                </span>
            )}
        </span>
    );
}
