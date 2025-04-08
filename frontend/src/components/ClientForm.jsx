import { useState, useEffect, useRef } from 'react'
import * as yup from 'yup'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button } from './ui/button'
import { Plus } from 'lucide-react'
import { useToast } from './ui/hooks/use-toast'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from './ui/dialog'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from './ui/form'
import { Input } from './ui/input'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Checkbox } from './ui/checkbox'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Pencil } from 'lucide-react'

import { useDispatch } from 'react-redux'
import {
	createClient,
	checkClientName,
	updateClient,
} from '../reducers/clientSlice'

const schema = yup.object().shape({
	title: yup
		.string()
		.oneOf(['Dr.', 'Dra.', 'none'])
		.required('Title is required'),
	firstName: yup.string().required('First name is required'),
	lastName: yup.string().required('Last name is required'),
	address: yup.string().required('Address is required'),
})

export function ClientForm({
	onClientAdded,
	onClientUpdated,
	initialData = null,
	isUpdateMode = false,
	open: externalOpen,
	onOpenChange: externalOnOpenChange,
}) {
	const dispatch = useDispatch()
	const [internalOpen, setInternalOpen] = useState(false)
	const [acknowledgeChecked, setAcknowledgeChecked] = useState(false)
	const [showAlert, setShowAlert] = useState(false)
	const [editingField, setEditingField] = useState(null)
	const { toast } = useToast()

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

	const defaultTrigger = (
		<Button variant="default" size="sm" className="ml-2 hidden h-8 lg:flex">
			<Plus className="h-4 w-4" />
			Add Client
		</Button>
	)

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			{!isUpdateMode && (
				<DialogTrigger asChild>{defaultTrigger}</DialogTrigger>
			)}
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>
						{initialData ? 'Edit Client' : 'Add Client'}
					</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						{showAlert && (
							<Alert className="mb-4 border-yellow-500 bg-yellow-50 text-yellow-900">
								<AlertTitle className="text-lg font-semibold">
									Warning: Duplicate Client
								</AlertTitle>
								<AlertDescription className="mt-2">
									<p>
										A client with the name{' '}
										<strong>
											{form.getValues('firstName')}{' '}
											{form.getValues('lastName')}
										</strong>{' '}
										already exists.
									</p>
								</AlertDescription>
							</Alert>
						)}
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title</FormLabel>
									<FormControl>
										<div className="flex items-center space-x-2">
											<RadioGroup
												onValueChange={(value) => {
													field.onChange(value)
													handleFieldChange()
												}}
												defaultValue={field.value}
												className="flex space-x-4"
												disabled={
													initialData &&
													!(editingField === 'title')
												}
											>
												<FormItem className="flex items-center space-x-2">
													<FormControl>
														<RadioGroupItem value="Dr." />
													</FormControl>
													<FormLabel className="font-normal">
														Dr.
													</FormLabel>
												</FormItem>
												<FormItem className="flex items-center space-x-2">
													<FormControl>
														<RadioGroupItem value="Dra." />
													</FormControl>
													<FormLabel className="font-normal">
														Dra.
													</FormLabel>
												</FormItem>
												<FormItem className="flex items-center space-x-2">
													<FormControl>
														<RadioGroupItem value="none" />
													</FormControl>
													<FormLabel className="font-normal">
														None
													</FormLabel>
												</FormItem>
											</RadioGroup>
											{initialData && (
												<Button
													type="button"
													variant="ghost"
													size="icon"
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
								<FormItem>
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
											/>
											{initialData && (
												<Button
													type="button"
													variant="ghost"
													size="icon"
													className="absolute right-2 top-1/2 -translate-y-1/2"
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
								<FormItem>
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
											/>
											{initialData && (
												<Button
													type="button"
													variant="ghost"
													size="icon"
													className="absolute right-2 top-1/2 -translate-y-1/2"
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
								<FormItem>
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
											/>
											{initialData && (
												<Button
													type="button"
													variant="ghost"
													size="icon"
													className="absolute right-2 top-1/2 -translate-y-1/2"
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
									<FormMessage />
								</FormItem>
							)}
						/>
						{showAlert && (
							<div className="flex items-center space-x-2 mb-4">
								<Checkbox
									id="acknowledge"
									checked={acknowledgeChecked}
									onCheckedChange={setAcknowledgeChecked}
								/>
								<label
									htmlFor="acknowledge"
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									{initialData
										? 'Confirm duplicate client update'
										: 'Confirm adding duplicate client'}
								</label>
							</div>
						)}
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => handleOpenChange(false)}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={showAlert && !acknowledgeChecked}
							>
								{initialData ? 'Update Client' : 'Add Client'}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
