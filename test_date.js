const val = "2026-08-28";
console.log("Original:", new Date(val).getTime());
console.log("Local:", new Date(val + "T00:00:00").getTime());
const todayStart = new Date();
todayStart.setHours(0, 0, 0, 0);
console.log("todayStart:", todayStart.getTime());
