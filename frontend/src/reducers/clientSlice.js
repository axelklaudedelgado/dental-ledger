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

export const createClient = createAsyncThunk(
	'clients/create',
	async (clientData) => {
		const newClient = await clientService.create(clientData)
		return newClient
	},
)

export const checkClientName = createAsyncThunk(
	'clients/checkName',
	async ({ firstName, lastName }) => {
		const response = await clientService.checkName({ firstName, lastName })
		return response
	},
)

export const updateClient = createAsyncThunk(
	'clients/updateClient',
	async ({ id, updatedData }) => {
		const updatedClient = await clientService.update(id, updatedData)
		return updatedClient
	},
)

export const deleteClient = createAsyncThunk(
	'clients/delete',
	async (clientId) => {
		await clientService.deleteOne(clientId)
		return clientId
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
	reducers: {},
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

			// Create a client
			.addCase(createClient.fulfilled, (state, action) => {
				state.clients.push(action.payload)
			})

			// Update a client
			.addCase(updateClient.fulfilled, (state, action) => {
				state.clients = state.clients.map((client) =>
					client.id === action.payload.client.id
						? action.payload.client
						: client,
				)
			})

			// Delete a single client
			.addCase(deleteClient.fulfilled, (state, action) => {
				state.clients = state.clients.filter(
					(client) => client.id !== action.payload,
				)
			})
	},
})

export default clientSlice.reducer
