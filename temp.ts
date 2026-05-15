const a = "[3条] nihao ";

console.log(a[0]);

const b = a.replace(/^\[\d+条\]\s*/g, "");

console.log(b);
