import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useMediaQuery } from '@/components/ui/hooks/useMediaQuery'
import {
	Check,
	ChevronsUpDown,
	CalendarIcon,
	PlusCircle,
	X,
	Pencil,
	ChevronLeft,
	ChevronRight,
} from 'lucide-react'
import {
	format,
	addDays,
	addMonths,
	startOfMonth,
	endOfMonth,
	eachDayOfInterval,
	isSameDay,
	getDay,
	isValid,
	parse,
} from 'date-fns'
import * as yup from 'yup'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
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
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion'
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
	DrawerDescription,
} from '@/components/ui/drawer'
import BalanceInfo from './BalanceInfo'
import BalanceDrawer from './BalanceDrawer'
import { fetchClientDetails } from '@/reducers/clientSlice'
import decodeClientSlug from '@/utils/decodeClientSlug'
import particularService from '@/services/particularService'
import transactionService from '@/services/transactionService'

const minimumDate = new Date(2000, 0, 1)
const createSchema = (selectedClient) => {
	return yup.object().shape({
		joNumber: yup.number().required('Job order number is required'),
		date: yup
			.date()
			.required('Date is required')
			.transform((value, originalValue) => {
				if (!value) return value

				if (value instanceof Date && !isNaN(value)) {
					return new Date(value.toDateString())
				}

				return value
			})
			.min(
				minimumDate,
				`Date cannot be before ${format(minimumDate, 'MM/dd/yyyy')}`,
			)
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
	const isMobile = useMediaQuery('(max-width: 768px)')
	const { slugName } = useParams()
	const location = useLocation()
	const navigate = useNavigate()
	const dispatch = useDispatch()
	const clientId = decodeClientSlug(slugName)
	const { selectedClient } = useSelector((state) => state.clients)
	const transactionId = isUpdateMode ? location.state.id : null
	const originalTransaction =
		isUpdateMode && location.state.edit
			? location.state.originalTransaction
			: location.state
	const [services, setServices] = useState([])
	const [nextJONumber, setNextJONumber] = useState(null)
	const [editingField, setEditingField] = useState(null)
	const [openComboboxes, setOpenComboboxes] = useState({})
	const [openAccordions, setOpenAccordions] = useState([])
	const [datePickerOpen, setDatePickerOpen] = useState(false)
	const [currentMonth, setCurrentMonth] = useState(new Date())
	const [inputValue, setInputValue] = useState(
		format(new Date(), 'MM/dd/yyyy'),
	)
	const initialAccordionOpened = useRef(false)
	const dateRef = useRef(null)
	const remarksRef = useRef(null)
	const serviceRefs = useRef([])
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

	const { watch, setValue, trigger, clearErrors, getValues, formState } = form
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
	const isOverpayment = totalPayment > totalAmount

	const projectedClientBalance =
		isUpdateMode && originalTransaction
			? (
					(selectedClient?.totalBalance || 0) +
					(balance -
						(originalTransaction.amount -
							originalTransaction.payment))
				).toFixed(2)
			: ((selectedClient?.totalBalance || 0) + balance).toFixed(2)

	useEffect(() => {
		if (
			isMobile &&
			formState.errors.particulars &&
			formState.submitCount > 0
		) {
			const errorIndices = Object.keys(
				formState.errors.particulars || {},
			).map(Number)

			if (errorIndices.length > 0) {
				const accordionsWithErrors = errorIndices.map(
					(index) => `item-${index}`,
				)

				setOpenAccordions((prev) => {
					const newOpenAccordions = [...prev]

					accordionsWithErrors.forEach((id) => {
						if (!newOpenAccordions.includes(id)) {
							newOpenAccordions.push(id)
						}
					})

					if (
						newOpenAccordions.length === prev.length &&
						newOpenAccordions.every((id) => prev.includes(id))
					) {
						return prev
					}

					return newOpenAccordions
				})
			}
		}
	}, [formState.errors.particulars, formState.submitCount, isMobile])

	useEffect(() => {
		if (
			!isUpdateMode &&
			particulars.length === 1 &&
			openAccordions.length === 0 &&
			!initialAccordionOpened.current
		) {
			setOpenAccordions(['item-0'])
			initialAccordionOpened.current = true
		}
	}, [isUpdateMode, particulars.length, openAccordions.length])

	useEffect(() => {
		dispatch(fetchClientDetails(clientId))
	}, [clientId, dispatch])

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
					setValue('joNumber', data.nextJONumber)
				} catch (error) {
					console.error('Error fetching JO number:', error)
				}
			}
		}

		fetchJONumber()
	}, [formInitialData, nextJONumber, setValue])

	useEffect(() => {
		if (nextJONumber && !formInitialData) {
			setValue('joNumber', nextJONumber)
		}
	}, [nextJONumber, formInitialData, setValue])

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

	useEffect(() => {
		if (isUpdateMode && particulars.length > 0 && !editingField) {
			const allAccordionValues = particulars.map(
				(_, index) => `item-${index}`,
			)
			setOpenAccordions(allAccordionValues)
		}
	}, [isUpdateMode, particulars, editingField])

	useEffect(() => {
		const formDate = getValues('date')
		if (formDate) {
			setInputValue(format(formDate, 'MM/dd/yyyy'))
		}
	}, [getValues])

	useEffect(() => {
		if (datePickerOpen) {
			setCurrentMonth(getValues('date') || new Date())
		}
	}, [datePickerOpen, getValues])

	const triggerAllPaymentValidations = async () => {
		const formParticulars = getValues('particulars')
		const paymentIndices = formParticulars
			.map((p, index) => (p.type === 'Payment' ? index : -1))
			.filter((index) => index !== -1)

		for (const index of paymentIndices) {
			await trigger(`particulars[${index}].unitPrice`)
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

		if (isMobile) {
			const newIndex = particulars.length
			setOpenAccordions([`item-${newIndex}`])
		}

		serviceRefs.current = serviceRefs.current.concat(null)
	}

	const removeParticular = async (index) => {
		if (editingField === `particular-${index}`) {
			setEditingField(null)
		} else if (editingField && editingField.startsWith('particular-')) {
			const editingIndex = parseInt(editingField.split('-')[1])
			if (editingIndex > index) {
				setEditingField(`particular-${editingIndex - 1}`)
			}
		}

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
			clearErrors(field)
		})

		serviceRefs.current = serviceRefs.current.filter((_, i) => i !== index)
		if (
			isMobile &&
			particulars.length > 1 &&
			index === particulars.length - 1
		) {
			setOpenAccordions([`item-${particulars.length - 2}`])
		}

		await triggerAllPaymentValidations()
	}

	const handleDateInput = (e) => {
		const value = e.target.value
		setInputValue(value)
		const isAddingText = value.length > inputValue.length

		if (isAddingText) {
			if (
				value.length === 2 &&
				!value.includes('/') &&
				/^\d{2}$/.test(value)
			) {
				setInputValue(value + '/')
			} else if (
				value.length === 5 &&
				value.charAt(2) === '/' &&
				!value.includes('/', 3) &&
				/^\d{2}\/\d{2}$/.test(value)
			) {
				setInputValue(value + '/')
			}
		}

		if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
			try {
				const parsedDate = parse(value, 'MM/dd/yyyy', new Date())

				if (isValid(parsedDate)) {
					setValue('date', parsedDate)

					if (parsedDate > new Date(new Date().toDateString())) {
						form.setError('date', {
							type: 'manual',
							message: 'Date cannot be in the future',
						})
					} else if (parsedDate < minimumDate) {
						form.setError('date', {
							type: 'manual',
							message: `Date cannot be before ${format(minimumDate, 'MM/dd/yyyy')}`,
						})
					} else {
						form.clearErrors('date')
					}
				} else {
					form.setError('date', {
						type: 'manual',
						message: 'Invalid date',
					})
				}
			} catch (error) {
				form.setError('date', {
					type: 'manual',
					message: 'Invalid date format',
				})
			}
		} else if (value.length > 0) {
			form.setError('date', {
				type: 'manual',
				message: 'Please complete the date in MM/DD/YYYY format',
			})
		} else {
			form.clearErrors('date')
		}
	}

	const handleDateBlur = () => {
		if (inputValue) {
			if (/^\d{2}\/\d{2}\/\d{4}$/.test(inputValue)) {
				validateDate(inputValue)
			} else {
				form.setError('date', {
					type: 'manual',
					message: 'Invalid date format. Use MM/DD/YYYY',
				})
			}
		}
	}

	const validateDate = (dateString) => {
		try {
			if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
				form.setError('date', {
					type: 'manual',
					message: 'Invalid date format. Use MM/DD/YYYY',
				})
				return
			}

			const parsedDate = parse(dateString, 'MM/dd/yyyy', new Date())

			if (!isValid(parsedDate)) {
				form.setError('date', {
					type: 'manual',
					message: 'Invalid date',
				})
				return
			}

			if (parsedDate > new Date(new Date().toDateString())) {
				form.setError('date', {
					type: 'manual',
					message: 'Date cannot be in the future',
				})
				return
			}

			if (parsedDate < minimumDate) {
				form.setError('date', {
					type: 'manual',
					message: `Date cannot be before ${format(minimumDate, 'MM/dd/yyyy')}`,
				})
				return
			}

			setValue('date', parsedDate)
			form.clearErrors('date')
		} catch (error) {
			form.setError('date', {
				type: 'manual',
				message: 'Invalid date format',
			})
		}
	}

	const today = new Date()
	const yesterday = addDays(today, -1)

	const quickSelectOptions = [
		{ label: 'Today', date: today },
		{ label: 'Yesterday', date: yesterday },
	]

	const selectQuickDate = (selectedDate) => {
		setValue('date', selectedDate)
		setDatePickerOpen(false)
		setInputValue(format(selectedDate, 'MM/dd/yyyy'))
		form.clearErrors('date')
	}
	const previousMonth = () => {
		setCurrentMonth(addMonths(currentMonth, -1))
	}

	const nextMonth = () => {
		setCurrentMonth(addMonths(currentMonth, 1))
	}
	const monthStart = startOfMonth(currentMonth)
	const monthEnd = endOfMonth(currentMonth)
	const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
	const startDay = getDay(monthStart)
	const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

	const onSubmit = (data) => {
		const transaction = {
			id: transactionId,
			joNumber: data.joNumber,
			date: format(data.date, 'yyyy-MM-dd'),
			clientId: clientId,
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
			originalTransaction: {
				amount: originalTransaction?.amount || 0,
				payment: originalTransaction?.payment || 0,
			},
			projectedClientBalance: projectedClientBalance,
		}

		const currentPath = location.pathname

		if (isUpdateMode) {
			navigate(`${currentPath}/review`, { state: transaction })
		} else {
			const newPath = currentPath.replace('/add', '/review')
			navigate(newPath, { state: transaction })
		}
	}

	if (isMobile) {
		return (
			<div className="px-4 py-6 space-y-6 max-w-md mx-auto">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<div className="grid grid-cols-1 gap-4">
							<div>
								<Label htmlFor="joNumber">Job Order #</Label>
								<Input
									id="joNumber"
									value={form.watch('joNumber')}
									disabled
									className="mt-1"
								/>
							</div>

							<div>
								<div className="flex justify-between items-center">
									<Label htmlFor="date">Date</Label>
									{isUpdateMode && (
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onClick={() =>
												setEditingField(
													editingField === 'date'
														? null
														: 'date',
												)
											}
											className={cn(
												'text-xs h-10 w-10 px-2',
												editingField === 'date'
													? 'text-green-600'
													: 'text-blue-600',
											)}
										>
											{editingField === 'date'
												? 'Done'
												: 'Edit'}
										</Button>
									)}
								</div>
								<div className="relative mt-1">
									<div className="flex">
										<Input
											id="date"
											type="text"
											inputMode="numeric"
											pattern="\d{2}/\d{2}/\d{4}"
											placeholder="MM/DD/YYYY"
											value={inputValue}
											onChange={handleDateInput}
											className={cn(
												'h-12 text-base pr-12 border-2',
												form.formState.errors.date
													? 'border-red-500 focus:border-red-500'
													: 'focus:border-primary',
											)}
											disabled={
												isUpdateMode &&
												editingField !== 'date'
											}
											aria-invalid={
												!!form.formState.errors.date
											}
											aria-describedby={
												form.formState.errors.date
													? 'date-error'
													: undefined
											}
											onBlur={handleDateBlur}
											ref={dateRef}
										/>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="absolute right-0 top-0 h-12 w-12"
											disabled={
												isUpdateMode &&
												editingField !== 'date'
											}
											onClick={() =>
												setDatePickerOpen(true)
											}
										>
											<CalendarIcon className="h-5 w-5" />
										</Button>
									</div>
									{!form.formState.errors.date && (
										<p className="text-gray-500 text-xs mt-1">
											Format: MM/DD/YYYY (e.g.,
											01/15/2023)
										</p>
									)}
									{form.formState.errors.date && (
										<p
											id="date-error"
											className="text-red-500 text-sm mt-1"
										>
											{form.formState.errors.date.message}
										</p>
									)}

									<Drawer
										open={datePickerOpen}
										onOpenChange={setDatePickerOpen}
									>
										<DrawerContent className="p-0 max-h-[90vh]">
											<DrawerHeader className="border-b px-4 py-3">
												<DrawerTitle className="text-base font-medium">
													Select Date
												</DrawerTitle>
												<DrawerDescription className="text-sm text-muted-foreground">
													Choose a date for your
													transaction
												</DrawerDescription>
											</DrawerHeader>

											<div className="p-4">
												<div className="grid grid-cols-2 gap-2 mb-6">
													{quickSelectOptions.map(
														(option) => (
															<Button
																key={
																	option.label
																}
																variant="outline"
																className="h-14 text-base"
																onClick={() =>
																	selectQuickDate(
																		option.date,
																	)
																}
															>
																{option.label}
															</Button>
														),
													)}
												</div>

												<div className="flex items-center justify-between mb-6">
													<Button
														variant="outline"
														className="h-14 w-14 p-0"
														onClick={previousMonth}
													>
														<ChevronLeft className="h-6 w-6" />
													</Button>
													<h2 className="text-xl font-medium">
														{format(
															currentMonth,
															'MMMM yyyy',
														)}
													</h2>
													<Button
														variant="outline"
														className="h-14 w-14 p-0"
														onClick={nextMonth}
													>
														<ChevronRight className="h-6 w-6" />
													</Button>
												</div>

												<div className="grid grid-cols-7 text-center mb-2">
													{weekDays.map((day) => (
														<div
															key={day}
															className="text-sm font-medium text-muted-foreground"
														>
															{day}
														</div>
													))}
												</div>

												<div className="grid grid-cols-7 gap-2">
													{Array.from({
														length: startDay,
													}).map((_, index) => (
														<div
															key={`empty-${index}`}
														></div>
													))}

													{days.map((day) => {
														const isSelected =
															isSameDay(
																day,
																form.watch(
																	'date',
																),
															)
														const isToday =
															isSameDay(
																day,
																today,
															)
														const isFuture =
															day > today
														const isPast =
															day < minimumDate

														return (
															<div
																key={day.toString()}
																className="flex justify-center"
															>
																<button
																	type="button"
																	onClick={() => {
																		if (
																			!isFuture
																		) {
																			setValue(
																				'date',
																				day,
																			)
																			setInputValue(
																				format(
																					day,
																					'MM/dd/yyyy',
																				),
																			)
																			setDatePickerOpen(
																				false,
																			)
																			form.clearErrors(
																				'date',
																			)
																		}
																	}}
																	disabled={
																		isFuture ||
																		isPast
																	}
																	className={cn(
																		'h-14 w-14 flex items-center justify-center rounded-md',
																		isSelected &&
																			'bg-black text-white',
																		isToday &&
																			!isSelected &&
																			'border border-primary',
																		isFuture &&
																			'text-muted-foreground opacity-50 cursor-not-allowed',
																		!isSelected &&
																			!isToday &&
																			!isFuture &&
																			'hover:bg-muted',
																	)}
																	aria-label={format(
																		day,
																		'MMMM d, yyyy',
																	)}
																>
																	{format(
																		day,
																		'd',
																	)}
																</button>
															</div>
														)
													})}
												</div>
											</div>
										</DrawerContent>
									</Drawer>
								</div>
							</div>
						</div>

						<div className="space-y-4 mt-6">
							<Label>Particulars</Label>

							<div className="space-y-3">
								{particulars.map((particular, index) => (
									<div
										key={index}
										className="border rounded-md overflow-hidden"
									>
										<Accordion
											type="multiple"
											value={openAccordions}
											onValueChange={(value) => {
												if (isUpdateMode) {
													if (
														editingField ===
														`particular-${index}`
													) {
														setOpenAccordions(value)
													}
												} else {
													setOpenAccordions(value)
												}
											}}
										>
											<AccordionItem
												value={`item-${index}`}
												className="border-0"
											>
												<AccordionTrigger
													className={cn(
														'px-4 py-4 hover:no-underline',
														isUpdateMode &&
															editingField !==
																`particular-${index}` &&
															'cursor-default',
													)}
													onClick={(e) => {
														if (
															isUpdateMode &&
															editingField !==
																`particular-${index}`
														) {
															e.preventDefault()
														}
													}}
												>
													<div className="flex justify-between items-center w-full">
														<span className="truncate max-w-[150px]">
															{particular.name ||
																'Select service...'}
														</span>
														{particular.type ===
															'Service' &&
															particular.name && (
																<span className="text-sm text-gray-600 mr-2 flex-shrink-0">
																	{
																		particular.units
																	}{' '}
																	× ₱
																	{Number(
																		particular.unitPrice,
																	).toFixed(
																		2,
																	)}
																</span>
															)}
														{particular.type ===
															'Payment' && (
															<span className="text-sm text-gray-600 mr-2 flex-shrink-0">
																₱
																{Number(
																	particular.unitPrice,
																).toFixed(2)}
															</span>
														)}
													</div>
												</AccordionTrigger>
												<AccordionContent className="px-4 pb-4">
													<div className="space-y-4">
														<FormField
															control={
																form.control
															}
															name={`particulars.${index}.particularId`}
															render={({
																field,
															}) => (
																<FormItem>
																	<FormLabel>
																		Service/Payment
																	</FormLabel>
																	<FormControl>
																		<Popover
																			open={
																				openComboboxes[
																					index
																				]
																			}
																			onOpenChange={(
																				open,
																			) => {
																				if (
																					!isUpdateMode ||
																					editingField ===
																						`particular-${index}`
																				) {
																					setOpenComboboxes(
																						(
																							prev,
																						) => ({
																							...prev,
																							[index]:
																								open,
																						}),
																					)
																				}
																			}}
																		>
																			<PopoverTrigger
																				asChild
																			>
																				<Button
																					variant="outline"
																					role="combobox"
																					className="w-full justify-between mt-1 h-12 text-base"
																					disabled={
																						isUpdateMode &&
																						editingField !==
																							`particular-${index}`
																					}
																				>
																					<span className="truncate">
																						{field.value
																							? services.find(
																									(
																										s,
																									) =>
																										s.value ===
																										field.value,
																								)
																									?.label
																							: 'Select service...'}
																					</span>
																					<ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
																				</Button>
																			</PopoverTrigger>
																			<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
																				<Command>
																					<CommandInput
																						placeholder="Search service..."
																						className="h-12"
																					/>
																					<CommandList>
																						<CommandEmpty>
																							No
																							service
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
																										className="h-12 text-base"
																									>
																										<Check
																											className={cn(
																												'mr-2 h-5 w-5 flex-shrink-0',
																												field.value ===
																													service.value
																													? 'opacity-100'
																													: 'opacity-0',
																											)}
																										/>
																										<span className="truncate">
																											{
																												service.label
																											}
																										</span>
																									</CommandItem>
																								),
																							)}
																						</CommandGroup>
																					</CommandList>
																				</Command>
																			</PopoverContent>
																		</Popover>
																	</FormControl>
																	<FormMessage />
																</FormItem>
															)}
														/>

														{particular.type ===
															'Service' && (
															<div className="grid grid-cols-2 gap-3">
																<FormField
																	control={
																		form.control
																	}
																	name={`particulars.${index}.units`}
																	render={({
																		field,
																	}) => (
																		<FormItem>
																			<FormLabel>
																				Units
																			</FormLabel>
																			<FormControl>
																				<Input
																					type="number"
																					{...field}
																					onChange={(
																						e,
																					) => {
																						field.onChange(
																							Number(
																								e
																									.target
																									.value,
																							) ||
																								0,
																						)
																						handleParticularChange(
																							index,
																							'units',
																							Number(
																								e
																									.target
																									.value,
																							) ||
																								0,
																						)
																					}}
																					className="mt-1 h-12 text-base"
																					min={
																						1
																					}
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

																<FormField
																	control={
																		form.control
																	}
																	name={`particulars.${index}.unitPrice`}
																	render={({
																		field,
																	}) => (
																		<FormItem>
																			<FormLabel>
																				Unit
																				Price
																			</FormLabel>
																			<FormControl>
																				<Input
																					type="text"
																					value={
																						field.value
																					}
																					onChange={(
																						e,
																					) => {
																						if (
																							e
																								.target
																								.value ===
																								'' ||
																							/^\d{1,8}(\.\d{0,2})?$/.test(
																								e
																									.target
																									.value,
																							)
																						) {
																							const value =
																								Number.parseFloat(
																									e
																										.target
																										.value,
																								) ||
																								0
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
																					onBlur={(
																						e,
																					) => {
																						const value =
																							e
																								.target
																								.value
																						if (
																							value !==
																								'' &&
																							value !==
																								'.'
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
																					className="mt-1 h-12 text-base"
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
															</div>
														)}

														{particular.type ===
															'Payment' && (
															<FormField
																control={
																	form.control
																}
																name={`particulars.${index}.unitPrice`}
																render={({
																	field,
																}) => (
																	<FormItem>
																		<FormLabel>
																			Payment
																			Amount
																		</FormLabel>
																		<FormControl>
																			<Input
																				type="text"
																				value={
																					field.value
																				}
																				onChange={(
																					e,
																				) => {
																					if (
																						e
																							.target
																							.value ===
																							'' ||
																						/^\d{1,8}(\.\d{0,2})?$/.test(
																							e
																								.target
																								.value,
																						)
																					) {
																						const value =
																							Number.parseFloat(
																								e
																									.target
																									.value,
																							) ||
																							0
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
																				onBlur={(
																					e,
																				) => {
																					const value =
																						e
																							.target
																							.value
																					if (
																						value !==
																							'' &&
																						value !==
																							'.'
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
																				className="mt-1 h-12 text-base"
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

														<div className="flex flex-col gap-2 mt-2">
															{isUpdateMode && (
																<Button
																	type="button"
																	variant="outline"
																	size="lg"
																	onClick={() => {
																		if (
																			editingField ===
																			`particular-${index}`
																		) {
																			setEditingField(
																				null,
																			)
																		} else {
																			setEditingField(
																				`particular-${index}`,
																			)
																			if (
																				!openAccordions.includes(
																					`item-${index}`,
																				)
																			) {
																				setOpenAccordions(
																					[
																						...openAccordions,
																						`item-${index}`,
																					],
																				)
																			}
																		}
																	}}
																	className={cn(
																		'w-full h-14',
																		editingField ===
																			`particular-${index}`
																			? 'text-green-600 hover:text-green-800 hover:bg-green-50'
																			: 'text-blue-600 hover:text-blue-800 hover:bg-blue-50',
																	)}
																>
																	{editingField ===
																	`particular-${index}` ? (
																		<>
																			<Check className="mr-2 h-5 w-5" />{' '}
																			Done
																		</>
																	) : (
																		<>
																			<Pencil className="mr-2 h-5 w-5" />{' '}
																			Edit
																		</>
																	)}
																</Button>
															)}
															{(!isUpdateMode ||
																editingField ===
																	`particular-${index}`) &&
																particulars.length >
																	1 && (
																	<Button
																		type="button"
																		variant="ghost"
																		size="lg"
																		onClick={() =>
																			removeParticular(
																				index,
																			)
																		}
																		className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 h-14"
																	>
																		<X className="mr-2 h-5 w-5" />{' '}
																		Remove
																	</Button>
																)}
														</div>
													</div>
												</AccordionContent>
											</AccordionItem>
										</Accordion>
									</div>
								))}
							</div>
							{!isUpdateMode && (
								<Button
									type="button"
									variant="outline"
									onClick={addParticular}
									className="w-full h-14 text-base"
								>
									<PlusCircle className="mr-2 h-5 w-5" /> Add
									Particular
								</Button>
							)}
						</div>

						<div className="space-y-4 border-t border-b py-4 mt-6">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label htmlFor="totalAmount">
										Total Amount
									</Label>
									<Input
										id="totalAmount"
										value={totalAmount.toFixed(2)}
										readOnly
										className="mt-1 h-12 text-base"
									/>
								</div>

								<div>
									<Label htmlFor="totalPayment">
										Total Payment
									</Label>
									<Input
										id="totalPayment"
										value={totalPayment.toFixed(2)}
										readOnly
										className="mt-1 h-12 text-base"
									/>
								</div>
							</div>

							<div>
								<Label htmlFor="balance">Balance</Label>
								<Input
									id="balance"
									value={balance.toFixed(2)}
									readOnly
									className="mt-1 h-12 text-base"
								/>
							</div>

							<div
								className={`p-4 border rounded-lg ${isOverpayment ? 'bg-yellow-50' : 'bg-blue-50'} mb-4`}
							>
								<div className="space-y-2">
									<div className="flex justify-between items-center">
										<span>
											Current Transaction Balance:
										</span>
										<span className="font-medium">
											₱{balance.toFixed(2)}
										</span>
									</div>

									{isUpdateMode && originalTransaction && (
										<div className="flex justify-between">
											<span>Net Change:</span>
											<span
												className={`font-medium flex items-center ${
													balance -
														(originalTransaction.amount -
															originalTransaction.payment) >
													0
														? 'text-red-600'
														: balance -
																	(originalTransaction.amount -
																		originalTransaction.payment) <
															  0
															? 'text-green-600'
															: ''
												}`}
											>
												{balance -
													(originalTransaction.amount -
														originalTransaction.payment) >
												0
													? '↑'
													: balance -
																(originalTransaction.amount -
																	originalTransaction.payment) <
														  0
														? '↓'
														: ''}
												₱
												{Math.abs(
													balance -
														(originalTransaction.amount -
															originalTransaction.payment),
												).toFixed(2)}
											</span>
										</div>
									)}

									<div className="flex justify-between items-center">
										<span>
											Outstanding Balance (
											{isUpdateMode
												? 'Before Update'
												: 'Before Transaction'}
											):
										</span>
										<span>
											₱
											{(
												selectedClient?.totalBalance ||
												0
											).toFixed(2)}
										</span>
									</div>

									<div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-1 font-medium">
										<span>
											Projected Balance (
											{isUpdateMode
												? 'After Update'
												: 'After Transaction'}
											):
										</span>
										<span>₱{projectedClientBalance}</span>
									</div>
								</div>
							</div>

							<BalanceDrawer
								totalAmount={totalAmount}
								totalPayment={totalPayment}
								balance={balance}
								clientBalance={
									selectedClient?.totalBalance || 0
								}
								isUpdateMode={isUpdateMode}
								originalTransaction={originalTransaction}
							/>
						</div>

						<div className="mt-6">
							<FormField
								control={form.control}
								name="remarks"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Remarks (Optional)
										</FormLabel>
										<FormControl>
											<Textarea
												{...field}
												placeholder="Any additional notes..."
												className="mt-1 h-20 text-base"
												disabled={
													isUpdateMode &&
													editingField !== 'remarks'
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<Button
							type="submit"
							className="w-full h-14 text-base mt-6"
						>
							{isUpdateMode
								? 'Update Transaction'
								: 'Review Transaction'}
						</Button>
					</form>
				</Form>
			</div>
		)
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
														editingField !== 'date'
													}
													ref={dateRef}
												>
													<CalendarIcon className="mr-2 h-4 w-4" />
													{format(field.value, 'PPP')}
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
															field.onChange(date)
														}
													}}
													disabled={(date) =>
														date >
															new Date(
																new Date().toDateString(),
															) ||
														date < minimumDate
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
														editingField === 'date'
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
									editingField === `particular-${index}` &&
									'bg-muted/30',
							)}
						>
							<FormField
								control={form.control}
								name={`particulars.${index}.particularId`}
								render={({ field }) => (
									<FormItem className="max-w-[240px] flex-1">
										<FormLabel>Service/Payment</FormLabel>
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
																		)?.label
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
																Number(
																	e.target
																		.value,
																),
															)
															handleParticularChange(
																index,
																'units',
																Number(
																	e.target
																		.value,
																),
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
													value={field.value}
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
															] = value.split('.')
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
										onClick={() => removeParticular(index)}
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
					{(!isUpdateMode ||
						editingField?.startsWith('particular-')) && (
						<Button
							type="button"
							variant="outline"
							onClick={addParticular}
							className="mt-2"
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
							<Input value={totalAmount.toFixed(2)} readOnly />
						</div>
						<div>
							<Label>Total Payment</Label>
							<Input value={totalPayment.toFixed(2)} readOnly />
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
													editingField === 'remarks'
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
					{isUpdateMode ? 'Update Transaction' : 'Review Transaction'}
				</Button>
			</form>
		</Form>
	)
}

export default TransactionForm
