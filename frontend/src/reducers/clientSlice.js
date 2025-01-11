import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import clientService from '../services/clientService'

export const fetchClients = createAsyncThunk('clients/fetchAll', async () => {
	const clients = await clientService.getAll()
	return clients
})

export const fetchClientDetails = createAsyncThunk(
	'clients/fetchDetails',
	async (clientId) => {
		const clientDetails = await clientService.getOne(clientId)
		return clientDetails
	},
)

const clientSlice = createSlice({
	name: 'clients',
	initialState: {
		clients: [],
		selectedClient: null,
		clientsStatus: 'idle',
		clientsError: null,
		clientDetailsStatus: 'idle',
		clientDetailsError: null,
	},
	reducers: {
		addClient: (state, action) => {
			state.clients.push(action.payload)
		},
	},
	extraReducers: (builder) => {
		builder
			// Fetch all clients
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

			// Fetch specific client details
			.addCase(fetchClientDetails.pending, (state) => {
				state.clientDetailsStatus = 'loading'
			})
			.addCase(fetchClientDetails.fulfilled, (state, action) => {
				state.clientDetailsStatus = 'succeeded'
				state.selectedClient = action.payload.client
				state.selectedClient.transactions = action.payload.transactions
			})
			.addCase(fetchClientDetails.rejected, (state, action) => {
				state.clientDetailsStatus = 'failed'
				state.clientDetailsError = action.error.message
			})
	},
})

export const { addClient } = clientSlice.actions
export default clientSlice.reducer
