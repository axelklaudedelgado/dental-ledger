import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { BreadcrumbLink } from '../breadcrumb'
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Spinner } from '@/components/ui/extensions/spinner'
import { Button } from '@/components/ui/button'

const TRANSACTION_STORAGE_KEY = 'pending_transaction_data'
const TRANSACTION_SUBMITTED_KEY = 'transaction_submitted'
const REDIRECT_DELAY_SECONDS = 5

const CustomBreadcrumbLink = ({ to, label, shouldClearState = false, isEditLink = false }) => {
    const navigate = useNavigate()
    const [showDialog, setShowDialog] = useState(false)
    const [countdown, setCountdown] = useState(REDIRECT_DELAY_SECONDS)
    const [redirectPath, setRedirectPath] = useState('')
  
    const handleClick = (e) => {
        e.preventDefault()
        

        const isSubmitted = sessionStorage.getItem(TRANSACTION_SUBMITTED_KEY) === 'true'
        
        if (shouldClearState) {
            sessionStorage.removeItem(TRANSACTION_STORAGE_KEY)
            sessionStorage.removeItem(TRANSACTION_SUBMITTED_KEY)
            navigate(to, { replace: true, state: null })
        } else if (isEditLink) {

        if (isSubmitted) {
                const pathParts = window.location.pathname.split('/')
                const clientSlug = pathParts[2] 
                const clientPath = `/client/${clientSlug}`
                
                setRedirectPath(clientPath)
                setShowDialog(true)
                setCountdown(REDIRECT_DELAY_SECONDS)

                sessionStorage.removeItem(TRANSACTION_STORAGE_KEY)
                sessionStorage.removeItem(TRANSACTION_SUBMITTED_KEY)
                
                const interval = setInterval(() => {
                    setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval)
                        setShowDialog(false)
                        navigate(clientPath, { replace: true, state: null })
                        return 0
                    }
                    return prev - 1
                    })
                }, 1000)
            
                return () => clearInterval(interval)
            } else {

                const savedTransaction = sessionStorage.getItem(TRANSACTION_STORAGE_KEY)
                if (savedTransaction) {
                    try {
                        const transaction = JSON.parse(savedTransaction)
                        navigate(to, { state: transaction })
                    } catch (error) {
                        console.error('Failed to parse transaction data', error)
                        navigate(to, { state: null })
                    }
                } else {
                    navigate(to, { state: null })
                }
            }
        } else {
            navigate(to, { state: null })
        }
    }
  
    const handleRedirectNow = () => {
        setShowDialog(false)
        navigate(redirectPath, { replace: true, state: null })
    }
  
    return (
        <>
            <BreadcrumbLink asChild>
                <Link to={to} onClick={handleClick}>{label}</Link>
            </BreadcrumbLink>
        
            <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Transaction Already Submitted</AlertDialogTitle>
                        <AlertDialogDescription className="py-4">
                            This transaction has already been submitted and cannot be edited.
                            <div className="flex items-center justify-center mt-6 mb-2">
                                <Spinner size="medium">
                                    Redirecting to client page in {countdown} {countdown === 1 ? 'second' : 'seconds'}...
                                </Spinner>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button onClick={handleRedirectNow}>
                            Redirect Now
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

export default CustomBreadcrumbLink