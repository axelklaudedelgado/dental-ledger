import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import {
	Check,
	ChevronsUpDown,
	CalendarIcon,
	PlusCircle,
	X,
	Pencil,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import BackButton from './BackButton'
import BalanceInfo from './BalanceInfo'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useSelector } from 'react-redux'
import { fetchClientDetails } from '../reducers/clientSlice'
import decodeClientSlug from '../utils/decodeClientSlug'
import particularService from '../services/particularService'
import transactionService from '../services/transactionService'

const createSchema = (selectedClient) => {
	return yup.object().shape({
		joNumber: yup.number().required('Job order number is required'),
		date: yup
			.date()
			.required('Date is required')
			.transform((value) => {
				if (!value) return value
				return new Date(value.toDateString())
			})
			.max(
				new Date(new Date().toDateString()),
				'Date cannot be in the future',
			),
		particulars: yup
			.array()
			.of(
				yup.object().shape({
					particularId: yup
						.number()
						.required('Service/Payment is required'),
					type: yup.string().required('Type is required'),
					name: yup.string().required('Name is required'),
					units: yup.number().when('type', {
						is: 'Service',
						then: () =>
							yup
								.number()
								.transform((value) =>
									isNaN(value) ? undefined : value,
								)
								.min(1, 'Units must be at least 1')
								.required('Units is required'),
						otherwise: () => yup.number().optional().nullable(),
					}),
					unitPrice: yup.number().when(['type', 'particularId'], {
						is: (type, particularId) =>
							type === 'Payment' || particularId === 15,
						then: () =>
							yup
								.number()
								.transform((value) =>
									isNaN(value) ? undefined : value,
								)
								.test({
									name: 'payment-validation',
									test: async function (value) {
										if (value === 0 || value === '0')
											return true

										if (value && value < 0.01) {
											return this.createError({
												message:
													'Payment amount must be greater than 0',
											})
										}

										if (
											!value ||
											this.parent.type !== 'Payment'
										)
											return true

										const allParticulars =
											this.from[1].value.particulars

										const totalAmount = allParticulars
											.filter((p) => p.type === 'Service')
											.reduce(
												(sum, p) =>
													sum +
													(Number(p.units) || 0) *
														(Number(p.unitPrice) ||
															0),
												0,
											)

										const totalPayments = allParticulars
											.filter((p) => p.type === 'Payment')
											.reduce(
												(sum, p) =>
													sum +
													(Number(p.unitPrice) || 0),
												0,
											)

										if (totalPayments <= totalAmount)
											return true

										const overpayment =
											totalPayments - totalAmount
										const hasEnoughBalance =
											overpayment <=
											(selectedClient?.totalBalance || 0)

										return (
											hasEnoughBalance ||
											this.createError({
												message:
													'Payment exceeds available balance',
											})
										)
									},
								}),
						otherwise: () =>
							yup
								.number()
								.transform((value) =>
									isNaN(value) ? undefined : value,
								)
								.min(0, 'Price cannot be negative')
								.required('Price is required'),
					}),
				}),
			)
			.min(1, 'At least one particular is required'),
		remarks: yup.string().optional(),
	})
}

const TRANSACTION_STORAGE_KEY = 'pending_transaction_data'
const TRANSACTION_SUBMITTED_KEY = 'transaction_submitted'

const TransactionForm = ({ isUpdateMode = false }) => {
	const [openComboboxes, setOpenComboboxes] = useState({})
	const [services, setServices] = useState([])
	const [nextJONumber, setNextJONumber] = useState(null)
	const [editingField, setEditingField] = useState(null)

	const dateRef = useRef(null)
	const remarksRef = useRef(null)
	const serviceRefs = useRef([])

	const { slugName } = useParams()
	const location = useLocation()
	const prevLocation = isUpdateMode
		? location.pathname.replace('/transaction/edit', '')
		: location.pathname.replace('/transaction/add', '')
	const transactionId = isUpdateMode ? location.state.id : null
	const originalTransaction = isUpdateMode ? location.state : null

	const navigate = useNavigate()
	const id = decodeClientSlug(slugName)
	const dispatch = useDispatch()

	const { selectedClient } = useSelector((state) => state.clients)

	const getInitialData = () => {
		const wasSubmitted =
			sessionStorage.getItem(TRANSACTION_SUBMITTED_KEY) === 'true'
		if (wasSubmitted) {
			return null
		}

		if (location.state) {
			return location.state
		}

		const savedTransaction = sessionStorage.getItem(TRANSACTION_STORAGE_KEY)
		if (savedTransaction) {
			try {
				return JSON.parse(savedTransaction)
			} catch (e) {
				console.error('Failed to parse saved transaction data', e)
			}
		}

		return null
	}

	const formInitialData = getInitialData()

	useEffect(() => {
		dispatch(fetchClientDetails(id))
	}, [id, dispatch])

	useEffect(() => {
		const fetchServices = async () => {
			try {
				const servicesData = await particularService.getAll()
				const formattedServices = servicesData.map((service) => ({
					value: service.id,
					label: service.name,
					type: service.type,
				}))
				setServices(formattedServices)
			} catch (error) {
				console.error('Error fetching services:', error)
			}
		}

		fetchServices()
	}, [])

	useEffect(() => {
		const fetchJONumber = async () => {
			if (!formInitialData && nextJONumber === null) {
				try {
					const data = await transactionService.nextJONumber()
					setNextJONumber(data.nextJONumber)
				} catch (error) {
					console.error('Error fetching JO number:', error)
				}
			}
		}

		fetchJONumber()
	}, [formInitialData, nextJONumber])

	useEffect(() => {
		if (editingField) {
			const refMap = {
				date: dateRef,
				remarks: remarksRef,
			}

			if (editingField.startsWith('particular-')) {
				const index = Number.parseInt(editingField.split('-')[1])
				if (serviceRefs.current[index]) {
					serviceRefs.current[index].focus()
				}
			} else {
				const ref = refMap[editingField]
				if (ref && ref.current) {
					ref.current.focus()
				}
			}
		}
	}, [editingField])

	const form = useForm({
		resolver: yupResolver(createSchema(selectedClient)),
		defaultValues: {
			joNumber: formInitialData?.joNumber || nextJONumber || '',
			date: formInitialData?.date
				? new Date(formInitialData.date)
				: new Date(),
			particulars: formInitialData?.particulars || [
				{
					particularId: null,
					type: '',
					name: '',
					units: 1,
					unitPrice: 0,
				},
			],
			remarks:
				formInitialData?.remarks === 'No remarks'
					? ''
					: formInitialData?.remarks || '',
		},
		mode: 'onChange',
	})

	useEffect(() => {
		if (nextJONumber && !formInitialData) {
			form.setValue('joNumber', nextJONumber)
		}
	}, [nextJONumber, formInitialData, form])

	const { watch } = form
	const particulars = watch('particulars')

	const totalAmount = particulars
		.filter((p) => p.type === 'Service')
		.reduce(
			(sum, p) =>
				sum + (Number(p.units) || 0) * (Number(p.unitPrice) || 0),
			0,
		)

	const totalPayment = particulars
		.filter((p) => p.type === 'Payment')
		.reduce((sum, p) => sum + (Number(p.unitPrice) || 0), 0)

	const balance = totalAmount - totalPayment

	const triggerAllPaymentValidations = async () => {
		const formParticulars = form.getValues('particulars')
		const paymentIndices = formParticulars
			.map((p, index) => (p.type === 'Payment' ? index : -1))
			.filter((index) => index !== -1)

		for (const index of paymentIndices) {
			await form.trigger(`particulars[${index}].unitPrice`)
		}
	}

	const handleParticularChange = async (index, field, value) => {
		const formParticulars = form.getValues('particulars')
		const updatedParticulars = [...formParticulars]

		if (field === 'particularId') {
			if (!value) {
				updatedParticulars[index] = {
					particularId: null,
					type: '',
					name: '',
					units: 1,
					unitPrice: 0,
				}
				form.clearErrors(`particulars[${index}].unitPrice`)
			} else {
				const selectedService = services.find((s) => s.value === value)
				const currentParticular = updatedParticulars[index]
				const typeChanged =
					currentParticular.type !== selectedService.type

				updatedParticulars[index] = {
					particularId: value,
					type: selectedService.type,
					name: selectedService.label,
					units: selectedService.type === 'Service' ? 1 : null,
					unitPrice: typeChanged
						? 0
						: updatedParticulars[index].unitPrice,
				}

				form.setValue('particulars', updatedParticulars)

				if (typeChanged) {
					form.clearErrors(`particulars[${index}].unitPrice`)
					form.trigger(`particulars[${index}].unitPrice`)
				}
			}
		} else {
			updatedParticulars[index][field] = value
		}

		form.setValue('particulars', updatedParticulars)

		if (
			field === 'unitPrice' ||
			field === 'units' ||
			(field === 'particularId' && updatedParticulars[index].type)
		) {
			await triggerAllPaymentValidations()
		}
	}

	const addParticular = () => {
		const formParticulars = form.getValues('particulars')
		form.setValue('particulars', [
			...formParticulars,
			{
				particularId: null,
				type: '',
				name: '',
				units: 1,
				unitPrice: 0,
			},
		])

		serviceRefs.current = serviceRefs.current.concat(null)
	}

	const removeParticular = async (index) => {
		const formParticulars = form.getValues('particulars')
		form.setValue(
			'particulars',
			formParticulars.filter((_, i) => i !== index),
		)

		const errorFields = [
			`particulars.${index}.particularId`,
			`particulars.${index}.type`,
			`particulars.${index}.name`,
			`particulars.${index}.units`,
			`particulars.${index}.unitPrice`,
		]

		errorFields.forEach((field) => {
			form.clearErrors(field)
		})

		serviceRefs.current = serviceRefs.current.filter((_, i) => i !== index)

		await triggerAllPaymentValidations()
	}

	const onSubmit = (data) => {
		const transaction = {
			id: transactionId,
			joNumber: data.joNumber,
			date: format(data.date, 'yyyy-MM-dd'),
			clientId: id,
			particulars: data.particulars.map((p) => ({
				particularId: p.particularId,
				name: p.name,
				type: p.type,
				units: p.type === 'Service' ? Number(p.units) : null,
				unitPrice: Number(p.unitPrice),
			})),
			remarks: data.remarks,
			amount: totalAmount,
			payment: totalPayment,
			balance,
			clientTotalBalance: selectedClient?.totalBalance || 0,
			projectedClientBalance:
				(selectedClient?.totalBalance || 0) + balance,
		}

		if (isUpdateMode) {
			const currentPath = location.pathname
			navigate(`${currentPath}/review`, { state: transaction })
		} else {
			const currentPath = location.pathname
			const newPath = currentPath.replace('/add', '/review')
			navigate(newPath, { state: transaction })
		}
	}

	return (
		<>
			<BackButton
				navigateRoute={prevLocation}
				preserveState={false}
				clearSessionStorage={true}
			/>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-6"
				>
					<div className="flex justify-between items-center mt-10">
						<FormField
							control={form.control}
							name="joNumber"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Job Order #</FormLabel>
									<FormControl>
										<Input {...field} disabled />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="date"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Date</FormLabel>
									<FormControl>
										<div className="relative">
											<Popover>
												<PopoverTrigger asChild>
													<Button
														variant="outline"
														className="w-[240px] justify-start text-left font-normal"
														disabled={
															isUpdateMode &&
															editingField !==
																'date'
														}
														ref={dateRef}
													>
														<CalendarIcon className="mr-2 h-4 w-4" />
														{format(
															field.value,
															'PPP',
														)}
													</Button>
												</PopoverTrigger>
												<PopoverContent
													className="w-auto p-0"
													align="start"
												>
													<Calendar
														mode="single"
														selected={field.value}
														onSelect={(date) => {
															if (date) {
																field.onChange(
																	date,
																)
															}
														}}
														disabled={(date) =>
															date >
															new Date(
																new Date().toDateString(),
															)
														}
														initialFocus
														classNames={{
															day_selected:
																'bg-zinc-900 text-white hover:bg-zinc-900 hover:text-white focus:bg-zinc-900 focus:text-white',
															day_disabled:
																'text-muted-foreground opacity-50 hover:bg-transparent hover:text-muted-foreground',
															day_today:
																'bg-accent text-accent-foreground',
														}}
													/>
												</PopoverContent>
											</Popover>
											{isUpdateMode && (
												<Button
													type="button"
													variant="ghost"
													size="icon"
													className="absolute right-2 top-1/2 -translate-y-1/2"
													onClick={() =>
														setEditingField(
															editingField ===
																'date'
																? null
																: 'date',
														)
													}
												>
													<Pencil className="h-4 w-4" />
												</Button>
											)}
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					<div className="space-y-4">
						<Label>Particulars</Label>
						{particulars.map((particular, index) => (
							<div
								key={index}
								className={cn(
									'flex items-start gap-4 [&_:first-child]:flex-shrink p-2 rounded-md',
									isUpdateMode &&
										editingField ===
											`particular-${index}` &&
										'bg-muted/30',
								)}
							>
								<FormField
									control={form.control}
									name={`particulars.${index}.particularId`}
									render={({ field }) => (
										<FormItem className="max-w-[240px] flex-1">
											<FormLabel>
												Service/Payment
											</FormLabel>
											<div className="relative">
												<Popover
													open={openComboboxes[index]}
													onOpenChange={(open) =>
														setOpenComboboxes(
															(prev) => ({
																...prev,
																[index]: open,
															}),
														)
													}
												>
													<PopoverTrigger asChild>
														<FormControl>
															<Button
																variant="outline"
																role="combobox"
																aria-expanded={
																	openComboboxes[
																		index
																	]
																}
																className="w-full justify-between whitespace-normal"
																disabled={
																	isUpdateMode &&
																	editingField !==
																		`particular-${index}`
																}
																ref={(el) => {
																	serviceRefs.current[
																		index
																	] = el
																}}
															>
																<span className="mr-2">
																	{field.value
																		? services.find(
																				(
																					service,
																				) =>
																					service.value ===
																					field.value,
																			)
																				?.label
																		: 'Select service...'}
																</span>
																<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
															</Button>
														</FormControl>
													</PopoverTrigger>
													<PopoverContent
														className="w-[var(--radix-popover-trigger-width)] p-0"
														align="start"
													>
														<Command>
															<CommandInput placeholder="Search service..." />
															<CommandList>
																<CommandEmpty>
																	No service
																	found.
																</CommandEmpty>
																<CommandGroup>
																	{services.map(
																		(
																			service,
																		) => (
																			<CommandItem
																				key={
																					service.value
																				}
																				value={
																					service.label
																				}
																				onSelect={() => {
																					const newValue =
																						field.value ===
																						service.value
																							? null
																							: service.value
																					field.onChange(
																						newValue,
																					)
																					handleParticularChange(
																						index,
																						'particularId',
																						newValue,
																					)
																					setOpenComboboxes(
																						(
																							prev,
																						) => ({
																							...prev,
																							[index]: false,
																						}),
																					)
																				}}
																				disabled={
																					service.label ===
																						'Payment' &&
																					particulars.some(
																						(
																							particular,
																						) =>
																							particular.name ===
																							'Payment',
																					)
																				}
																			>
																				<Check
																					className={cn(
																						'mr-2 h-4 w-4',
																						field.value ===
																							service.value
																							? 'opacity-100'
																							: 'opacity-0',
																					)}
																				/>
																				{
																					service.label
																				}
																			</CommandItem>
																		),
																	)}
																</CommandGroup>
															</CommandList>
														</Command>
													</PopoverContent>
												</Popover>
											</div>
											<FormMessage />
										</FormItem>
									)}
								/>

								{particular.type === 'Service' &&
									particulars[index].particularId && (
										<FormField
											control={form.control}
											name={`particulars.${index}.units`}
											render={({ field }) => (
												<FormItem className="w-20 flex-none">
													<FormLabel>Units</FormLabel>
													<FormControl>
														<Input
															type="number"
															{...field}
															onChange={(e) => {
																field.onChange(
																	e.target
																		.value,
																)
																handleParticularChange(
																	index,
																	'units',
																	e.target
																		.value,
																)
															}}
															disabled={
																isUpdateMode &&
																editingField !==
																	`particular-${index}`
															}
															min={1}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									)}

								{particulars[index].particularId && (
									<FormField
										control={form.control}
										name={`particulars.${index}.unitPrice`}
										render={({ field }) => (
											<FormItem className="w-32 flex-none">
												<FormLabel>
													{particulars[index].type ===
													'Payment'
														? 'Payment Amount'
														: 'Unit Price'}
												</FormLabel>
												<FormControl>
													<Input
														type="text"
														{...field}
														onChange={(e) => {
															const value =
																e.target.value
															if (
																value === '' ||
																/^\d{1,8}(\.\d{0,2})?$/.test(
																	value,
																)
															) {
																field.onChange(
																	value,
																)
																handleParticularChange(
																	index,
																	'unitPrice',
																	value,
																)
															}
														}}
														onBlur={(e) => {
															const value =
																e.target.value
															if (
																value !== '' &&
																value !== '.'
															) {
																const [
																	integerPart,
																	decimalPart,
																] =
																	value.split(
																		'.',
																	)
																const formattedValue =
																	integerPart +
																	(decimalPart
																		? '.' +
																			decimalPart.padEnd(
																				2,
																				'0',
																			)
																		: '.00')
																field.onChange(
																	formattedValue,
																)
																handleParticularChange(
																	index,
																	'unitPrice',
																	formattedValue,
																)
															}
														}}
														disabled={
															isUpdateMode &&
															editingField !==
																`particular-${index}`
														}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								)}

								<div className="flex items-center mt-8 space-x-1">
									{isUpdateMode && (
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() =>
												setEditingField(
													editingField ===
														`particular-${index}`
														? null
														: `particular-${index}`,
												)
											}
										>
											<Pencil className="h-4 w-4" />
										</Button>
									)}

									{particulars.length > 1 && (
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() =>
												removeParticular(index)
											}
											disabled={
												isUpdateMode &&
												editingField !==
													`particular-${index}`
											}
										>
											<X className="h-4 w-4" />
										</Button>
									)}
								</div>
							</div>
						))}
						{!isUpdateMode && (
							<Button
								type="button"
								variant="outline"
								onClick={addParticular}
								className="mt-2"
								disabled={
									isUpdateMode &&
									!editingField?.startsWith('particular-')
								}
							>
								<PlusCircle className="mr-2 h-4 w-4" /> Add
								Particular
							</Button>
						)}
					</div>

					<div className="space-y-4">
						<div className="grid grid-cols-3 gap-4">
							<div>
								<Label>Total Amount</Label>
								<Input
									value={totalAmount.toFixed(2)}
									readOnly
								/>
							</div>
							<div>
								<Label>Total Payment</Label>
								<Input
									value={totalPayment.toFixed(2)}
									readOnly
								/>
							</div>
							<div>
								<Label>Balance</Label>
								<Input
									value={balance.toFixed(2)}
									readOnly
									className={cn(
										balance < 0 &&
											selectedClient?.totalBalance >=
												Math.abs(balance)
											? 'border-yellow-500'
											: balance < 0
												? 'border-red-500'
												: '',
									)}
								/>
							</div>
						</div>

						<BalanceInfo
							totalAmount={totalAmount}
							totalPayment={totalPayment}
							balance={balance}
							selectedClient={selectedClient}
							isUpdateMode={isUpdateMode}
							originalTransaction={originalTransaction}
						/>
					</div>

					<FormField
						control={form.control}
						name="remarks"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Remarks (Optional)</FormLabel>
								<FormControl>
									<div className="relative">
										<Textarea
											{...field}
											placeholder="Any additional notes..."
											className="h-24"
											disabled={
												isUpdateMode &&
												editingField !== 'remarks'
											}
											ref={remarksRef}
										/>
										{isUpdateMode && (
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="absolute right-2 top-4"
												onClick={() =>
													setEditingField(
														editingField ===
															'remarks'
															? null
															: 'remarks',
													)
												}
											>
												<Pencil className="h-4 w-4" />
											</Button>
										)}
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button type="submit" className="w-full">
						{isUpdateMode
							? 'Update Transaction'
							: 'Review Transaction'}
					</Button>
				</form>
			</Form>
		</>
	)
}

export default TransactionForm
