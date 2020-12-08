import { createAlbum } from "../"
import { API, graphqlOperation } from "aws-amplify";
import { createAlbum as createAlbumMutation } from "@/graphql/mutations"


export const albumInfo = {
    // name spaced == means that we have to put the name before any function?
    namespaced: true,
    state: {error: null, albums: null},
    mutations: {
        setAlbums(state, payload) {
            state.albums = payload;
        }
    },
    actions: {
        async createAlbum(_, {dispatch}) {
            try {
                 
            } catch(error) {

            }
        }
    },
    getters: {

    }

}