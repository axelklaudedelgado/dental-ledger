import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import clientService from '../services/clientService'
import transactionService from '../services/transactionService'

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

export const createTransaction = createAsyncThunk(
	'transactions/create',
	async (newTransaction) => {
		const response =
			await transactionService.createTransaction(newTransaction)
		return response
	},
)

export const updateTransaction = createAsyncThunk(
	'transactions/update',
	async ({ id, updatedData }) => {
		const response = await transactionService.updateTransaction(
			id,
			updatedData,
		)
		return response
	},
)

export const deleteTransaction = createAsyncThunk(
	'transactions/delete',
	async (transactionId) => {
		await transactionService.deleteOne(transactionId)
		return transactionId
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
		lastUpdated: Date.now(),
	},
	reducers: {
		refreshClientList: (state) => {
			state.lastUpdated = Date.now()
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

			// Create a transaction
			.addCase(createTransaction.fulfilled, (state, action) => {
				state.selectedClient.transactions.push(
					action.payload.transaction,
				)

				if (action.payload.client) {
					const { totalBalance, status } = action.payload.client

					if (state.selectedClient?.id) {
						state.clients = state.clients.map((client) =>
							client.id === state.selectedClient.id
								? { ...client, totalBalance, status }
								: client,
						)

						state.selectedClient = {
							...state.selectedClient,
							totalBalance,
							status,
						}

						state.lastUpdated = Date.now()
					}
				}
			})

			// Update a single transaction
			.addCase(updateTransaction.fulfilled, (state, action) => {
				if (state.selectedClient?.transactions) {
					state.selectedClient.transactions = state.selectedClient.transactions.map(
						(transaction) =>
							transaction.id === action.payload.transaction.id
								? action.payload.transaction
								: transaction
					)
				}

				if (action.payload.client) {
					const { totalBalance, status } = action.payload.client

					if (state.selectedClient?.id) {
						state.clients = state.clients.map((client) =>
							client.id === state.selectedClient.id
								? { ...client, totalBalance, status }
								: client
						)

						state.selectedClient = {
							...state.selectedClient,
							totalBalance,
							status,
						}

						state.lastUpdated = Date.now()
					}
				}
			})

			// Delete a single transaction
			.addCase(deleteTransaction.fulfilled, (state, action) => {
				state.selectedClient.transactions =
					state.selectedClient.transactions.filter(
						(transaction) => transaction.id !== action.payload,
					)

				state.selectedClient.totalBalance =
					state.selectedClient.transactions.reduce(
						(acc, transaction) =>
							acc +
							transaction.amount -
							(transaction.payment || 0),
						0,
					)

				state.selectedClient = { ...state.selectedClient }

				state.clients = state.clients.map((client) =>
					client.id === state.selectedClient.id
						? {
								...client,
								totalBalance: state.selectedClient.totalBalance,
								status: state.selectedClient.status,
							}
						: client,
				)
			})
	},
})

export const { refreshClientList } = clientSlice.actions
export default clientSlice.reducer
