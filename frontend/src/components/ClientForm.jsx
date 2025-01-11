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

import { useDispatch } from 'react-redux'
import { addClient } from '../reducers/clientSlice'
import clientService from '../services/clientService'

const schema = yup.object().shape({
	title: yup
		.string()
		.oneOf(['Dr', 'Dra', 'none'])
		.required('Title is required'),
	firstName: yup.string().required('First name is required'),
	lastName: yup.string().required('Last name is required'),
	address: yup.string().required('Address is required'),
})

export function ClientForm() {
	const dispatch = useDispatch()
	const [open, setOpen] = useState(false)
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

		const name =
			title === 'none'
				? `${trimmedFirstName} ${trimmedLastName}`
				: `${title}. ${trimmedFirstName} ${trimmedLastName}`

		const requestBody = {
			name,
			address,
		}

		try {
			const newClient = await clientService.create(requestBody)
			dispatch(addClient(newClient))

			toast({
				title: 'Client Added',
				description: `${name} has been added successfully.`,
			})

			setOpen(false)
		} catch (error) {
			toast({
				variant: 'destructive',
				title: 'Error adding client:',
				description: `${error.response?.data || error.message}`,
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
	}

	const handleOpenChange = (newOpen) => {
		setOpen(newOpen)
		if (!newOpen) {
			resetForm()
		}
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
						<FormField
							control={form.control}
							name="title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Title</FormLabel>
									<FormControl>
										<RadioGroup
											onValueChange={field.onChange}
											defaultValue={field.value}
											className="flex space-x-4"
										>
											<FormItem className="flex items-center space-x-2">
												<FormControl>
													<RadioGroupItem value="Dr" />
												</FormControl>
												<FormLabel className="font-normal">
													Dr.
												</FormLabel>
											</FormItem>
											<FormItem className="flex items-center space-x-2">
												<FormControl>
													<RadioGroupItem value="Dra" />
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
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => handleOpenChange(false)}
							>
								Cancel
							</Button>
							<Button type="submit">Add Client</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	)
}
