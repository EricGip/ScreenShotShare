import { API, graphqlOperation, Storage} from "aws-amplify";
import { createAlbum as createAlbumMutation } from "@/graphql/mutations";
import { getAlbum as getAlbumQuery } from "@/graphql/queries";
import { listAlbums as listAlbumsQuery } from "@/graphql/queries";
import { createPhoto as createPhotoMutation } from "@/graphql/mutations";
import { uuid } from "uuidv4";
import awsconfig from "@/aws-exports"

export const albumInfo = {
  // name spaced == means that we have to put the name before any function?
  namespaced: true,
  state: { albums: null },
  mutations: {
    // mutation to get albums and setting into state
    setAlbums(state, payload) {
      state.albums = payload;
    },
  },
  actions: {
    // creating album when called (async)
    async createAlbum({dispatch}, newAlbum) {
      try {
        // whatever payload is, going to pass through here and be created.
        await API.graphql(
          graphqlOperation(createAlbumMutation, { input: newAlbum }));

          // this is to send a dispatch to automatically update the list, instead of us having to refresh 
          dispatch("getAlbumsData")
      } catch (error) {
        console.error("createAlbum", error);
      }
    },
    async getAlbum(_, albumId) {
      return await API.graphql(
        graphqlOperation(getAlbumQuery, { id: albumId })
      );
    },
    async getAlbumsData({ commit }) {
      const albumsData = await API.graphql(graphqlOperation(listAlbumsQuery));
      commit("setAlbums", albumsData.data.listAlbums.items);
    },

  async createPhoto(_, data) {

    // first, grabbing config data 
    const {
        aws_user_files_s3_bucket_region: region,
        aws_user_files_s3_bucket: bucket
    } = awsconfig;

    // grabbing file data and extension 
    const {file, type: mimeType, id} = data
    const extension = file.name.substr(file.name.lastIndexOf(".") + 1);
    const photoId = uuid(); 
    const key = `images/${photoId}.${extension}`;

    // creating input data, 
    const inputData = {
        id: photoId,
        photoAlbumId: id,
        contentType: mimeType,
        // look at graphQL query for these
        fullsize: {
            // can just put key, region, lol
            key: key,
            region: region,
            bucket: bucket,
        }
    }

    // adding file into s3 bucket 
    try {
        // put (NOT PUSH!!!) data into s3 bucket, protected s3 bucket. 
        await Storage.put(key, file, {
            level: "protected",
            contentType: mimeType,
            metadata: {albumId: id, photoId}
        })

        await API.graphql(
            // mutations == sets photo into s3 bucket for us? its the same as migrating in django? 
            graphqlOperation(createPhotoMutation, {input: inputData})
        )
        return Promise.resolve("success");

    } catch(error) {
        console.log("createPhoto error", error)
        return Promise.reject(error)
    }
    }      
  },

  getters: {
    albums: (state) => state.albums,
  }
};
