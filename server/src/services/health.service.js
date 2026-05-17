export async function getSystemHealth() {
  return {
    status: "ok",
    uptimeSec: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  };
}
