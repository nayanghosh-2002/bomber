
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchContacts = createAsyncThunk(
  'contacts/fetchContacts',
  async (query = '') => {
    const response = await axios.get(`/api/contacts/search?q=${query}`);
    return response.data;
  }
);

const contactsSlice = createSlice({
  name: 'contacts',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
    searchTerm: ''
  },
  reducers: {
    setSearchTerm(state, action) {
      state.searchTerm = action.payload;
    }
  },
  extraReducers(builder) {
    builder
      .addCase(fetchContacts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export const { setSearchTerm } = contactsSlice.actions;
export default contactsSlice.reducer;
