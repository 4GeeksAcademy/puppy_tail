const getState = ({ getStore, getActions, setStore }) => {
  return {
    store: {
      accessToken: null,
      userInfo: null,
      message: null,
      pets: [],
      singlePet: [],
      signup: [],
      signupKeeper: [],
    },
    actions: {
      //Get all pets from the database, including the owners inside the pet object.
      getPets: async () => {
        const { pets } = getStore();
        try {
          fetch(
            `https://upgraded-cod-464w4v5prv43vrg-3001.app.github.dev/api/pets`
          )
            .then((resp) => {
              if (!resp.ok) {
                console.error(resp.status + ": " + resp.statusText);
              }
              return resp.json();
            })
            .then((data) => {
              console.log(data);
              setStore({ pets: data });
            });
        } catch (error) {
          console.error(error);
        }
      },
      //Get pets by owner id
      getOwnerPets: async (owner_id) => {
        const { pets } = getStore();
        try {
          fetch(
            `https://upgraded-cod-464w4v5prv43vrg-3001.app.github.dev/api/pets/owner/${owner_id}`
          )
            .then((resp) => {
              if (!resp.ok) {
                if (resp.status == 404) {
                  throw Error({ msg: "User does not exist" });
                }
                console.error(resp.status + ": " + resp.statusText);
              }
              return resp.json();
            })
            .then((data) => {
              console.log(data);
              setStore({ pets: data });
            });
        } catch (error) {
          console.error(error);
        }
      },
      createPet: async (obj) => {
        try {
          fetch(
            `https://upgraded-cod-464w4v5prv43vrg-3001.app.github.dev/api/pets`,
            {
              method: "POST",
              body: JSON.stringify(obj),
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
            .then((response) => {
              if (!response.ok) {
                throw Error(response.status + ": " + response.statusText);
              }
              return response.json();
            })
            .then((data) => {
              console.log("Successfully created pet: " + data);
            });
        } catch (error) {
          console.error(error);
        }
      },
      updatePet: async (obj) => {
        try {
          //Use email as contact id
          fetch(
            `https://upgraded-cod-464w4v5prv43vrg-3001.app.github.dev/api/pets/${obj.id}`,
            {
              method: "PUT",
              body: JSON.stringify(obj),
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
            .then((response) => {
              if (!response.ok) {
                throw Error(response.status + ": " + response.statusText);
              }
              return response.json();
            })
            .then((data) => {
              console.log("Successfully updated pet: " + data);
            });
        } catch (error) {
          console.error(error);
        }
      },
      getPet: async (id) => {
        const { singlePet } = getStore();
        try {
          fetch(
            `https://upgraded-cod-464w4v5prv43vrg-3001.app.github.dev/api/pets/${id}`
          )
            .then((resp) => {
              if (!resp.ok) {
                console.error(resp.status + ": " + resp.statusText);
              }
              return resp.json();
            })
            .then((data) => {
              console.log(data);
              setStore({ singlePet: data });
            });
        } catch (error) {
          console.error(error);
        }
      },
      deletePet: async (obj) => {
        try {
          fetch(
            `https://upgraded-cod-464w4v5prv43vrg-3001.app.github.dev/api/pets/${obj.id}`,
            {
              method: "DELETE",
            }
          )
            .then((response) => {
              if (!response.ok) {
                if (response.status == 404) {
                  throw Error("No pet associated with ID provided");
                } else {
                  throw Error(response.status + ": " + response.statusText);
                }
              }
              return response.json();
            })
            .then((data) => {
              console.log({ data } + " Succesfully deleted pet from server");
              //setStore({pets:data})
            });
        } catch (error) {
          console.error({ error });
          return;
        }
      },

      apiFetch: async (endpoint, method = "GET", body = null) => {
        var request;
        if (method == "GET") {
          request = await fetch(process.env.BACKEND_URL + "/api" + endpoint);
        } else {
          const params = {
            method,
            headers: {
              "Content-Type": "application/json",
            },
          };
          if (body) params.body = JSON.stringify(body);
          request = fetch(process.env.BACKEND_URL + "/api" + endpoint, params);
        }
        const resp = await request;
        const data = await resp.json();
        return { code: resp.status, data };
      },

      apiFetchProtected: async (endpoint, method = "GET", body = null) => {
        const { accessToken } = getStore();
        if (!accessToken) {
          return "No token";
        }
        const params = {
          method,
          headers: {
            'Authorization': "Bearer " + accessToken,
          },
        };
        if (body) {
          params.headers["Content-Type"] = "application/json";
          params.body = JSON.stringify(body);
        }
        console.log(accessToken);
        const resp = await fetch(
          process.env.BACKEND_URL + "/api" + endpoint,
          params
        );
        const data = await resp.json();
        return { code: resp.status, data };
      },

      loadTokens: () => {
        let token = localStorage.getItem("accessToken");
        if (token) {
          setStore({ accessToken: token });
        }
      },

      login: async (email, password) => {
        const { apiFetch } = getActions();
        const resp = await apiFetch("/login", "POST", {
          email,
          password,
        });
        if (resp.code !== 201) {
          console.error("Login error");
          return null;
        }
        console.log({ resp });
        const { message, token } = resp.data;
        localStorage.setItem("accessToken", token);
        setStore({ accessToken: token });
        return "Login Successful";
      },

      logout: () => {
        setStore({ accessToken: null });
        localStorage.setItem("accessToken", null);
      },

      getUserInfo: async () => {
        const { apiFetchProtected } = getActions();
        const resp = await apiFetchProtected("/helloprotected");
        setStore({ userInfo: resp.data });
        return "Ok";
      },

      getMessage: async () => {
        try {
          const { apiFetch } = getActions();
          const data = await apiFetch("/hello");
          setStore({ message: data.data.message });

          return data;
        } catch (error) {
          console.log("Error loading message from backend", error);
        }
      },

      signup: async (first_name, last_name, email, password) => {
        const { apiFetch } = getActions();
        const resp = await apiFetch("/signup", "POST", {
          last_name,
          first_name,
          email,
          password,
        });
        if (resp.code != 201) {
          console.error("Signup error");
          return resp;
        }
      },

      signupKeeper: async (
        first_name,
        last_name,
        email,
        password,
        hourly_pay
      ) => {
        const { apiFetch } = getActions();
        const resp = await apiFetch("/signup/keeper", "POST", {
          last_name,
          first_name,
          email,
          password,
          hourly_pay,
        });
        if (resp.code != 201) {
          console.error("Signup error");
          return resp;
        }
      },
    },
  };
};

export default getState;
