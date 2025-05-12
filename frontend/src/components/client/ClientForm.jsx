import { useState, useEffect, useRef } from 'react'
import * as yup from 'yup'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react'
import { useToast } from '../ui/hooks/use-toast'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogDescription,
} from '../ui/dialog'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '../ui/form'
import { Input } from '../ui/input'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import { Checkbox } from '../ui/checkbox'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Pencil, X } from 'lucide-react'
import { useMediaQuery } from '../ui/hooks/useMediaQuery'

import { useDispatch } from 'react-redux'
import {
	createClient,
	checkClientName,
	updateClient,
} from '../../reducers/clientSlice'

const schema = yup.object().shape({
	title: yup
		.string()
		.oneOf(['Dr.', 'Dra.', 'none'])
		.required('Title is required'),
	firstName: yup.string().required('First name is required'),
	lastName: yup.string().required('Last name is required'),
	address: yup
		.string()
		.required('Address is required')
		.max(255, 'Address must be less than 255 characters'),
})

export function ClientForm({
	onClientAdded,
	onClientUpdated,
	initialData = null,
	isUpdateMode = false,
	isMobile = false,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
}) {
	const dispatch = useDispatch()
	const [internalOpen, setInternalOpen] = useState(false)
	const [acknowledgeChecked, setAcknowledgeChecked] = useState(false)
	const [showAlert, setShowAlert] = useState(false)
	const [editingField, setEditingField] = useState(null)
	const { toast } = useToast()
	const isSmallScreen = useMediaQuery('(max-width: 405px)')

	const firstNameRef = useRef(null)
	const lastNameRef = useRef(null)
	const addressRef = useRef(null)

	const form = useForm({
		resolver: yupResolver(schema),
		defaultValues: {
			title: 'none',
			firstName: '',
			lastName: '',
			address: '',
		},
		mode: 'onChange',
	})

	const open = externalOpen !== undefined ? externalOpen : internalOpen
	const onOpenChange = externalOnOpenChange || setInternalOpen

	useEffect(() => {
		if (initialData && open) {
			form.reset({
				title: initialData.title || 'none',
				firstName: initialData.firstName,
				lastName: initialData.lastName,
				address: initialData.address,
			})
			setEditingField(null)
		}
	}, [initialData, form, open])

	useEffect(() => {
		if (editingField) {
			const refMap = {
				firstName: firstNameRef,
				lastName: lastNameRef,
				address: addressRef,
			}
			const ref = refMap[editingField]
			if (ref && ref.current) {
				ref.current.focus()
			}
		}
	}, [editingField])

	const onSubmit = async (data) => {
		const { title, firstName, lastName, address } = data

		const trimmedFirstName = firstName.trim()
		const trimmedLastName = lastName.trim()

		const hasNameChanged =
			trimmedFirstName !== initialData?.firstName ||
			trimmedLastName !== initialData?.lastName

		const requestBody = {
			title: title === 'none' ? null : title,
			firstName: trimmedFirstName,
			lastName: trimmedLastName,
			address,
		}

		try {
			if (hasNameChanged) {
				const nameCheckResult = await dispatch(
					checkClientName({
						firstName: trimmedFirstName,
						lastName: trimmedLastName,
					}),
				).unwrap()

				if (nameCheckResult.exists && !acknowledgeChecked) {
					setShowAlert(true)
					return
				}
			}

			if (!initialData) {
				const result = await dispatch(
					createClient(requestBody),
				).unwrap()
				onClientAdded(result.id)
			} else {
				const result = await dispatch(
					updateClient({
						id: initialData.id,
						updatedData: requestBody,
					}),
				).unwrap()
				onClientUpdated(result.id)
			}

			toast({
				title: initialData ? 'Client Updated' : 'Client Added',
				description: `${initialData ? `${initialData.firstName} ${initialData.lastName}` : `${requestBody.firstName} ${requestBody.lastName}`} has been ${initialData ? 'updated' : 'added'} successfully.`,
			})

			onOpenChange(false)
			resetForm()
		} catch {
			toast({
				variant: 'destructive',
				title: `Error ${initialData ? 'updating' : 'adding'} client:`,
				description: `An error occurred while ${initialData ? 'updating' : 'adding'} the client.`,
			})
		}
	}

	const handleKeyPress = (event, fieldName) => {
		const keyCode = event.keyCode || event.which
		const keyValue = String.fromCharCode(keyCode)

		if (event.ctrlKey || event.metaKey || keyCode < 32) return

		if (!/^[A-Za-zñÑ\s.-]+$/.test(keyValue)) {
			event.preventDefault()
			if (!form.formState.errors[fieldName]) {
				form.setError(fieldName, {
					type: 'specialCharacter',
					message: 'Invalid character entered.',
				})
			}
		} else {
			if (form.formState.errors[fieldName]?.type === 'specialCharacter') {
				form.clearErrors(fieldName)
			}
		}
	}

	const handleFieldFocus = (field) => {
		Object.keys(form.formState.errors).forEach((key) => {
			if (
				key !== field.name &&
				form.formState.errors[key]?.type === 'specialCharacter'
			) {
				form.clearErrors(key)
			}
		})
	}

	const resetForm = () => {
		form.reset({
			title: 'none',
			firstName: '',
			lastName: '',
			address: '',
		})
		setShowAlert(false)
		setAcknowledgeChecked(false)
		setEditingField(null)
	}

	const handleOpenChange = (newOpen) => {
		onOpenChange(newOpen)
		if (!newOpen) {
			resetForm()
		}
	}

	const handleFieldChange = () => {
		setShowAlert(false)
	}

	const defaultTrigger = () => {
		return isMobile ? (
			<Button
				size="icon"
				className="h-11 w-11 bg-action hover:bg-action-focus"
			>
				<Plus className="h-5 w-5 text-white" />
			</Button>
		) : (
			<Button
				variant="default"
				size="sm"
				className="ml-2 hidden h-8 lg:flex bg-action hover:bg-action-focus"
			>
				<Plus className="h-4 w-4 text-white" />
				Add Client
			</Button>
		)
	}

	const contentScrollable = showAlert && isSmallScreen

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			{!isUpdateMode && (
				<DialogTrigger asChild>{defaultTrigger()}</DialogTrigger>
			)}
			<DialogContent className="p-0 w-full sm:max-w-[425px] max-h-[90vh] flex flex-col overflow-hidden">
				<DialogHeader className="bg-white px-4 py-3 sm:px-6 sm:py-4 border-b sticky top-0 z-10">
					<div className="flex items-center justify-between">
						<DialogTitle className="text-lg">
							{initialData ? 'Edit Client' : 'Add Client'}
						</DialogTitle>
					</div>
					<DialogDescription className="pt-1 text-sm">
						{initialData
							? "Edit the client's information below to update them in your list."
							: "Enter the client's information below to add them to your list."}
					</DialogDescription>
				</DialogHeader>

				<div
					className={`px-4 py-3 sm:px-6 flex-grow ${contentScrollable ? 'overflow-y-auto' : ''}`}
				>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className="space-y-4"
						>
							{showAlert && (
								<div className="space-y-3">
									<Alert className="border-yellow-500 bg-yellow-50 text-yellow-900 relative">
										<AlertTitle className="text-base font-semibold">
											Warning: Duplicate Client
										</AlertTitle>
										<AlertDescription className="mt-1 text-sm">
											<p>
												A client with the name{' '}
												<strong>
													{form.getValues(
														'firstName',
													)}{' '}
													{form.getValues('lastName')}
												</strong>{' '}
												already exists.
											</p>
										</AlertDescription>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="absolute top-2 right-2 h-6 w-6 rounded-full"
											onClick={() => setShowAlert(false)}
										>
											<X className="h-3 w-3" />
											<span className="sr-only">
												Close warning
											</span>
										</Button>
									</Alert>
									<div className="flex items-center space-x-3">
										<Checkbox
											id="acknowledge"
											checked={acknowledgeChecked}
											onCheckedChange={
												setAcknowledgeChecked
											}
											className="h-5 w-5 border-2"
										/>
										<label
											htmlFor="acknowledge"
											className="text-sm font-medium leading-none cursor-pointer"
										>
											{initialData
												? 'Confirm duplicate client update'
												: 'Confirm adding duplicate client'}
										</label>
									</div>
								</div>
							)}
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem className="space-y-2">
										<FormLabel>Title</FormLabel>
										<FormControl>
											<div className="flex items-center space-x-2">
												<RadioGroup
													onValueChange={(value) => {
														field.onChange(value)
														handleFieldChange()
													}}
													defaultValue={field.value}
													className="flex flex-wrap gap-6"
													disabled={
														initialData &&
														!(
															editingField ===
															'title'
														)
													}
												>
													<FormItem className="flex items-center space-x-3">
														<FormControl>
															<RadioGroupItem
																value="Dr."
																className="h-5 w-5"
															/>
														</FormControl>
														<FormLabel className="font-normal cursor-pointer">
															Dr.
														</FormLabel>
													</FormItem>
													<FormItem className="flex items-center space-x-3">
														<FormControl>
															<RadioGroupItem
																value="Dra."
																className="h-5 w-5"
															/>
														</FormControl>
														<FormLabel className="font-normal cursor-pointer">
															Dra.
														</FormLabel>
													</FormItem>
													<FormItem className="flex items-center space-x-3">
														<FormControl>
															<RadioGroupItem
																value="none"
																className="h-5 w-5"
															/>
														</FormControl>
														<FormLabel className="font-normal cursor-pointer">
															None
														</FormLabel>
													</FormItem>
												</RadioGroup>
												{initialData && (
													<Button
														type="button"
														variant="ghost"
														size="icon"
														className="h-10 w-10 ml-auto"
														onClick={() =>
															setEditingField(
																editingField ===
																	'title'
																	? null
																	: 'title',
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
							<FormField
								control={form.control}
								name="firstName"
								render={({ field }) => (
									<FormItem className="space-y-2">
										<FormLabel>First Name</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													{...field}
													disabled={
														initialData &&
														!(
															editingField ===
															'firstName'
														)
													}
													onKeyPress={(e) =>
														handleKeyPress(
															e,
															'firstName',
														)
													}
													onFocus={() =>
														handleFieldFocus(field)
													}
													onChange={(e) => {
														field.onChange(e)
														handleFieldChange()
													}}
													ref={firstNameRef}
													className="h-12"
												/>
												{initialData && (
													<Button
														type="button"
														variant="ghost"
														size="icon"
														className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10"
														onClick={() =>
															setEditingField(
																editingField ===
																	'firstName'
																	? null
																	: 'firstName',
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
							<FormField
								control={form.control}
								name="lastName"
								render={({ field }) => (
									<FormItem className="space-y-2">
										<FormLabel>Last Name</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													{...field}
													disabled={
														initialData &&
														!(
															editingField ===
															'lastName'
														)
													}
													onKeyPress={(e) =>
														handleKeyPress(
															e,
															'lastName',
														)
													}
													onFocus={() =>
														handleFieldFocus(field)
													}
													onChange={(e) => {
														field.onChange(e)
														handleFieldChange()
													}}
													ref={lastNameRef}
													className="h-12"
												/>
												{initialData && (
													<Button
														type="button"
														variant="ghost"
														size="icon"
														className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10"
														onClick={() =>
															setEditingField(
																editingField ===
																	'lastName'
																	? null
																	: 'lastName',
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
							<FormField
								control={form.control}
								name="address"
								render={({ field }) => (
									<FormItem className="space-y-2">
										<FormLabel>Address</FormLabel>
										<FormControl>
											<div className="relative">
												<Input
													{...field}
													onFocus={() =>
														handleFieldFocus(field)
													}
													disabled={
														initialData &&
														!(
															editingField ===
															'address'
														)
													}
													ref={addressRef}
													className="h-12"
													maxLength={255}
												/>
												{initialData && (
													<Button
														type="button"
														variant="ghost"
														size="icon"
														className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10"
														onClick={() =>
															setEditingField(
																editingField ===
																	'address'
																	? null
																	: 'address',
															)
														}
													>
														<Pencil className="h-4 w-4" />
													</Button>
												)}
											</div>
										</FormControl>
										<div className="text-xs text-right text-gray-500">
											{field.value.length} / 255
										</div>
										<FormMessage />
									</FormItem>
								)}
							/>
						</form>
					</Form>
				</div>

				<DialogFooter className="bg-white px-4 py-3 sm:px-6 border-t sticky bottom-0 z-10">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChange(false)}
							className="h-12"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={showAlert && !acknowledgeChecked}
							className="bg-action hover:bg-action-focus h-12"
							onClick={form.handleSubmit(onSubmit)}
						>
							{initialData ? 'Update Client' : 'Add Client'}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
