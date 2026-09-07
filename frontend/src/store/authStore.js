import { create } from "zustand";

/*
|--------------------------------------------------------------------------
| Read stored user safely
|--------------------------------------------------------------------------
*/

const getStoredUser = () => {
  try {
    const user = sessionStorage.getItem("user");

    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};


/*
|--------------------------------------------------------------------------
| Auth Store
|--------------------------------------------------------------------------
*/

const useAuthStore = create((set) => ({
  token: sessionStorage.getItem("token") || null,

  user: getStoredUser(),

  isAuthenticated:
    !!sessionStorage.getItem("token"),


  /*
  |--------------------------------------------------------------------------
  | LOGIN
  |--------------------------------------------------------------------------
  */

  login: (token, user) => {
    sessionStorage.setItem(
      "token",
      token
    );

    sessionStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    set({
      token,
      user,
      isAuthenticated: true,
    });
  },


  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  logout: () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },


  /*
  |--------------------------------------------------------------------------
  | UPDATE USER
  |--------------------------------------------------------------------------
  */

  setUser: (user) => {
    sessionStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    set({
      user,
    });
  },
}));


export default useAuthStore;