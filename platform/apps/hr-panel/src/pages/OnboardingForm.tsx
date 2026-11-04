import { useNavigate } from 'react-router-dom'
import OnboardingWizard from '../components/OnboardingWizard'

export default function OnboardingForm() {
  const navigate = useNavigate()

  return (
    <div className="py-4">
      <OnboardingWizard
        onClose={() => navigate('/onboarding')}
        onSuccess={() => navigate('/onboarding')}
      />
    </div>
  )
}
