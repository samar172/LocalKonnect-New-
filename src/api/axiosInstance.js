import axios from "axios";

// ----------- User Token Logic -----------
let userToken = localStorage.getItem("lk_auth_token") || null;
let userTokenPromise = null;
let resolveUserTokenPromise = null;

if (!userToken) {
  userTokenPromise = new Promise((resolve) => {
    resolveUserTokenPromise = resolve;
  });
}

const pollForUserToken = () => {
  const interval = setInterval(() => {
    const foundToken = localStorage.getItem("lk_auth_token");
    if (foundToken) {
      userToken = foundToken;
      if (resolveUserTokenPromise) {
        resolveUserTokenPromise(userToken);
      }
      clearInterval(interval);
    }
  }, 500);
};
if (!userToken) pollForUserToken();

const awaitUserToken = () =>
  userToken ? Promise.resolve(userToken) : userTokenPromise;

const axiosUser = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

axiosUser.interceptors.request.use(
  async (config) => {
    if (config.headers["Authorization"]) return config;
    try {
      const token = await awaitUserToken();
      if (token) config.headers["Authorization"] = `Bearer ${token}`;
    } catch (error) {
      return Promise.reject(new Error("User authentication token not found."));
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Export both instances
export { axiosUser };
