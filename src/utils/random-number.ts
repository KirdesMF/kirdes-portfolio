type RandomNumberRange = {
	max: number;
	min: number;
};

type RandomNumberOptions = RandomNumberRange & {
	hash?: number | string;
};

function getHashValue(hash: number | string): number {
	if (typeof hash === "number") return Math.abs(Math.trunc(hash));

	let value = 0;

	for (const character of hash) {
		value = (value * 31 + character.charCodeAt(0)) % 100000;
	}

	return value;
}

export function getRandomNumber({ hash, max, min }: RandomNumberOptions): number {
	const range = max - min + 1;
	if (range <= 0) return min;

	if (hash === undefined) return min + Math.floor(Math.random() * range);

	return min + (getHashValue(hash) % range);
}
