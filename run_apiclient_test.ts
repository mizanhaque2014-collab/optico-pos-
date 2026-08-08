import { apiCall } from './lib/apiClient';

async function main() {
  try {
    const users = await apiCall('getUsers');
    console.log("USERS:", users);
  } catch (err) {
    console.error("ERROR:", err);
  }
}
main();
