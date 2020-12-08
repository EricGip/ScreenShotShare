import { Auth } from 'aws-amplify'

export const auth = {

    namespaced: true,
    state: { user: null},
    mutations: {
        // takes payload, sets it to state. 
        setUser(state,payload) {
            state.user = payload;
        }
    },
    actions: {
        // need a signup w/ email confirm, login, and logout, 
        async logout({commit}) {
            commit("setUser", null);
            // next part is frmo sign up, sign in aws docs. 
            return await Auth.signOut(); 
        },
        async login({ commit}, {username, password}) {
            try {
                await Auth.signIn({
                    username,
                    password
                });

                const userInfo = await Auth.currentUserInfo();
                commit("setUser", userInfo);

                return Promise.resolve("Success")

            } catch(error) {
                console.log(error)
                return Promise.reject(error)
            }
        },
        async confirmSignUp(_, { username, code}) {
            try {
                await Auth.confirmSignUp(username,code);
                return Promise.resolve();

            } catch(error) {
                console.log(error)
                return Promise.reject(error)
            }
        },
        async signUp(_, {username, password, email}) {
            try {
                await Auth.signUp({
                    username,
                    password,
                    attributes: {
                        email
                    }
                })
                return Promise.resolve();
            } catch(error) {
                console.log(error)
                return Promise.reject(error);
            }
        },

        // this should load before every page to make sure everything is validated 
        async authAction({commit}) {
            const userInfo = await Auth.currentUserInfo();
            commit("setUser", userInfo);
        }
    },
    getters: {
        user: (state) => state.user
    }

}