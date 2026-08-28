process.env.TZ = 'America/Los_Angeles';
const val = "2026-08-28";
console.log("Original:", new Date(val).getTime(), new Date(val).toISOString());
console.log("Local:", new Date(val + "T00:00:00").getTime(), new Date(val + "T00:00:00").toISOString());
const todayStart = new Date("2026-08-28T12:00:00");
todayStart.setHours(0, 0, 0, 0);
console.log("todayStart:", todayStart.getTime(), todayStart.toISOString());
