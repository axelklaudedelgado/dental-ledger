import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import clientService from '../services/clientService'

export const fetchClients = createAsyncThunk('clients/fetchAll', async () => {
	const clients = await clientService.getAll()
	return clients
})

const clientSlice = createSlice({
	name: 'clients',
	initialState: {
		clients: [],
		clientsStatus: 'idle',
		clientsError: null,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchClients.pending, (state) => {
				state.clientsStatus = 'loading'
			})
			.addCase(fetchClients.fulfilled, (state, action) => {
				state.clientsStatus = 'succeeded'
				state.clients = action.payload
			})
			.addCase(fetchClients.rejected, (state, action) => {
				state.clientsStatus = 'failed'
				state.clientsError = action.error.message
			})
	},
})

export default clientSlice.reducer
