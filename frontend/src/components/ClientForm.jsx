import { useState } from 'react'
import * as yup from 'yup'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Button } from './ui/button'
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

import { useDispatch } from 'react-redux'
import { createClient, checkClientName } from '../reducers/clientSlice'

const schema = yup.object().shape({
	title: yup
		.string()
		.oneOf(['Dr.', 'Dra.', 'none'])
		.required('Title is required'),
	firstName: yup.string().required('First name is required'),
	lastName: yup.string().required('Last name is required'),
	address: yup.string().required('Address is required'),
})

export function ClientForm({ onClientAdded }) {
	const dispatch = useDispatch()
	const [open, setOpen] = useState(false)
	const [acknowledgeChecked, setAcknowledgeChecked] = useState(false)
	const [showAlert, setShowAlert] = useState(false)
	const { toast } = useToast()

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

	const onSubmit = async (data) => {
		const { title, firstName, lastName, address } = data

		const trimmedFirstName = firstName.trim()
		const trimmedLastName = lastName.trim()

		const requestBody = {
			title: title === 'none' ? null : title,
			firstName: trimmedFirstName,
			lastName: trimmedLastName,
			address,
		}

		try {
			const nameCheckResult = await dispatch(
				checkClientName({
					firstName: trimmedFirstName,
					lastName: trimmedLastName,
				}),
			).unwrap()

			if (nameCheckResult.exists) {
				setShowAlert(true)
				setAcknowledgeChecked(false)
				return
			}

			if (
				!nameCheckResult.exists ||
				(nameCheckResult.exists && acknowledgeChecked)
			) {
				const result = await dispatch(
					createClient(requestBody),
				).unwrap()
				onClientAdded(result.id)

				toast({
					title: 'Client Added',
					description: `${requestBody.name} has been added successfully.`,
				})

				setOpen(false)
				resetForm()
			}
		} catch {
			toast({
				variant: 'destructive',
				title: 'Error adding client:',
				description: 'An error occurred while adding the client.',
			})
		}
	}

	const handleKeyPress = (event, fieldName) => {
		const keyCode = event.keyCode || event.which
		const keyValue = String.fromCharCode(keyCode)
		if (!/^[A-Za-z\s]+$/.test(keyValue)) {
			event.preventDefault()
			form.setError(fieldName, {
				message: 'Only letters and spaces are allowed.',
			})
		} else {
			form.clearErrors(fieldName)
		}
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
	}

	const handleOpenChange = (newOpen) => {
		setOpen(newOpen)
		if (!newOpen) {
			resetForm()
		}
	}

	const handleFieldChange = () => {
		setShowAlert(false)
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="ml-2 hidden h-8 lg:flex"
				>
					Add Client
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add Client</DialogTitle>
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
										<RadioGroup
											onValueChange={(value) => {
												field.onChange(value)
												handleFieldChange()
											}}
											defaultValue={field.value}
											className="flex space-x-4"
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
										<Input
											{...field}
											onKeyPress={(e) =>
												handleKeyPress(e, 'firstName')
											}
											onChange={(e) => {
												field.onChange(e)
												handleFieldChange()
											}}
										/>
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
										<Input
											{...field}
											onKeyPress={(e) =>
												handleKeyPress(e, 'lastName')
											}
											onChange={(e) => {
												field.onChange(e)
												handleFieldChange()
											}}
										/>
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
										<Input {...field} />
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
									I acknowledge that I'm adding a duplicate
									client
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
								Add Client
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
