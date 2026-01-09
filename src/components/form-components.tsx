import { useStore } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import * as ShadcnSelect from '@/components/ui/select'
import { Slider as ShadcnSlider } from '@/components/ui/slider'
import { Switch as ShadcnSwitch } from '@/components/ui/switch'
import { Textarea as ShadcnTextarea } from '@/components/ui/textarea'
import { useFieldContext, useFormContext } from '@/hooks/form-context'
import { Field, FieldError, FieldGroup, FieldLabel } from './ui/field'

export function SubscribeButton({ label }: { label: string }) {
	const form = useFormContext()
	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => (
				<Button type="submit" disabled={isSubmitting}>
					{label}
				</Button>
			)}
		</form.Subscribe>
	)
}

function ErrorMessages({
	errors,
}: {
	errors: Array<{ message?: string } | undefined>
}) {
	return <FieldError errors={errors} />
}

export function TextField({
	label,
	placeholder,
}: {
	label: string
	placeholder?: string
}) {
	const field = useFieldContext<string>()
	const errors = useStore(field.store, (state) => state.meta.errors)

	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

	return (
		<FieldGroup>
			<Field data-invalid={isInvalid}>
				<FieldLabel htmlFor={label} className="mb-2 text-xl font-bold">
					{label}
				</FieldLabel>
				<Input
					aria-invalid={isInvalid}
					id={field.name}
					name={field.name}
					value={field.state.value}
					placeholder={placeholder}
					onBlur={field.handleBlur}
					onChange={(e) => field.handleChange(e.target.value)}
				/>
				{isInvalid && <ErrorMessages errors={errors} />}
			</Field>
		</FieldGroup>
	)
}

export function TextArea({
	label,
	rows = 3,
}: {
	label: string
	rows?: number
}) {
	const field = useFieldContext<string>()
	const errors = useStore(field.store, (state) => state.meta.errors)
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

	return (
		<FieldGroup>
			<Field data-invalid={isInvalid}>
				<FieldLabel htmlFor={label} className="mb-2 text-xl font-bold">
					{label}
				</FieldLabel>
				<ShadcnTextarea
					aria-invalid={isInvalid}
					id={field.name}
					name={field.name}
					value={field.state.value}
					onBlur={field.handleBlur}
					rows={rows}
					onChange={(e) => field.handleChange(e.target.value)}
				/>
				{isInvalid && <ErrorMessages errors={errors} />}
			</Field>
		</FieldGroup>
	)
}

export function Select({
	label,
	values,
	placeholder,
}: {
	label: string
	values: Array<{ label: string; value: string }>
	placeholder?: string
}) {
	const field = useFieldContext<string>()
	const errors = useStore(field.store, (state) => state.meta.errors)
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

	return (
		<FieldGroup>
			<ShadcnSelect.Select
				name={field.name}
				value={field.state.value}
				onValueChange={(value) => field.handleChange(value)}
			>
				<ShadcnSelect.SelectTrigger className="w-full">
					<ShadcnSelect.SelectValue placeholder={placeholder} />
				</ShadcnSelect.SelectTrigger>
				<ShadcnSelect.SelectContent>
					<ShadcnSelect.SelectGroup>
						<ShadcnSelect.SelectLabel>{label}</ShadcnSelect.SelectLabel>
						{values.map((value) => (
							<ShadcnSelect.SelectItem key={value.value} value={value.value}>
								{value.label}
							</ShadcnSelect.SelectItem>
						))}
					</ShadcnSelect.SelectGroup>
				</ShadcnSelect.SelectContent>
			</ShadcnSelect.Select>
			{isInvalid && <ErrorMessages errors={errors} />}
		</FieldGroup>
	)
}

export function Switch({ label }: { label: string }) {
	const field = useFieldContext<boolean>()
	const errors = useStore(field.store, (state) => state.meta.errors)
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid

	return (
		<FieldGroup>
			<div className="flex items-center gap-2">
				<ShadcnSwitch
					id={label}
					onBlur={field.handleBlur}
					checked={field.state.value}
					onCheckedChange={(checked) => field.handleChange(checked)}
				/>
				<FieldLabel htmlFor={label}>{label}</FieldLabel>
			</div>
			{isInvalid && <ErrorMessages errors={errors} />}
		</FieldGroup>
	)
}
