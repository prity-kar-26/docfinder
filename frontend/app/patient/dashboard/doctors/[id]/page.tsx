import { DoctorProfileView } from "@/components/patient/DoctorProfileView"

export default async function DoctorProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    return <DoctorProfileView doctorId={id} />
}
